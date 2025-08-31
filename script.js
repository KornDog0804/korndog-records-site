function createAdminPanel() {
  // Create admin panel container
  const adminPanel = document.createElement('div');
  adminPanel.id = 'adminPanel';
  adminPanel.className = 'admin-panel';
  
  // Admin panel header
  adminPanel.innerHTML = `
    <div class="admin-header">
      <h2><i class="fas fa-lock"></i> KornDog Records Admin</h2>
      <button id="closeAdminBtn" class="btn btn-secondary">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="admin-tabs">
      <button class="admin-tab active" data-tab="inventory">Inventory</button>
      <button class="admin-tab" data-tab="orders">Orders</button>
      <button class="admin-tab" data-tab="settings">Settings</button>
    </div>
    
    <div class="admin-content">
      <!-- Inventory Tab -->
      <div class="admin-tab-content active" id="inventoryTab">
        <div class="admin-actions">
          <button id="addProductBtn" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add Product
          </button>
          <div class="admin-search">
            <input type="text" id="searchInventory" placeholder="Search inventory...">
            <select id="filterType">
              <option value="all">All Types</option>
              <option value="vinyl">Vinyl</option>
              <option value="funko">Funko</option>
              <option value="collectible">Collectible</option>
            </select>
            <select id="filterCharacter">
              <option value="all">All Characters</option>
              <option value="zombie">Zombie Kitty</option>
              <option value="chibi">Chibi Kitty</option>
              <option value="korndog">KornDog</option>
            </select>
          </div>
        </div>
        
        <div class="inventory-table-container">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Type</th>
                <th>Character</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="inventoryTableBody">
              <!-- Inventory items will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Orders Tab -->
      <div class="admin-tab-content" id="ordersTab">
        <h3>Recent Orders</h3>
        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="ordersTableBody">
              <!-- Order data will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div class="admin-tab-content" id="settingsTab">
        <h3>Store Settings</h3>
        <div class="settings-form">
          <div class="form-group">
            <label>Store Name</label>
            <input type="text" id="storeName" value="KornDog Records">
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select id="currency">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tax Rate (%)</label>
            <input type="number" id="taxRate" value="8.5" min="0" max="30" step="0.1">
          </div>
          <div class="form-group">
            <label>Default 3D Mode</label>
            <div class="toggle-switch">
              <input type="checkbox" id="default3D">
              <label for="default3D"></label>
            </div>
          </div>
          <button id="saveSettingsBtn" class="btn btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(adminPanel);
  
  // Add event listeners for admin panel
  document.getElementById('closeAdminBtn').addEventListener('click', toggleAdminPanel);
  
  // Tab switching
  const tabs = adminPanel.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab content
      const tabContents = adminPanel.querySelectorAll('.admin-tab-content');
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Show selected tab content
      const tabName = tab.getAttribute('data-tab');
      document.getElementById(`${tabName}Tab`).classList.add('active');
    });
  });
  
  // Add product button
  document.getElementById('addProductBtn').addEventListener('click', showAddProductModal);
  
  // Search and filter functionality
  document.getElementById('searchInventory').addEventListener('input', filterInventory);
  document.getElementById('filterType').addEventListener('change', filterInventory);
  document.getElementById('filterCharacter').addEventListener('change', filterInventory);
  
  // Save settings button
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  
  return adminPanel;
}
