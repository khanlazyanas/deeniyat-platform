import express from 'express';
// Naya function getUstadStats bhi import kar liya
import { getDashboardStats, getUstadStats } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Stats fetch karne ke liye user ka login hona zaroori hai (protect middleware)
router.get('/stats', protect, getDashboardStats);

// 👇 Yeh naya route banaya hai Ustad ke dashboard stats ke liye
router.get('/ustad-stats', protect, getUstadStats);

export default router;