#!/bin/bash

# Create root level files
touch index.html package.json vite.config.js

# Create public directory
mkdir public

# Create src directory and its subdirectories
mkdir -p src/assets
mkdir -p src/router
mkdir -p src/store
mkdir -p src/pages
mkdir -p src/components

# Create source files
touch src/App.vue src/main.js

# Create router file
touch src/router/index.js

# Create Pinia store files
touch src/store/cart.js src/store/auth.js

# Create page components
touch src/pages/HomePage.vue \
      src/pages/MenuPage.vue \
      src/pages/OrderDetailsPage.vue \
      src/pages/OrderStatusPage.vue \
      src/pages/VendorDashboard.vue

# Create common components
touch src/components/Navbar.vue src/components/Footer.vue

echo "Folder and file structure for '$PROJECT_NAME' has been created successfully."
