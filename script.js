/* KornDog Records - Complete JavaScript */

// ===== GLOBAL STATE =====
let currentPage = 'home';
let currentSlideIndex = 1;
let cart = JSON.parse(localStorage.getItem('kdr_cart')) || [];
let products = JSON.parse(localStorage.getItem('kdr_products')) || [
    {
        id: 'sleep-token-1',
        title: 'Sleep Token - Even In Arcadia',
        price: 85.99,
        category: 'vinyl',
        image: null,
        inventory: 1,
        description: 'Limited edition vinyl pressing of Sleep Token\'s latest masterpiece.',
        inStock: true
    }
];

// ===== RADIO SYSTEM (MADMAN FM) =====
const STATIONS = [
    { 
        key: 'metalcore', 
        label: 'METALCORE MELTDOWN', 
        subtitle: 'HEAVY RIFFS',
        playlistId: 'PLToUeDNp2s3Kd2mMguU3QMyhM4gHSxzDw' 
    },
    { 
        key: 'miku', 
        label: 'HATSUNE MIKU', 
        subtitle: 'DIGITAL DREAMS',
        playlistId: 'RDEMA703AE9PNaNYb3T-XAhR9g' 
    },
    { 
        key: 'dgd', 
        label: 'DANCE GAVIN DANCE', 
        subtitle: 'POST-HARDCORE',
        playlistId: 'RDEM16389tt61fqxE6JRiZ6_HQ' 
    }
];

let currentStation = +localStorage.getItem('kdr_station_index') || 0;
let isPlaying = false;
let isMuted = false;
let currentVolume = 70;
let ytPlayer = null;

// ===== KITTY MESSAGING SYSTEM =====
const kittyMessages = {
    vinyl: [
        "Another record for your therapy collection!",
        "Vinyl therapy is the best therapy!",
        "That one's gonna sound sweet on the turntable!",
        "Building your sonic sanctuary, one spin at a time!",
        "Every record tells a story - this one's yours now!",
        "The needle drops on another classic!",
        "Your collection just got heavier!"
    ],
    funkos: [
        "Pop culture perfection added to your shelf!",
        "Your Funko family just grew!",
        "Another little guardian for your collection!",
        "That's one adorable addition!",
        "Pop goes your heart - and your wallet!",
        "Collectible cuteness overload!",
        "Your display shelf is getting crowded!"
    ],
    cds: [
        "Digital meets physical - nice choice!",
        "That CD's ready to spin some magic!",
        "Compact disc, maximum impact!",
        "Your CD collection just got stronger!",
        "Sometimes the classics hit different!",
        "Silver disc, golden memories!",
        "Ready for some serious spinning!"
    ],
    collectibles: [
        "That's a rare find for your treasure trove!",
        "Collector's paradise just got better!",
        "Your collection game is strong!",
        "Another gem for the display case!",
        "Collectible magic in your hands!",
        "Rarity achieved - well done!",
        "Your collection just leveled up!"
    ],
    mystery: [
        "Mystery box magic is coming your way!",
        "What treasures await inside?",
        "The mystery is half the fun!",
        "Surprise vinyl therapy incoming!",
        "Unknown adventures in your cart!",
        "Mystery solved when it arrives!",
        "Roll the dice on awesome!"
    ],
    removed: [
        "Item removed from your collection",
        "Maybe next time, music lover!",
        "Your cart's a little lighter now",
        "Sometimes you gotta let the music go",
        "Decision changed - no worries!",
        "Cart cleanup complete!",
        "Second thoughts are totally cool"
    ]
};

// ===== PAYPAL INTEGRATION =====
let paypalLoaded = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌽🐕 KornDog Records initializing...');
    
    initializeRadio();
    initializeHeroCarousel();
    initializeProductGrid();
    initializeAboutTabs();
    initializePayPal();
    initializeEmailJS();
    updateCartCounter();
    buildStationButtons();
    
    console.log('🎵 Vinyl therapy is ready to roll!');
});

