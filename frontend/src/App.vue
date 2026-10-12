<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { useAuth, SignInButton, SignUpButton } from "@clerk/vue"

import NoteEditor from './components/NoteEditor.vue'
import NoteTitle from './components/NoteTitle.vue'
import NoteList from './components/NoteList.vue'
import DevLog from './components/DevLog.vue'

const { isSignedIn, isLoaded, getToken } = useAuth()

const hasClerkKey = computed(() => {
    const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.CLERK_PUBLISHABLE_KEY
    return !!(key && !key.includes("your_clerk_publishable_key"))
})

const notes = ref([])
const selectedNote = ref(null)
const theme = ref(localStorage.getItem('theme') || 'light')

// Route/View management
const currentView = ref(
    typeof window !== 'undefined' && (window.location.pathname === '/devlog' || window.location.pathname === '/dev-log')
        ? 'devlog'
        : 'home'
)

// Toast Notifications state
const toasts = ref([])
const hasShownAutoSaveNotice = ref(false)
let autoSaveInterval = null

const API_BASE = import.meta.env.VITE_API_URL ?? (typeof window !== 'undefined' && window.location.port === "5173" ? "http://localhost:8080" : "")

function addToast(message, type = 'info', duration = 4000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    if (duration > 0) {
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }
}

function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
}

function navigateToDevLog() {
    currentView.value = 'devlog'
    if (typeof window !== 'undefined' && window.location.pathname !== '/devlog') {
        window.history.pushState(null, '', '/devlog')
    }
}

function navigateHome() {
    currentView.value = 'home'
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState(null, '', '/')
    }
}

async function authHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders }
    try {
        if (getToken && getToken.value) {
            const token = await getToken.value()
            if (token) {
                headers["Authorization"] = `Bearer ${token}`
            }
        }
    } catch (e) {
        console.warn("Could not retrieve Clerk token:", e)
    }
    return headers
}

async function getNotes() {
    try {
        const headers = await authHeaders()
        const response = await fetch(`${API_BASE}/api/notes`, { headers })
        if (response.ok) {
            notes.value = await response.json()
            if (notes.value.length > 0) {
                selectedNote.value = notes.value[0]
            } else {
                selectedNote.value = null
            }
        }
    } catch (e) {
        console.error("Failed to fetch notes:", e)
    }
}

function selectNote(note) {
    selectedNote.value = note
}

function updateContent(content) {
    if (selectedNote.value) {
        selectedNote.value.content = content
    }
}

function updateTitle(title) {
    if (selectedNote.value) {
        selectedNote.value.title = title
    }
}

