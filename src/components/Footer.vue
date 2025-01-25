<template>
    <footer class="bg-light text-center text-lg-start mt-4">
      <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.05);">
        © {{ currentYear }} FoodBooking. All rights reserved.
        <!-- Add social icons or links below if needed -->
        <!-- 
        <a href="#" class="ms-3 text-dark">
          <i class="fab fa-facebook-f"></i>
        </a>
        -->
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentYear: new Date().getFullYear(),
      };
    },
  };
  </script>
  
  <style scoped>
  /* Adjust your footer style here if desired */
  footer {
    position: relative;
    bottom: 0;
    width: 100%;
  }
  </style>  