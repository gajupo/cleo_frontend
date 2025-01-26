<template>
    <div class="container mt-4">
      <h2>Vendor Login</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            class="form-control"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            id="password"
            class="form-control"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { useAuthStore } from '../store/auth';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        error: null,
      };
    },
    methods: {
      async login() {
        const authStore = useAuthStore();
        try {
          await authStore.loginVendor(this.email, this.password);
          this.$router.push('/vendor'); // Redirect to the dashboard after login
        } catch (err) {
          this.error = 'Invalid email or password.';
          console.error(err);
        }
      },
    },
  };
  </script>
  