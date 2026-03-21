import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';

import { apiLimiter } from './src/middleware/rateLimiter.js';
import errorHandler from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import familyRoutes from './src/routes/familyRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import reminderRoutes from './src/routes/reminderRoutes.js';
import stepsRoutes from './src/routes/stepsRoutes.js';
import recordsRoutes from './src/routes/recordsRoutes.js';
import emergencyRoutes from './src/routes/emergencyRoutes.js';
import tipsRoutes from './src/routes/tipsRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import healthStatusRoutes from './src/routes/healthStatusRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import todoRoutes from './src/routes/todoRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import healthDataRoutes from './src/routes/healthDataRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import medicationRoutes from './src/routes/medicationRoutes.js';
import nutritionRoutes from './src/routes/nutritionRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Configure true origin for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(apiLimiter); // Apply rate limiting
app.use(mongoSanitize()); // Prevent NoSQL injections
app.use(compression()); // Compress responses

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/health', healthStatusRoutes); // Extended health routes
app.use('/api/health-data', healthDataRoutes); // Native health APIs
app.use('/api/reminder', reminderRoutes);
app.use('/api/steps', stepsRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/nutrition', nutritionRoutes);


// Base route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Family Health Connect API is running...' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
