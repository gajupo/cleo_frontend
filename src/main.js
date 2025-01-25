// src/main.js
import { createApp } from 'vue';
import App from './App.vue';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap'; // optional JS
import axios from 'axios';

// Router
import router from './router';

// Pinia
import { createPinia } from 'pinia';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// set base URL for axios
axios.defaults.baseURL = 'http://localhost:3000';

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app');
