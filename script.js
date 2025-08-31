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
    avatar: 'https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000043471-removebg-preview.png',
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
    avatar: 'https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/1000044073-removebg-preview.png',
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
    avatar: 'https://raw.githubusercontent.com/KornDog0804/korndog-records-site/main/ChatGPT%20Image%20Aug%2010%2C%202025%2C%2012_07_42%20AM.png',
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
  // Left aisle (Zombie Kitty's Vinyl Section)
  createAisle({
    start: { x: -25, z: -20 },
    end: { x: -25, z: 10 },
    width: 10,
    height: 6,
    color: 0x4a2a4a,
    glowColor: 0xff3e6c
  });
  
  // Right aisle (Chibi Kitty's Funko Section)
  createAisle({
    start: { x: 25, z: -20 },
    end: { x: 25, z: 10 },
    width: 10,
    height: 6,
    color: 0x2a4a2a,
    glowColor: 0x00ff66
  });
  
  // Center aisle (KornDog's Featured Section)
  createAisle({
    start: { x: 0, z: -40 },
    end: { x: 0, z: -20 },
    width: 15,
    height: 8,
    color: 0x4a4a2a,
    glowColor: 0xffd166
  });
}

function createAisle(options) {
  const group = new THREE.Group();
  
  const length = Math.sqrt(
    Math.pow(options.end.x - options.start.x, 2) + 
    Math.pow(options.end.z - options.start.z, 2)
  );
  
  const angle = Math.atan2(
    options.end.z - options.start.z,
    options.end.x - options.start.x
  );
  
  // Create shelving
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
    color: 0x00ff66
  });
  scene.add(funkoCase);
  
  // Collectibles Display Case
  const collectiblesCase = createGlassCase({
    width: 10,
    height: 8,
    depth: 4,
    position: { x: -25, y: 4, z: 15 },
    rotation: { x: 0, y: -Math.PI / 4, z: 0 },
    color: 0xff3e6c
  });
  scene.add(collectiblesCase);
}

function createGlassCase(options) {
  const group = new THREE.Group();
  
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    transmission: 0.95,
    thickness: 0.5
  });
  
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
  const frontGeometry = new THREE.PlaneGeometry(options.width, options.height);
  const frontPanel = new THREE.Mesh(frontGeometry, glassMaterial);
  frontPanel.position.z = options.depth/2;
  group.add(frontPanel);
  
  const backPanel = frontPanel.clone();
  backPanel.position.z = -options.depth/2;
  backPanel.rotation.y = Math.PI;
  group.add(backPanel);
  
  const sideGeometry = new THREE.PlaneGeometry(options.depth, options.height);
  const leftPanel = new THREE.Mesh(sideGeometry, glassMaterial);
  leftPanel.position.x = -options.width/2;
  leftPanel.rotation.y = Math.PI/2;
  group.add(leftPanel);
  
  const rightPanel = leftPanel.clone();
  rightPanel.position.x = options.width/2;
  rightPanel.rotation.y = -Math.PI/2;
  group.add(rightPanel);
  
  const topGeometry = new THREE.PlaneGeometry(options.width, options.depth);
  const topPanel = new THREE.Mesh(topGeometry, glassMaterial);
  topPanel.position.y = options.height/2;
  topPanel.rotation.x = -Math.PI/2;
  group.add(topPanel);
  
  // Add glow effect
  const glowLight = new THREE.PointLight(options.color, 0.8, 10);
  glowLight.position.set(0, 0, 0);
  group.add(glowLight);
  
  group.position.set(options.position.x, options.position.y, options.position.z);
  group.rotation.set(
    options.rotation.x || 0,
    options.rotation.y || 0,
    options.rotation.z || 0
  );
  
  group.userData = { type: 'displayCase' };
  
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
    default:
      pedestalColor = 0x4a4a2a;
      glowColor = 0xffd166;
      break;
  }
  
  // Create pedestal
  const pedestalGeometry = new THREE.CylinderGeometry(2, 2.5, 1, 8);
  const pedestalMaterial = new THREE.MeshLambertMaterial({ color: pedestalColor });
  const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
  pedestal.position.set(product.position.x, 0.5, product.position.z);
  pedestal.castShadow = true;
  displayGroup.add(pedestal);
  
  // Create floating product representation
  const loader = new THREE.TextureLoader();
  loader.load(product.image, (texture) => {
    const productGeometry = new THREE.PlaneGeometry(3, 3);
    const productMaterial = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true
    });
    const productMesh = new THREE.Mesh(productGeometry, productMaterial);
    productMesh.position.set(product.position.x, 3, product.position.z);
    productMesh.userData = { product };
    
    // Add floating animation
    let time = Math.random() * Math.PI * 2;
    function animateProduct() {
      time += 0.02;
      productMesh.position.y = 3 + Math.sin(time) * 0.5;
      productMesh.rotation.y += 0.01;
      requestAnimationFrame(animateProduct);
    }
    animateProduct();
    
    displayGroup.add(productMesh);
    productMeshes.push(productMesh);
  });
  
  // Add glow effect
  const glowLight = new THREE.PointLight(glowColor, 0.5, 8);
  glowLight.position.set(product.position.x, 2, product.position.z);
  displayGroup.add(glowLight);
  
  scene.add(displayGroup);
}

