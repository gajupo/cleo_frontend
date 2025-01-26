<template>
    <div class="container mt-4">
      <!-- "Go to Order" Button -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Our Menus</h2>
        <button 
          v-if="cartItemCount > 0" 
          @click="goToOrder" 
          class="btn btn-warning"
        >
          Ver Orden <span class="badge badge-info">{{ cartItemCount }} </span>
        </button>
      </div>
  
      <div class="row">
        <div 
          v-for="menu in menus" 
          :key="menu.menu_id" 
          class="col-md-4 mb-3"
        >
          <!-- Dynamic Class for Selected Items -->
          <div 
            class="card" 
            :class="{ 'bg-success text-white': isItemInCart(menu.menu_id) }"
          >
            <img :src="menu.image_url" class="card-img-top" alt="Menu Item" />
            <div class="card-body">
              <h5>{{ menu.name }}</h5>
              <p>{{ menu.description }}</p>
              <p class="fw-bold">${{ menu.price }}</p>
              <div class="d-flex align-items-center">
                <input 
                  type="number" 
                  min="1" 
                  v-model.number="quantities[menu.menu_id]" 
                  class="form-control w-50 me-2"
                />
                <button 
                  class="btn btn-primary" 
                  @click="addToCart(menu)"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <p>Loading menus...</p>
      </div>
  
      <!-- Error Handling -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useCartStore } from '../store/cart.js';
  
  export default {
    data() {
      return {
        menus: [],
        quantities: {},
        loading: false,
        error: null,
        cartItemCount: 0 // Initialize cart item count
      };
    },
    async created() {
      this.fetchMenus();
      this.updateCartCount(); // Ensure cart count updates on page load
    },
    methods: {
      async fetchMenus() {
        try {
          this.loading = true;
          const response = await axios.get('/api/menus');
          this.menus = response.data;
          this.menus.forEach(menu => {
            this.quantities[menu.menu_id] = 1; // default quantity
          });
        } catch (err) {
          this.error = 'Could not fetch menus. Please try again.';
          console.error(err);
        } finally {
          this.loading = false;
        }
      },
      addToCart(menu) {
        const quantity = this.quantities[menu.menu_id];
        if (quantity < 1) return;
  
        const cartStore = useCartStore();
        cartStore.addItem({
          menu_id: menu.menu_id,
          name: menu.name,
          price: menu.price,
          quantity,
        });
        this.updateCartCount(); // Update cart item count
      },
      isItemInCart(menuId) {
        const cartStore = useCartStore();
        return cartStore.items.some(item => item.menu_id === menuId);
      },
      updateCartCount() {
        const cartStore = useCartStore();
        this.cartItemCount = cartStore.items.length;
      },
      goToOrder() {
        // Logic to navigate to the order page
        this.$router.push('/order-details');
      }
    },
  };
  </script>
  
  <style>
  /* Optional styles for a more visible selection */
  .bg-success {
    transition: background-color 0.3s ease;
  }
  </style>
  