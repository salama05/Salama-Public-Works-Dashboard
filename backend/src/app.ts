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
import User from './models/User';

const createDefaultAdmin = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            await User.create({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || 'admin'
            });
            console.log('Default admin user created: admin / admin');
        }
    } catch (err) {
        console.error('Error creating default admin:', err);
    }
};

app.use('/api', apiRoutes);

// Serve Static Assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.get(/^(?!\/api).+/, (req, res) =>
        res.sendFile(path.resolve(__dirname, '../../', 'frontend', 'dist', 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/public-works-dashboard';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        createDefaultAdmin();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
