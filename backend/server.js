const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const problemRoutes = require('./routes/problemRoutes');
require('dotenv').config();

const app = express();

// ✅ 1. CORS must be first
app.use(cors({
    origin: [
        'https://online-judge-mern-eight.vercel.app',
        'http://localhost:5000'
    ],
    credentials: true
}));

// ✅ 2. Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { status: 429, message: 'Too many requests. Please try again later.' }
});
app.use(limiter);
app.set('trust proxy', 1);

// ✅ 3. Body parser
app.use(bodyParser.json());

// ✅ 4. Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ✅ 5. Routes
app.use('/api', problemRoutes);

// ✅ 6. Start server after DB connects
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('MongoDB connection error:', err));