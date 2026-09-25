<script setup>

defineProps({
    note: Object    
})

const emit = defineEmits([
    "update-title",
    "save-note"
])

</script>

<template>
    <header class="note-title-bar border-bottom p-3 d-flex align-items-center gap-2 bg-body" style="min-height: 72px;">
        <template v-if="note">
            <input
                class="form-control form-control-lg border-0 shadow-none fw-bold note-title-input bg-transparent text-body"
                placeholder="Note Title"
                :value="note.title"
                @input="emit('update-title', $event.target.value)"
            >
            <button class="btn btn-success px-4 save-button" @click="emit('save-note')">Save</button>
        </template>
        <div v-else class="text-secondary small py-2">
            No note selected
        </div>
    </header>
</template>