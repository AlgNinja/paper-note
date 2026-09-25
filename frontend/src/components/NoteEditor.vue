<script setup>

defineProps({
    note: Object
})

const emit = defineEmits([
    "update-content",
])
</script>

<template>
    <section class="note-editor flex-grow-1 d-flex flex-column p-3 h-100 overflow-hidden bg-body">
        <textarea
            v-if="note"
            class="form-control border-0 shadow-none flex-grow-1 p-2 note-content bg-transparent text-body"
            style="resize: none;"
            placeholder="Write your note here..."
            :value="note.content"
            @input="emit('update-content', $event.target.value)"
        ></textarea>
        <div v-else class="d-flex align-items-center justify-content-center h-100 text-secondary">
            <p class="lead mb-0">Select a note or create a new one to get started.</p>
        </div>
    </section>
</template>