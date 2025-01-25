// src/store/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

axios.interceptors.request.use(config => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  });
  
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    vendor: null,
  }),
  actions: {
    async loginVendor(email, password) {
      try {
        const response = await axios.post('/api/vendor/login', { email, password });
        // Example response: { token, vendor: {...} }
        this.token = response.data.token;
        this.vendor = response.data.vendor;

        // Store token in localStorage or cookies if needed
        localStorage.setItem('vendorToken', this.token);
      } catch (error) {
        throw error;
      }
    },
    logoutVendor() {
      this.token = null;
      this.vendor = null;
      localStorage.removeItem('vendorToken');
    },
  },
});
