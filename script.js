// KornDog Records - Complete App with Camera & Storage
const ADMIN_PASSWORD = 'KornDog2024!';

const IMAGES = {
  DEFAULT_RECORD: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJib2IiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4N0NFRkE7Ii8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNBNzg0RkY7Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkY5M0Q0OyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2JvYikiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE1MCIgZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjIwIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iMjAwIiB5PSIzMDAiIGZpbGw9IiNGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjcwMCI+Qm9iIFJvc3MgUmVjb3JkPC90ZXh0Pjwvc3ZnPg==',
  DEFAULT_FUNKO: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJjaGliaSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwRkZCNzsiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwRkZEQzsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkY7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGVsbGlwc2UgY3g9IjIwMCIgY3k9IjMwMCIgcng9IjE4MCIgcnk9IjEwMCIgZmlsbD0idXJsKCNjaGliaSkiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjEwMCIgZmlsbD0iIzAwRkZCNyIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSIxMzAiIHI9IjE1IiBmaWxsPSIjMDAwIi8+PGNpcmNsZSBjeD0iMjMwIiBjeT0iMTMwIiByPSIxNSIgZmlsbD0iIzAwMCIvPjxlbGxpcHNlIGN4PSIyMDAiIGN5PSIxNzAiIHJ4PSI4IiByeT0iNCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMzcwIiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSI3MDAiPkNoaWJpIEtpdHR5PC90ZXh0Pjwvc3ZnPg==',
  ZOMBIE_KITTY: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiMwMEZGNzciLz48cGF0aCBkPSJNMjUgMzAgTDM1IDI1IEw0NSAzNSBMMzUgNDAgWiIgZmlsbD0iI0ZGNjlCNCIvPjxwYXRoIGQ9Ik01NSAzMCBMNjUgMjUgTDc1IDM1IEw2NSA0MCBaIiBmaWxsPSIjRkY2OUI0Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik02MCAzOCBMNzAgNDAgTDY1IDUwIFoiIGZpbGw9IiNGRkYiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI1NSIgcng9IjQiIHJ5PSIyIiBmaWxsPSIjMDAwIi8+PC9zdmc+',
  CHIBI_KITTY: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1NSIgcj0iNDAiIGZpbGw9IiMwMEZGQjciLz48cGF0aCBkPSJNMjUgMzAgTDM1IDI1IEw0NSAzNSBMMzUgNDAgWiIgZmlsbD0iI0ZGNjlCNCIvPjxwYXRoIGQ9Ik01NSAzMCBMNjUgMjUgTDc1IDM1IEw2NSA0MCBaIiBmaWxsPSIjRkY2OUI0Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSI0NSIgcj0iNCIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjY1IiBjeT0iNDUiIHI9IjQiIGZpbGw9IiMwMDAiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI2MCIgcng9IjMiIHJ5PSIyIiBmaWxsPSIjMDAwIi8+PC9zdmc+'
};

const ZOMBIE_MESSAGES = ["BRAAAAINS... I mean, RECORDS!", "This vinyl is DEAD good!", "Another victim for my collection!", "Perfect choice!", "The undead approve this purchase!", "Zombies need music too, ya know!", "This record will NEVER DIE!", "Excellent taste!", "Adding to cart... FOREVER!", "Music keeps the zombie soul alive!"];

const CHIBI_MESSAGES = ["Kawaii desu! Perfect choice!", "This Funko sparks joy!", "So cute, I could cry happy tears!", "Adding to cart with love!", "Collectible cuteness overload!", "This makes my heart go doki doki!", "Funko power activated!", "Chibi approved purchase!", "Cuteness level: MAXIMUM!", "Another treasure for your collection!"];

class KornDogApp {
  constructor() {
    this.products = this.loadProducts();
    this.cart = this.loadCart();
    this.currentPage = 'home';
    this.isAdminLoggedIn = localStorage.getItem('kdr_admin_session') === 'true';
    this.imageFiles = new Map();
    this.init();
  }
  
