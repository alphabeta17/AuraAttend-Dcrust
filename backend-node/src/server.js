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

// 1. Apne API routes pehle register karein
app.use('/api/auth', authRoutes);

// 2. Frontend ke static files serve karein
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// 3. SPA Fallback (Catch-all middleware - No path-to-regexp errors!)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});