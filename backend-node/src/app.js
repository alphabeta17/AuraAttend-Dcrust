const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Enable CORS so your React frontend (port 5173) can talk to this backend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Mount Auth Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('AuraAttend Backend is active and running!');
});

module.exports = app;