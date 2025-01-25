// src/store/cart.js
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // array of { menu_id, name, price, quantity }
  }),
  getters: {
    totalAmount(state) {
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    itemCount(state) {
      return state.items.reduce((count, item) => count + item.quantity, 0);
    },
  },
  actions: {
    addItem(newItem) {
      const existing = this.items.find(i => i.menu_id === newItem.menu_id);
      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        this.items.push(newItem);
      }
    },
    removeItem(menu_id) {
      this.items = this.items.filter(i => i.menu_id !== menu_id);
    },
    clearCart() {
      this.items = [];
    },
  },
    persist: {
    key: 'my-cart-store',   // optional custom key name
    storage: sessionStorage // <--- ensures data is cleared when the session ends
    },
});
