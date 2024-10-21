const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const problemRoutes = require('./routes/problemRoutes');  // Import problem routes
require('dotenv').config();
const path = require('path');



const app = express();

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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
app.use(cors());
if (process.env.NODE_ENV === 'production') {
app.use(express.static(path.join(__dirname, 'frontend', 'build'))); // Serve static React files

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html')); // For React router
});
}
