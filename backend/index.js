// backend/index.js

// --- 1. Import Dependencies ---
// Import Express to create and manage the server.
const express = require('express');
// Import CORS to allow cross-origin requests from the frontend.
const cors = require('cors');
// Import the authentication routes we created.
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// --- 2. Initialize the Application ---
// Create an instance of an Express application.
const app = express();
// Define the port the server will run on. Use environment variable or default to 5000.
const PORT = process.env.PORT || 5000;

// --- 3. Middlewares ---
// This section is for code that runs on every request.
// The order of middlewares is very important.

// Enable CORS for all incoming requests. This allows our React app (on port 3000)
// to communicate with our server (on port 5000).
app.use(cors());

// Enable the express.json() middleware. This parses incoming requests with JSON payloads.
// It's how we get data from `req.body`. Without this, `req.body` would be undefined.
app.use(express.json());

// --- 4. API Routes ---
// This is where we define the API endpoints for our application.

// Define a simple root route for testing if the server is alive.
app.get('/', (req, res) => {
  res.send('Project Hub API is running successfully!');
});

// For any request that starts with '/api/auth', use the router defined in 'authRoutes.js'.
// For example, a request to '/api/auth/login' will be handled by the login route.
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);

// --- 5. Start the Server ---
// Start listening for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});