// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// SUPER AGGRESSIVE LOADING SCREEN FIX
(function() {
  // Method 1: Immediate timeout
  setTimeout(function() {
    hideLoadingScreen();
  }, 2000);
  
  // Method 2: DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(hideLoadingScreen, 500);
  });
  
  // Method 3: Window load event
  window.addEventListener('load', hideLoadingScreen);
  
  // Method 4: Periodic check
  let checkCount = 0;
  const loadingCheckInterval = setInterval(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      hideLoadingScreen();
    }
    
    checkCount++;
    if (checkCount >= 5) {
      clearInterval(loadingCheckInterval);
    }
  }, 1000);
})();

// Safe localStorage wrapper
function safeGetItem(key, defaultValue = null) {
  try {
    if (typeof Storage !== "undefined" && localStorage) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  return defaultValue;
}

function safeSetItem(key, value) {
  try {
    if (typeof Storage !== "undefined" && localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  return false;
}

// Global state
const state = {
  cart: [],
  products: [],
  currentSection: 'home',
  currentFilter: null,
  isAdmin: false,
  editingProduct: null
};

// Kitty Messages - Batman Comic Style
const kittyMessages = {
  zombie: [
    "ROCK ON!",
    "VINYL POWER!",
    "SPIN ME RIGHT ROUND!",
    "MUSIC TO MY EARS!",
    "THAT'S A GROOVE!",
    "NEEDLE DROP MAGIC!",
    "ANALOG FOREVER!",
    "WICKED CHOICE!",
    "TURN IT UP!",
    "PURE AUDIO GOLD!"
  ],
  chibi: [
    "KAWAII CHOICE!",
    "POP PERFECTION!",
    "SO COLLECTIBLE!",
    "FUNKO FANTASTIC!",
    "SHELF WORTHY!",
    "LIMITED EDITION!",
    "COLLECTOR'S DREAM!",
    "UNBOX THE MAGIC!",
    "DISPLAY READY!",
    "FUNKO FEVER!"
  ],
  remove: [
    "NOOO! COME BACK!",
    "BUT... BUT...",
    "RECONSIDER?",
    "IT WAS SO GOOD!",
    "SECOND THOUGHTS?",
    "DON'T LEAVE ME!",
    "MAYBE LATER?",
    "I'LL WAIT HERE...",
    "CART SADNESS...",
    "HASTA LA VISTA!"
  ]
};

// Initialize default products
function initializeProducts() {
  if (state.products.length === 0) {
    state.products = [
      // Vinyl Records
      {
        id: 1,
        title: "Pink Floyd - Dark Side of the Moon",
        price: 29.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png",
        imageBack: null,
        description: "Legendary progressive rock masterpiece on 180g vinyl. A must-have for any serious collector with pristine sound quality.",
        type: 'vinyl'
      },
      {
        id: 2,
        title: "The Cure - Disintegration",
        price: 32.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png",
        imageBack: null,
        description: "Gothic masterpiece featuring atmospheric soundscapes. Dark, emotional, and utterly beautiful - a perfect rainy day album.",
        type: 'vinyl'
      },
      {
        id: 3,
        title: "My Chemical Romance - Black Parade",
        price: 27.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png",
        imageBack: null,
        description: "Emo rock opera with theatrical flair. Perfect for dramatic listening sessions and sing-along moments.",
        type: 'vinyl'
      },
      
      // Funko Pops
      {
        id: 6,
        title: "Funko Pop! Music - Freddie Mercury",
        price: 19.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png",
        imageBack: null,
        description: "Queen's legendary frontman in his iconic yellow jacket from Wembley. Limited edition with detailed sculpting!",
        type: 'funko'
      },
      {
        id: 7,
        title: "Funko Pop! Horror - Pennywise",
        price: 24.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png",
        imageBack: null,
        description: "The dancing clown from Stephen King's IT, complete with detailed costume and red balloon accessory.",
        type: 'funko'
      },
      {
        id: 8,
        title: "Funko Pop! Marvel - Spider-Man",
        price: 17.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png",
        imageBack: null,
        description: "Your friendly neighborhood Spider-Man in classic red and blue suit. Perfect for any Marvel collection!",
        type: 'funko'
      },
      
      // CDs
      {
        id: 14,
        title: "The Cure - Seventeen Seconds (Remastered)",
        price: 15.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png",
        imageBack: null,
        description: "Remastered edition of the influential gothic rock album with bonus tracks and enhanced audio quality.",
        type: 'cd'
      },
      {
        id: 15,
        title: "Joy Division - Unknown Pleasures",
        price: 18.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png",
        imageBack: null,
        description: "Post-punk masterpiece with the iconic pulsar wave cover. Essential listening for alternative music fans.",
        type: 'cd'
      },
      
      // Movies
      {
        id: 16,
        title: "The Nightmare Before Christmas (4K)",
        price: 24.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png",
        imageBack: null,
        description: "Tim Burton's stop-motion classic in stunning 4K Ultra HD with behind-the-scenes content and director commentary.",
        type: 'movie'
      },
      {
        id: 17,
        title: "Beetlejuice (Collector's Edition)",
        price: 22.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png",
        imageBack: null,
        description: "The ghost with the most in a special collector's edition featuring deleted scenes and making-of documentaries.",
        type: 'movie'
      },
      
      // Collectibles
      {
        id: 18,
        title: "Limited Edition Zombie Kitty Figure",
        price: 49.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png",
        imageBack: null,
        description: "Exclusive KornDog Records mascot figure with glow-in-the-dark eyes. Only 500 made worldwide - a true collector's item!",
        type: 'collectible'
      },
      {
        id: 19,
        title: "Limited Edition Chibi Kitty Figure",
        price: 49.99,
        imageFront: "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png",
        imageBack: null,
        description: "Exclusive KornDog Records mascot figure with interchangeable expressions. Only 500 made worldwide!",
        type: 'collectible'
      }
    ];
    saveProducts();
  }
}

// Loading screen management
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    console.log('Loading screen hidden');
  }
}

// SECURE ADMIN SYSTEM - WORKING VERSION
let adminClickCount = 0;
let lastClickTime = 0;
const ADMIN_PASSWORD = "KornDog2025!";
const CLICK_TIMEOUT = 4000; // 4 seconds

function forceAdminAccess() {
  if (checkAdminLockout()) {
    showNotification('Admin access temporarily locked due to failed attempts');
    return;
  }
  
  const password = prompt("Enter admin password:");
  if (password === ADMIN_PASSWORD) {
    enableAdminAccess();
  } else if (password !== null) {
    handleFailedLogin();
  }
}

function enableAdminAccess() {
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.classList.add('show');
    adminBtn.style.opacity = '1';
    adminBtn.style.pointerEvents = 'auto';
    adminBtn.style.display = 'block';
    showNotification('Admin access granted!');
    state.isAdmin = true;
    safeSetItem('kdr_admin_enabled', true);
    safeSetItem('kdr_failed_attempts', 0);
    
    // Also open admin panel immediately
    setTimeout(() => {
      toggleAdmin();
    }, 500);
  }
}