function createCharacterZones() {
  // Create character representations in 3D space
  Object.keys(characters).forEach((key, index) => {
    const character = characters[key];
    const positions = [
      { x: -25, y: 4, z: 15 }, // Zombie Kitty
      { x: 25, y: 4, z: 15 },  // Chibi Kitty
      { x: 0, y: 4, z: -45 }   // KornDog
    ];
    
    const loader = new THREE.TextureLoader();
    loader.load(character.avatar, (texture) => {
      const characterGeometry = new THREE.PlaneGeometry(4, 4);
      const characterMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true
      });
      const characterMesh = new THREE.Mesh(characterGeometry, characterMaterial);
      characterMesh.position.copy(positions[index]);
      characterMesh.userData = { character: key };
      
      // Add floating animation
      let time = Math.random() * Math.PI * 2;
      function animateCharacter() {
        time += 0.015;
        characterMesh.position.y = positions[index].y + Math.sin(time) * 0.3;
        characterMesh.rotation.y = Math.sin(time * 0.5) * 0.1;
        requestAnimationFrame(animateCharacter);
      }
      animateCharacter();
      
      scene.add(characterMesh);
      characterMeshes[key] = characterMesh;
    });
  });
}

function createAtmosphericLighting() {
  // Ambient lighting
  const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
  scene.add(ambientLight);
  
  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Add colored accent lights
  const lights = [
    { color: 0xff3e6c, position: { x: -25, y: 10, z: 0 } },
    { color: 0x00ff66, position: { x: 25, y: 10, z: 0 } },
    { color: 0xffd166, position: { x: 0, y: 15, z: -30 } }
  ];
  
  lights.forEach(lightData => {
    const light = new THREE.PointLight(lightData.color, 0.6, 30);
    light.position.set(lightData.position.x, lightData.position.y, lightData.position.z);
    scene.add(light);
  });
}

function createMagicalParticles() {
  const particleCount = 100;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = Math.random() * 20;
    positions[i + 2] = (Math.random() - 0.5) * 100;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffd166,
    size: 0.5,
    transparent: true,
    opacity: 0.6
  });
  
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);
  
  // Animate particles
  function animateParticles() {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] += 0.02;
      if (positions[i] > 20) {
        positions[i] = 0;
      }
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

function setupControls() {
  // Keyboard controls
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Mouse controls
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onMouseClick);
  
  // Touch controls for mobile
  setupTouchControls();
  
  // Window resize
  window.addEventListener('resize', onWindowResize);
}

function onKeyDown(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
    case 'Space':
      event.preventDefault();
      // Jump functionality
      velocity.y = 10;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
}

