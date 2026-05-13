const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const problemRoutes = require('./routes/problemRoutes');  // Import problem routes
require('dotenv').config();
const path = require('path');
const rateLimit = require('express-rate-limit');




const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
      status: 429,
      message: "Too many requests. Please try again later."
  }
});
app.use(limiter); // 🔐 apply rate limiter globally
app.set('trust proxy', 1);
// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Use routes for problems
app.use('/api', problemRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.use(cors({
    origin: [
        'https://online-judge-mern-eight.vercel.app',
        'http://localhost:3000'
    ],
    credentials: true
}));


