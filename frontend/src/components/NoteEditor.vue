<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
    note: Object
})

const emit = defineEmits([
    "update-content",
])

const editorRef = ref(null)
const colorInputRef = ref(null)

const isBoldActive = ref(false)
const isItalicActive = ref(false)
const isUnderlineActive = ref(false)

const currentFontSize = ref(16)
const selectedFont = ref('')
const selectedTextColor = ref('')
const customColorPicker = ref('#212529')
const activeColorDisplay = ref('#212529')
const selectedHighlightColor = ref('')

let savedRange = null

const FONT_FAMILIES = [
    { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { name: 'Courier New', value: "'Courier New', Courier, monospace" },
    { name: 'Consolas', value: 'Consolas, monospace' },
    { name: 'Comic Sans MS', value: "'Comic Sans MS', cursive" },
    { name: 'Impact', value: 'Impact, Charcoal, sans-serif' }
]

const COLOR_PRESETS = [
    { name: 'Charcoal', value: '#212529', icon: '⚫' },
    { name: 'Slate Gray', value: '#64748b', icon: '⚪' },
    { name: 'Crimson Red', value: '#dc2626', icon: '🔴' },
    { name: 'Burnt Orange', value: '#ea580c', icon: '🟠' },
    { name: 'Warm Amber', value: '#d97706', icon: '🟡' },
    { name: 'Forest Green', value: '#16a34a', icon: '🟢' },
    { name: 'Ocean Blue', value: '#2563eb', icon: '🔵' },
    { name: 'Amethyst Purple', value: '#9333ea', icon: '🟣' },
    { name: 'Rose Pink', value: '#e11d48', icon: '🌸' }
]

const HIGHLIGHT_PRESETS = [
    { name: 'Lemon Yellow', value: '#fef08a', icon: '🟨' },
    { name: 'Mint Green', value: '#bbf7d0', icon: '🟩' },
    { name: 'Soft Pink', value: '#fbcfe8', icon: '🌸' },
    { name: 'Sky Blue', value: '#bfdbfe', icon: '🟦' },
    { name: 'Soft Lavender', value: '#e9d5ff', icon: '🟪' },
    { name: 'Peach', value: '#fed7aa', icon: '🟧' }
]

const LEGACY_CLASSES = [
    'small', 'fs-6', 'fs-5', 'fs-4', 'fs-3', 'fs-2',
    'text-body', 'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info', 'text-secondary'
]

function saveCurrentRange() {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (editorRef.value && editorRef.value.contains(range.commonAncestorContainer)) {
            savedRange = range.cloneRange()
        }
    }
}

function restoreRange() {
    if (savedRange) {
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(savedRange)
    }
}

function ensureEditorFocus() {
    if (!editorRef.value) return
    restoreRange()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !editorRef.value.contains(selection.anchorNode)) {
        editorRef.value.focus()
        const range = document.createRange()
        range.selectNodeContents(editorRef.value)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
        savedRange = range.cloneRange()
    }
}

function getEditorSelection() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
        return null
    }
    const range = selection.getRangeAt(0)
    if (!editorRef.value || !editorRef.value.contains(range.commonAncestorContainer)) {
        return null
    }
    return { selection, range }
}

function updateActiveStates() {
    saveCurrentRange()
    try {
        isBoldActive.value = document.queryCommandState('bold')
        isItalicActive.value = document.queryCommandState('italic')
        isUnderlineActive.value = document.queryCommandState('underline')
    } catch {
        // Fallback for environments without queryCommandState
    }

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.value) {
        let node = sel.anchorNode
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
        if (node && editorRef.value.contains(node)) {
            const computed = window.getComputedStyle(node)
            const parsedSize = parseInt(computed.fontSize, 10)
            if (!isNaN(parsedSize) && parsedSize >= 8 && parsedSize <= 96) {
                currentFontSize.value = parsedSize
            }
            if (node.style.fontFamily) {
                selectedFont.value = node.style.fontFamily
            }
            if (node.style.color) {
                activeColorDisplay.value = node.style.color
            }
        }
    }
}

