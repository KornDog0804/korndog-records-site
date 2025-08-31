// ======= GLOBAL STATE =======
const state = {
  cart: JSON.parse(localStorage.getItem("kdr_cart") || "[]"),
  currentProduct: null,
  mode: 'explore',
  is3D: false,
  products: [
    // Zombie Kitty's Vinyl Section (Left Aisle)
    {
      id: 1,
      title: "Pink Floyd - Dark Side of the Moon",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "Legendary progressive rock masterpiece on 180g vinyl. A must-have for any serious collector.",
      position: { x: -25, z: -15 },
      character: 'zombie',
      type: 'vinyl'
    },
    {
      id: 2,
      title: "The Cure - Disintegration",
      price: 32.99,
      image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      description: "Gothic masterpiece. Dark, atmospheric, and utterly beautiful.",
      position: { x: -25, z: -10 },
      character: 'zombie',
      type: 'vinyl'
    },
    {
      id: 3,
      title: "My Chemical Romance - Black Parade",
      price: 27.99,
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      description: "Emo rock opera with theatrical flair. Perfect for dramatic listening sessions.",
      position: { x: -25, z: -5 },
      character: 'zombie',
      type: 'vinyl'
    },
    {
      id: 4,
      title: "Joy Division - Unknown Pleasures",
      price: 26.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "Post-punk classic with the iconic pulsar wave cover. Haunting and essential.",
      position: { x: -25, z: 0 },
      character: 'zombie',
      type: 'vinyl'
    },
    {
      id: 5,
      title: "Bauhaus - In The Flat Field",
      price: 28.99,
      image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      description: "Gothic rock pioneers' debut album. Dark, intense, and influential.",
      position: { x: -25, z: 5 },
      character: 'zombie',
      type: 'vinyl'
    },
    
    // Chibi Kitty's Funko Section (Right Aisle)
    {
      id: 6,
      title: "Funko Pop! Music - Freddie Mercury",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      description: "Queen's legendary frontman in his iconic yellow jacket. Limited edition!",
      position: { x: 25, z: -15 },
      character: 'chibi',
      type: 'funko'
    },
    {
      id: 7,
      title: "Funko Pop! Horror - Pennywise",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "The dancing clown from IT, with detailed costume and red balloon.",
      position: { x: 25, z: -10 },
      character: 'chibi',
      type: 'funko'
    },
    {
      id: 8,
      title: "Funko Pop! Music - Billie Eilish",
      price: 22.99,
      image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      description: "Pop superstar in her signature green and black outfit. Super cute!",
      position: { x: 25, z: -5 },
      character: 'chibi',
      type: 'funko'
    },
    {
      id: 9,
      title: "Funko Pop! Movies - Edward Scissorhands",
      price: 21.99,
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      description: "Tim Burton's iconic character with detailed scissor hands and wild hair.",
      position: { x: 25, z: 0 },
      character: 'chibi',
      type: 'funko'
    },
    {
      id: 10,
      title: "Funko Pop! Animation - Sailor Moon",
      price: 23.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "Magical girl heroine with moon scepter and detailed costume.",
      position: { x: 25, z: 5 },
      character: 'chibi',
      type: 'funko'
    },
    
    // KornDog's Featured Section (Center Aisle)
    {
      id: 11,
      title: "Led Zeppelin IV",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      description: "Classic rock masterpiece featuring Stairway to Heaven. 180g audiophile pressing.",
      position: { x: -5, z: -35 },
      character: 'korndog',
      type: 'vinyl'
    },
    {
      id: 12,
      title: "Miles Davis - Kind of Blue",
      price: 32.99,
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      description: "The best-selling jazz album of all time. Essential for any collection.",
      position: { x: 0, z: -35 },
      character: 'korndog',
      type: 'vinyl'
    },
    {
      id: 13,
      title: "Funko Pop! Rocks - KISS Complete Set",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "All four members of KISS in full makeup and costumes. Collector's item!",
      position: { x: 5, z: -35 },
      character: 'korndog',
      type: 'funko'
    }
  ]
};

