<!-- src/pages/VendorDashboard.vue -->
<template>
    <div class="container mt-4">
      <h2>Vendor Dashboard</h2>
  
      <!-- Optional login or check if vendor is logged in -->
      <div v-if="!isLoggedIn" class="alert alert-info">
        Please log in to view orders.
      </div>
  
      <div v-else>
        <!-- Status filter buttons -->
        <div class="mb-3">
          <button 
            v-for="s in statuses" 
            :key="s" 
            class="btn btn-outline-primary me-2"
            @click="filterOrders(s)"
          >
            {{ s }}
          </button>
          <button class="btn btn-outline-secondary" @click="filterOrders('')">All</button>
        </div>
  
        <!-- Orders table -->
        <table class="table table-hover" v-if="!loading && orders.length">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.order_id">
              <td>{{ order.order_id }}</td>
              <td>{{ order.status }}</td>
              <td>${{ order.total_amount }}</td>
              <td>
                <select 
                  class="form-select" 
                  v-model="selectedStatus[order.order_id]" 
                  @change="updateOrderStatus(order.order_id)"
                >
                  <option v-for="opt in statuses" :key="opt">{{ opt }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div v-else-if="loading">
          <p>Loading orders...</p>
        </div>
        <div v-else>
          <p>No orders found.</p>
        </div>
  
        <!-- Error Handling -->
        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useAuthStore } from '../store/auth';
  
  export default {
    data() {
      return {
        orders: [],
        loading: false,
        error: null,
        statuses: ['Created', 'Preparing', 'Delivering', 'Out of Location', 'Delivered'],
        selectedStatus: {},
      };
    },
    computed: {
      isLoggedIn() {
        // Or direct store usage if you prefer
        const authStore = useAuthStore();
        return !!authStore.token;
      },
    },
    async created() {
      // If needed, check vendor authentication
      if (this.isLoggedIn) {
        this.fetchOrders();
      }
    },
    methods: {
      async fetchOrders(status = '') {
        try {
          this.loading = true;
          let url = '/api/vendor/orders';
          if (status) {
            url += `?status=${status}`;
          }
          const response = await axios.get(url);
          this.orders = response.data;
  
          // Initialize selected status for each order
          this.orders.forEach(o => {
            this.selectedStatus[o.order_id] = o.status;
          });
        } catch (err) {
          this.error = 'Could not fetch orders.';
          console.error(err);
        } finally {
          this.loading = false;
        }
      },
      filterOrders(status) {
        this.error = null;
        this.orders = [];
        this.fetchOrders(status);
      },
      async updateOrderStatus(orderId) {
        const newStatus = this.selectedStatus[orderId];
        try {
          await axios.put(`/api/vendor/orders/${orderId}/status`, { status: newStatus });
        } catch (err) {
          this.error = 'Failed to update order status.';
          console.error(err);
        }
      },
    },
  };
  </script>
  