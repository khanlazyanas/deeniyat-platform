import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Deeniyat Platform Backend is running perfectly! 🚀');
});

export default app;