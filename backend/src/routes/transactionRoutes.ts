import express from 'express';
import { createTransaction, getMyTransactions, getAllTransactions } from '../controllers/transactionController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// User (Student/Ustad/Admin) apne transactions bana sakte hain aur dekh sakte hain
router.post('/', protect, createTransaction);
router.get('/my-transactions', protect, getMyTransactions);

// Sirf SUPER ADMIN pure platform ka paisa (Fees/Donations) track kar sakta hai
router.get('/', protect, authorize('Admin'), getAllTransactions);

export default router;