// ======= CHARACTER SYSTEM =======
const characters = {
  zombie: {
    name: "Zombie Kitty",
    role: "Vinyl Specialist",
    avatar: 'assets/images/characters/zombie-kitty.png', // Gothic Hello Kitty with X eye
    messages: [
      "This record is absolutely killer! That bass drop is to die for.",
      "I've got my eye on this one... well, my one good eye anyway!",
      "This album has the perfect dark vibes for your collection.",
      "Need something with a bit more edge? This vinyl will cut right through you.",
      "This limited pressing is hauntingly beautiful. Just like me!"
    ]
  },
  chibi: {
    name: "Chibi Kitty",
    role: "Funko Curator",
    avatar: 'assets/images/characters/chibi-kitty.png', // Green zombie Hello Kitty
    messages: [
      "These Funkos are fresh from the grave! Er, I mean factory!",
      "This collectible is stitched together perfectly, just like me!",
      "Green with envy? You will be if you don't grab this limited edition!",
      "These Funkos are to die for... and I should know!",
      "Need a cute but creepy addition to your collection? I've got just the thing!"
    ]
  },
  korndog: {
    name: "KornDog",
    role: "Store Owner",
    avatar: 'assets/images/characters/korndog-logo.png',
    messages: [
      "Welcome to KornDog Records! I'm your host with the most!",
      "Check out our vinyl section with Zombie Kitty or browse Funkos with Chibi Kitty!",
      "Hot and fresh recommendations, just like me!",
      "Don't forget to check out our display cases at the end of each aisle!",
      "We've got the best selection of vinyl AND collectibles in town!"
    ]
  }
};

// ======= 3D STORE SYSTEM =======
let scene, camera, renderer;
let productMeshes = [];
let characterMeshes = {};
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function init3DStore() {
  const canvas = document.getElementById('canvas3D');
  
  // Scene setup with enhanced atmosphere
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a1a2e, 15, 80);
  
  // Camera with smooth controls
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 25);
  
  // Renderer with advanced settings
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0a0a1a, 0.8);

  // Build the magical store
  createMagicalEnvironment();
  createProducts();
  createCharacterZones();
  createAtmosphericLighting();
  
  setupControls();
  animate();
}
function createMagicalEnvironment() {
  // Holographic floor with vinyl pattern
  const floorGeometry = new THREE.PlaneGeometry(120, 120);
  const floorMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x2a2a4a,
    transparent: true,
    opacity: 0.7
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Create store aisles
  createStoreAisles();
  
  // Create display cases at the end of aisles
  createDisplayCases();

  // Floating vinyl records as ambient decoration
  for (let i = 0; i < 20; i++) {
    const vinylGeometry = new THREE.RingGeometry(1, 1.5, 32);
    const vinylMaterial = new THREE.MeshLambertMaterial({ 
      color: Math.random() > 0.5 ? 0x1a1a1a : 0x2a2a2a,
      transparent: true,
      opacity: 0.3
    });
    const vinyl = new THREE.Mesh(vinylGeometry, vinylMaterial);
    
    vinyl.position.set(
      (Math.random() - 0.5) * 100,
      5 + Math.random() * 10,
      (Math.random() - 0.5) * 100
    );
    vinyl.rotation.z = Math.random() * Math.PI * 2;
    
    let time = Math.random() * Math.PI * 2;
    function animateVinyl() {
      time += 0.01;
      vinyl.rotation.z += 0.005;
      vinyl.position.y += Math.sin(time) * 0.01;
      requestAnimationFrame(animateVinyl);
    }
    animateVinyl();
    
    scene.add(vinyl);
  }

  // Magical particle system
  createMagicalParticles();
}

function createStoreAisles() {
  // Create aisle shelving units
  
  // Left aisle (Zombie Kitty's Vinyl Section)
  createAisle({
    start: { x: -25, z: -20 },
    end: { x: -25, z: 10 },
    width: 10,
    height: 6,
    color: 0x4a2a4a, // Dark purple for Zombie Kitty
    glowColor: 0xff3e6c
  });
  
  // Right aisle (Chibi Kitty's Funko Section)
  createAisle({
    start: { x: 25, z: -20 },
    end: { x: 25, z: 10 },
    width: 10,
    height: 6,
    color: 0x2a4a2a, // Dark green for Chibi Kitty
    glowColor: 0x00ff66
  });
  
  // Center aisle (KornDog's Featured Section)
  createAisle({
    start: { x: 0, z: -40 },
    end: { x: 0, z: -20 },
    width: 15,
    height: 8,
    color: 0x4a4a2a, // Gold/brown for KornDog
    glowColor: 0xffd166
  });
}