function onMouseMove(event) {
  if (!state.is3D) return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Camera look around
  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;
  
  camera.rotation.y -= movementX * 0.002;
  camera.rotation.x -= movementY * 0.002;
  
  // Clamp vertical rotation
  camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
}

function onMouseClick(event) {
  if (!state.is3D) return;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(productMeshes);
  
  if (intersects.length > 0) {
    const product = intersects[0].object.userData.product;
    if (product) {
      showProductPanel(product);
    }
  }
}

function setupTouchControls() {
  const joystick = document.getElementById('joystick');
  const joystickContainer = document.querySelector('.joystick-container');
  
  if (!joystick || !joystickContainer) return;
  
  let isDragging = false;
  let startPos = { x: 0, y: 0 };
  
  joystick.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    const rect = joystickContainer.getBoundingClientRect();
    startPos.x = touch.clientX - rect.left - rect.width / 2;
    startPos.y = touch.clientY - rect.top - rect.height / 2;
  });
  
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const rect = joystickContainer.getBoundingClientRect();
    const deltaX = touch.clientX - rect.left - rect.width / 2;
    const deltaY = touch.clientY - rect.top - rect.height / 2;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 25;
    
    if (distance <= maxDistance) {
      joystick.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;
      
      // Update movement based on joystick position
      moveForward = deltaY < -5;
      moveBackward = deltaY > 5;
      moveLeft = deltaX < -5;
      moveRight = deltaX > 5;
    }
  });
  
  document.addEventListener('touchend', () => {
    isDragging = false;
    joystick.style.transform = 'translate(-50%, -50%)';
    moveForward = moveBackward = moveLeft = moveRight = false;
  });
}

function animate() {
  requestAnimationFrame(animate);
  
  if (state.is3D && camera) {
    updateMovement();
    renderer.render(scene, camera);
  }
}

function updateMovement() {
  const speed = 0.3;
  
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveLeft) - Number(moveRight);
  direction.normalize();
  
  if (moveForward || moveBackward) velocity.z -= direction.z * speed;
  if (moveLeft || moveRight) velocity.x -= direction.x * speed;
  
  // Apply movement
  camera.position.add(velocity);
  
  // Apply friction
  velocity.multiplyScalar(0.9);
  
  // Keep camera above ground
  if (camera.position.y < 2) {
    camera.position.y = 2;
    velocity.y = 0;
  }
  
  // Gravity
  velocity.y -= 0.3;
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// ======= UI FUNCTIONS =======
function showProductPanel(product) {
  const panel = document.getElementById('productPanel');
  const image = document.getElementById('panelImage');
  const title = document.getElementById('panelTitle');
  const price = document.getElementById('panelPrice');
  const description = document.getElementById('panelDescription');
  
  image.src = product.image;
  title.textContent = product.title;
  price.textContent = `$${product.price}`;
  description.textContent = product.description;
  
  panel.classList.add('show');
  
  state.currentProduct = product;
  
  // Show character message
  showCharacterMessage(product.character, product);
}

function hideProductPanel() {
  const panel = document.getElementById('productPanel');
  panel.classList.remove('show');
  hideCharacterMessage();
  state.currentProduct = null;
}

function showCharacterMessage(characterKey, product) {
  const character = characters[characterKey];
  const popup = document.getElementById('characterPopup');
  const avatar = document.getElementById('characterAvatar');
  const name = document.getElementById('characterName');
  const role = document.getElementById('characterRole');
  const message = document.getElementById('characterMessage');
  
  avatar.src = character.avatar;
  name.textContent = character.name;
  role.textContent = character.role;
  
  const randomMessage = character.messages[Math.floor(Math.random() * character.messages.length)];
  message.textContent = randomMessage;
  
  popup.classList.add('show');
}

function hideCharacterMessage() {
  const popup = document.getElementById('characterPopup');
  popup.classList.remove('show');
}

function focusCharacter(characterKey) {
  const character = characters[characterKey];
  showCharacterMessage(characterKey, null);
}

