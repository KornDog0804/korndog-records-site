# KornDog Records 🎵
Premium Media & Collectibles E-commerce Website

## Features

### 🛍️ Store Functionality
- **Product Categories**: Vinyl Records, CDs, Funko Pops, Movies, Collectibles
- **3D Flip Cards**: Interactive product cards that flip to show detailed descriptions
- **Smart Cart System**: Add/remove items with quantity tracking
- **PayPal Integration**: Secure payment processing
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🐱 Kitty Popups
- **Zombie Kitty**: Appears for vinyl/CD/movie purchases with rock-themed messages
- **Chibi Kitty**: Appears for Funko Pop purchases with kawaii messages  
- **10 Unique Messages**: Each kitty has 10 different Batman comic-style speech bubbles
- **Thank You Screen**: Both kitties appear together after successful purchases

### 🔐 Admin System (HIDDEN BY DEFAULT)
- **Completely Hidden**: No visible admin access until activated
- **Secure Access**: Hidden admin panel with password protection
- **Product Management**: Add, edit, delete products with front/back images
- **Hero Image Control**: Choose from preset logos or upload custom images
- **Inventory Overview**: Complete product management dashboard
- **Failed Login Protection**: Automatic lockout after 3 failed attempts

## Quick Setup

1. **Clone or Download** this repository
2. **Upload to GitHub Pages** or host anywhere
3. **Admin Access**: Click "Admin Access" button, password: `KornDog2025!`
4. **PayPal**: Uses sandbox environment - replace client-id for production

## Admin Access Methods

### Method 1: Direct Button
- Click the "Admin Access" button on the homepage
- Enter password: `KornDog2025!`

### Method 2: Secret Clicks  
- Click the hero logo 5 times quickly
- Enter password when prompted

## File Structure

```
korndog-records-site/
├── index.html          # Main website file
├── styles.css          # Complete styling
├── script.js           # All functionality
└── README.md           # This documentation
```

## Hero Images Available

1. **Default Logo**: KornDog Records official logo
2. **Zombie Kitty**: Green cat with X eye (for vinyl/music theme)
3. **Chibi Kitty**: White cat with X eye (for Funko/collectible theme)
4. **Custom Upload**: Upload your own hero image

## Kitty Messages

### Zombie Kitty (Music Products)
- "ROCK ON!"
- "VINYL POWER!" 
- "SPIN ME RIGHT ROUND!"
- "MUSIC TO MY EARS!"
- "NEEDLE DROP MAGIC!"
- And 5 more!

### Chibi Kitty (Funko Products)
- "KAWAII CHOICE!"
- "POP PERFECTION!"
- "FUNKO FANTASTIC!"
- "COLLECTOR'S DREAM!"
- "SHELF WORTHY!"
- And 5 more!

## Technical Features

- **Responsive Grid Layout**: Auto-adjusting product grids
- **LocalStorage Persistence**: Cart and products saved between sessions
- **Glassmorphism UI**: Modern frosted glass effects
- **3D CSS Animations**: Smooth card flips and transitions
- **Comic-Style Popups**: Batman-inspired speech bubbles
- **Secure Admin**: Password protection with lockout system

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox  
- Safari
- Mobile browsers

## Security Notes

- Admin password: `KornDog2025!` (change in script.js line 62)
- Failed login lockout: 10 minutes after 3 attempts
- All admin features hidden by default
- PayPal sandbox mode enabled

## Customization

### Change Admin Password
Edit line 62 in `script.js`:
```javascript
const ADMIN_PASSWORD = "YourNewPassword123!";
```

### Add New Products
1. Access admin panel
2. Fill out product form with front/back images
3. Save - appears immediately in store

### Update Hero Logo
1. Admin panel → Hero Image Management
2. Select preset or upload custom image
3. Changes apply instantly to nav and hero sections

## PayPal Setup

For production, replace the PayPal client-id in `index.html`:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=USD"></script>
```

## License

© 2025 KornDog Records. All rights reserved.

---

**Enjoy your premium media shopping experience!** 🎸🐱
