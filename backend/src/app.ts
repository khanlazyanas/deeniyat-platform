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
// 👇 FIX: CORS Configuration Updated for Vercel Dynamic Links
app.use(cors({
  origin: function (origin, callback) {
    // Agar koi origin nahi hai (API testing tools jaise Postman ke liye), toh allow karo
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000', 
      process.env.FRONTEND_URL || 'https://deeniyat-platform.vercel.app'
    ];

    // Agar origin allowedOrigins mein hai, YA origin .vercel.app se khatam hota hai, toh allow karo
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS Policy'));
    }
  },
  credentials: true, // Frontend se cookies ya token aane dene ke liye
}));

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