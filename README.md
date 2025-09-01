# KornDog Records - Enhanced Edition

This is an enhanced version of the KornDog Records website, featuring advanced animations, interactive elements, and viral-worthy features designed to create an engaging and memorable user experience.

## Features

### Visual Enhancements
- **Immersive Vinyl Universe**: Animated record players, spinning vinyl, and music-themed visual elements
- **3D Product Cards**: Interactive product cards with flip animations and 3D hover effects
- **Dynamic Animations**: Parallax scrolling, micro-interactions, and smooth transitions
- **Audio Visualizer**: Visual representation of music that responds to user interaction
- **Custom Cursor**: Enhanced cursor experience with context-aware hover effects

### Character-Driven Experience
- **Enhanced Zombie Kitty**: Expanded character with animations and personalized messages
- **KornDog Mascot**: Interactive shop guide with personality and helpful tips
- **Character Backstories**: Detailed lore and personality for site mascots

### Technical Improvements
- **Modular CSS Architecture**: Separated CSS files for better organization and maintenance
- **Advanced JavaScript Features**: Object-oriented approach with classes for functionality
- **Responsive Design**: Fully responsive layout that works on all device sizes
- **Performance Optimizations**: Lazy loading, efficient animations, and optimized assets

### User Experience Enhancements
- **Product Filtering & Sorting**: Advanced filtering and sorting options for product discovery
- **Quick View Modal**: View product details without leaving the current page
- **Wishlist Functionality**: Save favorite items for later
- **Recently Viewed Products**: Track and display recently viewed items
- **Product Recommendations**: "You might also like" suggestions based on viewing history
- **Enhanced Cart Experience**: Improved cart UI with animations and notifications

### Viral Marketing Elements
- **Social Sharing Integration**: Easy sharing of products on social media
- **Newsletter Signup**: Capture email addresses for marketing
- **Testimonials**: Social proof from satisfied customers
- **Community Section**: Highlight the community aspect of the brand

## File Structure

```
korndog_enhanced/
├── css/
│   ├── main.css           # Core styles and variables
│   ├── navigation.css     # Navigation and header styles
│   ├── products.css       # Product card and grid styles
│   ├── cart.css           # Cart and checkout styles
│   ├── characters.css     # Character elements and popups
│   ├── hero.css           # Hero section and homepage styles
│   ├── effects.css        # Animations and special effects
│   ├── buttons.css        # Buttons and UI elements
│   └── footer.css         # Footer and social media styles
├── js/
│   └── main.js            # Enhanced JavaScript functionality
├── images/                # Image assets (not included in this version)
├── index.html             # Main HTML file
└── README.md              # This file
```

## Setup Instructions

1. Replace the PayPal Client ID in `index.html`:
   ```javascript
   const PAYPAL_CLIENT_ID = "YOUR_LIVE_CLIENT_ID";
   ```

2. (Optional) Configure the UpCloud JSON content URL:
   ```javascript
   const JSON_URL = "https://jii3i.upcloudobjects.com/korndog-media/content/live.json";
   ```

3. Deploy the site to your preferred hosting provider.

## Content Structure

The site expects JSON data in the following format:

```json
{
  "hero": { 
    "headline": "Hand Picked Favorites", 
    "subhead": "Vinyl therapy is always on deck" 
  },
  "sections": [
    { 
      "title": "Kitties", 
      "items": [ 
        { 
          "title": "Album", 
          "price": 12.99, 
          "image": "https://.../cover.jpg",
          "description": "Optional description text" 
        } 
      ] 
    },
    { 
      "title": "Funkos", 
      "items": [ 
        { 
          "title": "Pop", 
          "price": 15, 
          "image": "https://.../pop.jpg" 
        } 
      ] 
    },
    { 
      "title": "Collectibles", 
      "items": [ ... ] 
    }
  ]
}
```

## Viral Marketing Features

### Social Sharing
Each product can be shared directly to social media platforms with pre-populated content.

### Character Engagement
Zombie Kitty and KornDog create memorable interactions that encourage users to share their experience.

### Visual Appeal
The immersive vinyl universe design creates a shareable, screenshot-worthy experience.

### Community Building
Testimonials, social feeds, and community sections foster a sense of belonging.

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Credits

- Original KornDog Records concept
- Enhanced design and development by NinjaTech AI
- Font Awesome for icons
- Google Fonts (Inter, Permanent Marker)
- Unsplash for stock photography