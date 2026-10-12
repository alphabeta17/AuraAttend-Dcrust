import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

// Enable CORS for both 5173 and 5174
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

app.use(express.json());

// Mount Auth Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('AuraAttend Backend is active and running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});