function updateEmptyState() {
    if (!editorRef.value) return
    const text = editorRef.value.innerText?.replace(/\n/g, '').replace(/\u200B/g, '').trim()
    if (!text && (!editorRef.value.innerHTML || editorRef.value.innerHTML === '<br>' || editorRef.value.innerHTML.includes('\u200B'))) {
        editorRef.value.classList.add('is-empty')
    } else {
        editorRef.value.classList.remove('is-empty')
    }
}

function handleInput() {
    if (!editorRef.value) return
    updateEmptyState()
    updateActiveStates()
    emit('update-content', editorRef.value.innerHTML)
}

function toggleBold() {
    ensureEditorFocus()
    document.execCommand('bold', false, null)
    handleInput()
}

function toggleItalic() {
    ensureEditorFocus()
    document.execCommand('italic', false, null)
    handleInput()
}

function toggleUnderline() {
    ensureEditorFocus()
    document.execCommand('underline', false, null)
    handleInput()
}

function applyInlineStyle(styleProp, styleVal) {
    ensureEditorFocus()
    const selInfo = getEditorSelection()
    if (!selInfo) return
    const { selection, range } = selInfo

    if (range.collapsed) {
        // No text highlighted: insert a zero-width space span so subsequent typing inherits the style
        const container = range.startContainer
        const parentSpan = container.nodeType === Node.TEXT_NODE ? container.parentElement : container

        if (
            parentSpan &&
            parentSpan !== editorRef.value &&
            parentSpan.tagName === 'SPAN' &&
            parentSpan.textContent === '\u200B'
        ) {
            if (styleVal) {
                parentSpan.style[styleProp] = styleVal
            } else {
                parentSpan.style[styleProp] = ''
            }
        } else {
            const span = document.createElement('span')
            if (styleVal) {
                span.style[styleProp] = styleVal
            }
            const textNode = document.createTextNode('\u200B')
            span.appendChild(textNode)
            range.insertNode(span)

            const newRange = document.createRange()
            newRange.setStart(textNode, 1)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
        }
        saveCurrentRange()
        handleInput()
        return
    }

    // Text is highlighted: apply style directly to selection
    let parent = range.commonAncestorContainer
    if (parent.nodeType === Node.TEXT_NODE) {
        parent = parent.parentNode
    }

    // If whole selection is already inside a span, update style on parent directly
    if (parent && parent !== editorRef.value && parent.tagName === 'SPAN') {
        if (styleVal) {
            parent.style[styleProp] = styleVal
        } else {
            parent.style[styleProp] = ''
        }
        handleInput()
        return
    }

    const fragment = range.extractContents()
    if (fragment.querySelectorAll) {
        fragment.querySelectorAll('span').forEach(span => {
            if (styleVal) {
                span.style[styleProp] = ''
            }
        })
    }

    const span = document.createElement('span')
    if (styleVal) {
        span.style[styleProp] = styleVal
    }
    span.appendChild(fragment)
    range.insertNode(span)

    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    selection.removeAllRanges()
    selection.addRange(newRange)
    saveCurrentRange()

    handleInput()
}

// Font Size handlers
function onFontSizeWheel(event) {
    const delta = event.deltaY < 0 ? 1 : -1
    const newSize = Math.min(96, Math.max(8, (currentFontSize.value || 16) + delta))
    currentFontSize.value = newSize
    applyInlineStyle('fontSize', `${newSize}px`)
}

function onFontSizeInput() {
    if (currentFontSize.value && currentFontSize.value >= 8 && currentFontSize.value <= 96) {
        applyInlineStyle('fontSize', `${currentFontSize.value}px`)
    }
}

// Font Family handler
function onFontFamilyChange() {
    applyInlineStyle('fontFamily', selectedFont.value || '')
}

// Text Color handlers
function onColorPresetChange() {
    if (selectedTextColor.value === 'custom') {
        colorInputRef.value?.click()
        return
    }
    if (selectedTextColor.value) {
        activeColorDisplay.value = selectedTextColor.value
        applyInlineStyle('color', selectedTextColor.value)
    } else {
        activeColorDisplay.value = '#212529'
        applyInlineStyle('color', '')
    }
}

function onCustomColorInput(event) {
    const color = event.target.value
    activeColorDisplay.value = color
    selectedTextColor.value = 'custom'
    applyInlineStyle('color', color)
}

