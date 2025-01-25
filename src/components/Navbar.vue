<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <!-- Brand / Logo -->
        <router-link to="/" class="navbar-brand">
          Doña Cleo
        </router-link>
  
        <!-- Toggler button for mobile view -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
  
        <!-- Navbar links -->
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/" class="nav-link" exact>Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/menu" class="nav-link">Menu</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/order-details" class="nav-link">Order Details</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/vendor" class="nav-link">Vendor Dashboard</router-link>
            </li>
          </ul>
  
          <!-- Right side (optional) -->
          <!-- Example: show cart item count using a Pinia store, or user login status -->
          <div>
            <!-- If you have a cart store, display item count -->
            <!-- <span class="text-white me-3">Cart Items: {{ cartItemCount }}</span> -->
            <!-- If you have authentication, display login/logout button -->
            <!-- <button class="btn btn-outline-light">Login</button> -->
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { useCartStore } from '../store/cart';
  import { computed } from 'vue';
  
  export default {
    setup() {
      // If you need to display cart count:
      // const cartStore = useCartStore();
      // const cartItemCount = computed(() => cartStore.itemCount);
  
      return {
        // cartItemCount
      };
    },
  };
  </script>
  
  <style scoped>
  /* Optional: override navbar styles here */
  </style>
  