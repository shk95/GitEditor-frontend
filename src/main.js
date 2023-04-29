import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import 'bootstrap'
// import './assets/main.css'

startApp()

async function startApp() {
  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedState)
  app.use(pinia)
  app.use(router)
  // attempt to auto refresh token before startup
  app.mount('#app')
}
