import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import apiRoutes from './routes/api';

app.use('/api', apiRoutes);

// Serve Static Assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.get('/:path*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../../', 'frontend', 'dist', 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/public-works-dashboard';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
