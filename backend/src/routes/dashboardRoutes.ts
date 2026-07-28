import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Stats fetch karne ke liye user ka login hona zaroori hai (protect middleware)
router.get('/stats', protect, getDashboardStats);

export default router;