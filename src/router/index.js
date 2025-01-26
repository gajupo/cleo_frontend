import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import MenuPage from '../pages/MenuPage.vue';
import OrderDetailsPage from '../pages/OrderDetailsPage.vue';
import OrderStatusPage from '../pages/OrderStatusPage.vue';
import VendorDashboard from '../pages/VendorDashboard.vue';
import VendorLogin from '../pages/VendorLogin.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/menu', name: 'Menu', component: MenuPage },
  { path: '/order-details', name: 'OrderDetails', component: OrderDetailsPage },
  { path: '/order-status/:orderId', name: 'OrderStatus', component: OrderStatusPage },
  { path: '/vendor', name: 'VendorDashboard', component: VendorDashboard },
  { path: '/vendor/login', name: 'VendorLogin', component: VendorLogin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
