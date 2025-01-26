<template>
  <div class="container mt-4">
    <h2>Vendor Dashboard</h2>

    <!-- Redirect if not logged in -->
    <div v-if="!isLoggedIn" class="alert alert-info">
      Redirecting to login...
    </div>

    <div v-else>
      <!-- Logout Button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>Welcome, {{ vendorName }}</h5>
        <button class="btn btn-danger" @click="logout">Logout</button>
      </div>

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
            <th>Details</th>
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
            <td>
              <button 
                class="btn btn-link" 
                @click="viewOrderDetails(order.order_id)"
              >
                View Details
              </button>
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
import { mapState } from 'pinia';

let eventSource = null; // Keep a reference to the SSE connection

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
    ...mapState(useAuthStore, ['token', 'vendor']),
    isLoggedIn() {
      return !!this.token;
    },
    vendorName() {
      return this.vendor ? this.vendor.name : 'Vendor';
    },
  },
  async created() {
    if (!this.isLoggedIn) {
      this.$router.push('/vendor/login'); // Redirect to login page if not logged in
      return;
    }

    await this.fetchOrders();

    // ============= SSE SETUP =============
    // Open a connection to SSE only if the user is logged in
    this.initSSEConnection();
  },
  beforeUnmount() {
    // Close SSE connection when leaving this page
    if (eventSource) {
      eventSource.close();
      eventSource = null;
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
    viewOrderDetails(orderId) {
      this.$router.push(`/order-status/${orderId}`); // Redirect to Order Details page
    },
    logout() {
      const authStore = useAuthStore();
      authStore.logoutVendor(); // Clear token and vendor data
      this.$router.push('/vendor/login'); // Redirect to login
    },

    // ============= SSE METHODS =============
    initSSEConnection() {
      // Create an EventSource to /api/vendor/orders/stream
      eventSource = new EventSource('http://localhost:3000/api/vendor/orders/stream');

      // Listen for "new_order" events
      eventSource.addEventListener('new_order', (event) => {
        // parse the data
        const newOrder = JSON.parse(event.data);
        console.log('New order event:', newOrder);

        // Option 1: Just add to the front
        this.orders.unshift({
          order_id: newOrder.order_id,
          total_amount: newOrder.total_amount,
          status: newOrder.status,
          created_at: newOrder.created_at,
          // Include other fields as needed
        });
        // Also set default status selection
        this.selectedStatus[newOrder.order_id] = newOrder.status;
      });

      // Optional: handle error events
      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        // If needed, close and retry logic could go here
      };
    },
  },
};
</script>