  init() {
    this.updateCartCount();
    this.setupEventListeners();
    this.renderCurrentPage();
  }
  
  loadProducts() {
    try {
      const saved = localStorage.getItem('kdr_products');
      if (saved) return JSON.parse(saved);
      return [
        {id: 1, category: "record", title: "Sevendust — Self-Titled", price: 42.00, grade: "NM", image: IMAGES.DEFAULT_RECORD},
        {id: 2, category: "record", title: "Bullet For My Valentine — The Poison", price: 39.00, grade: "VG+", image: IMAGES.DEFAULT_RECORD},
        {id: 11, category: "funko", title: "Mystery Funko ($10)", price: 10.00, grade: "", image: IMAGES.DEFAULT_FUNKO},
        {id: 12, category: "funko", title: "Chibi Mystery Box", price: 15.00, grade: "", image: IMAGES.DEFAULT_FUNKO}
      ];
    } catch { return []; }
  }
  
  saveProducts() { localStorage.setItem('kdr_products', JSON.stringify(this.products)); }
  
  loadCart() {
    try { return JSON.parse(localStorage.getItem('kdr_cart') || '[]'); }
    catch { return []; }
  }
  
  saveCart() {
    localStorage.setItem('kdr_cart', JSON.stringify(this.cart));
    this.updateCartCount();
  }
  