function handleFailedLogin() {
  let attempts = safeGetItem('kdr_failed_attempts', 0) + 1;
  safeSetItem('kdr_failed_attempts', attempts);
  
  if (attempts >= 3) {
    safeSetItem('kdr_admin_lockout', Date.now());
    showNotification('Admin locked for 10 minutes due to failed attempts');
  } else {
    showNotification(`Incorrect password. ${3 - attempts} attempts remaining`);
  }
}

function checkAdminLockout() {
  const lockoutTime = safeGetItem('kdr_admin_lockout', 0);
  if (lockoutTime) {
    const timeDiff = Date.now() - lockoutTime;
    if (timeDiff < 600000) { // 10 minutes
      return true;
    } else {
      safeSetItem('kdr_admin_lockout', 0);
      safeSetItem('kdr_failed_attempts', 0);
    }
  }
  return false;
}

// Navigation Functions
function goHome() {
  showSection('home');
}

function showSection(sectionName) {
  document.querySelectorAll('.content-area').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = sectionName === 'home' ? 'homeSection' : sectionName;
  const section = document.getElementById(targetSection);
  if (section) {
    section.classList.add('active');
    state.currentSection = sectionName;
    
    if (sectionName === 'store2d') {
      if (state.currentFilter) {
        filterProducts(state.currentFilter);
      } else {
        showCategoryPrompt();
      }
    }
  }
}

function showStore() {
  showSection('store2d');
}

function showStoreCategory(category) {
  showSection('store2d');
  setTimeout(() => {
    filterProducts(category);
  }, 100);
}