// Highlight Color handler
function onHighlightChange() {
    applyInlineStyle('backgroundColor', selectedHighlightColor.value || '')
}

function clearFormatting() {
    ensureEditorFocus()
    document.execCommand('removeFormat', false, null)

    const selInfo = getEditorSelection()
    if (selInfo && !selInfo.range.collapsed) {
        const { selection, range } = selInfo
        const fragment = range.extractContents()
        if (fragment.querySelectorAll) {
            fragment.querySelectorAll('span').forEach(span => {
                span.style.color = ''
                span.style.backgroundColor = ''
                span.style.fontSize = ''
                span.style.fontFamily = ''
                LEGACY_CLASSES.forEach(c => span.classList.remove(c))
                if (!span.getAttribute('style') && span.classList.length === 0) {
                    span.replaceWith(...span.childNodes)
                }
            })
        }
        range.insertNode(fragment)
        const newRange = document.createRange()
        newRange.selectNodeContents(fragment)
        selection.removeAllRanges()
        selection.addRange(newRange)
    }

    currentFontSize.value = 16
    selectedFont.value = ''
    selectedTextColor.value = ''
    selectedHighlightColor.value = ''
    activeColorDisplay.value = '#212529'

    handleInput()
}

// Synchronize content on note load or switch
watch(
    () => props.note?.id,
    async () => {
        await nextTick()
        if (editorRef.value && props.note) {
            editorRef.value.innerHTML = props.note.content || ''
            updateEmptyState()
            savedRange = null
        }
    }
)

onMounted(() => {
    if (editorRef.value && props.note) {
        editorRef.value.innerHTML = props.note.content || ''
        updateEmptyState()
    }
})
</script>

