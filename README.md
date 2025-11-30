# Skincare Chatbot Frontend

A React-based web application for skin disease detection and AI-powered skincare product recommendations.

## Features

- 🔐 User Authentication (Login/Register)
- 📸 Skin Disease Detection via Image Upload
- 💬 AI Chat for Personalized Product Recommendations
- 🛒 E-commerce with Shopping Cart
- 📦 Order Management and History
- 👨‍💼 Admin Dashboard
- 💾 Persistent State Management with LocalStorage

## Tech Stack

- **React** 19.1.1
- **React Router DOM** 7.9.1
- **Tailwind CSS** 3.4.0
- **Axios** 1.12.2
- **Lucide React** (Icons)
- **Highcharts** (Admin Dashboard)

## Project Structure

```
src/
├── components/          # Organized by feature
│   ├── Layout/         # Header, Sidebar
│   ├── Chat/           # AI Chat components
│   ├── Product/        # Product listing
│   ├── Cart/           # Shopping cart
│   ├── Order/          # Checkout, Order history
│   ├── Auth/           # Login, Register
│   ├── Admin/          # Admin dashboard
│   └── Upload/         # Image upload & detection
├── services/           # API service layer
│   ├── authService.js
│   ├── chatService.js
│   ├── productService.js
│   ├── orderService.js
│   └── uploadService.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useChat.js
│   └── useLocalStorage.js
├── utils/              # Utility functions
│   ├── constants.js
│   ├── formatters.js
│   ├── validators.js
│   └── helpers.js
└── assets/             # Static files
```

## Getting Started

### Prerequisites

- Node.js 14+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Endpoints

The app connects to the following backend endpoints:

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/chat` - AI chat
- `GET /api/v1/products` - Get products
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `POST /predict` - Skin disease prediction

## Features Overview

### Authentication
- Email/username and password login
- User registration with validation
- Token-based authentication
- Role-based access (admin/user)

### Skin Detection
- Drag & drop or file upload
- AI-powered disease detection
- Confidence score display
- Session persistence

### AI Chat
- Multiple chat sessions per user
- Chat history in localStorage
- Disease-aware recommendations
- Session management

### E-commerce
- Product catalog with filters
- Category, condition, and price filters
- Search functionality
- Shopping cart with quantity management
- Checkout process
- Order tracking

### Admin Panel
- System information
- User management
- Product management
- Database viewer

## Development

### Adding New Components

Components should be organized by feature:

```javascript
// Good: Organized by feature
import { Login, Register } from './components/Auth';
import { Products } from './components/Product';

// Bad: Flat structure
import Login from './components/Login';
import Register from './components/Register';
```

### Adding New Services

Create service files in `src/services/`:

```javascript
// src/services/myService.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const myApiCall = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/endpoint`, data);
  return response.data;
};
```

### Using Custom Hooks

```javascript
import { useAuth, useCart, useChat } from '../hooks';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { cartItems, addToCart } = useCart(user);
  const { sessions, createNewChat } = useChat(user);
  
  // Component logic
}
```

## License

This project is part of a skincare chatbot system.

## Support

For issues and questions, please contact the development team.