function show3DInfo() {
  // Create a 3D experience section if it doesn't exist
  let experience3d = document.getElementById('experience3d');
  if (!experience3d) {
    experience3d = document.createElement('section');
    experience3d.id = 'experience3d';
    experience3d.className = 'content-area';
    experience3d.innerHTML = `
      <div class="experience-3d">
        <button class="back-btn" onclick="goHome()">
          <i class="fas fa-arrow-left"></i>
          Back to Home
        </button>
        <h2>3D Experience</h2>
        <span class="coming-soon-badge">Coming Soon</span>
        <p>We're working on an immersive 3D shopping experience where you can browse our vinyl records, CDs, and collectibles in a virtual store environment.</p>
        <p>Check back soon for this exciting feature!</p>
        <button class="btn-large btn-primary" onclick="showStore()">
          <i class="fas fa-store"></i>
          Browse 2D Store Instead
        </button>
      </div>
    `;
    document.body.appendChild(experience3d);
  }
  
  showSection('experience3d');
}

// Hero Image Management
function selectHeroImage(imageUrl) {
  // Update hero images immediately
  updateHeroImagesOnPage(imageUrl);
  
  // Save to localStorage
  safeSetItem('kdr_hero_image', imageUrl);
  
  // Update selection visual
  document.querySelectorAll('.hero-image-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  event.target.closest('.hero-image-option').classList.add('selected');
  
  showNotification('Hero image updated!');
}

function updateHeroImagesOnPage(imageUrl) {
  // Update hero logo
  const heroLogo = document.getElementById('heroLogo');
  if (heroLogo) {
    heroLogo.src = imageUrl;
  }
  
  // Update nav brand logo
  const navLogo = document.getElementById('navLogo');
  if (navLogo) {
    navLogo.src = imageUrl;
  }
}

function setupHeroImageManagement() {
  const heroImageInput = document.getElementById('heroImage');
  const heroImagePreview = document.getElementById('heroImagePreview');
  const heroImageForm = document.getElementById('heroImageForm');
  
  // Load current hero image
  const currentHeroImage = safeGetItem('kdr_hero_image', null);
  if (currentHeroImage) {
    heroImagePreview.src = currentHeroImage;
    heroImagePreview.style.display = 'block';
    updateHeroImagesOnPage(currentHeroImage);
  }
  
  // Handle image upload
  if (heroImageInput && heroImagePreview) {
    heroImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          heroImagePreview.src = event.target.result;
          heroImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Handle form submission
  if (heroImageForm) {
    heroImageForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (heroImagePreview.style.display !== 'none' && heroImagePreview.src) {
        // Save hero image to localStorage
        safeSetItem('kdr_hero_image', heroImagePreview.src);
        
        // Update actual hero images on the page
        updateHeroImagesOnPage(heroImagePreview.src);
        
        showNotification('Custom hero image updated successfully!');
        
        // Reset form
        heroImageForm.reset();
        heroImagePreview.style.display = 'none';
      } else {
        showNotification('Please select an image first');
      }
    });
  }
}

