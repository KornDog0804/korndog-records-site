:root {
  --bg1: #3b2aa2;
  --bg2: #0fa77f;
  --accent1: #ff3e6c;
  --accent2: #ffd166;
  --ink: #ffffff; /* Improved contrast - pure white */
  --muted: #e2e8f0; /* Improved contrast - lighter gray */
  --dark-text: #1a202c; /* High contrast dark text */
}

* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

body { 
  font-family: Inter, system-ui, sans-serif; 
  background: linear-gradient(135deg, var(--bg1), var(--bg2)); 
  color: var(--ink); 
  min-height: 100vh; 
  overflow-x: hidden;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Improved button accessibility and tap targets */
button, .btn-large, .add-to-cart-btn, .tab-btn, .feature-item {
  position: relative;
  z-index: 10;
  cursor: pointer !important;
  pointer-events: auto !important;
  min-height: 44px; /* Minimum touch target size */
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Larger tap targets for mobile */
@media (max-width: 768px) {
  button, .btn-large, .add-to-cart-btn, .tab-btn, .feature-item {
    min-height: 48px; /* Larger for mobile */
    min-width: 48px;
    padding: 0.75rem 1rem; /* Increased padding */
  }
  
  .feature-item {
    padding: 1.25rem; /* Even larger for category buttons */
  }
  
  .tab-btn {
    padding: 0.75rem 1rem; /* Ensure good tap size */
    margin: 0.25rem; /* Add margin for easier tapping */
  }
}

/* Ensure content areas don't block clicks */
.content-area {
  position: relative;
  z-index: 1;
}

/* Make sure modals are above everything */
.modal-overlay {
  z-index: 1100 !important;
}

/* Loading Screen */
.loading-screen { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: linear-gradient(135deg, var(--bg1), var(--bg2)); 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  z-index: 1000; 
  transition: opacity 0.5s ease; 
}

.loading-screen.hidden { 
  opacity: 0; 
  pointer-events: none; 
}

.loading-logo { 
  font-family: 'Permanent Marker', cursive; 
  font-size: 2.5rem; 
  color: var(--accent2); 
  margin-bottom: 1rem; 
}

.loading-text { 
  color: var(--muted); 
  margin-bottom: 2rem; 
}

.loading-enter-btn {
  margin-top: 20px; 
  background: var(--accent1); 
  color: white; 
  border: none; 
  padding: 12px 24px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: bold; 
  font-size: 16px; 
  box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
  position: relative; 
  z-index: 1500;
  transition: all 0.3s ease;
}

.loading-enter-btn:hover {
  background: #ff1e5c;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

/* Spinning Record Animation */
.spinning-record {
  font-size: 4rem;
  color: var(--accent2);
  margin-bottom: 2rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Navigation */
.nav { 
  background: rgba(11, 18, 32, 0.9); 
  backdrop-filter: blur(8px); 
  padding: 1rem 2rem; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  position: sticky; 
  top: 0; 
  z-index: 100; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
}

.nav-brand { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  font-family: 'Permanent Marker', cursive; 
  font-size: 1.2rem; 
  color: var(--accent2); 
  cursor: pointer; 
  user-select: none; 
}

.nav-brand img { 
  height: 32px; 
  width: auto; 
  border-radius: 50%;
}

.nav-controls { 
  display: flex; 
  gap: 1rem; 
  align-items: center; 
}

.admin-btn { 
  background: rgba(255, 209, 102, 0.2); 
  border: 1px solid var(--accent2); 
  color: var(--accent2); 
  padding: 0.5rem; 
  border-radius: 8px; 
  cursor: pointer; 
  opacity: 0; 
  transition: all 0.3s ease; 
  pointer-events: none; 
}

.admin-btn.show { 
  opacity: 1; 
  pointer-events: all; 
}

.admin-btn:hover {
  background: rgba(255, 209, 102, 0.3);
  transform: scale(1.05);
}

.btn-cart { 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  color: var(--ink); 
  padding: 0.75rem 1rem; 
  border-radius: 8px; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  cursor: pointer; 
  font-weight: 600; 
  transition: all 0.3s ease;
}

.btn-cart:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.cart-count { 
  background: var(--accent1); 
  color: white; 
  padding: 2px 8px; 
  border-radius: 12px; 
  font-size: 0.8rem; 
  animation: cartPulse 0.3s ease-out;
}

@keyframes cartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Content Areas */
.content-area { 
  min-height: calc(100vh - 70px); 
  display: none; 
}

.content-area.active { 
  display: block; 
}

/* Hero Section */
.hero-section { 
  min-height: 85vh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  text-align: center; 
  padding: 2rem; 
}

.hero-content { 
  max-width: 600px; 
}

.hero-logo { 
  width: 180px; 
  height: 180px; 
  margin: 0 auto 2rem; 
  border-radius: 50%; 
  background: rgba(255, 255, 255, 0.15); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  backdrop-filter: blur(8px); 
  border: 2px solid rgba(255, 255, 255, 0.3); 
  cursor: pointer; 
  transition: all 0.3s ease;
}

.hero-logo:hover {
  transform: scale(1.05);
  border-color: var(--accent2);
}

.hero-logo img { 
  width: 140px; 
  height: 140px;
  object-fit: contain;
  border-radius: 50%;
}

.hero-title { 
  font-size: 3.5rem; 
  font-weight: 900; 
  color: var(--ink); 
  margin-bottom: 1rem; 
  font-family: 'Permanent Marker', cursive; 
}

.hero-subtitle { 
  font-size: 1.2rem; 
  color: var(--muted); 
  margin-bottom: 3rem; 
  line-height: 1.6; 
}

.admin-access-btn {
  background: transparent; 
  color: var(--accent2); 
  border: none; 
  padding: 8px 16px; 
  border-radius: 8px; 
  margin: 10px 0; 
  cursor: pointer; 
  opacity: 0.5;
  transition: all 0.3s ease;
}

.admin-access-btn:hover {
  opacity: 1;
  background: rgba(255, 209, 102, 0.1);
}

.hero-actions { 
  display: flex; 
  gap: 1.5rem; 
  justify-content: center; 
  margin-bottom: 3rem; 
  flex-wrap: wrap; 
}

.btn-large { 
  padding: 1.25rem 2.5rem; 
  border-radius: 12px; 
  font-size: 1.1rem; 
  font-weight: 700; 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  border: none; 
}

.btn-large:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.btn-primary { 
  background: var(--accent1); 
  color: white; 
}

.btn-primary:hover {
  background: #ff1e5c;
}

.btn-secondary { 
  background: rgba(255, 255, 255, 0.1); 
  color: var(--ink); 
  border: 2px solid rgba(255, 255, 255, 0.3); 
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.features-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
  gap: 1.5rem; 
  max-width: 500px; 
  margin: 0 auto; 
}

.feature-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 0.75rem; 
  color: var(--muted); 
  font-weight: 600; 
  cursor: pointer; 
  padding: 1rem; 
  border-radius: 12px; 
  transition: all 0.3s ease; 
}

.feature-item:hover { 
  background: rgba(255, 255, 255, 0.1); 
  color: var(--ink); 
  transform: translateY(-3px);
}

.feature-item i { 
  font-size: 2rem; 
  color: var(--accent2); 
}

/* 2D Store */
.store-2d { 
  padding: 2rem; 
}

.back-btn { 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  color: var(--ink); 
  padding: 0.75rem 1.5rem; 
  border-radius: 8px; 
  cursor: pointer; 
  margin-bottom: 2rem; 
  display: inline-flex; 
  align-items: center; 
  gap: 0.5rem; 
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-3px);
}

.store-header { 
  text-align: center; 
  margin-bottom: 3rem; 
}

.store-header h2 { 
  font-family: 'Permanent Marker', cursive; 
  font-size: 2.5rem; 
  color: var(--accent2); 
  margin-bottom: 1rem; 
}

.category-tabs { 
  display: flex; 
  gap: 0.75rem; 
  margin-bottom: 2rem; 
  justify-content: center; 
  flex-wrap: wrap; 
}

.tab-btn { 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  color: var(--ink); 
  padding: 0.75rem 1rem; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 600; 
  font-size: 0.9rem; 
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tab-btn.active { 
  background: var(--accent1); 
  color: white; 
  box-shadow: 0 4px 12px rgba(255, 62, 108, 0.3);
}

.products-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 1.5rem; 
}

.products-grid-placeholder { 
  text-align: center; 
  padding: 4rem 2rem; 
  color: var(--muted); 
  grid-column: 1 / -1; 
}

.products-grid-placeholder i { 
  font-size: 3rem; 
  margin-bottom: 1rem; 
  color: var(--accent2); 
}

/* Product Cards with Flip Animation */
.product-card { 
  background: transparent; 
  border: none; 
  border-radius: 12px; 
  overflow: visible; 
  transition: transform 0.3s ease; 
  cursor: pointer; 
  perspective: 1000px; 
  height: 400px; 
}

.product-card:hover { 
  transform: translateY(-5px); 
}

.product-card-inner { 
  position: relative; 
  width: 100%; 
  height: 100%; 
  text-align: center; 
  transition: transform 0.6s; 
  transform-style: preserve-3d; 
}

.product-card.flipped .product-card-inner { 
  transform: rotateY(180deg); 
}

.product-card-front, 
.product-card-back { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  -webkit-backface-visibility: hidden; 
  backface-visibility: hidden; 
  border-radius: 12px; 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  backdrop-filter: blur(8px); 
}

.product-card-back { 
  transform: rotateY(180deg); 
  background: rgba(255, 255, 255, 0.15); 
}

.product-image { 
  width: 100%; 
  height: 220px; 
  object-fit: cover; 
  border-radius: 12px 12px 0 0; 
}

.product-back-image {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.product-info { 
  padding: 1.5rem; 
  height: calc(100% - 220px); 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  text-align: left; 
}

.product-back-info { 
  padding: 1.5rem; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  text-align: center; 
}

.product-title { 
  font-weight: 700; 
  color: var(--ink); 
  margin-bottom: 0.5rem; 
  font-size: 1.1rem; 
}

.product-price { 
  font-size: 1.3rem; 
  color: var(--accent2); 
  font-weight: 700; 
  margin-bottom: 0.75rem; 
}

.product-description { 
  color: var(--muted); 
  font-size: 0.9rem; 
  margin-bottom: 1rem; 
  flex-grow: 1; 
}

.product-back-description { 
  color: var(--muted); 
  font-size: 1rem; 
  line-height: 1.6; 
  margin-bottom: 1.5rem; 
}

.add-to-cart-btn { 
  background: var(--accent1); 
  color: white; 
  border: none; 
  padding: 0.75rem; 
  border-radius: 8px; 
  width: 100%; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}

.add-to-cart-btn:hover { 
  background: #ff1e5c; 
  transform: scale(1.02);
}

.flip-indicator { 
  position: absolute; 
  top: 10px; 
  right: 10px; 
  background: rgba(0, 0, 0, 0.7); 
  color: var(--accent2); 
  padding: 0.5rem; 
  border-radius: 50%; 
  font-size: 0.8rem; 
  opacity: 0.7; 
  animation: pulse-flip 2s infinite; 
}

@keyframes pulse-flip { 
  0%, 100% { opacity: 0.7; transform: scale(1); } 
  50% { opacity: 1; transform: scale(1.1); } 
}

/* Admin Panel */
.admin-panel { 
  position: fixed; 
  top: 0; 
  right: -100%; 
  width: 100%; 
  max-width: 450px; 
  height: 100vh; 
  background: rgba(11, 18, 32, 0.95); 
  backdrop-filter: blur(12px); 
  z-index: 200; 
  transition: right 0.4s ease; 
  overflow-y: auto; 
  padding: 2rem; 
}

.admin-panel.show { 
  right: 0; 
}

.admin-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 2rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  padding-bottom: 1rem; 
}

.admin-title { 
  color: var(--accent2); 
  font-size: 1.5rem; 
  font-weight: 700; 
}

.close-admin { 
  background: none; 
  border: none; 
  color: var(--muted); 
  font-size: 1.5rem; 
  cursor: pointer; 
  transition: color 0.3s ease;
}

.close-admin:hover {
  color: var(--accent1);
}

.admin-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
}

.admin-section-title {
  color: var(--accent2);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

/* Hero Image Selection Grid */
.hero-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-image-option {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-image-option:hover {
  border-color: var(--accent2);
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.hero-image-option.selected {
  border-color: var(--accent1);
  background: rgba(255, 62, 108, 0.2);
}

.hero-image-option img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  border-radius: 50%;
}

.hero-image-option span {
  display: block;
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 500;
}

.form-group { 
  margin-bottom: 1.5rem; 
}

.form-group label { 
  display: block; 
  color: var(--muted); 
  font-weight: 600; 
  margin-bottom: 0.5rem; 
  font-size: 0.9rem; 
}

.form-input { 
  width: 100%; 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  color: var(--ink); 
  padding: 0.75rem; 
  border-radius: 8px; 
  font-size: 0.9rem; 
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent2);
  background: rgba(255, 255, 255, 0.15);
}

.form-textarea { 
  min-height: 80px; 
  resize: vertical; 
}

.file-input-wrapper { 
  position: relative; 
  display: inline-block; 
  width: 100%; 
}

.file-input-button { 
  background: var(--accent1); 
  color: white; 
  padding: 0.75rem; 
  border-radius: 8px; 
  text-align: center; 
  cursor: pointer; 
  transition: all 0.3s ease;
}

.file-input-button:hover {
  background: #ff1e5c;
}

.file-input { 
  position: absolute; 
  left: 0; 
  top: 0; 
  opacity: 0; 
  width: 100%; 
  height: 100%; 
  cursor: pointer; 
}

.image-preview { 
  width: 80px; 
  height: 80px; 
  object-fit: cover; 
  border-radius: 8px; 
  margin-top: 1rem; 
  border: 2px solid var(--accent2); 
}

.hero-preview {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
}

.btn-admin { 
  background: var(--accent1); 
  color: white; 
  border: none; 
  padding: 0.75rem 1.5rem; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  width: 100%; 
  margin-bottom: 0.5rem; 
  transition: all 0.3s ease;
}

.btn-admin:hover {
  background: #ff1e5c;
  transform: translateY(-2px);
}

.btn-admin-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--ink);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.btn-admin-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.inventory-list { 
  margin-top: 1rem; 
}

.inventory-item { 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 8px; 
  padding: 1rem; 
  margin-bottom: 1rem; 
  transition: all 0.3s ease;
}

.inventory-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent2);
}