async function saveNote(isAutoSave = false) {
    if (!selectedNote.value) return
    const note = selectedNote.value
    try {
        const headers = await authHeaders({ "Content-Type": "application/json" })
        const response = await fetch(`${API_BASE}/api/notes/${note.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                title: note.title,
                content: note.content
            })
        })

        if (response.ok) {
            const updatedNote = await response.json()
            const index = notes.value.findIndex(n => n.id === updatedNote.id)
            if (index !== -1) {
                notes.value[index] = updatedNote
            }
            selectedNote.value = updatedNote

            if (isAutoSave) {
                const timeString = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                addToast(`💾 Note automatically saved at ${timeString}`, 'success', 3500)
            } else {
                addToast('Note saved successfully', 'success', 2500)
            }
        }
    } catch (e) {
        console.error("Failed to save note:", e)
        if (!isAutoSave) {
            addToast("Failed to save note", "danger", 3500)
        }
    }
}

async function createNote() {
    try {
        const headers = await authHeaders()
        const response = await fetch(`${API_BASE}/api/notes`, {
            method: "POST",
            headers
        })
        if (response.ok) {
            const newNote = await response.json()
            notes.value.unshift(newNote)
            selectedNote.value = newNote
            addToast("Created new note", "info", 2000)
        }
    } catch (e) {
        console.error("Failed to create note:", e)
    }
}

async function deleteNote(id) {
    try {
        const headers = await authHeaders()
        const response = await fetch(`${API_BASE}/api/notes/${id}`, {
            method: "DELETE",
            headers
        })

        if (response.ok) {
            notes.value = notes.value.filter(n => n.id !== id)
            if (selectedNote.value && selectedNote.value.id === id) {
                selectedNote.value = notes.value.length > 0 ? notes.value[0] : null
            }
            addToast("Note deleted", "secondary", 2000)
        }
    } catch (e) {
        console.error("Failed to delete note:", e)
    }
}

function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-bs-theme', theme.value)
    localStorage.setItem('theme', theme.value)
}

function startAutoSaveTimer() {
    stopAutoSaveTimer()
    // Run auto-save once every 60 seconds (1 minute)
    autoSaveInterval = setInterval(() => {
        if (isSignedIn.value && selectedNote.value) {
            saveNote(true)
        }
    }, 60000)
}

function stopAutoSaveTimer() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
        autoSaveInterval = null
    }
}

function handleNotesScreenEnter() {
    getNotes()
    startAutoSaveTimer()
    if (!hasShownAutoSaveNotice.value) {
        hasShownAutoSaveNotice.value = true
        addToast(
            "Notes automatically save every minute, but make sure to manually save before closing the tab.",
            "info",
            8000
        )
    }
}

watch(isSignedIn, (signedIn) => {
    if (signedIn) {
        handleNotesScreenEnter()
    } else {
        stopAutoSaveTimer()
        notes.value = []
        selectedNote.value = null
    }
})

onMounted(() => {
    document.documentElement.setAttribute('data-bs-theme', theme.value)

    if (typeof window !== 'undefined') {
        window.addEventListener('popstate', () => {
            if (window.location.pathname === '/devlog' || window.location.pathname === '/dev-log') {
                currentView.value = 'devlog'
            } else {
                currentView.value = 'home'
            }
        })
    }

    if (isSignedIn.value) {
        handleNotesScreenEnter()
    }
})

onUnmounted(() => {
    stopAutoSaveTimer()
})
</script>

<template>
    <!-- Loading Screen while Clerk initializes -->
    <div v-if="!isLoaded" class="vh-100 d-flex align-items-center justify-content-center bg-body">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <!-- Dev Log View -->
    <DevLog
        v-else-if="currentView === 'devlog'"
        :is-signed-in="isSignedIn"
        :theme="theme"
        @navigate-home="navigateHome"
        @toggle-theme="toggleTheme"
    />

    <!-- Authenticated App View -->
    <main v-else-if="isSignedIn" class="notes-app d-flex vh-100 overflow-hidden bg-body text-body position-relative">
        <NoteList
            :notes="notes"
            :selected-id="selectedNote?.id"
            :theme="theme"
            @select-note="selectNote"
            @create-note="createNote"
            @delete-note="deleteNote"
            @toggle-theme="toggleTheme"
            @open-devlog="navigateToDevLog"
        />
        <div class="d-flex flex-column flex-grow-1 h-100 overflow-hidden bg-body">
            <NoteTitle :note="selectedNote" @update-title="updateTitle" @save-note="saveNote(false)" />
            <NoteEditor :note="selectedNote" @update-content="updateContent" />
        </div>
    </main>

    <!-- Landing Page (Signed Out) -->
    <div v-else class="landing-page min-vh-100 d-flex flex-column bg-body text-body position-relative">
        <!-- Landing Navbar -->
        <nav class="navbar border-bottom px-4 py-3 bg-body sticky-top">
            <div class="container-fluid d-flex justify-content-between align-items-center">
                <span class="navbar-brand fw-bold fs-4 mb-0">📝 Paper Note</span>
                <div class="d-flex align-items-center gap-2">
                    <button
                        class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        @click="navigateToDevLog"
                        title="View monthly developer log"
                    >
                        <span>📋</span>
                        <span>Dev Log</span>
                    </button>
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                        @click="toggleTheme"
                    >
                        {{ theme === 'dark' ? '☀️' : '🌙' }}
                    </button>
                    <SignInButton mode="modal">
                        <button class="btn btn-sm btn-outline-primary">Sign In</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button class="btn btn-sm btn-primary">Sign Up</button>
                    </SignUpButton>
                </div>
            </div>
        </nav>

        <!-- Main Landing Content -->
        <main class="flex-grow-1 d-flex flex-column justify-content-center py-5">
            <div class="container py-4 text-center">
                <!-- Warning banner if keys are still placeholder -->
                <div v-if="!hasClerkKey" class="alert alert-warning d-inline-block text-start mb-4 shadow-sm" style="max-width: 600px;">
                    <h6 class="alert-heading fw-bold mb-1">⚙️ Configuration needed</h6>
                    <small>Please set your Clerk keys in the <code>.env</code> file (<code>CLERK_SECRET_KEY</code> and <code>VITE_CLERK_PUBLISHABLE_KEY</code>) to enable sign in.</small>
                </div>

                <div class="mb-4 d-flex justify-content-center gap-2 flex-wrap">
                    <span class="badge text-bg-primary-subtle text-primary-emphasis px-3 py-2 rounded-pill fs-6">
                        Minimal • Fast • Secure
                    </span>
                    <button
                        type="button"
                        class="btn btn-sm badge text-bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill fs-6 border-0 shadow-sm d-flex align-items-center gap-1"
                        @click="navigateToDevLog"
                        title="View our monthly developer log"
                    >
                        <span>🚀 What's new in October? Check the Dev Log &rarr;</span>
                    </button>
                </div>

                <h1 class="display-3 fw-bold mb-3 tracking-tight">
                    Distraction-Free Note Taking
                </h1>
                <p class="lead text-secondary mx-auto mb-5" style="max-width: 620px;">
                    Capture thoughts, write notes, and organize your work seamlessly. Built with instant syncing, rich text customization, automatic saving, and privacy-first authentication.
                </p>

                <div class="d-flex justify-content-center gap-3 mb-5">
                    <SignUpButton mode="modal">
                        <button class="btn btn-primary btn-lg px-4 py-2 shadow-sm">
                            Get Started Free
                        </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                        <button class="btn btn-outline-secondary btn-lg px-4 py-2">
                            Sign In
                        </button>
                    </SignInButton>
                </div>

                <!-- Feature Cards -->
                <div class="row g-4 justify-content-center text-start mt-2">
                    <div class="col-12 col-md-4">
                        <div class="card h-100 border bg-body-tertiary shadow-sm p-3">
                            <div class="card-body">
                                <div class="fs-2 mb-2">⚡</div>
                                <h5 class="card-title fw-bold">Instant &amp; Fast</h5>
                                <p class="card-text text-secondary small">
                                    Fast note creation, seamless editing, and minute-by-minute auto-saving so you never lose your work.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="card h-100 border bg-body-tertiary shadow-sm p-3">
                            <div class="card-body">
                                <div class="fs-2 mb-2">🎨</div>
                                <h5 class="card-title fw-bold">Full Customization</h5>
                                <p class="card-text text-secondary small">
                                    Choose custom font sizes, web-safe typography, named colors, and highlights without heavy dependencies.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="card h-100 border bg-body-tertiary shadow-sm p-3">
                            <div class="card-body">
                                <div class="fs-2 mb-2">🔒</div>
                                <h5 class="card-title fw-bold">Secure with Clerk</h5>
                                <p class="card-text text-secondary small">
                                    Enterprise-grade authentication ensures your personal notes remain completely private and isolated.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Landing Footer -->
        <footer class="border-top py-3 text-center text-secondary small bg-body d-flex justify-content-center align-items-center gap-3">
            <span>Paper Note &copy; 2026 • Simple, distraction-free notes.</span>
            <span>&bull;</span>
            <button class="btn btn-link btn-sm text-secondary text-decoration-none p-0" @click="navigateToDevLog">
                📋 Dev Log
            </button>
        </footer>
    </div>

    <!-- Non-invasive Toast Notifications Container -->
    <div
        class="toast-container position-fixed bottom-0 end-0 p-3"
        style="z-index: 1090; pointer-events: none;"
    >
        <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast show align-items-center border shadow mb-2"
            :class="{
                'text-bg-success text-white': toast.type === 'success',
                'text-bg-info text-dark': toast.type === 'info',
                'text-bg-danger text-white': toast.type === 'danger',
                'text-bg-secondary text-white': toast.type === 'secondary'
            }"
            style="pointer-events: auto; max-width: 380px; min-width: 260px;"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div class="d-flex">
                <div class="toast-body small py-2 px-3 d-flex align-items-center gap-2">
                    <span v-if="toast.type === 'info'">ℹ️</span>
                    <span>{{ toast.message }}</span>
                </div>
                <button
                    type="button"
                    class="btn-close me-2 m-auto"
                    :class="{ 'btn-close-white': toast.type !== 'info' }"
                    aria-label="Close"
                    @click="removeToast(toast.id)"
                ></button>
            </div>
        </div>
    </div>
</template>