// Product Management
function showCategoryPrompt() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="products-grid-placeholder">
      <i class="fas fa-hand-pointer"></i>
      <h3>Please select a category above</h3>
      <p>Choose from Vinyl, CDs, Funkos, Movies, or Collectibles to browse our products</p>
    </div>
  `;
}

function filterProducts(type, buttonElement) {
  state.currentFilter = type;
  
  // Update active tab
  if (buttonElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (type === 'all' && btn.textContent.includes('All')) {
        btn.classList.add('active');
      } else if (btn.textContent.toLowerCase().includes(type.toLowerCase())) {
        btn.classList.add('active');
      }
    });
  }
  
  renderProducts();
  
  const count = type === 'all' ? state.products.length : state.products.filter(p => p.type === type).length;
  showNotification(`Showing ${count} ${type === 'all' ? 'items' : type} products`);
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  if (!state.currentFilter) {
    showCategoryPrompt();
    return;
  }
  
  const filteredProducts = state.currentFilter === 'all' 
    ? state.products 
    : state.products.filter(p => p.type === state.currentFilter);

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="products-grid-placeholder">
        <i class="fas fa-box-open"></i>
        <h3>No products found</h3>
        <p>No ${state.currentFilter === 'all' ? '' : state.currentFilter} products available yet.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredProducts.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card-inner">
        <div class="product-card-front">
          <img src="${product.imageFront}" alt="${product.title}" class="product-image" loading="lazy">
          <div class="product-info">
            <div>
              <div class="product-title">${product.title}</div>
              <div class="product-price">$${product.price.toFixed(2)}</div>
              <div class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
              <i class="fas fa-cart-plus"></i>
              Add to Cart
            </button>
          </div>
          <div class="flip-indicator">
            <i class="fas fa-sync-alt"></i>
          </div>
        </div>
        <div class="product-card-back">
          <div class="product-back-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            ${product.imageBack ? `<img src="${product.imageBack}" alt="${product.title} (back)" class="product-back-image">` : ''}
            <p class="product-back-description">${product.description}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
              <i class="fas fa-cart-plus"></i>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers for card flipping
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't flip if clicking on the add to cart button
      if (!e.target.closest('.add-to-cart-btn')) {
        this.classList.toggle('flipped');
      }
    });
  });
}

// Admin Functions
function toggleAdmin() {
  if (checkAdminLockout()) {
    showNotification('Admin access temporarily locked');
    return;
  }

  const adminPanel = document.getElementById('adminPanel');
  if (!adminPanel) return;
  
  if (adminPanel.classList.contains('show')) {
    adminPanel.classList.remove('show');
    state.isAdmin = false;
  } else {
    adminPanel.classList.add('show');
    renderInventory();
    setupImageUploads();
    setupHeroImageManagement();
    state.isAdmin = true;
  }
}

function setupImageUploads() {
  // Front image upload
  const frontInput = document.getElementById('productImageFront');
  const frontPreview = document.getElementById('imagePreviewFront');
  
  if (frontInput && frontPreview) {
    frontInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          frontPreview.src = event.target.result;
          frontPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Back image upload
  const backInput = document.getElementById('productImageBack');
  const backPreview = document.getElementById('imagePreviewBack');
  
  if (backInput && backPreview) {
    backInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          backPreview.src = event.target.result;
          backPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Form submission
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProduct();
    });
  }
}

function saveProduct() {
  const title = document.getElementById('productTitle').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const description = document.getElementById('productDescription').value.trim();
  const type = document.getElementById('productType').value;
  const productId = document.getElementById('productId').value;
  
  // Get image data from previews
  const frontPreview = document.getElementById('imagePreviewFront');
  const backPreview = document.getElementById('imagePreviewBack');
  
  // Default image if none selected
  let imageFront = "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/ChatGPT%20Image%20Aug%2010%2C%202025%2C%2012_07_42%20AM.png";
  if (frontPreview && frontPreview.style.display !== 'none' && frontPreview.src) {
    imageFront = frontPreview.src;
  }
  
  let imageBack = null;
  if (backPreview && backPreview.style.display !== 'none' && backPreview.src) {
    imageBack = backPreview.src;
  }
  
  if (!title || !price || !description || !type) {
    showNotification('Please fill in all required fields');
    return;
  }
  
  if (productId) {
    // Update existing product
    const index = state.products.findIndex(p => p.id.toString() === productId);
    if (index >= 0) {
      state.products[index] = {
        ...state.products[index],
        title,
        price,
        description,
        type,
        imageFront,
        imageBack
      };
      showNotification('Product updated successfully!');
    }
  } else {
    // Add new product
    const newProduct = {
      id: Date.now(),
      title,
      price,
      description,
      type,
      imageFront,
      imageBack
    };
    
    state.products.push(newProduct);
    showNotification('Product added successfully!');
  }
  
  saveProducts();
  resetProductForm();
  renderInventory();
  
  if (state.currentFilter === type || state.currentFilter === 'all') {
    renderProducts();
  }
}

function resetProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('imagePreviewFront').style.display = 'none';
  document.getElementById('imagePreviewBack').style.display = 'none';
  state.editingProduct = null;
}

function editProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  state.editingProduct = product;
  
  document.getElementById('productId').value = product.id;
  document.getElementById('productTitle').value = product.title;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productType').value = product.type;
  
  const frontPreview = document.getElementById('imagePreviewFront');
  if (product.imageFront) {
    frontPreview.src = product.imageFront;
    frontPreview.style.display = 'block';
  }
  
  const backPreview = document.getElementById('imagePreviewBack');
  if (product.imageBack) {
    backPreview.src = product.imageBack;
    backPreview.style.display = 'block';
  }
  
  showNotification('Product loaded for editing');
}

function deleteProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (product && confirm(`Delete "${product.title}"?`)) {
    state.products = state.products.filter(p => p.id !== productId);
    saveProducts();
    renderInventory();
    
    if (state.currentSection === 'store2d') {
      renderProducts();
    }
    
    showNotification('Product deleted');
  }
}

function saveProducts() {
  safeSetItem('kdr_products', state.products);
}

function renderInventory() {
  const inventoryList = document.getElementById('inventoryList');
  if (!inventoryList) return;
  
  const byType = {};
  state.products.forEach(product => {
    if (!byType[product.type]) byType[product.type] = [];
    byType[product.type].push(product);
  });

  let html = `<h3 style="color: var(--accent2); margin-bottom: 1rem;">Inventory (${state.products.length} total)</h3>`;
  
  Object.keys(byType).forEach(type => {
    html += `<h4 style="color: var(--accent1); margin: 1rem 0 0.5rem 0; text-transform: capitalize;">${type}s (${byType[type].length})</h4>`;
    byType[type].forEach(product => {
      html += `
        <div class="inventory-item">
          <div class="inventory-item-title">${product.title}</div>
          <div class="inventory-item-price">$${product.price.toFixed(2)}</div>
          <button class="btn-small btn-edit" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      `;
    });
  });
  
  inventoryList.innerHTML = html;
}

// Kitty Popup Functions
function showKittyPopup(action, productType = null) {
  let kittyImage, messages;
  
  if (action === 'add') {
    // Show different kitty based on product type
    if (productType === 'funko') {
      kittyImage = "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png";
      messages = kittyMessages.chibi;
    } else {
      // Default to zombie kitty for vinyl, cd, movie, collectible
      kittyImage = "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png";
      messages = kittyMessages.zombie;
    }
  } else {
    // Remove action - show chibi kitty with sad messages
    kittyImage = "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png";
    messages = kittyMessages.remove;
  }
  
  // Random message selection
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  // Create popup element
  const popup = document.createElement('div');
  popup.className = 'kitty-popup';
  popup.innerHTML = `
    <img src="${kittyImage}" alt="Kitty">
    <div class="speech-bubble">${randomMessage}</div>
  `;
  
  // Random position on screen (avoid edges)
  const x = Math.random() * (window.innerWidth - 250) + 50;
  const y = Math.random() * (window.innerHeight - 250) + 100;
  
  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
  
  document.body.appendChild(popup);
  
  // Show popup
  setTimeout(() => {
    popup.classList.add('show');
  }, 50);
  
  // Bounce effect
  setTimeout(() => {
    popup.classList.add('bounce');
  }, 600);
  
  // Remove popup
  setTimeout(() => {
    popup.classList.add('zoom-out');
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 500);
  }, 3000); // Show longer to read the speech bubble
}

function showThankYouPopup() {
  // Create thank you popup
  const popup = document.createElement('div');
  popup.className = 'thank-you-popup';
  popup.innerHTML = `
    <div class="thank-you-content">
      <div class="thank-you-kitties">
        <div class="thank-you-kitty">
          <img src="https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/Screenshot_20250827-140949.png" alt="Zombie Kitty">
        </div>
        <div class="thank-you-kitty">
          <img src="https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png" alt="Chibi Kitty">
        </div>
      </div>
      <h2 class="thank-you-title">Thank You!</h2>
      <p class="thank-you-message">Your order has been processed successfully. Come back soon for more amazing collectibles!</p>
      <button onclick="closeThankYouPopup()" class="thank-you-btn">
        <i class="fas fa-heart"></i> Continue Shopping
      </button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Show popup
  setTimeout(() => {
    popup.classList.add('show');
  }, 100);
}

