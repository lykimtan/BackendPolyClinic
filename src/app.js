import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import fnARoutes from "./routes/FnARoutes.js";
import appointmentRoute from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import cookieParser from 'cookie-parser'; //import cookie-parser


// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));//request body > 10mb sẽ bị từ chối
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/fna', fnARoutes);
app.use('/api/appointments', appointmentRoute);
app.use('/api/medical-records', medicalRecordRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to Hospital Management API",
        version: "1.0.0",
        endpoints: {
            users: "/api/users",
            health: "/health"
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

export default app;