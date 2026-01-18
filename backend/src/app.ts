import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import apiRoutes from './routes/api';

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api', apiRoutes);


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/public-works-dashboard';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
