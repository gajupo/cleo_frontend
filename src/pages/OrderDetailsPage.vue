<!-- src/pages/OrderDetailsPage.vue -->
<template>
    <div class="container mt-4">
      <h2>Order Details</h2>
  
      <div v-if="cartItems.length">
        <table class="table">
          <thead>
            <tr>
              <th>Menu Item</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartItems" :key="item.menu_id">
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.price * item.quantity }}</td>
            </tr>
          </tbody>
        </table>
        <p class="fw-bold">Total: ${{ totalAmount }}</p>
      </div>
  
      <!-- Delivery, Payment, and Time Slot selection -->
      <div class="mb-3">
        <label for="address" class="form-label">Delivery Location</label>
        <input 
          type="text" 
          id="address" 
          class="form-control" 
          v-model="deliveryLocation"
          placeholder="Enter your address"
        />
        <button class="btn btn-secondary mt-2" @click="autoDetectLocation">Auto-Detect Location</button>
      </div>
  
      <div class="mb-3">
        <label class="form-label">Payment Method</label>
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="radio" 
            name="paymentType" 
            value="Card" 
            v-model="paymentType"
          />
          <label class="form-check-label">Card</label>
        </div>
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="radio" 
            name="paymentType" 
            value="Cash" 
            v-model="paymentType"
          />
          <label class="form-check-label">Cash on Delivery</label>
        </div>
      </div>
  
      <div class="mb-3">
        <label class="form-label" for="deliveryTime">Select Delivery Time</label>
        <select class="form-select" v-model="selectedTimeSlot">
          <option disabled value="">-- Choose a time slot --</option>
          <option v-for="slot in timeSlots" :key="slot.slot_id" :value="slot.slot_id">
            {{ slot.time }}
          </option>
        </select>
      </div>
  
      <button class="btn btn-primary" @click="placeOrder">Place Order</button>
  
      <!-- Loading state and error messages -->
      <div v-if="loading" class="mt-3">
        <p>Placing your order, please wait...</p>
      </div>
      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useCartStore } from '../store/cart';
  
  export default {
    data() {
      return {
        deliveryLocation: '',
        paymentType: 'Cash',
        timeSlots: [],
        selectedTimeSlot: null,
        loading: false,
        error: null,
      };
    },
    computed: {
      cartItems() {
        const cartStore = useCartStore();
        return cartStore.items;
      },
      totalAmount() {
        const cartStore = useCartStore();
        return cartStore.totalAmount;
      },
    },
    async created() {
      // Optionally fetch available time slots
      try {
        const response = await axios.get('/api/delivery-slots');
        this.timeSlots = response.data;
      } catch (err) {
        console.error(err);
      }
    },
    methods: {
      async autoDetectLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            // In real scenario, reverse-geocode (Google Maps API) or just store lat/lng
            const { latitude, longitude } = position.coords;
            this.deliveryLocation = `Lat: ${latitude}, Lng: ${longitude}`;
          }, error => {
            alert('Geolocation not permitted. Please enter address manually.');
          });
        }
      },
      async placeOrder() {
        if (!this.cartItems.length) {
          this.error = 'Cart is empty. Please add items first.';
          return;
        }
        if (!this.deliveryLocation) {
          this.error = 'Please provide a delivery location.';
          return;
        }
        if (!this.selectedTimeSlot) {
          this.error = 'Please select a delivery time slot.';
          return;
        }
  
        this.loading = true;
        this.error = null;
        try {
          const payload = {
            items: this.cartItems,
            payment_type: this.paymentType,
            delivery_time_slot_id: this.selectedTimeSlot,
            delivery_location: this.deliveryLocation,
          };
          const response = await axios.post('/api/orders', payload);
          const { orderId } = response.data;
  
          // Clear cart
          useCartStore().clearCart();
  
          // Redirect to status page
          this.$router.push(`/order-status/${orderId}`);
        } catch (err) {
          this.error = 'Failed to place order. Please try again.';
          console.error(err);
        } finally {
          this.loading = false;
        }
      },
    },
  };
  </script>  