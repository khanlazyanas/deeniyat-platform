import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes'; // Naya import
import { notFound, errorHandler } from './middlewares/errorMiddleware';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes); // Naya route connect ho gaya

// Basic Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Deeniyat Platform Backend is running perfectly! 🚀');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;