function createAisle(options) {
  const group = new THREE.Group();
  
  // Calculate aisle length
  const length = Math.sqrt(
    Math.pow(options.end.x - options.start.x, 2) + 
    Math.pow(options.end.z - options.start.z, 2)
  );
  
  // Calculate aisle angle
  const angle = Math.atan2(
    options.end.z - options.start.z,
    options.end.x - options.start.x
  );
  
  // Create left shelf
  const shelfGeometry = new THREE.BoxGeometry(length, options.height, 1);
  const shelfMaterial = new THREE.MeshLambertMaterial({ color: options.color });
  
  const leftShelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
  leftShelf.position.set(
    (options.start.x + options.end.x) / 2,
    options.height / 2,
    (options.start.z + options.end.z) / 2 - options.width / 2
  );
  leftShelf.rotation.y = angle;
  group.add(leftShelf);
  
  // Create right shelf
  const rightShelf = leftShelf.clone();
  rightShelf.position.z = (options.start.z + options.end.z) / 2 + options.width / 2;
  group.add(rightShelf);
  
  // Add glow effect
  const glowLight = new THREE.PointLight(options.glowColor, 0.6, 15);
  glowLight.position.set(
    (options.start.x + options.end.x) / 2,
    options.height / 2,
    (options.start.z + options.end.z) / 2
  );
  group.add(glowLight);
  
  // Add shelf dividers and product slots
  const dividerCount = Math.floor(length / 4);
  for (let i = 0; i < dividerCount; i++) {
    const dividerGeometry = new THREE.BoxGeometry(0.2, options.height, options.width);
    const divider = new THREE.Mesh(dividerGeometry, shelfMaterial);
    
    const progress = i / (dividerCount - 1);
    divider.position.set(
      options.start.x + (options.end.x - options.start.x) * progress,
      options.height / 2,
      options.start.z + (options.end.z - options.start.z) * progress
    );
    divider.rotation.y = angle;
    group.add(divider);
  }
  
  scene.add(group);
  return group;
}

function createDisplayCases() {
  // Funko Display Case
  const funkoCase = createGlassCase({
    width: 10,
    height: 8,
    depth: 4,
    position: { x: 25, y: 4, z: 15 },
    rotation: { x: 0, y: Math.PI / 4, z: 0 },
    color: 0x00ff66 // Green glow to match Chibi Kitty
  });
  scene.add(funkoCase);
  
  // Populate with Funko items
  populateDisplayCase(funkoCase, 'funko');
  
  // Collectibles Display Case
  const collectiblesCase = createGlassCase({
    width: 10,
    height: 8,
    depth: 4,
    position: { x: -25, y: 4, z: 15 },
    rotation: { x: 0, y: -Math.PI / 4, z: 0 },
    color: 0xff3e6c // Pink glow to match Zombie Kitty
  });
  scene.add(collectiblesCase);
  
  // Populate with collectible items
  populateDisplayCase(collectiblesCase, 'collectible');
}

