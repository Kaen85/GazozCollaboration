const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const usersRouter = require("./routes/users");
const authRoutes = require('./routes/authRoutes');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// === ROUTES ===
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
// Make sure this line exists and points to the file we edited:
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/projects', require('./routes/projectRoutes'));
app.use("/users", usersRouter);


// Serve Static Files (Uploads)
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));