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
    token: localStorage.getItem('vendorToken') || null, // Auto-load token from localStorage
    vendor: null,
  }),
  actions: {
    async loginVendor(email, password) {
      try {
        const response = await axios.post('/api/vendor/login', { email, password });
        this.token = response.data.token;
        this.vendor = response.data.vendor;

        // Store token for persistence
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
    initializeVendor() {
      if (this.token) {
        // Attempt to fetch vendor data if a token exists
        axios
          .get('/api/vendor/profile')
          .then(response => {
            this.vendor = response.data.vendor;
          })
          .catch(() => {
            this.logoutVendor(); // Clear invalid token
          });
      }
    },
  },
});