function createGlassCase(options) {
  const group = new THREE.Group();
  
  // Glass panels
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    transmission: 0.95,
    thickness: 0.5,
    envMapIntensity: 1
  });
  
  // Base and frame
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2
  });
  
  // Create base
  const baseGeometry = new THREE.BoxGeometry(options.width, 0.5, options.depth);
  const base = new THREE.Mesh(baseGeometry, frameMaterial);
  base.position.y = -options.height/2 + 0.25;
  group.add(base);
  
  // Create glass panels
  // Front panel
  const frontGeometry = new THREE.PlaneGeometry(options.width, options.height);
  const frontPanel = new THREE.Mesh(frontGeometry, glassMaterial);
  frontPanel.position.z = options.depth/2;
  group.add(frontPanel);
  
  // Back panel
  const backPanel = frontPanel.clone();
  backPanel.position.z = -options.depth/2;
  backPanel.rotation.y = Math.PI;
  group.add(backPanel);
  
  // Left panel
  const sideGeometry = new THREE.PlaneGeometry(options.depth, options.height);
  const leftPanel = new THREE.Mesh(sideGeometry, glassMaterial);
  leftPanel.position.x = -options.width/2;
  leftPanel.rotation.y = Math.PI/2;
  group.add(leftPanel);
  
  // Right panel
  const rightPanel = leftPanel.clone();
  rightPanel.position.x = options.width/2;
  rightPanel.rotation.y = -Math.PI/2;
  group.add(rightPanel);
  
  // Top panel
  const topGeometry = new THREE.PlaneGeometry(options.width, options.depth);
  const topPanel = new THREE.Mesh(topGeometry, glassMaterial);
  topPanel.position.y = options.height/2;
  topPanel.rotation.x = -Math.PI/2;
  group.add(topPanel);
  
  // Add glow effect
  const glowLight = new THREE.PointLight(options.color, 0.8, 10);
  glowLight.position.set(0, 0, 0);
  group.add(glowLight);
  
  // Position and rotate the entire case
  group.position.set(options.position.x, options.position.y, options.position.z);
  group.rotation.set(
    options.rotation.x || 0,
    options.rotation.y || 0,
    options.rotation.z || 0
  );
  
  // Add user data for interaction
  group.userData = { type: 'displayCase' };
  
  return group;
}
function populateDisplayCase(caseGroup, itemType) {
  // Define items based on type
  const items = itemType === 'funko' ? [
    {
      id: 101,
      title: "Funko Pop! Music - Kurt Cobain",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      description: "Limited edition Kurt Cobain Funko Pop! figure with iconic outfit and guitar.",
      character: 'chibi'
    },
    {
      id: 102,
      title: "Funko Pop! Horror - Freddy Krueger",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      description: "Nightmare on Elm Street's iconic villain in adorable Funko form. Sweet dreams!",
      character: 'chibi'
    },
    {
      id: 103,
      title: "Funko Pop! Music - David Bowie",
      price: 22.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "Ziggy Stardust era David Bowie with detailed costume and iconic makeup.",
      character: 'chibi'
    }
  ] : [
    {
      id: 201,
      title: "Limited Edition Vinyl Figure - Zombie Kitty",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      description: "Exclusive KornDog Records mascot figure. Only 500 made worldwide!",
      character: 'zombie'
    },
    {
      id: 202,
      title: "Vintage Record Player Miniature",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      description: "Detailed miniature replica of a classic turntable. Perfect for display!",
      character: 'zombie'
    },
    {
      id: 203,
      title: "Glow-in-the-Dark Album Art Pins",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      description: "Set of 5 enamel pins featuring iconic album covers that glow in the dark.",
      character: 'zombie'
    }
  ];
  
  // Create shelves inside the case
  const caseWidth = 9; // Slightly less than the case width
  const caseDepth = 3.5; // Slightly less than the case depth
  
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.5,
    roughness: 0.3
  });
  
  // Add shelves and items
  for (let i = 0; i < items.length; i++) {
    // Create shelf
    const shelfGeometry = new THREE.BoxGeometry(caseWidth, 0.1, caseDepth);
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.y = -2 + (i * 2); // Space shelves evenly
    caseGroup.add(shelf);
    
    // Create item display
    const item = items[i];
    
    // Create item card with image
    const loader = new THREE.TextureLoader();
    loader.load(item.image, (texture) => {
      const cardGeometry = new THREE.PlaneGeometry(1.5, 2);
      const cardMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true
      });
      const card = new THREE.Mesh(cardGeometry, cardMaterial);
      card.position.set(0, shelf.position.y + 1.1, 0);
      card.userData = { item };
      caseGroup.add(card);
      
      // Add to interactive objects
      productMeshes.push(card);
      
      // Add floating price tag
      const priceTag = createPriceTag(item.price, item.title);
      priceTag.position.set(0, shelf.position.y + 2.2, 0);
      caseGroup.add(priceTag);
    });
  }
}

