# HARSHA-ARTS Online Store

A full-stack e-commerce website for HARSHA-ARTS pencil carvings with both frontend and backend functionality.

## Features

### Frontend
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Image Modal**: Click on any product image to view it in full size
- **Shopping Cart**: Add products to cart with real-time updates
- **Cart Management**: View, update quantities, and remove items from cart
- **Smooth Animations**: Enhanced user experience with transitions and animations
- **Sticky Navigation**: Easy access to cart from anywhere on the page

### Backend
- **RESTful API**: Built with Node.js and Express
- **Cart Management**: Server-side cart storage and management
- **Product Catalog**: API endpoints for product information
- **CORS Enabled**: Allows frontend-backend communication

## Tech Stack

### Frontend
- HTML5
- CSS3 (with animations and responsive design)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- CORS middleware

## Project Structure

```
harsha-arts-shop/
├── server.js           # Backend server
├── package.json        # Node.js dependencies
├── public/             # Frontend files
│   └── index.html      # Main HTML file
└── README.md          # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Product Images**
   Place all your product images in the `public` folder:
   - anjali.jpg
   - buddy.jpg
   - kanna.jpg
   - harsha.jpg
   - vani.jpg
   - priya.jpg
   - saimanu.jpg
   - swathi.jpg
   - harini.jpg
   - buddi.jpg
   - eswar.jpg
   - nanaammu.jpg

3. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to: `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products

### Cart
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart/:userId/add` - Add item to cart
- `DELETE /api/cart/:userId/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/:userId/clear` - Clear entire cart

## Usage

### Adding Products to Cart
1. Browse products on the home page
2. Click on a product image to view it in full size
3. Click "Add to Cart" button on any product
4. Cart count updates automatically in the navigation bar

### Managing Cart
1. Click on "Cart 🛒" in the navigation
2. View all items with images, quantities, and prices
3. Remove individual items or clear entire cart
4. See total price automatically calculated
5. Proceed to checkout when ready

### Image Modal
- Click any product image to open it in a modal
- View full-size image with product details
- Add to cart directly from the modal
- Close by clicking the X or clicking outside the modal

## Customization

### Adding New Products
Edit `server.js` and add products to the `products` array in the `/api/products` endpoint:

```javascript
{ 
  id: 13, 
  name: 'NEW PRODUCT❤', 
  price: 600, 
  image: 'newproduct.jpg' 
}
```

### Styling
Modify the `<style>` section in `public/index.html` to change:
- Colors
- Fonts
- Layout
- Animations

### Backend Port
Change the port in `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

## Production Deployment

For production deployment:

1. **Use a Database**: Replace in-memory cart storage with MongoDB, PostgreSQL, etc.
2. **Add Authentication**: Implement user login/registration
3. **Payment Gateway**: Integrate Stripe, PayPal, or Razorpay
4. **Environment Variables**: Use `.env` file for configuration
5. **Security**: Add helmet, rate limiting, and input validation
6. **Hosting**: Deploy to Heroku, DigitalOcean, or AWS

## Future Enhancements

- User authentication and profiles
- Order history
- Payment integration
- Admin dashboard for product management
- Product search and filtering
- Product reviews and ratings
- Email notifications
- Wishlist functionality
- Discount codes and promotions

## Support

For issues or questions, please contact HARSHA-ARTS support.

## License

© 2025 HARSHA-ARTS. All rights reserved.
