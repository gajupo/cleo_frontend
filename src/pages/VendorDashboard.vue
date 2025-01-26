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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Highlight row if isNew == true -->
          <tr
            v-for="order in orders"
            :key="order.order_id"
            :class="{'bg-info text-white': order.isNew}"
          >
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
              <div class="d-flex align-items-center">
                <!-- View Details Button -->
                <button
                  class="btn btn-link me-2"
                  @click="viewOrderDetails(order.order_id)"
                >
                  View Details
                </button>

                <!-- Show "Accept" button only if isNew -->
                <button
                  v-if="order.isNew"
                  class="btn btn-success"
                  @click="acceptNewOrder(order)"
                >
                  Accept
                </button>
              </div>
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

let eventSource = null; // SSE connection
let beepAudio = null;   // Audio element used for beeping

export default {
  data() {
    return {
      orders: [],
      loading: false,
      error: null,
      statuses: ['Created', 'Preparing', 'Delivering', 'Out of Location', 'Delivered'],
      selectedStatus: {},
      beeping: false, // track if beep is currently playing in a loop
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
    // Start listening for SSE if user is logged in
    this.initSSEConnection();
  },
  beforeUnmount() {
    // Close SSE connection
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    // Stop any ongoing beep
    this.stopBeep();
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
        this.orders.forEach((o) => {
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
      this.$router.push(`/order-status/${orderId}`);
    },
    logout() {
      const authStore = useAuthStore();
      authStore.logoutVendor();
      this.$router.push('/vendor/login');
    },

    // --------------------
    // SSE + Audio Methods
    // --------------------
    initSSEConnection() {
      eventSource = new EventSource('http://192.168.0.145:3000/api/vendor/orders/stream');
      eventSource.addEventListener('new_order', (event) => {
        const newOrder = JSON.parse(event.data);
        console.log('New order event:', newOrder);

        // Mark order as new
        const orderToAdd = {
          ...newOrder,
          isNew: true,
        };
        this.orders.unshift(orderToAdd);
        this.selectedStatus[newOrder.order_id] = newOrder.status;

        // If we're not already beeping, start beep
        if (!this.beeping) {
          this.startBeep();
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
      };
    },

    // Start looping the beep sound
    startBeep() {
      this.beeping = true;
      beepAudio = new Audio('/sounds/beep.mp3');
      beepAudio.loop = true;
      beepAudio
        .play()
        .catch((err) => {
          console.error('Audio playback failed:', err);
        });
    },

    // Stop beep if it's playing
    stopBeep() {
      if (beepAudio) {
        beepAudio.pause();
        beepAudio.currentTime = 0;
        beepAudio = null;
      }
      this.beeping = false;
    },

    acceptNewOrder(order) {
      // Mark the order as no longer new
      order.isNew = false;

      // Check if ANY order is still new
      const anyStillNew = this.orders.some((o) => o.isNew);
      if (!anyStillNew) {
        // If none are new, stop beep
        this.stopBeep();
      }

      // Optionally update the order status or do something else
      // For example, we might set the status to "Preparing" on acceptance
      // this.selectedStatus[order.order_id] = 'Preparing';
      // this.updateOrderStatus(order.order_id);
    },
  },
};
</script>

<style scoped>
/* Force a visible highlight for new orders */
.bg-info.text-white {
  background-color: #17a2b8 !important;
  color: white !important;
  transition: background-color 0.5s;
}
</style>
