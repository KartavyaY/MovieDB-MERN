# React Movie Browser with MongoDB & Firebase Auth

A full-stack movie browsing application with React frontend, Node.js/Express backend, MongoDB database, and Firebase authentication.

## 🌟 Features

- **🎬 Movie & TV Series Browsing** - Browse 52+ movies and TV series
- **🔍 Advanced Search** - Search by title, genre, or description with MongoDB text indexing
- **🎯 Smart Filtering** - Filter by Movies, TV Series, or All content
- **👤 User Authentication** - Firebase Auth with email/password and Google sign-in
- **📺 Personal Watchlist** - Save movies to your personal list (requires login)
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🚀 Real-time Updates** - Live search with debouncing
- **🎨 Modern UI** - Glassmorphism design with smooth animations

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** with hooks and context API
- **Firebase SDK** for authentication
- **Axios** for API communication
- **CSS Modules** for styling
- **Vite** for fast development and building

### Backend (Node.js + Express)
- **Express.js** REST API server
- **MongoDB** with Mongoose ODM
- **Firebase Admin SDK** for token verification
- **Security middleware** (Helmet, CORS, Rate limiting)
- **Text search indexing** for advanced search

### Database (MongoDB)
- **Movies Collection** - Movie/TV series data with text indexes
- **Users Collection** - User profiles and watchlists
- **Optimized queries** with proper indexing

## 🚀 Getting Started

### Quick Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd react-project

# Run the setup script - it handles everything!
./setup.sh
```

The setup script will:
- Check prerequisites (Node.js, MongoDB)
- Install all dependencies
- Set up environment files
- Seed the database
- Start both servers

### Manual Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Firebase project for authentication

### 1. Clone and Install Dependencies

```bash
# Install root dependencies first
npm install

# Install all project dependencies
npm run install:all
```

### 2. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication and configure email/password + Google providers
3. Generate service account credentials for backend
4. Get web app config for frontend

### 3. Environment Configuration

#### Frontend (frontend/.env)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:5001/api
```

#### Backend (backend/.env)
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/movie-browser
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FRONTEND_URL=http://localhost:5173
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with movie data
npm run backend:seed
```

### 5. Start the Application

```bash
# Option 1: Use the run script
./run.sh

# Option 2: Use npm command
npm run dev

# Option 3: Start servers separately
npm run backend:dev    # Terminal 1
npm run frontend:dev   # Terminal 2
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 📡 API Endpoints

### Movies
- `GET /api/movies` - Get movies with filtering and pagination
- `GET /api/movies/search` - Search movies
- `GET /api/movies/stats` - Get movie statistics
- `GET /api/movies/genres` - Get all genres
- `GET /api/movies/:id` - Get single movie

### Users (Protected)
- `POST /api/users/profile` - Create/update user profile
- `GET /api/users/profile` - Get user profile
- `GET /api/users/watchlist` - Get user's watchlist
- `POST /api/users/watchlist` - Add movie to watchlist
- `DELETE /api/users/watchlist/:movieId` - Remove from watchlist
- `PUT /api/users/preferences` - Update preferences

## 🎯 Usage

### For Users
1. Browse movies without logging in
2. Sign up/Sign in to access personal features
3. Add movies to your watchlist
4. Filter by Movies, TV Series, or view your personal list
5. Search for specific content

### For Developers
1. All API endpoints return JSON with consistent structure
2. Authentication handled via Firebase tokens
3. MongoDB queries optimized for performance
4. Frontend components are modular and reusable

## 🛠️ Development Commands

### Root Level Commands
```bash
./setup.sh              # Complete setup (recommended for first time)
./run.sh                # Quick start both servers
npm run dev             # Start both frontend and backend
npm run backend:dev     # Start only backend
npm run frontend:dev    # Start only frontend
npm run backend:seed    # Seed database with movie data
npm run install:all     # Install all dependencies
npm run setup           # Install dependencies and seed database
```

### Frontend Commands
```bash
cd frontend
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

### Backend Commands
```bash
cd backend
npm run dev             # Start with nodemon (auto-restart)
npm start              # Start production server
npm run seed           # Seed database with movie data
```

## 🎨 Styling

The application uses CSS Modules with a glassmorphism design:
- **Navbar**: Semi-transparent with backdrop blur
- **Cards**: Rounded corners with subtle shadows
- **Auth Modal**: Clean, centered overlay design
- **Responsive**: Mobile-first approach

## 🔒 Security Features

- **JWT Token Verification** via Firebase Admin SDK
- **Rate Limiting** to prevent abuse
- **CORS Protection** configured for frontend
- **Input Validation** on all API endpoints
- **Secure Headers** via Helmet middleware

## 📦 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

### Backend (Heroku/Railway/DigitalOcean)
1. Set up MongoDB Atlas for production
2. Configure environment variables
3. Deploy backend folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎬 Ready to Browse Movies!

Your full-stack movie browser is now ready with:
- ✅ 52 movies and TV series
- ✅ MongoDB database storage
- ✅ Firebase authentication
- ✅ Personal watchlists
- ✅ Advanced search and filtering
- ✅ Responsive design

Start the servers and enjoy browsing! 🍿

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
