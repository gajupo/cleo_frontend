<!-- src/pages/OrderStatusPage.vue -->
<template>
    <div class="container mt-4">
      <h2>Order Status</h2>
      <div v-if="loading">Loading order details...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else-if="order">
        <p><strong>Order ID:</strong> {{ order.order_id }}</p>
        <p><strong>Total:</strong> ${{ order.total_amount }}</p>
        <p><strong>Status:</strong> {{ order.status }}</p>
        <p><strong>Location:</strong> {{ order.delivery_location }}</p>
        <p><strong>Delivery Time Slot:</strong> {{ deliverySlotTime }}</p>
        <hr />
        <h5>Items:</h5>
        <ul>
          <li v-for="item in order.items" :key="item.order_item_id">
            {{ item.menu_id }} - Qty: {{ item.quantity }} - ${{ item.price }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        order: null,
        deliverySlotTime: null, // Store the delivery slot time
        loading: false,
        error: null,
      };
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
      } catch (err) {
        this.error = 'Order not found or server error.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  };
  </script>
  