<template>
    <section class="note-editor flex-grow-1 d-flex flex-column p-2 p-sm-3 h-100 overflow-hidden bg-body">
        <!-- Rich Text Formatting Toolbar -->
        <div v-if="note" class="note-formatting-toolbar pb-2 mb-2 border-bottom d-flex align-items-center gap-2 overflow-x-auto flex-nowrap flex-md-wrap">
            <!-- Bold, Italic, Underline toggles -->
            <div class="btn-group btn-group-sm flex-shrink-0" role="group" aria-label="Text formatting">
                <button
                    type="button"
                    class="btn"
                    :class="isBoldActive ? 'btn-primary' : 'btn-outline-secondary'"
                    @mousedown.prevent="toggleBold"
                    title="Bold"
                    aria-label="Toggle Bold"
                >
                    <span class="fw-bold px-1">B</span>
                </button>
                <button
                    type="button"
                    class="btn"
                    :class="isItalicActive ? 'btn-primary' : 'btn-outline-secondary'"
                    @mousedown.prevent="toggleItalic"
                    title="Italic"
                    aria-label="Toggle Italic"
                >
                    <span class="fst-italic px-1">I</span>
                </button>
                <button
                    type="button"
                    class="btn"
                    :class="isUnderlineActive ? 'btn-primary' : 'btn-outline-secondary'"
                    @mousedown.prevent="toggleUnderline"
                    title="Underline"
                    aria-label="Toggle Underline"
                >
                    <span class="text-decoration-underline px-1">U</span>
                </button>
            </div>

            <div class="vr my-1 d-none d-sm-block"></div>

            <!-- Font Family selector -->
            <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <label for="font-family-select" class="form-label mb-0 small text-secondary">Font:</label>
                <select
                    id="font-family-select"
                    v-model="selectedFont"
                    class="form-select form-select-sm"
                    style="width: 140px;"
                    @mousedown="saveCurrentRange"
                    @change="onFontFamilyChange"
                >
                    <option value="">Default Font</option>
                    <option
                        v-for="font in FONT_FAMILIES"
                        :key="font.name"
                        :value="font.value"
                        :style="{ fontFamily: font.value }"
                    >
                        {{ font.name }}
                    </option>
                </select>
            </div>

            <div class="vr my-1 d-none d-sm-block"></div>

            <!-- Font Size number input with scroll wheel & typing -->
            <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <label for="font-size-input" class="form-label mb-0 small text-secondary">Size:</label>
                <div class="input-group input-group-sm" style="width: 82px;">
                    <input
                        id="font-size-input"
                        type="number"
                        min="8"
                        max="96"
                        step="1"
                        v-model.number="currentFontSize"
                        class="form-control form-control-sm text-center px-1"
                        title="Type a size or scroll wheel over this box"
                        @mousedown="saveCurrentRange"
                        @wheel.prevent="onFontSizeWheel"
                        @input="onFontSizeInput"
                    />
                    <span class="input-group-text px-1 text-secondary small">px</span>
                </div>
            </div>

            <div class="vr my-1 d-none d-sm-block"></div>

            <!-- Text Color selector + custom color picker -->
            <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <label for="color-select" class="form-label mb-0 small text-secondary">Color:</label>
                <select
                    id="color-select"
                    v-model="selectedTextColor"
                    class="form-select form-select-sm"
                    style="width: 120px;"
                    @mousedown="saveCurrentRange"
                    @change="onColorPresetChange"
                >
                    <option value="">Auto</option>
                    <option
                        v-for="c in COLOR_PRESETS"
                        :key="c.name"
                        :value="c.value"
                        :style="{ color: c.value, fontWeight: '600' }"
                    >
                        {{ c.icon }} {{ c.name }}
                    </option>
                    <option value="custom">🎨 Custom...</option>
                </select>

                <!-- Color preview circle button triggering native HTML5 color picker -->
                <label
                    class="btn btn-sm btn-outline-secondary p-0 d-inline-flex align-items-center justify-content-center"
                    style="width: 30px; height: 30px; cursor: pointer;"
                    title="Choose custom color"
                    @mousedown="saveCurrentRange"
                >
                    <span
                        class="rounded-circle border"
                        :style="{ width: '18px', height: '18px', backgroundColor: activeColorDisplay }"
                    ></span>
                    <input
                        ref="colorInputRef"
                        type="color"
                        v-model="customColorPicker"
                        class="visually-hidden"
                        @input="onCustomColorInput"
                    />
                </label>
            </div>

            <div class="vr my-1 d-none d-sm-block"></div>

            <!-- Highlight (Background) selector -->
            <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <label for="highlight-select" class="form-label mb-0 small text-secondary">Highlight:</label>
                <select
                    id="highlight-select"
                    v-model="selectedHighlightColor"
                    class="form-select form-select-sm"
                    style="width: 125px;"
                    @mousedown="saveCurrentRange"
                    @change="onHighlightChange"
                >
                    <option value="">None</option>
                    <option
                        v-for="h in HIGHLIGHT_PRESETS"
                        :key="h.name"
                        :value="h.value"
                        :style="{ backgroundColor: h.value, color: '#212529', fontWeight: '500' }"
                    >
                        {{ h.icon }} {{ h.name }}
                    </option>
                </select>
            </div>

            <!-- Clear formatting button -->
            <button
                type="button"
                class="btn btn-sm btn-outline-secondary ms-auto flex-shrink-0"
                @mousedown.prevent="clearFormatting"
                title="Clear formatting"
            >
                <small>Clear Format</small>
            </button>
        </div>

        <!-- Rich Text Editor Container -->
        <div
            v-if="note"
            ref="editorRef"
            contenteditable="true"
            class="note-editor-content form-control border-0 shadow-none flex-grow-1 p-2 bg-transparent text-body overflow-auto"
            data-placeholder="Write your note here..."
            @input="handleInput"
            @keyup="updateActiveStates"
            @mouseup="updateActiveStates"
            @click="updateActiveStates"
        ></div>
        <div v-else class="d-flex align-items-center justify-content-center h-100 text-secondary">
            <p class="lead mb-0">Select a note or create a new one to get started.</p>
        </div>
    </section>
</template>

<style scoped>
.note-formatting-toolbar {
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
}

.note-formatting-toolbar::-webkit-scrollbar {
    height: 4px;
}

.note-editor-content {
    white-space: pre-wrap;
    word-break: break-word;
    outline: none !important;
    min-height: 200px;
    font-size: 16px;
}

.note-editor-content:empty::before,
.note-editor-content.is-empty::before {
    content: attr(data-placeholder);
    color: var(--bs-secondary-color, #6c757d);
    pointer-events: none;
    opacity: 0.6;
}

/* Hide number spinner arrows slightly for cleaner look, but keep functionality */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    opacity: 1;
}
</style>