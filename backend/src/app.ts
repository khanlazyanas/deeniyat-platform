import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { notFound, errorHandler } from './middlewares/errorMiddleware';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);

// Basic Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Deeniyat Platform Backend is running perfectly! 🚀');
});

// Error Handling Middlewares (Yeh hamesha saare routes ke baad aate hain)
app.use(notFound);
app.use(errorHandler);

export default app;