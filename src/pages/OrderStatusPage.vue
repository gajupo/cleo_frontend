<template>
  <div class="container mt-4">
    <h2>Order Status</h2>

    <!-- Button to return to Vendor Dashboard -->
    <div v-if="isVendorLoggedIn" class="mb-3">
      <button class="btn btn-secondary" @click="goToVendorDashboard">
        Back to Vendor Dashboard
      </button>
    </div>

    <div v-if="loading">Loading order details...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="order">
      <p><strong>Order ID:</strong> {{ order.order_id }}</p>
      <p><strong>Total:</strong> ${{ order.total_amount }}</p>
      <p><strong>Status:</strong> <span class="badge bg-info">{{ order.status }}</span></p>
      <p><strong>Location:</strong> {{ order.delivery_location }}</p>
      <p><strong>Delivery Time Slot:</strong> {{ deliverySlotTime }}</p>
      <hr />
      <h5>Items:</h5>
      <ul>
        <li v-for="item in enrichedItems" :key="item.order_item_id">
          <strong>{{ item.menu_name }}</strong> - Qty: {{ item.quantity }} - ${{ item.price }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../store/auth';

export default {
  data() {
    return {
      order: null,
      enrichedItems: [], // Store items with menu names
      deliverySlotTime: null, // Store the delivery slot time
      loading: false,
      error: null,
    };
  },
  computed: {
    isVendorLoggedIn() {
      const authStore = useAuthStore();
      return !!authStore.token;
    },
  },
  async created() {
    const { orderId } = this.$route.params;
    this.loading = true;
    try {
      // Fetch order details
      const response = await axios.get(`/api/orders/${orderId}`);
      this.order = response.data;

      // Fetch delivery slot time if delivery_time_slot_id is present
      if (this.order.delivery_time_slot_id) {
        const slotResponse = await axios.get(
          `/api/delivery-slots/${this.order.delivery_time_slot_id}`
        );
        this.deliverySlotTime = slotResponse.data.time; // Set the slot time
      }

      // Fetch menu names for all items
      await this.fetchMenuNames();
    } catch (err) {
      this.error = 'Order not found or server error.';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchMenuNames() {
      try {
        const itemsWithNames = await Promise.all(
          this.order.items.map(async (item) => {
            const menuResponse = await axios.get(`/api/menus/${item.menu_id}`);
            return {
              ...item,
              menu_name: menuResponse.data.name, // Add menu name to the item
            };
          })
        );
        this.enrichedItems = itemsWithNames;
      } catch (err) {
        console.error('Failed to fetch menu names:', err);
        this.error = 'Failed to load product details.';
      }
    },
    goToVendorDashboard() {
      this.$router.push('/vendor');
    },
  },
};
</script>