// ===== PAGE NAVIGATION =====
function showPage(pageName) {
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName);
    const targetNav = document.getElementById('nav-' + pageName);
    
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
    }
    
    if (targetNav) {
        targetNav.classList.add('active');
    }
    
    // Page-specific initialization
    if (pageName === 'cart') {
        renderCart();
    } else if (pageName === 'admin') {
        renderAdminInventory();
    } else if (pageName === 'shop') {
        renderProducts();
    }
}

// ===== ABOUT TABS SYSTEM =====
function initializeAboutTabs() {
    const tabs = document.querySelectorAll('.story-tab');
    const contents = document.querySelectorAll('.story-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetStory = this.dataset.story;
            
            // Remove active from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetStory + '-story');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ===== HERO CAROUSEL SYSTEM =====
function initializeHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Auto-advance every 8 seconds
    setInterval(() => {
        currentSlideIndex = currentSlideIndex >= slides.length ? 1 : currentSlideIndex + 1;
        showSlide(currentSlideIndex);
    }, 8000);
}

function currentSlide(n) {
    showSlide(currentSlideIndex = n);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    if (n > slides.length) currentSlideIndex = 1;
    if (n < 1) currentSlideIndex = slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[currentSlideIndex - 1]) {
        slides[currentSlideIndex - 1].classList.add('active');
    }
    if (dots[currentSlideIndex - 1]) {
        dots[currentSlideIndex - 1].classList.add('active');
    }
}

// ===== MADMAN FM RADIO PLAYER SYSTEM =====
function buildStationButtons() {
    const stationButtonsWrap = document.getElementById('stationButtons');
    if (!stationButtonsWrap) return;
    
    stationButtonsWrap.innerHTML = '';
    STATIONS.forEach((station, index) => {
        const button = document.createElement('button');
        button.textContent = station.label;
        button.classList.toggle('active', index === currentStation);
        button.addEventListener('click', () => setStation(index, true));
        stationButtonsWrap.appendChild(button);
    });
}

function initializeRadio() {
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const openBtn = document.getElementById('openPlayerBtn');
    const closeBtn = document.getElementById('closePlayerBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const modalVolumeSlider = document.getElementById('modalVolumeSlider');
    const muteBtn = document.getElementById('muteBtn');
    const modalMuteBtn = document.getElementById('modalMuteBtn');
    
    // Event listeners
    if (playBtn) playBtn.addEventListener('click', playPause);
    if (prevBtn) prevBtn.addEventListener('click', prevStation);
    if (nextBtn) nextBtn.addEventListener('click', nextStation);
    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
    if (modalMuteBtn) modalMuteBtn.addEventListener('click', toggleMute);
    
    // Volume controls
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
        volumeSlider.value = currentVolume;
    }
    if (modalVolumeSlider) {
        modalVolumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
        modalVolumeSlider.value = currentVolume;
    }
    
    // Keyboard controls
    const radioBar = document.getElementById('radioBar');
    if (radioBar) {
        radioBar.addEventListener('keydown', handleKeyboardControls);
    }
    
    // Global keyboard controls
    document.addEventListener('keydown', handleGlobalKeyboardControls);
    
    refreshStationUI();
}

function handleKeyboardControls(e) {
    switch(e.key) {
        case ' ':
            e.preventDefault();
            playPause();
            break;
        case 'ArrowRight':
            nextStation();
            break;
        case 'ArrowLeft':
            prevStation();
            break;
        case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(100, currentVolume + 10));
            break;
        case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(0, currentVolume - 10));
            break;
        case 'm':
        case 'M':
            toggleMute();
            break;
    }
}

function handleGlobalKeyboardControls(e) {
    // Only handle global shortcuts when not typing in form fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case ' ':
            if (e.target === document.body || e.target.closest('.radio-bar')) {
                e.preventDefault();
                playPause();
            }
            break;
        case 'm':
        case 'M':
            if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser shortcuts
            toggleMute();
            break;
    }
}

