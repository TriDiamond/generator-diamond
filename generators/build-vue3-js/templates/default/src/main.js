import { createApp } from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import App from './App.vue'
import router from './router'
import store from './store'

import './router/guard' // router guards

const app = createApp(App).use(store).use(router)

app.mount('#app')
