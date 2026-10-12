<script setup>
import { SignInButton, SignUpButton } from '@clerk/vue'

defineProps({
    isSignedIn: Boolean,
    theme: {
        type: String,
        default: 'light'
    }
})

const emit = defineEmits(['navigate-home', 'toggle-theme'])
</script>

<template>
    <div class="devlog-page min-vh-100 d-flex flex-column bg-body text-body">
        <!-- DevLog Navbar -->
        <header class="navbar border-bottom px-2 px-sm-4 py-2 py-sm-3 bg-body sticky-top">
            <div class="container d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2 gap-sm-3">
                    <button
                        class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                        @click="emit('navigate-home')"
                        title="Return to application"
                    >
                        <span>&larr;</span>
                        <span class="d-none d-sm-inline">{{ isSignedIn ? 'Back to Notes' : 'Back to Home' }}</span>
                        <span class="d-sm-none">Back</span>
                    </button>
                    <span
                        class="navbar-brand fw-bold fs-6 fs-sm-5 mb-0 text-decoration-none cursor-pointer"
                        role="button"
                        @click="emit('navigate-home')"
                    >
                        📝 Paper Note
                    </span>
                </div>

                <div class="d-flex align-items-center gap-1 gap-sm-2">
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                        @click="emit('toggle-theme')"
                    >
                        {{ theme === 'dark' ? '☀️' : '🌙' }}
                    </button>
                    <template v-if="!isSignedIn">
                        <SignInButton mode="modal">
                            <button class="btn btn-sm btn-outline-primary">Sign In</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button class="btn btn-sm btn-primary">Sign Up</button>
                        </SignUpButton>
                    </template>
                </div>
            </div>
        </header>

        <!-- Main DevLog Content -->
        <main class="flex-grow-1 py-4 py-sm-5">
            <div class="container" style="max-width: 860px;">
                <!-- Header / Hero section -->
                <div class="text-center mb-4 mb-sm-5">
                    <div class="d-inline-flex align-items-center gap-2 mb-2">
                        <span class="badge text-bg-primary-subtle text-primary-emphasis px-3 py-2 rounded-pill fs-6 fw-semibold">
                            📋 Product Changelog
                        </span>
                        <span class="badge text-bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill fs-6">
                            v0.2.1
                        </span>
                    </div>
                    <h1 class="display-5 display-md-4 fw-bold mt-2 mb-3 tracking-tight">Developer Log</h1>
                    <p class="lead text-secondary mx-auto" style="max-width: 650px;">
                        Track the ongoing evolution of Paper Note. Below you will find our monthly release notes, newly shipped features, and improvements.
                    </p>
                </div>

                <!-- Timeline Container -->
                <div class="devlog-timeline d-flex flex-column gap-4 gap-sm-5">
                    <!-- October 2026 Release -->
                    <article class="card border shadow-sm rounded-4 overflow-hidden">
                        <div class="card-header bg-body-tertiary border-bottom px-3 px-sm-4 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                            <div>
                                <div class="d-flex align-items-center gap-2">
                                    <h3 class="h4 fw-bold mb-0">October 2026</h3>
                                    <span class="badge text-bg-success rounded-pill px-2 py-1">Latest Update</span>
                                </div>
                                <small class="text-secondary">Release v0.2.1 • Mobile-First UI, Rich Text Formatting &amp; Monitoring</small>
                            </div>
                            <span class="text-secondary small">October 12, 2026</span>
                        </div>
                        <div class="card-body p-3 p-sm-4">
                            <p class="text-secondary mb-4">
                                This month brings a dedicated Mobile-First UI redesign, powerful rich text customization tools, automated background saving with real-time feedback, and system health checks to keep your writing safe, portable, and distraction-free across all devices.
                            </p>

                            <!-- Mobile-First UI -->
                            <div class="mb-4">
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>📱</span> Mobile-First UI
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Full-Screen Mobile Notes Tab &amp; Toggle:</strong>
                                            Added a dedicated <code>☰ Notes</code> button in the note title bar for small screens. Tapping it opens the notes drawer full-screen, allowing easy browsing, organization, and switching.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Instant Focus Return:</strong>
                                            Tapping any note or clicking <code>+ New Note</code> automatically dismisses the notes drawer, smoothly returning full-screen space to the editor for distraction-free note writing. Includes a dedicated <code>✕</code> close button to exit without switching.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Single-Row Touch-Scrollable Toolbar:</strong>
                                            Formatting controls now glide smoothly in a horizontal, single-row touch-scrollable bar on mobile viewports. This saves up to 120px of vertical space otherwise lost to keyboard and wrapped toolbars.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Touch Sizing &amp; Viewport Zoom Guard:</strong>
                                            Enlarged touch targets for fingers, 16px base editor font size preventing unwanted iOS Safari auto-zooming, and global overflow guards eliminating horizontal jitter.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <hr class="my-4 opacity-25">

                            <!-- Feature 1: Rich Text Customization -->
                            <div class="mb-4">
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>🎨</span> Rich Text Customization (Zero Dependencies)
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Flexible Font Sizing:</strong>
                                            Pick any font size from 8px to 96px by direct typing, clicking up/down stepper arrows, or using your <em>mouse scroll wheel</em> directly over the size input.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Universal Web-Safe Font Families:</strong>
                                            Choose from standard, cross-platform fonts with live previews in the dropdown:
                                            <span class="badge text-bg-light border text-dark ms-1">Times New Roman</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Georgia</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Garamond</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Arial</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Verdana</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Trebuchet MS</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Tahoma</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Courier New</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Consolas</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Comic Sans MS</span>
                                            <span class="badge text-bg-light border text-dark ms-1">Impact</span>.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Refined Color Palette:</strong>
                                            Named color swatches replace generic framework names with natural tones (Charcoal, Slate Gray, Crimson Red, Burnt Orange, Warm Amber, Forest Green, Ocean Blue, Amethyst Purple, Rose Pink).
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Native HTML5 Color Picker:</strong>
                                            Integrated 16-million hex color picker button with full browser palette and eyedropper screen sampling support.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Pastel Text Highlighter:</strong>
                                            Apply soft background highlights in Lemon Yellow, Mint Green, Soft Pink, Sky Blue, Soft Lavender, or Peach.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Live Cursor Caret Styling:</strong>
                                            Change formatting at any time without highlighting text first. The editor seamlessly creates a styled placeholder at your cursor so subsequent keystrokes adopt your chosen size, font, and color immediately.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Inline CSS Formatting:</strong>
                                            Notes now save clean inline styles, guaranteeing that notes render accurately across all devices and export formats without CSS library dependencies.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <hr class="my-4 opacity-25">

                            <!-- Feature 2: Automatic Saving & Notifications -->
                            <div class="mb-4">
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>💾</span> Automatic Saving &amp; Notifications
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">1-Minute Background Auto-Save:</strong>
                                            Never lose your train of thought. While you are logged in and working on a note, the editor automatically persists your content once every minute.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Non-Invasive Save Notifications:</strong>
                                            A discreet, floating Bootstrap toast appears in the bottom right corner of the screen confirming each automatic save.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Initial Safety Reminder:</strong>
                                            When you open the notes workspace, a one-time alert reminds you of the 1-minute auto-save interval and suggests doing a manual save before closing the browser tab.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <hr class="my-4 opacity-25">

                            <!-- Feature 3: Health Check API -->
                            <div>
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>🩺</span> Infrastructure &amp; Health Monitoring
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Health Check Endpoint:</strong>
                                            Added <code>GET /api/health</code> (and <code>/health</code>) for uptime monitors, load balancers, and container orchestration to verify server health and active PostgreSQL connectivity in real time.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </article>

                    <!-- September 2026 Release -->
                    <article class="card border shadow-sm rounded-4 overflow-hidden">
                        <div class="card-header bg-body-tertiary border-bottom px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <div class="d-flex align-items-center gap-2">
                                    <h3 class="h4 fw-bold mb-0">September 2026</h3>
                                    <span class="badge text-bg-secondary-subtle text-secondary-emphasis rounded-pill px-2 py-1">Initial Release</span>
                                </div>
                                <small class="text-secondary">Release v0.1.0 • Project Genesis &amp; Core Platform Launch</small>
                            </div>
                            <span class="text-secondary small">September 24, 2026</span>
                        </div>
                        <div class="card-body p-4">
                            <p class="text-secondary mb-4">
                                The debut release of Paper Note! Built from the ground up to provide a fast, secure, distraction-free environment for organizing thoughts and notes.
                            </p>

                            <!-- Feature 1: Core Note Taking -->
                            <div class="mb-4">
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>📝</span> Core Note-Taking Application
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Minimalist Note Workspace:</strong>
                                            Two-pane responsive layout with an intuitive note list sidebar and a dedicated full-screen editor pane.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Complete Note CRUD Operations:</strong>
                                            Create new notes, view note lists, update content and titles, and delete old notes seamlessly.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Interactive Formatting Foundation:</strong>
                                            Basic bold and italic formatting buttons with selection detection.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <hr class="my-4 opacity-25">

                            <!-- Feature 2: Full-Stack Architecture -->
                            <div class="mb-4">
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>⚙️</span> Full-Stack Architecture
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Vue 3 &amp; Vite:</strong>
                                            Modern reactive frontend powered by Vue 3 Single File Components and Vite for near-instant development and production bundling.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Express.js Backend:</strong>
                                            Modular Node.js server handling note REST endpoints and serving compiled static frontend bundles in production.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">PostgreSQL Database:</strong>
                                            Persistent SQL relational storage with automatic table initialization on startup.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <hr class="my-4 opacity-25">

                            <!-- Feature 3: Security & Customization -->
                            <div>
                                <h5 class="fw-bold d-flex align-items-center gap-2 text-primary">
                                    <span>🔒</span> Authentication &amp; Design
                                </h5>
                                <ul class="list-unstyled ps-3 mt-2 text-secondary d-flex flex-column gap-2">
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Clerk Authentication:</strong>
                                            Multi-tenant user authentication isolating note collections per user with Bearer token authorization.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Development Bypass Mode:</strong>
                                            Automatic fallback to offline developer mode when Clerk API keys are not supplied.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Adaptive Light / Dark Themes:</strong>
                                            One-click theme switching using Bootstrap 5 <code>data-bs-theme</code>, persisted locally across sessions.
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-start gap-2">
                                        <span class="text-success fw-bold">✓</span>
                                        <div>
                                            <strong class="text-body">Containerized Deployment:</strong>
                                            Multi-stage <code>Dockerfile</code> and <code>docker-compose.yml</code> setup connecting the Express app with a PostgreSQL container out of the box.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </article>
                </div>

                <!-- Footer Callout -->
                <div class="text-center mt-5 pt-4">
                    <button class="btn btn-primary px-4 py-2" @click="emit('navigate-home')">
                        {{ isSignedIn ? 'Return to Your Notes' : 'Get Started with Paper Note' }} &rarr;
                    </button>
                </div>
            </div>
        </main>

        <!-- DevLog Footer -->
        <footer class="border-top py-3 text-center text-secondary small bg-body">
            Paper Note &copy; 2026 • Product Changelog &amp; Developer Notes
        </footer>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