// YouTube API Integration
window.onYouTubeIframeAPIReady = function() {
    const firstStation = STATIONS[currentStation];
    const playerVars = {
        autoplay: 0, 
        controls: 1, 
        rel: 0, 
        fs: 1, 
        playsinline: 1,
        modestbranding: 1
    };
    
    if (firstStation.playlistId) {
        playerVars.listType = 'playlist';
        playerVars.list = firstStation.playlistId;
    }
    
    const playerDiv = document.getElementById('ytPlayer');
    if (playerDiv) {
        ytPlayer = new YT.Player('ytPlayer', {
            videoId: firstStation.videoId || '',
            playerVars: playerVars,
            events: { 
                onReady: onPlayerReady, 
                onStateChange: onStateChange,
                onError: onPlayerError
            }
        });
    }
    refreshStationUI();
    console.log('🎵 Madman FM player ready!');
};

function onPlayerReady() {
    if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
    }
}

function onStateChange(e) {
    if (e.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayUI();
    } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        updatePlayUI();
    }
}

function onPlayerError(e) {
    console.warn('YouTube player error:', e.data);
    showKittyNotification('removed', 'Radio Hiccup', 'Having trouble with that track - trying next station!');
    setTimeout(nextStation, 2000);
}

function playPause() {
    if (!ytPlayer) return;
    if (isPlaying) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
}

function setVolume(volume) {
    currentVolume = parseInt(volume);
    if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
    }
    
    // Update both sliders
    const volumeSlider = document.getElementById('volumeSlider');
    const modalVolumeSlider = document.getElementById('modalVolumeSlider');
    if (volumeSlider) volumeSlider.value = currentVolume;
    if (modalVolumeSlider) modalVolumeSlider.value = currentVolume;
    
    // Update mute button state
    updateMuteUI();
    
    localStorage.setItem('kdr_volume', currentVolume);
}

function toggleMute() {
    if (isMuted) {
        setVolume(currentVolume);
        isMuted = false;
    } else {
        if (ytPlayer && ytPlayer.setVolume) {
            ytPlayer.setVolume(0);
        }
        isMuted = true;
    }
    updateMuteUI();
}

function updateMuteUI() {
    const muteBtn = document.getElementById('muteBtn');
    const modalMuteBtn = document.getElementById('modalMuteBtn');
    
    const icon = isMuted || currentVolume === 0 ? '🔇' : '🔊';
    
    if (muteBtn) muteBtn.textContent = icon;
    if (modalMuteBtn) modalMuteBtn.textContent = icon;
}

function setStation(index, andPlay = false) {
    currentStation = (index + STATIONS.length) % STATIONS.length;
    localStorage.setItem('kdr_station_index', String(currentStation));
    
    // Update button states
    const buttons = document.querySelectorAll('#stationButtons button');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === currentStation);
    });
    
    const station = STATIONS[currentStation];
    
    if (ytPlayer) {
        if (station.playlistId) {
            ytPlayer.loadPlaylist({
                listType: 'playlist',
                list: station.playlistId
            });
        } else if (station.videoId) {
            ytPlayer.loadVideoById(station.videoId);
        }
        
        if (!andPlay) ytPlayer.pauseVideo();
    }
    
    refreshStationUI();
    
    if (andPlay) {
        isPlaying = true;
        if (ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
    }
    
    showKittyNotification('vinyl', 'Station Changed', `Now tuned to ${station.label}!`);
}

function nextStation() {
    setStation(currentStation + 1, isPlaying);
}

function prevStation() {
    setStation(currentStation - 1, isPlaying);
}

function refreshStationUI() {
    const station = STATIONS[currentStation];
    const stationNameEl = document.getElementById('stationName');
    const stationSubtitleEl = document.getElementById('stationSubtitle');
    const modalStationNameEl = document.getElementById('modalStationName');
    
    if (stationNameEl) stationNameEl.textContent = station.label;
    if (stationSubtitleEl) stationSubtitleEl.textContent = station.subtitle;
    if (modalStationNameEl) modalStationNameEl.textContent = station.label;
}