function createPriceTag(price, title) {
  const group = new THREE.Group();
  
  // Create floating price tag background
  const tagGeometry = new THREE.PlaneGeometry(2, 0.6);
  const tagMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.7
  });
  const tag = new THREE.Mesh(tagGeometry, tagMaterial);
  group.add(tag);
  
  // Create price text (using sprite for simplicity)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.font = 'Bold 36px Arial';
  context.textAlign = 'center';
  context.fillText(`$${price}`, 128, 50);
  context.font = '24px Arial';
  context.fillText(title.substring(0, 15) + (title.length > 15 ? '...' : ''), 128, 90);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(2, 1, 1);
  group.add(sprite);
  
  return group;
}

function createProducts() {
  state.products.forEach(product => {
    createEnhancedProductDisplay(product);
  });
}

function createEnhancedProductDisplay(product) {
  const displayGroup = new THREE.Group();
  
  // Character-themed pedestals
  let pedestalColor, glowColor;
  switch(product.character) {
    case 'zombie':
      pedestalColor = 0x4a2a4a;
      glowColor = 0xff3e6c;
      break;
    case 'chibi':
      pedestalColor = 0x2a4a2a;
      glowColor = 0x00ff66;
      break;
    default: // korndog
      pedestalColor = 0x4a4a2a;
      glowColor = 0xffd166;
  }
  
  const pedestalGeometry = new THREE.CylinderGeometry(3.5, 4, 1.5, 8);
  const pedestalMaterial = new THREE.MeshLambertMaterial({ color: pedestalColor });
  const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
  pedestal.position.y = 0.75;
  pedestal.castShadow = true;
  displayGroup.add(pedestal);

  // Floating album with enhanced animations
  const albumGeometry = new THREE.PlaneGeometry(5, 5);
  const loader = new THREE.TextureLoader();
  
  loader.load(product.image, (texture) => {
    const albumMaterial = new THREE.MeshLambertMaterial({ 
      map: texture,
      transparent: true
    });
    const album = new THREE.Mesh(albumGeometry, albumMaterial);
    album.position.y = 4;
    album.rotation.y = Math.PI / 4;
    album.castShadow = true;
    
    // Character-specific floating behavior
    const originalY = album.position.y;
    let time = Math.random() * Math.PI * 2;
    const floatAmplitude = product.character === 'zombie' ? 0.8 : 0.5;
    const floatSpeed = product.character === 'chibi' ? 0.025 : 0.015;
    
    function animateAlbum() {
      time += floatSpeed;
      album.position.y = originalY + Math.sin(time) * floatAmplitude;
      album.rotation.y += 0.008;
      
      // Zombie kitty items occasionally "glitch"
      if (product.character === 'zombie' && Math.random() < 0.003) {
        album.rotation.y += 0.2;
        album.position.y += 0.5;
      }
      
      requestAnimationFrame(animateAlbum);
    }
    animateAlbum();
    
    displayGroup.add(album);
  });

  // Holographic info display
  const holoGeometry = new THREE.PlaneGeometry(8, 2.5);
  const holoMaterial = new THREE.MeshBasicMaterial({ 
    color: glowColor,
    transparent: true,
    opacity: 0.4
  });
  const holo = new THREE.Mesh(holoGeometry, holoMaterial);
  holo.position.y = 7;
  displayGroup.add(holo);

  // Price beacon
  const beaconGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
  const beaconMaterial = new THREE.MeshBasicMaterial({ 
    color: glowColor,
    transparent: true,
    opacity: 0.6
  });
  const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
  beacon.position.y = 2.5;
  displayGroup.add(beacon);

  displayGroup.position.set(product.position.x, 0, product.position.z);
  displayGroup.userData = { product };
  
  scene.add(displayGroup);
  productMeshes.push(displayGroup);
}

function createCharacterZones() {
  // Zombie Kitty's Spooky Corner
  const zombieGeometry = new THREE.BoxGeometry(12, 8, 12);
  const zombieMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x2a1a2a,
    transparent: true,
    opacity: 0.2
  });
  const zombieZone = new THREE.Mesh(zombieGeometry, zombieMaterial);
  zombieZone.position.set(-25, 4, 0);
  scene.add(zombieZone);

  // Chibi Kitty's Kawaii Corner
  const chibiGeometry = new THREE.BoxGeometry(12, 8, 12);
  const chibiMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x1a4a2a,
    transparent: true,
    opacity: 0.2
  });
  const chibiZone = new THREE.Mesh(chibiGeometry, chibiMaterial);
  chibiZone.position.set(25, 4, 0);
  scene.add(chibiZone);

  // KornDog's Central Hub
  const korndogGeometry = new THREE.CylinderGeometry(8, 10, 3, 12);
  const korndogMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x4a4a2a,
    transparent: true,
    opacity: 0.3
  });
  const korndogHub = new THREE.Mesh(korndogGeometry, korndogMaterial);
  korndogHub.position.set(0, 1.5, -30);
  scene.add(korndogHub);
}

