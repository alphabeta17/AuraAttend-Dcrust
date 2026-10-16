import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

app.use(express.json());

// 1. Mount Auth Routes FIRST
app.use('/api/auth', authRoutes);

// 2. Serve Frontend Built Static Files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 3. Catch-all route for SPA routing (React Router support)
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});