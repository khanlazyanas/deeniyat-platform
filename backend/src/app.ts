import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import submissionRoutes from './routes/submissionRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import transactionRoutes from './routes/transactionRoutes'; 
import { notFound, errorHandler } from './middlewares/errorMiddleware';
import dashboardRoutes from './routes/dashboardRoutes';
import paymentRoutes from "./routes/paymentRoutes";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory for audio playback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Basic Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Deeniyat Platform Backend is running perfectly! 🚀');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;