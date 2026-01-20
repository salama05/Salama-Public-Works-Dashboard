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
            const adminUser = process.env.ADMIN_USERNAME || 'admin';
            const adminPass = process.env.ADMIN_PASSWORD || 'admin';
            await User.create({
                username: adminUser,
                password: adminPass
            });
            console.log(`✅ Default admin user created successfully: [${adminUser}]`);
        } else {
            console.log(`ℹ️ Database already has ${userCount} users. Skipping default admin creation.`);
        }
    } catch (err) {
        console.error('❌ Error in createDefaultAdmin:', err);
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
