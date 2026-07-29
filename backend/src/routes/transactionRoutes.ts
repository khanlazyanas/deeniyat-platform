import express from 'express';
import { createTransaction, getMyTransactions, getAllTransactions } from '../controllers/transactionController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Specific user route (must be before the /:id or / routes to avoid conflicts)
router.get('/my-transactions', protect, getMyTransactions);

// General routes
router.route('/')
  .post(protect, createTransaction) // Users create transactions
  .get(protect, authorize('Admin'), getAllTransactions); // Super Admin tracks all revenue

export default router;