const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// === ROUTES ===
// Make sure this line exists and points to the file we edited:
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/projects', require('./routes/projectRoutes'));


// Serve Static Files (Uploads)
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));