.inventory-item-title { 
  color: var(--ink); 
  font-weight: 600; 
  margin-bottom: 0.5rem; 
}

.inventory-item-price { 
  color: var(--accent2); 
  font-weight: 700; 
  margin-bottom: 0.5rem;
}

.btn-small { 
  padding: 0.4rem 0.8rem; 
  border: none; 
  border-radius: 6px; 
  font-size: 0.8rem; 
  cursor: pointer; 
  margin-right: 0.5rem; 
  margin-top: 0.5rem; 
  transition: all 0.3s ease;
}

.btn-edit { 
  background: var(--accent2); 
  color: #000; 
}

.btn-edit:hover {
  background: #ffdc4d;
  transform: scale(1.05);
}

.btn-delete { 
  background: #ef4444; 
  color: white; 
}

.btn-delete:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* Cart Modal */
.modal-overlay { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0,0,0,0.8); 
  backdrop-filter: blur(5px); 
  z-index: 1100; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  opacity: 0; 
  pointer-events: none; 
  transition: opacity 0.3s ease; 
}

.modal-overlay.show { 
  opacity: 1; 
  pointer-events: all; 
}

.modal { 
  background: #0b1220; 
  border-radius: 12px; 
  width: 90%; 
  max-width: 500px; 
  max-height: 90vh; 
  overflow-y: auto; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
  border: 1px solid rgba(255,255,255,0.1); 
  animation: modalSlideIn 0.4s ease-out;
}