function createAtmosphericLighting() {
  // Ambient lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(30, 30, 30);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Character zone lighting
  const zombieLight = new THREE.PointLight(0xff3e6c, 0.6, 25);
  zombieLight.position.set(-25, 10, 0);
  scene.add(zombieLight);

  const chibiLight = new THREE.PointLight(0x00ff66, 0.6, 25);
  chibiLight.position.set(25, 10, 0);
  scene.add(chibiLight);

  const korndogLight = new THREE.PointLight(0xffd166, 0.8, 30);
  korndogLight.position.set(0, 15, -30);
  scene.add(korndogLight);

  // Animated disco lighting
  let lightTime = 0;
  function animateLights() {
    lightTime += 0.02;
    zombieLight.intensity = 0.4 + Math.sin(lightTime) * 0.2;
    chibiLight.intensity = 0.4 + Math.sin(lightTime + 2) * 0.2;
    korndogLight.intensity = 0.6 + Math.sin(lightTime + 4) * 0.2;
    requestAnimationFrame(animateLights);
  }
  animateLights();
}

function createMagicalParticles() {
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = Math.random() * 25;
    positions[i + 2] = (Math.random() - 0.5) * 100;
    
    // Random character colors
    const colorChoice = Math.random();
    if (colorChoice < 0.33) {
      colors[i] = 1; colors[i + 1] = 0.24; colors[i + 2] = 0.42; // Zombie pink
    } else if (colorChoice < 0.66) {
      colors[i] = 0; colors[i + 1] = 1; colors[i + 2] = 0.4; // Chibi green
    } else {
      colors[i] = 1; colors[i + 1] = 0.82; colors[i + 2] = 0.4; // KornDog gold
    }
  }
  
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    vertexColors: true
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Animate particles like musical notes
  function animateParticles() {
    const positions = particles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.02;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.001;
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}
// ======= CONTROLS =======
function setupControls() {
  // Keyboard
  document.addEventListener('keydown', (event) => {
    if (!state.is3D) return;
    switch (event.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyD': moveRight = true; break;
      case 'Space': 
        event.preventDefault();
        camera.position.y += 3;
        setTimeout(() => { camera.position.y = Math.max(6, camera.position.y - 3); }, 400);
        break;
    }
  });

  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW': moveForward = false; break;
      case 'KeyA': moveLeft = false; break;
      case 'KeyS': moveBackward = false; break;
      case 'KeyD': moveRight = false; break;
    }
  });

  // Mouse look
  let isMouseDown = false;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousedown', (event) => {
    if (!state.is3D) return;
    isMouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  document.addEventListener('mousemove', (event) => {
    if (isMouseDown && state.is3D) {
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      camera.rotation.y -= deltaX * 0.003;
      camera.rotation.x -= deltaY * 0.003;
      camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    }
  });

  // Product interaction
  document.addEventListener('click', onProductClick);
  window.addEventListener('resize', onWindowResize);

  // Mobile touch controls
  setupMobileControls();
  
  // Admin panel access (press Ctrl+Shift+A)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyA') {
      toggleAdminPanel();
    }
  });
  
  // Admin panel access via touch gesture (swipe down with 3 fingers)
  let touchStartY = 0;
  let touchStartTime = 0;

  document.addEventListener('touchstart', (event) => {
    if (event.touches.length === 3) {
      touchStartY = event.touches[0].clientY;
      touchStartTime = Date.now();
    }
  });

  document.addEventListener('touchend', (event) => {
    if (event.changedTouches.length === 3) {
      const touchEndY = event.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      const touchDistance = touchEndY - touchStartY;
      
      // If swipe down with 3 fingers and quick enough
      if (touchDistance > 100 && touchDuration < 500) {
        toggleAdminPanel();
      }
    }
  });
}