function updatePlayUI() {
    const playBtn = document.getElementById('playBtn');
    const eqEl = document.getElementById('eqBars');
    
    if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
    if (eqEl) eqEl.classList.toggle('paused', !isPlaying);
}

function openModal() {
    const modal = document.getElementById('radioModal');
    if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        
        if (ytPlayer) {
            const station = STATIONS[currentStation];
            if (station.playlistId) {
                ytPlayer.loadPlaylist({
                    listType: 'playlist',
                    list: station.playlistId
                });
            }
        }
    }
}

function closeModal() {
    const modal = document.getElementById('radioModal');
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// ===== ZOMBIE KITTY NOTIFICATION SYSTEM =====
function showKittyNotification(type, title, message = null) {
    const container = document.getElementById('kittyNotificationSystem');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'kitty-notification';
    
    const randomMessage = message || getRandomKittyMessage(type);
    
    notification.innerHTML = `
        <div class="kitty-notification-header">
            <div class="kitty-notification-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="35" fill="#ec4899" opacity="0.9"/>
                    <polygon points="25,25 35,15 30,35" fill="#ec4899"/>
                    <polygon points="65,15 75,25 70,35" fill="#ec4899"/>
                    <path d="M35 55 Q50 65 65 55" stroke="#10b981" stroke-width="2" fill="none"/>
                    <circle cx="38" cy="57" r="1" fill="#10b981"/>
                    <circle cx="45" cy="60" r="1" fill="#10b981"/>
                    <circle cx="55" cy="60" r="1" fill="#10b981"/>
                    <circle cx="62" cy="57" r="1" fill="#10b981"/>
                    <circle cx="42" cy="42" r="6" fill="#a855f7"/>
                    <circle cx="42" cy="42" r="3" fill="#ec4899"/>
                    <circle cx="58" cy="42" r="3" fill="#000"/>
                    <line x1="30" y1="35" x2="35" y2="40" stroke="#10b981" stroke-width="1"/>
                    <line x1="35" y1="35" x2="30" y2="40" stroke="#10b981" stroke-width="1"/>
                </svg>
            </div>
            <h4>${title}</h4>
        </div>
        <p class="kitty-notification-message">${randomMessage}</p>
    `;
    
    container.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getRandomKittyMessage(type) {
    const messages = kittyMessages[type] || kittyMessages.vinyl;
    return messages[Math.floor(Math.random() * messages.length)];
}

// ===== PRODUCT MANAGEMENT =====
function initializeProductGrid() {
    renderProducts();
}

function renderProducts(filteredProducts = null) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const productsToShow = filteredProducts || products;
    
    grid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
    
    // Update pagination info
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${productsToShow.length} product${productsToShow.length !== 1 ? 's' : ''}`;
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    
    const imageDisplay = product.image ? 
        `<img src="${product.image}" alt="${product.title}" class="product-image">` :
        `<div class="product-image" style="background: linear-gradient(45deg, #1f2937, #374151); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; text-align: center; padding: 10px;">
            ${product.title.split(' - ')[0]}<br/>${product.title.split(' - ')[1] || ''}<br/>${getCategoryIcon(product.category)}
            <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px;">$${product.price}</div>
        </div>`;
    
    const stockStatus = product.inventory > 0 ? 
        `<span style="color: #10b981; font-size: 0.9rem;">In Stock (${product.inventory})</span>` : 
        `<span style="color: #ef4444; font-size: 0.9rem;">Out of Stock</span>`;
    
    card.innerHTML = `
        <div class="product-image-container">
            ${imageDisplay}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            ${stockStatus}
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')" ${product.inventory <= 0 ? 'disabled' : ''}>
                    ${product.inventory > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
                <button class="btn btn-secondary" onclick="viewProduct('${product.id}')">View Details</button>
            </div>
        </div>
    `;
    
    return card;
}

function getCategoryIcon(category) {
    const icons = {
        vinyl: '🎵',
        cds: '💿',
        funkos: '🎭',
        collectibles: '⭐',
        mystery: '🎁'
    };
    return icons[category] || '🎵';
}

function filterProducts(category, event) {
    if (event) {
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    renderProducts(filteredProducts);
    
    showKittyNotification('vinyl', 'Filter Applied', `Showing ${category === 'all' ? 'all' : category} products!`);
}

// ===== SHOPPING CART SYSTEM =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.inventory <= 0) {
        showKittyNotification('removed', 'Out of Stock', 'Sorry, that item is no longer available!');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    // Decrease inventory
    product.inventory -= 1;
    
    localStorage.setItem('kdr_cart', JSON.stringify(cart));
    localStorage.setItem('kdr_products', JSON.stringify(products));
    updateCartCounter();
    
    // Re-render if on shop page
    if (currentPage === 'shop') {
        renderProducts();
    }
    
    // Show kitty notification
    const titles = {
        vinyl: 'Vinyl Added!',
        funkos: 'Funko Added!',
        cds: 'CD Added!',
        collectibles: 'Collectible Added!',
        mystery: 'Mystery Item Added!'
    };
    
    const title = titles[product.category] || 'Item Added!';
    showKittyNotification(product.category, title, `${product.title} is now in your collection!`);
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        
        // Restore inventory
        const product = products.find(p => p.id === productId);
        if (product) {
            product.inventory += removedItem.quantity;
        }
        
        cart.splice(itemIndex, 1);
        localStorage.setItem('kdr_cart', JSON.stringify(cart));
        localStorage.setItem('kdr_products', JSON.stringify(products));
        updateCartCounter();
        renderCart();
        
        showKittyNotification('removed', 'Item Removed', `${removedItem.title} removed from cart`);
    }
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
        const quantityDiff = newQuantity - item.quantity;
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (quantityDiff <= product.inventory) {
            product.inventory -= quantityDiff;
            item.quantity = newQuantity;
            localStorage.setItem('kdr_cart', JSON.stringify(cart));
            localStorage.setItem('kdr_products', JSON.stringify(products));
            updateCartCounter();
            renderCart();
        } else {
            showKittyNotification('removed', 'Not Enough Stock', `Only ${product.inventory} more available`);
        }
    }
}

function updateCartCounter() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLinks = document.querySelectorAll('#nav-cart');
    cartLinks.forEach(link => {
        link.textContent = `Cart (${totalItems})`;
    });
}

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div id="emptyCartMessage" style="text-align: center;">
                <p style="margin-bottom: 20px;">Your cart is empty. Start your vinyl therapy journey!</p>
                <button class="btn btn-primary" onclick="showPage('shop')">Browse Our Collection</button>
            </div>
        `;
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.06;
    const total = subtotal + tax;
    
    cartContainer.innerHTML = `
        <div id="cartItemsList">
            ${cart.map(item => `
                <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; margin-bottom: 15px; background: rgba(0,0,0,0.2);">
                    <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #1f2937, #374151); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
                        ${getCategoryIcon(item.category)}
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #10b981;">${item.title}</h4>
                        <p style="color: #ec4899; font-weight: bold;">$${item.price.toFixed(2)} each</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" style="width: 30px; height: 30px; border: 1px solid #ec4899; background: transparent; color: #ec4899; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                        <span style="min-width: 30px; text-align: center; font-weight: bold;">${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" style="width: 30px; height: 30px; border: 1px solid #ec4899; background: transparent; color: #ec4899; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Remove</button>
                </div>
            `).join('')}
        </div>
        
        <div id="cartSummary" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Tax (6%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: bold; color: #ec4899; margin-bottom: 20px;">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div id="paypal-button-container"></div>
            <div style="text-align: center; margin-top: 15px;">
                <button onclick="clearCart()" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Clear Cart</button>
            </div>
        </div>
    `;
    
    // Initialize PayPal button
    renderPayPalButton(total);
}

function clearCart() {
    if (cart.length === 0) return;
    
    // Restore inventory for all items
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.inventory += item.quantity;
        }
    });
    
    cart = [];
    localStorage.setItem('kdr_cart', JSON.stringify(cart));
    localStorage.setItem('kdr_products', JSON.stringify(products));
    updateCartCounter();
    renderCart();
    showKittyNotification('removed', 'Cart Cleared', 'All items have been removed from your cart');
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showKittyNotification('vinyl', 'Checking It Out!', `${product.title} - ${product.description || 'Hope you like what you hear!'}`);
    }
    // Build out product detail view here
}

