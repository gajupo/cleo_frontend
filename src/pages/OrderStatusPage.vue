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
        loading: false,
        error: null,
      };
    },
    async created() {
      const { orderId } = this.$route.params;
      this.loading = true;
      try {
        const response = await axios.get(`/api/orders/${orderId}`);
        this.order = response.data;
      } catch (err) {
        this.error = 'Order not found or server error.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  };
  </script>
  