  async captureImage() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 800, height: 600 }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          
          const modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
          modal.innerHTML = `
            <video style="max-width:90%;max-height:70%;border-radius:10px;" autoplay></video>
            <div style="margin-top:20px;display:flex;gap:15px;">
              <button class="btn" id="captureBtn">📸 Capture</button>
              <button class="btn secondary" id="cancelBtn">Cancel</button>
            </div>
          `;
          
          const modalVideo = modal.querySelector('video');
          modalVideo.srcObject = stream;
          document.body.appendChild(modal);
          
          modal.querySelector('#captureBtn').onclick = () => {
            ctx.drawImage(modalVideo, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
            resolve(dataUrl);
          };
          
          modal.querySelector('#cancelBtn').onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
            resolve(null);
          };
        };
      });
    } catch (error) {
      alert('Camera access denied or not available');
      return null;
    }
  }
  
  async selectFromGallery() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }
  
  async showImageOptions() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';
      modal.innerHTML = `
        <div class="card" style="text-align:center;max-width:300px;">
          <h3>Add Image</h3>
          <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;">
            <button class="btn" id="cameraBtn">📸 Take Photo</button>
            <button class="btn" id="galleryBtn">🖼️ Choose from Gallery</button>
            <button class="btn" id="defaultBtn">Use Default</button>
            <button class="btn secondary" id="cancelImageBtn">Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      modal.querySelector('#cameraBtn').onclick = async () => {
        document.body.removeChild(modal);
        const image = await this.captureImage();
        resolve(image);
      };
      
      modal.querySelector('#galleryBtn').onclick = async () => {
        document.body.removeChild(modal);
        const image = await this.selectFromGallery();
        resolve(image);
      };
      
      modal.querySelector('#defaultBtn').onclick = () => {
        document.body.removeChild(modal);
        resolve('default');
      };
      
      modal.querySelector('#cancelImageBtn').onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };
    });
  }
  
  addProduct(productData) {
    const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
    const defaultImage = productData.category === 'record' ? IMAGES.DEFAULT_RECORD : IMAGES.DEFAULT_FUNKO;
    const product = { 
      id: newId, 
      ...productData, 
      price: parseFloat(productData.price),
      image: productData.image || defaultImage
    };
    this.products.unshift(product);
    this.saveProducts();
    this.showKitty(productData.category, `Added ${product.title} to shop!`);
    return product;
  }
  
  updateProduct(id, updates) {
    const index = this.products.findIndex(p => p.id == id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      if (updates.price) this.products[index].price = parseFloat(updates.price);
      this.saveProducts();
    }
  }
  
  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id == id);
    if (index !== -1) {
      const product = this.products[index];
      this.products.splice(index, 1);
      this.saveProducts();
      this.showKitty(product.category, `Removed ${product.title} from shop`);
      return product;
    }
  }
  
  addToCart(productId) {
    const product = this.products.find(p => p.id == productId);
    if (!product) return;
    this.cart.push({
      id: Date.now(), productId: product.id, title: product.title,
      price: product.price, category: product.category
    });
    this.saveCart();
    const messages = product.category === 'record' ? ZOMBIE_MESSAGES : CHIBI_MESSAGES;
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showKitty(product.category, message);
  }
  
  removeFromCart(cartId) {
    this.cart = this.cart.filter(item => item.id != cartId);
    this.saveCart();
    this.renderCart();
  }
  
  updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
      const count = this.cart.length;
      countEl.textContent = count ? `(${count})` : '';
    }
  }
  
  showKitty(category, message) {
    const popup = document.getElementById('kittyPopup');
    const image = document.getElementById('kittyImage');
    const messageEl = document.getElementById('kittyMessage');
    if (!popup || !image || !messageEl) return;
    image.src = category === 'record' ? IMAGES.ZOMBIE_KITTY : IMAGES.CHIBI_KITTY;
    messageEl.textContent = message;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 4000);
  }
  
  formatPrice(price) { return '$' + parseFloat(price || 0).toFixed(2); }
  
  setupEventListeners() {
    document.addEventListener('click', async (e) => {
      if (e.target.dataset.addToCart) {
        this.addToCart(parseInt(e.target.dataset.addToCart));
      }
      if (e.target.dataset.removeFromCart) {
        this.removeFromCart(parseInt(e.target.dataset.removeFromCart));
      }
      if (e.target.dataset.deleteProduct) {
        if (confirm('Delete this product?')) {
          this.deleteProduct(parseInt(e.target.dataset.deleteProduct));
          this.renderAdmin();
        }
      }
      if (e.target.id === 'addImageBtn') {
        const imageData = await this.showImageOptions();
        if (imageData && imageData !== 'default') {
          document.getElementById('newImage').dataset.customImage = imageData;
          e.target.textContent = '✓ Image Added';
          e.target.style.background = 'var(--primary-green)';
        }
      }
      if (e.target.dataset.editImage) {
        const productId = e.target.dataset.editImage;
        const imageData = await this.showImageOptions();
        if (imageData && imageData !== 'default') {
          this.updateProduct(parseInt(productId), { image: imageData });
          this.renderAdmin();
        }
      }
    });
    
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
    }
    
    const quickAddForm = document.getElementById('quickAddForm');
    if (quickAddForm) {
      quickAddForm.addEventListener('submit', (e) => this.handleQuickAdd(e));
    }
    
    document.addEventListener('input', (e) => {
      if (e.target.dataset.productId && e.target.dataset.field) {
        const productId = parseInt(e.target.dataset.productId);
        const field = e.target.dataset.field;
        const value = e.target.value;
        this.updateProduct(productId, { [field]: value });
      }
    });
  }
  
  handleAdminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('loginError');
    if (password === ADMIN_PASSWORD) {
      this.isAdminLoggedIn = true;
      localStorage.setItem('kdr_admin_session', 'true');
      this.showRealAdminPage();
      errorEl.style.display = 'none';
    } else {
      errorEl.style.display = 'block';
      document.getElementById('adminPassword').value = '';
    }
  }
  
  showRealAdminPage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('adminPage').classList.add('active');
    this.currentPage = 'admin';
    this.renderAdmin();
  }
  
  async handleQuickAdd(e) {
    e.preventDefault();
    const category = document.getElementById('newCategory').value;
    const title = document.getElementById('newTitle').value;
    const price = document.getElementById('newPrice').value;
    const grade = document.getElementById('newGrade').value;
    const customImage = document.getElementById('newImage').dataset.customImage;
    
    if (!category || !title || !price) {
      alert('Please fill in required fields');
      return;
    }
    
    this.addProduct({ category, title, price, grade, image: customImage });
    e.target.reset();
    delete document.getElementById('newImage').dataset.customImage;
    document.getElementById('addImageBtn').textContent = '📸 Add Image';
    document.getElementById('addImageBtn').style.background = 'var(--primary-purple)';
    this.renderAdmin();
    this.renderCurrentPage();
  }
  
  renderCurrentPage() {
    switch (this.currentPage) {
      case 'shop': this.renderProducts('record'); break;
      case 'collectibles': this.renderProducts('funko'); break;
      case 'cart': this.renderCart(); break;
      case 'admin': this.renderAdmin(); break;
    }
  }
  
  renderProducts(category) {
    const grid = document.getElementById(category === 'record' ? 'shopGrid' : 'collectiblesGrid');
    if (!grid) return;
    const filtered = this.products.filter(p => p.category === category);
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="card"><p>No products yet. Check back soon!</p></div>';
      return;
    }
    grid.innerHTML = filtered.map(product => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.title}" class="product-image" 
             onerror="this.src='${category === 'record' ? IMAGES.DEFAULT_RECORD : IMAGES.DEFAULT_FUNKO}'">
        <div class="product-title">${product.title}</div>
        ${product.grade ? `<div class="product-grade">Grade: ${product.grade}</div>` : ''}
        <div class="price">${this.formatPrice(product.price)}</div>
        <button class="btn" data-add-to-cart="${product.id}">Add to Cart</button>
      </div>
    `).join('');
  }
  
  renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    if (this.cart.length === 0) {
      cartItems.innerHTML = '<div class="card"><h3>Your cart is empty!</h3><p>Check out our <a href="#" onclick="showPage(\'shop\')">records</a> or <a href="#" onclick="showPage(\'collectibles\')">collectibles</a>.</p></div>';
      return;
    }
    const total = this.cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    cartItems.innerHTML = `
      <div class="card">
        <h3>Cart Items</h3>
        ${this.cart.map(item => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div><strong>${item.title}</strong><br><span style="opacity:0.8;">${this.formatPrice(item.price)}</span></div>
            <button class="btn secondary" data-remove-from-cart="${item.id}">Remove</button>
          </div>
        `).join('')}
        <div style="margin-top:30px;padding-top:20px;border-top:2px solid rgba(255,255,255,0.2);">
          <div style="text-align:right;margin-bottom:20px;"><strong style="font-size:1.3em;">Total: ${this.formatPrice(total)}</strong></div>
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" style="text-align:center;">
            <input type="hidden" name="cmd" value="_cart">
            <input type="hidden" name="upload" value="1">
            <input type="hidden" name="business" value="tians.rule1215@gmail.com">
            <input type="hidden" name="currency_code" value="USD">
            ${this.cart.map((item, i) => `
              <input type="hidden" name="item_name_${i+1}" value="${item.title}">
              <input type="hidden" name="amount_${i+1}" value="${item.price.toFixed(2)}">
              <input type="hidden" name="quantity_${i+1}" value="1">
            `).join('')}
            <button type="submit" class="btn" style="width:100%;font-size:1.2em;padding:16px;">Pay with PayPal</button>
          </form>
        </div>
      </div>
    `;
  }
  
  renderAdmin() {
    const grid = document.getElementById('adminGrid');
    if (!grid) return;
    if (this.products.length === 0) {
      grid.innerHTML = '<div class="card"><p>No products yet. Use the form above to add your first item!</p></div>';
      return;
    }
    grid.innerHTML = this.products.map(product => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div style="text-align:left;margin-top:16px;">
          <input type="text" value="${product.title}" data-product-id="${product.id}" data-field="title" style="font-weight:bold;margin-bottom:12px;">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="number" value="${product.price}" step="0.01" data-product-id="${product.id}" data-field="price" style="width:100px;" placeholder="Price">
            <input type="text" value="${product.grade || ''}" data-product-id="${product.id}" data-field="grade" style="width:80px;" placeholde