// ===== PAYPAL INTEGRATION =====
function initializePayPal() {
    // PayPal will be loaded when needed in renderPayPalButton
}

function renderPayPalButton(total) {
    const container = document.getElementById('paypal-button-container');
    if (!container || !window.paypal) return;
    
    container.innerHTML = ''; // Clear existing buttons
    
    window.paypal.Buttons({
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
                showKittyNotification('vinyl', 'Payment Complete!', `Thanks ${details.payer.name.given_name}! Your vinyl therapy is on the way!`);
                
                // Clear cart after successful payment
                cart = [];
                localStorage.setItem('kdr_cart', JSON.stringify(cart));
                updateCartCounter();
                renderCart();
                
                // Send confirmation email (if EmailJS is configured)
                sendOrderConfirmation(details);
            });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            showKittyNotification('removed', 'Payment Error', 'Something went wrong with PayPal. Please try again.');
        }
    }).render('#paypal-button-container');
}

// ===== EMAIL INTEGRATION =====
function initializeEmailJS() {
    // Initialize EmailJS with your public key
    if (window.emailjs) {
        window.emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
    }
}

function sendOrderConfirmation(orderDetails) {
    if (!window.emailjs) return;
    
    const templateParams = {
        to_name: orderDetails.payer.name.given_name,
        to_email: orderDetails.payer.email_address,
        order_id: orderDetails.id,
        total_amount: orderDetails.purchase_units[0].payments.captures[0].amount.value,
        items: cart.map(item => `${item.title} (x${item.quantity})`).join(', ')
    };
    
    window.emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response);
        })
        .catch(function(error) {
            console.log('Email error:', error);
        });
}

