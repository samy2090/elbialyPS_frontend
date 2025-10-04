import './assets/main.css'
import axios from "axios";

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true; // allow cookies