function setupMobileControls() {
  const joystick = document.getElementById('joystick');
  const joystickContainer = document.querySelector('.joystick-container');
  let joystickActive = false;
  let joystickCenter = { x: 0, y: 0 };

  function startJoystick(event) {
    if (!state.is3D) return;
    joystickActive = true;
    const rect = joystickContainer.getBoundingClientRect();
    joystickCenter.x = rect.left + rect.width / 2;
    joystickCenter.y = rect.top + rect.height / 2;
    updateJoystick(event);
  }

  function updateJoystick(event) {
    if (!joystickActive || !state.is3D) return;
    
    const touch = event.touches ? event.touches[0] : event;
    const deltaX = touch.clientX - joystickCenter.x;
    const deltaY = touch.clientY - joystickCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 35;
    
    if (distance <= maxDistance) {
      joystick.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const limitedX = Math.cos(angle) * maxDistance;
      const limitedY = Math.sin(angle) * maxDistance;
      joystick.style.transform = `translate(-50%, -50%) translate(${limitedX}px, ${limitedY}px)`;
    }
    
    const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
    const angle = Math.atan2(deltaY, deltaX);
    
    if (normalizedDistance > 0.2) {
      moveForward = Math.cos(angle + Math.PI) * normalizedDistance > 0.3;
      moveBackward = Math.cos(angle) * normalizedDistance > 0.3;
      moveLeft = Math.sin(angle + Math.PI) * normalizedDistance > 0.3;
      moveRight = Math.sin(angle) * normalizedDistance > 0.3;
    } else {
      moveForward = moveBackward = moveLeft = moveRight = false;
    }
  }

  function endJoystick() {
    joystickActive = false;
    joystick.style.transform = 'translate(-50%, -50%)';
    moveForward = moveBackward = moveLeft = moveRight = false;
  }

  joystickContainer.addEventListener('mousedown', startJoystick);
  joystickContainer.addEventListener('touchstart', startJoystick);
  document.addEventListener('mousemove', updateJoystick);
  document.addEventListener('touchmove', updateJoystick);
  document.addEventListener('mouseup', endJoystick);
  document.addEventListener('touchend', endJoystick);

  // Touch buttons
  document.getElementById('jumpBtn').addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (state.is3D) {
      camera.position.y += 3;
      setTimeout(() => { camera.position.y = Math.max(6, camera.position.y - 3); }, 400);
    }
  });

  document.getElementById('interactBtn').addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (state.is3D) {
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(productMeshes, true);
      
      if (intersects.length > 0) {
        const clickedGroup = intersects[0].object.parent;
        if (clickedGroup.userData && clickedGroup.userData.product) {
          showProductPanel(clickedGroup.userData.product);
        }
      }
    }
  });
}

