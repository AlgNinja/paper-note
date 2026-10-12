<script setup>

defineProps({
    note: Object    
})

const emit = defineEmits([
    "update-title",
    "save-note",
    "toggle-notes"
])

</script>

<template>
    <header class="note-title-bar border-bottom p-2 p-sm-3 d-flex align-items-center gap-2 bg-body" style="min-height: 60px;">
        <button
            type="button"
            class="btn btn-outline-secondary d-md-none d-flex align-items-center gap-1 flex-shrink-0 notes-toggle-btn"
            @click="emit('toggle-notes')"
            title="Open notes tab"
            aria-label="Toggle notes tab"
        >
            <span class="fs-6 lh-1">☰</span>
            <span class="small fw-semibold">Notes</span>
        </button>
        <template v-if="note">
            <input
                class="form-control form-control-md border-0 shadow-none fw-bold note-title-input bg-transparent text-body flex-grow-1 fs-5 fs-md-4"
                placeholder="Note Title"
                :value="note.title"
                @input="emit('update-title', $event.target.value)"
            >
            <button class="btn btn-success px-3 px-sm-4 save-button flex-shrink-0" @click="emit('save-note')">Save</button>
        </template>
        <div v-else class="text-secondary small py-2 flex-grow-1">
            No note selected
        </div>
    </header>
</template>