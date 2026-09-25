<script setup>
import { UserButton } from '@clerk/vue'

defineProps({
    notes: Array,
    selectedId: Number,
    theme: {
        type: String,
        default: 'light'
    }
})

const emit = defineEmits(["select-note", "create-note", "delete-note", "toggle-theme"])
</script>

<template>
    <aside class="notes-sidebar d-flex flex-column border-end bg-body-tertiary" style="width: 280px; min-width: 240px;">
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                <UserButton />
                <h5 class="mb-0 fw-bold">Notes</h5>
                <button
                    class="btn btn-sm btn-outline-secondary theme-toggle-button"
                    :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                    @click="emit('toggle-theme')"
                >
                    {{ theme === 'dark' ? '☀️' : '🌙' }}
                </button>
            </div>
            <button class="btn btn-sm btn-primary new-note-button" @click="emit('create-note')">
                + New Note
            </button>
        </div>
        <div class="note-list list-group list-group-flush overflow-y-auto flex-grow-1">
            <div
                v-for="note in notes"
                :key="note.id"
                class="note-list-item list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2 px-3"
                :class="{ active: note.id === selectedId }"
                role="button"
                @click="emit('select-note', note)"
            >
                <span class="text-truncate me-2">{{ note.title || 'Untitled' }}</span>
                <button
                    class="btn btn-sm delete-note-button"
                    :class="note.id === selectedId ? 'btn-outline-light' : 'btn-outline-danger'"
                    @click.stop="emit('delete-note', note.id)"
                >
                    Delete
                </button>
            </div>
            <div v-if="notes && notes.length === 0" class="p-3 text-secondary text-center small">
                No notes yet
            </div>
        </div>
    </aside>
</template>