function closeThankYouPopup() {
  const popup = document.querySelector('.thank-you-popup');
  if (popup) {
    popup.classList.remove('show');
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 500);
  }
}

// Cart Functions
function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
    
    // Add pulse animation when cart updates
    cartCount.style.animation = 'none';
    setTimeout(() => {
      cartCount.style.animation = 'cartPulse 0.3s ease-out';
    }, 10);
  }
}

function addToCart(productId, event) {
  // Prevent default behavior and stop propagation
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Find the product
  const product = state.products.find(p => p.id === productId);
  if (!product) {
    console.error("Product not found:", productId);
    return;
  }
  
  // Add to cart
  const existingItem = state.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    const newItem = { 
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.imageFront || "https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/ChatGPT%20Image%20Aug%2010%2C%202025%2C%2012_07_42%20AM.png",
      quantity: 1
    };
    state.cart.push(newItem);
  }
  
  // Save cart
  safeSetItem('kdr_cart', state.cart);
  
  // Update UI
  updateCartUI();
  
  // Show kitty popup with product type for correct kitty selection
  showKittyPopup('add', product.type);
  
  // Show notification
  showNotification(`Added ${product.title} to cart!`);
}

function removeFromCart(productId) {
  const index = state.cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    const product = state.cart[index];
    state.cart.splice(index, 1);
    safeSetItem('kdr_cart', state.cart);
    updateCartUI();
    showKittyPopup('remove');
    showNotification(`Removed ${product.title} from cart`);
    showCart(); // Refresh cart display
  }
}