function onProductClick(event) {
  if (!state.is3D || event.target.closest('.ui-overlay')) return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(productMeshes, true);

  if (intersects.length > 0) {
    const clickedGroup = intersects[0].object.parent;
    if (clickedGroup.userData && clickedGroup.userData.product) {
      showProductPanel(clickedGroup.userData.product);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateMovement() {
  if (!state.is3D) return;
  
  const speed = 0.4;
  
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward) velocity.z -= direction.z * speed;
  if (moveLeft || moveRight) velocity.x -= direction.x * speed;

  const euler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
  const quaternion = new THREE.Quaternion().setFromEuler(euler);
  velocity.applyQuaternion(quaternion);

  camera.position.add(velocity);
  velocity.multiplyScalar(0.85);
  camera.position.y = Math.max(6, camera.position.y);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (state.is3D) {
    updateMovement();
    
    // Update holographic displays to face camera
    productMeshes.forEach(group => {
      const holo = group.children.find(child => 
        child.geometry && child.geometry.type === 'PlaneGeometry' && child.position.y > 5
      );
      if (holo) holo.lookAt(camera.position);
    });
    
    renderer.render(scene, camera);
  }
}

// ======= UI FUNCTIONS =======
function toggle3DMode() {
  state.is3D = !state.is3D;
  const canvas = document.getElementById('canvas3D');
  const content2D = document.getElementById('content2D');
  const hud = document.getElementById('hud3D');
  const floating3D = document.getElementById('floating3DCharacters');
  const dimensionText = document.getElementById('dimensionText');
  
  if (state.is3D) {
    // Enter 3D mode
    document.body.className = 'mode-3d';
    canvas.classList.add('active');
    content2D.classList.add('hidden');
    hud.classList.add('show');
    floating3D.classList.add('show');
    dimensionText.textContent = 'Exit 3D Store';
    
    // Update mode buttons
    document.getElementById('mode2D').classList.remove('active');
    document.getElementById('mode3D').classList.add('active');
    
    showCharacterMessage("Welcome to our 3D store! Walk around and click on albums to explore.", 'korndog');
  } else {
    // Exit 3D mode
    document.body.className = 'mode-2d';
    canvas.classList.remove('active');
    content2D.classList.remove('hidden');
    hud.classList.remove('show');
    floating3D.classList.remove('show');
    dimensionText.textContent = 'Enter 3D Store';
    
    // Update mode buttons
    document.getElementById('mode3D').classList.remove('active');
    document.getElementById('mode2D').classList.add('active');
    
    hideProductPanel();
    hideCharacterPopup();
  }
}

function enter3DStore() {
  if (!state.is3D) {
    toggle3DMode();
  }
}

function browse2D() {
  if (state.is3D) {
    toggle3DMode();
  }
}

function focusCharacter(characterType) {
  // Move camera to character zone
  switch(characterType) {
    case 'zombie':
      camera.position.set(-20, 8, 5);
      camera.lookAt(-25, 5, 0);
      showCharacterMessage(characters.zombie.messages[Math.floor(Math.random() * characters.zombie.messages.length)], 'zombie');
      break;
    case 'chibi':
      camera.position.set(20, 8, 5);
      camera.lookAt(25, 5, 0);
      showCharacterMessage(characters.chibi.messages[Math.floor(Math.random() * characters.chibi.messages.length)], 'chibi');
      break;
    case 'korndog':
      camera.position.set(0, 10, -20);
      camera.lookAt(0, 5, -30);
      showCharacterMessage(characters.korndog.messages[Math.floor(Math.random() * characters.korndog.messages.length)], 'korndog');
      break;
  }
}

function showProductPanel(product) {
  state.currentProduct = product;
  
  document.getElementById('panelImage').src = product.image;
  document.getElementById('panelTitle').textContent = product.title;
  document.getElementById('panelPrice').textContent = `$${product.price}`;
  document.getElementById('panelDescription').textContent = product.description;
  
  document.getElementById('productPanel').classList.add('show');
  
  // Show character-specific message
  const character = characters[product.character] || characters.korndog;
  const message = character.messages[Math.floor(Math.random() * character.messages.length)];
  showCharacterMessage(message, product.character);
}

function hideProductPanel() {
  document.getElementById('productPanel').classList.remove('show');
  state.currentProduct = null;
}

function showCharacterMessage(message, characterType = 'korndog') {
  const character = characters[characterType];
  document.getElementById('characterName').textContent = character.name;
  document.getElementById('characterRole').textContent = character.role;
  document.getElementById('characterAvatar').src = character.avatar;
  document.getElementById('characterMessage').textContent = message;
  document.getElementById('characterPopup').classList.add('show');
  
  setTimeout(() => {
    hideCharacterPopup();
  }, 6000);
}

function hideCharacterPopup() {
  document.getElementById('characterPopup').classList.remove('show');
}

function addToCart(product, qty = 1) {
  const existingIndex = state.cart.findIndex(item => item.id === product.id);
  
  if (existingIndex >= 0) {
    state.cart[existingIndex].qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      qty: qty
    });
  }
  
  localStorage.setItem("kdr_cart", JSON.stringify(state.cart));
  updateCartCount();
  
  const character = characters[product.character] || characters.korndog;
  showCharacterMessage(`Added ${product.title} to your cart! Great choice!`, product.character);
  hideProductPanel();
}

function updateCartCount() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
  
  if (count > 0) {
    document.getElementById('cartBtn').classList.add('has-items');
  } else {
    document.getElementById('cartBtn').classList.remove('has-items');
  }
}

// ======= CART SYSTEM =======
function showCart() {
  const cartPanel = document.getElementById('cartPanel') || createCartPanel();
  cartPanel
