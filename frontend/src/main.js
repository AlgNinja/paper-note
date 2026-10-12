import { createApp } from 'vue'
import { clerkPlugin } from '@clerk/vue'
import "./assets/main.css"
import App from './App.vue'

const app = createApp(App)

const publishableKey =
  (typeof window !== 'undefined' && window.__CLERK_PUBLISHABLE_KEY__) ||
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.CLERK_PUBLISHABLE_KEY ||
  ''

app.use(clerkPlugin, {
  publishableKey: publishableKey,
})

app.mount('#app')