function showCart() {
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartSummary = document.getElementById('cartSummary');
  const paypalContainer = document.getElementById('paypal-button-container');
  
  if (!cartItems || !cartEmpty || !cartSummary) return;
  
  if (state.cart.length === 0) {
    cartItems.style.display = 'none';
    cartEmpty.style.display = 'block';
    cartSummary.style.display = 'none';
    paypalContainer.style.display = 'none';
  } else {
    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    cartSummary.style.display = 'block';
    paypalContainer.style.display = 'block';
    
    let html = '';
    let subtotal = 0;
    
    state.cart.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1);
      subtotal += itemTotal;
      
      html += `
        <div class="cart-item-modal">
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-info">
            <div>${item.title}</div>
            <div>$${item.price.toFixed(2)} × ${item.quantity || 1}</div>
          </div>
          <div style="margin-left: auto; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
            $${itemTotal.toFixed(2)}
            <button onclick="removeFromCart(${item.id})" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });

    cartItems.innerHTML = html;
    
    const tax = subtotal * 0.06; // 6% Kentucky tax
    const total = subtotal + tax;
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    
    // Initialize PayPal buttons
    initializePayPal(total);
  }
  
  openModal('cartModal');
}

function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    state.cart = [];
    safeSetItem('kdr_cart', state.cart);
    updateCartUI();
    showKittyPopup('remove'); // Show kitty popup for clearing cart
    showCart(); // Refresh cart display
    showNotification('Cart cleared');
  }
}

// PayPal Integration
function initializePayPal(total) {
  const paypalContainer = document.getElementById('paypal-button-container');
  if (!paypalContainer || typeof paypal === 'undefined') return;
  
  // Clear previous buttons
  paypalContainer.innerHTML = '';
  
  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Payment successful
        processOrder(details);
      });
    },
    onError: function(err) {
      console.error('PayPal error:', err);
      showNotification('There was an error processing your payment. Please try again.');
    }
  }).render(paypalContainer);
}

function processOrder(details) {
  // Save order to localStorage
  const orders = safeGetItem('kdr_orders', []);
  orders.push({
    id: details.id,
    date: new Date().toISOString(),
    items: [...state.cart],
    total: state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
    customer: details.payer
  });
  safeSetItem('kdr_orders', orders);
  
  // Clear cart
  state.cart = [];
  safeSetItem('kdr_cart', state.cart);
  updateCartUI();
  
  // Close cart modal
  closeModal('cartModal');
  
  // Show thank you popup with both kitties
  showThankYouPopup();
  
  // Show success notification
  showNotification('Payment successful! Thank you for your order.');
}

// Modal Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

// Notification System
function showNotification(message) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Hide notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
  console.log('KornDog Records initializing...');
  
  // Initialize products
  initializeProducts();
  
  // Load saved data
  const savedCart = safeGetItem("kdr_cart", []);
  const savedProducts = safeGetItem("kdr_products", []);
  
  if (savedCart.length > 0) {
    state.cart = savedCart;
  }
  
  if (savedProducts.length > 0) {
    state.products = savedProducts;
  }
  
  // Setup admin access
  setupAdminAccess();
  
  // Load hero image if available
  const heroImage = safeGetItem('kdr_hero_image', null);
  if (heroImage) {
    updateHeroImagesOnPage(heroImage);
  }
  
  // Hide admin button by default
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.classList.remove('show');
    adminBtn.style.opacity = '0';
    adminBtn.style.pointerEvents = 'none';
  }
  
  // Hide admin panel by default
  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel) {
    adminPanel.classList.remove('show');
    adminPanel.style.right = '-100%';
  }
  
  // Initialize UI
  updateCartUI();
  
  console.log('KornDog Records initialized successfully!');
  console.log('Products loaded:', state.products.length);
  console.log('Cart items:', state.cart.length);
});
