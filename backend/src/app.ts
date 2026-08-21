import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import bloodRoutes from './routes/blood.routes.js';
import ambulanceRoutes from './routes/ambulance.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import auditRoutes from './routes/audit.routes.js';
import { AdminController } from './controllers/admin.controller.js';
import { authenticate } from './middleware/auth.middleware.js';
import { requireRole } from './middleware/role.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import appointmentRoutes from "./routes/appointment.routes.js";

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/blood', bloodRoutes);
app.use('/api/v1/ambulances', ambulanceRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
// Direct shortcut route for /api/v1/users and /api/v1/analytics/regional
app.get('/api/v1/users', authenticate, requireRole('super_admin'), AdminController.getUsers);
app.get('/api/v1/analytics/regional', authenticate, requireRole('super_admin'), AdminController.getRegionalAnalytics);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
