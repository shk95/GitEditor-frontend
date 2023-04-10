import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from 'axios'

import 'bootstrap'
// import './assets/main.css'

axios.defaults.baseURL = '/api'
axios.defaults.headers.common.Accept = 'application/json'

const app = createApp(App)

app.config.globalProperties.$axios = axios
app.use(createPinia())
app.use(router)

app.mount('#app')