// ===== ADMIN FUNCTIONS =====
function saveProduct() {
    const title = document.getElementById('productTitle')?.value;
    const category = document.getElementById('productCategory')?.value;
    const price = parseFloat(document.getElementById('productPrice')?.value);
    const inventory = parseInt(document.getElementById('productInventory')?.value) || 0;
    const description = document.getElementById('productDescription')?.value || '';
    const editId = document.getElementById('editProductId')?.value;
    
    if (!title || !price || isNaN(price)) {
        alert('Please fill in title and price');
        return;
    }
    
    if (editId) {
        // Edit existing product
        const productIndex = products.findIndex(p => p.id === editId);
        if (productIndex > -1) {
            products[productIndex] = {
                ...products[productIndex],
                title,
                category,
                price,
                inventory,
                description
            };
        }
    } else {
        // Add new product
        const newProduct = {
            id: generateProductId(title),
            title,
            category,
            price,
            inventory,
            description,
            image: null,
            inStock: inventory > 0
        };
        products.push(newProduct);
    }
    
    localStorage.setItem('kdr_products', JSON.stringify(products));
    resetForm();
    renderAdminInventory();
    
    showKittyNotification('vinyl', 'Product Saved!', `${title} has been ${editId ? 'updated in' : 'added to'} your store!`);
    
    if (currentPage === 'shop') {
        renderProducts();
    }
}

function generateProductId(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + '-' + Date.now();
}

