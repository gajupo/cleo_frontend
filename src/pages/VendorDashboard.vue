<template>
  <div class="container-fluid mt-3">
    <h2 class="mb-3 text-center">Vendor Dashboard</h2>

    <!-- Redirect if not logged in -->
    <div v-if="!isLoggedIn" class="alert alert-info">
      Redirecting to login...
    </div>

    <div v-else>
      <!-- Top row: Vendor Name & Logout -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h5 class="mb-2 mb-sm-0">
          Welcome, {{ vendorName }}
        </h5>
        <button class="btn btn-danger btn-sm" @click="logout">Logout</button>
      </div>

      <!-- Status Filter Buttons (stack on mobile) -->
      <div class="mb-3 d-flex flex-wrap gap-2">
        <button
          v-for="s in statuses"
          :key="s"
          class="btn btn-outline-primary btn-sm"
          @click="filterOrders(s)"
        >
          {{ s }}
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="filterOrders('')">All</button>
      </div>

      <!-- Conditionally Render Orders Table or Loading/No Results -->
      <div v-if="loading" class="text-center">
        <p>Loading orders...</p>
      </div>
      <div v-else-if="orders.length">
        <!-- Make table scrollable horizontally on small screens -->
        <div class="table-responsive">
          <table class="table table-hover table-sm align-middle">
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
                    class="form-select form-select-sm"
                    v-model="selectedStatus[order.order_id]"
                    @change="updateOrderStatus(order.order_id)"
                  >
                    <option v-for="opt in statuses" :key="opt">{{ opt }}</option>
                  </select>
                </td>
                <td>
                  <div class="d-flex flex-column flex-sm-row gap-2">
                    <!-- View Details Button -->
                    <button
                      class="btn btn-link p-0 text-decoration-none btn-sm"
                      @click="viewOrderDetails(order.order_id)"
                    >
                      View
                    </button>

                    <!-- "Accept" button if isNew -->
                    <button
                      v-if="order.isNew"
                      class="btn btn-success btn-sm"
                      @click="acceptNewOrder(order)"
                    >
                      Accept
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else>
        <p class="text-center">No orders found.</p>
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
let beepAudio = null;   // Audio element for beeping

export default {
  name: 'VendorDashboard',
  data() {
    return {
      orders: [],
      loading: false,
      error: null,
      statuses: ['Created', 'Preparing', 'Delivering', 'Out of Location', 'Delivered'],
      selectedStatus: {},
      beeping: false, // track if beep is looping
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
      this.$router.push('/vendor/login');
      return;
    }

    await this.fetchOrders();
    this.initSSEConnection();
  },
  beforeUnmount() {
    // Close SSE
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    // Stop beep if playing
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
        // Initialize status selections
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

    // SSE + Audio
    initSSEConnection() {
      eventSource = new EventSource('http://192.168.0.145:3000/api/vendor/orders/stream');
      eventSource.addEventListener('new_order', (event) => {
        const newOrder = JSON.parse(event.data);
        console.log('New order event:', newOrder);

        // Mark as new
        const orderToAdd = {
          ...newOrder,
          isNew: true,
        };
        this.orders.unshift(orderToAdd);
        this.selectedStatus[newOrder.order_id] = newOrder.status;

        // If beep not playing, start beep
        if (!this.beeping) {
          this.startBeep();
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
      };
    },
    startBeep() {
      this.beeping = true;
      beepAudio = new Audio('/sounds/beep.mp3');
      beepAudio.loop = true;
      beepAudio.play().catch((err) => {
        console.error('Audio playback failed:', err);
      });
    },
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

      // If no orders remain new, stop beep
      const anyStillNew = this.orders.some((o) => o.isNew);
      if (!anyStillNew) {
        this.stopBeep();
      }
    },
  },
};
</script>

<style scoped>
/* Slight margin for small screens */
.container-fluid {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/* Make sure the table looks good on small devices */
.table-sm td, .table-sm th {
  padding: 0.5rem;
}

/* Force a visible highlight for new orders */
.bg-info.text-white {
  background-color: #17a2b8 !important;
  color: white !important;
  transition: background-color 0.5s;
}
</style>