@keyframes modalSlideIn {
  0% { transform: scale(0.9) translateY(-20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header { 
  padding: 1.5rem; 
  border-bottom: 1px solid rgba(255,255,255,0.1); 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.modal-header h3 { 
  margin: 0; 
  color: var(--accent2); 
}

.modal-close-btn {
  background: none; 
  border: none; 
  color: var(--muted); 
  font-size: 1.5rem; 
  cursor: pointer;
  transition: color 0.3s ease;
}

.modal-close-btn:hover {
  color: var(--accent1);
}

.modal-body { 
  padding: 1.5rem; 
}

.modal-footer { 
  padding: 1.5rem; 
  border-top: 1px solid rgba(255,255,255,0.1); 
  display: flex; 
  justify-content: flex-end; 
  gap: 1rem; 
}

.cart-empty {
  text-align: center; 
  padding: 2rem;
}

.cart-empty i {
  font-size: 3rem; 
  color: var(--muted); 
  margin-bottom: 1rem;
}

.cart-item-modal { 
  display: flex; 
  align-items: center; 
  margin-bottom: 1rem; 
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-item-modal img { 
  width: 60px; 
  height: 60px; 
  object-fit: contain; 
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px; 
  margin-right: 1rem; 
}

.cart-item-info { 
  flex-grow: 1; 
}

.cart-item-info div:first-child { 
  font-weight: 600; 
  color: var(--ink);
}

.cart-item-info div:last-child { 
  color: var(--muted); 
  font-size: 0.9rem; 
}

.cart-summary {
  margin-top: 1.5rem;
}

.cart-summary-row { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 0.5rem; 
  color: var(--ink);
}

.cart-summary-row.total { 
  font-weight: bold; 
  font-size: 1.2rem; 
  color: var(--accent2); 
  margin-top: 1rem; 
  padding-top: 1rem; 
  border-top: 1px solid rgba(255,255,255,0.2); 
}

.btn-danger {
  background: #ef4444; 
  color: white; 
  border: none; 
  padding: 0.75rem 1.5rem; 
  border-radius: 8px; 
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #dc2626;
}

#paypal-button-container { 
  margin-top: 1.5rem; 
}

/* 3D Experience */
.experience-3d {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.experience-3d h2 {
  font-family: 'Permanent Marker', cursive;
  font-size: 2.5rem
