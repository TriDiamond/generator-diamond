import { createApp } from 'vue'
// Vuex is replaced with Pinia see@https://github.com/posva/pinia
// Pinia has a much better TypeScript support,
// also it's a much simpler State Management setup
import { createPinia } from 'pinia'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import App from './App.vue'
import router from './router'

import './router/guard' // router guards

const app = createApp(App).use(createPinia()).use(router)

app.mount('#app')