function resetForm() {
    ['productTitle', 'productPrice', 'productInventory', 'productDescription', 'editProductId'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    const categoryField = document.getElementById('productCategory');
    if (categoryField) categoryField.value = 'vinyl';
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('editProductId').value = product.id;
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productInventory').value = product.inventory;
    document.getElementById('productDescription').value = product.description || '';
    
    showKittyNotification('vinyl', 'Editing Product', `Now editing ${product.title}`);
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        const deletedProduct = products[productIndex];
        products.splice(productIndex, 1);
        localStorage.setItem('kdr_products', JSON.stringify(products));
        
        showKittyNotification('removed', 'Product Deleted', `${deletedProduct.title} has been removed from your store`);
        renderAdminInventory();
        
        if (currentPage === 'shop') {
            renderProducts();
        }
    }
}

function renderAdminInventory() {
    const inventoryList = document.getElementById('inventoryList');
    if (!inventoryList) return;
    
    if (products.length === 0) {
        inventoryList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">
                <p>No products in inventory yet.</p>
                <p>Add your first product using the form on the left!</p>
            </div>
        `;
        return;
    }
    
    inventoryList.innerHTML = products.map(product => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 10px; background: rgba(0,0,0,0.2);">
            <div>
                <div style="font-weight: bold; color: #10b981; margin-bottom: 5px;">${product.title}</div>
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                    ${product.category.charAt(0).toUpperCase() + product.category.slice(1)} • $${product.price.toFixed(2)} • Stock: ${product.inventory}
                </div>
                ${product.description ? `<div style="font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 5px;">${product.description}</div>` : ''}
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="editProduct('${product.id}')" style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">Edit</button>
                <button onclick="deleteProduct('${product.id}')" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">Delete</button>
            </div>
        </div>
    `).join('');
}

function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    
    let filtered = products;
    
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Re-render with filtered products
    const inventoryList = document.getElementById('inventoryList');
    if (inventoryList) {
        if (filtered.length === 0) {
            inventoryList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">
                    <p>No products match your search.</p>
                </div>
            `;
            return;
        }
        
        inventoryList.innerHTML = filtered.map(product => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 10px; background: rgba(0,0,0,0.2);">
                <div>
                    <div style="font-weight: bold; color: #10b981; margin-bottom: 5px;">${product.title}</div>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                        ${product.category.charAt(0).toUpperCase() + product.category.slice(1)} • $${product.price.toFixed(2)} • Stock: ${product.inventory}
                    </div>
                    ${product.description ? `<div style="font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 5px;">${product.description}</div>` : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="editProduct('${product.id}')" style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

function saveAllChanges() {
    localStorage.setItem('kdr_products', JSON.stringify(products));
    localStorage.setItem('kdr_cart', JSON.stringify(cart));
    showKittyNotification('vinyl', 'All Changes Saved!', 'Your store data has been saved successfully!');
}

// ===== UTILITY FUNCTIONS =====
function searchProducts(query) {
    if (!query) {
        renderProducts();
        return;
    }
    
    const filtered = products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    renderProducts(filtered);
}

// ===== PLACEHOLDER FUNCTIONS FOR FEATURES TO BE IMPLEMENTED =====
function openMediaLibrary(type) {
    showKittyNotification('vinyl', 'Coming Soon', `Media library for ${type} images will be available soon!`);
    // Implement media library modal here
}

// Load saved volume on initialization
document.addEventListener('DOMContentLoaded', function() {
    const savedVolume = localStorage.getItem('kdr_volume');
    if (savedVolume) {
        currentVolume = parseInt(savedVolume);
    }
});

// ===== EXPORT GLOBAL FUNCTIONS =====
// Make functions available globally for onclick handlers
window.showPage = showPage;
window.currentSlide = currentSlide;
window.filterProducts = filterProducts;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.viewProduct = viewProduct;
window.clearCart = clearCart;
window.saveProduct = saveProduct;
window.resetForm = resetForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterInventory = filterInventory;
window.saveAllChanges = saveAllChanges;
window.searchProducts = searchProducts;
window.openMediaLibrary = openMediaLibrary;

console.log('🌽🐕 KornDog Records JavaScript fully loaded - Ready to rock! 🎵');