// ======= MODE SWITCHING =======
function enter3DStore() {
  if (!scene) {
    init3DStore();
  }
  
  document.body.classList.add('mode-3d');
  document.body.classList.remove('mode-2d');
  
  const canvas = document.getElementById('canvas3D');
  const content2D = document.getElementById('content2D');
  const hud = document.getElementById('hud3D');
  const floatingCharacters = document.getElementById('floating3DCharacters');
  
  canvas.classList.add('active');
  content2D.classList.add('hidden');
  hud.classList.add('show');
  floatingCharacters.classList.add('show');
  
  // Update button text
  document.getElementById('dimensionText').textContent = 'Exit 3D Store';
  
  // Update mode buttons
  document.getElementById('mode2D').classList.remove('active');
  document.getElementById('mode3D').classList.add('active');
  
  state.is3D = true;
  
  // Request pointer lock for better 3D experience
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
  if (canvas.requestPointerLock) {
    canvas.requestPointerLock();
  }
}

function exit3DStore() {
  document.body.classList.remove('mode-3d');
  document.body.classList.add('mode-2d');
  
  const canvas = document.getElementById('canvas3D');
  const content2D = document.getElementById('content2D');
  const hud = document.getElementById('hud3D');
  const floatingCharacters = document.getElementById('floating3DCharacters');
  
  canvas.classList.remove('active');
  content2D.classList.remove('hidden');
  hud.classList.remove('show');
  floatingCharacters.classList.remove('show');
  
  // Hide panels
  hideProductPanel();
  
  // Update button text
  document.getElementById('dimensionText').textContent = 'Enter 3D Store';
  
  // Update mode buttons
  document.getElementById('mode3D').classList.remove('active');
  document.getElementById('mode2D').classList.add('active');
  
  state.is3D = false;
  
  // Exit pointer lock
  if (document.exitPointerLock) {
    document.exitPointerLock();
  }
}

function browse2D() {
  // Smooth scroll to 2D content area
  const content = document.getElementById('content2D');
  content.scrollIntoView({ behavior: 'smooth' });
}

// ======= CART SYSTEM =======
function addToCart(product) {
  const existingItem = state.cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }
  
  updateCartUI();
  saveCart();
  showNotification(`Added ${product.title} to cart!`);
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  if (totalItems > 0) {
    cartBtn.classList.add('has-items');
  } else {
    cartBtn.classList.remove('has-items');
  }
}

function saveCart() {
  localStorage.setItem('kdr_cart', JSON.stringify(state.cart));
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide and remove notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// ======= EVENT LISTENERS =======
document.addEventListener('DOMContentLoaded', function() {
  // Initialize loading screen
  simulateLoading();
  
  // Mode toggle buttons
  document.getElementById('toggle3D').addEventListener('click', function() {
    if (state.is3D) {
      exit3DStore();
    } else {
      enter3DStore();
    }
  });
  
  document.getElementById('mode2D').addEventListener('click', exit3DStore);
  document.getElementById('mode3D').addEventListener('click', enter3DStore);
  
  // Product panel controls
  document.getElementById('addToCartBtn').addEventListener('click', function() {
    if (state.currentProduct) {
      addToCart(state.currentProduct);
    }
  });
  
  document.getElementById('closePanelBtn').addEventListener('click', hideProductPanel);
  
  // Character popup controls
  document.getElementById('dismissCharacter').addEventListener('click', hideCharacterMessage);
  
  // Initialize cart UI
  updateCartUI();
  
  // Show welcome character message
  setTimeout(() => {
    showCharacterMessage('korndog', null);
  }, 2000);
});

function simulateLoading() {
  const progressBar = document.getElementById('loadingProgress');
  const loadingScreen = document.getElementById('loadingScreen');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500);
    }
    
    progressBar.style.width = progress + '%';
  }, 200);
}

// ======= UTILITY FUNCTIONS =======
function toggleCart() {
  // Cart modal functionality
  console.log('Cart toggled:', state.cart);
}

// Initialize on load
window.addEventListener('load', function() {
  console.log('KornDog Records initialized!');
});
