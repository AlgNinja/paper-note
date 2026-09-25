<script setup>
import { ref, computed, watch, onMounted } from "vue"
import { useAuth, SignInButton, SignUpButton } from "@clerk/vue"

import NoteEditor from './components/NoteEditor.vue'
import NoteTitle from './components/NoteTitle.vue'
import NoteList from './components/NoteList.vue'

const { isSignedIn, isLoaded, getToken } = useAuth()

const hasClerkKey = computed(() => {
    const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.CLERK_PUBLISHABLE_KEY
    return !!(key && !key.includes("your_clerk_publishable_key"))
})

const notes = ref([])
const selectedNote = ref(null)
const theme = ref(localStorage.getItem('theme') || 'light')

const API_BASE = import.meta.env.VITE_API_URL ?? (typeof window !== 'undefined' && window.location.port === "5173" ? "http://localhost:8080" : "")

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

async function saveNote() {
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
        }
    } catch (e) {
        console.error("Failed to save note:", e)
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

watch(isSignedIn, (signedIn) => {
    if (signedIn) {
        getNotes()
    } else {
        notes.value = []
        selectedNote.value = null
    }
})

onMounted(() => {
    document.documentElement.setAttribute('data-bs-theme', theme.value)
    if (isSignedIn.value) {
        getNotes()
    }
})
</script>

<template>
    <!-- Loading Screen while Clerk initializes -->
    <div v-if="!isLoaded" class="vh-100 d-flex align-items-center justify-content-center bg-body">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <!-- Authenticated App View -->
    <main v-else-if="isSignedIn" class="notes-app d-flex vh-100 overflow-hidden bg-body text-body">
        <NoteList
            :notes="notes"
            :selected-id="selectedNote?.id"
            :theme="theme"
            @select-note="selectNote"
            @create-note="createNote"
            @delete-note="deleteNote"
            @toggle-theme="toggleTheme"
        />
        <div class="d-flex flex-column flex-grow-1 h-100 overflow-hidden bg-body">
            <NoteTitle :note="selectedNote" @update-title="updateTitle" @save-note="saveNote" />
            <NoteEditor :note="selectedNote" @update-content="updateContent" />
        </div>
    </main>

    <!-- Landing Page (Signed Out) -->
    <div v-else class="landing-page min-vh-100 d-flex flex-column bg-body text-body">
        <!-- Landing Navbar -->
        <nav class="navbar border-bottom px-4 py-3 bg-body sticky-top">
            <div class="container-fluid d-flex justify-content-between align-items-center">
                <span class="navbar-brand fw-bold fs-4 mb-0">📝 Paper Note</span>
                <div class="d-flex align-items-center gap-2">
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

                <div class="mb-4">
                    <span class="badge text-bg-primary-subtle text-primary-emphasis px-3 py-2 rounded-pill fs-6">
                        Minimal • Fast • Secure
                    </span>
                </div>

                <h1 class="display-3 fw-bold mb-3 tracking-tight">
                    Distraction-Free Note Taking
                </h1>
                <p class="lead text-secondary mx-auto mb-5" style="max-width: 620px;">
                    Capture thoughts, write notes, and organize your work seamlessly. Built with instant syncing, light &amp; dark themes, and privacy-first authentication.
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
                                    Fast note creation, seamless editing, and auto-saving so you never lose your train of thought.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="card h-100 border bg-body-tertiary shadow-sm p-3">
                            <div class="card-body">
                                <div class="fs-2 mb-2">🎨</div>
                                <h5 class="card-title fw-bold">Adaptive Themes</h5>
                                <p class="card-text text-secondary small">
                                    Clean, eye-friendly light and dark modes designed to make reading and writing comfortable at any time of day.
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
        <footer class="border-top py-3 text-center text-secondary small bg-body">
            Paper Note &copy; 2026 • Simple, distraction-free notes.
        </footer>
    </div>
</template>
