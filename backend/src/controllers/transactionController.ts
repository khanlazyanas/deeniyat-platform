import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import catchAsync from '../utils/catchAsync';

// @desc    Create a new transaction (Fee/Donation)
// @route   POST /api/v1/transactions
// @access  Private (Logged in users)
export const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const { amount, type, transactionId } = req.body;
  const userId = req.user?._id;

  const transaction = await Transaction.create({
    userId,
    amount,
    type,
    // Real app mein status Payment Gateway ke webhook se 'Completed' hoga
    status: 'Pending', 
    transactionId: transactionId || '',
  });

  res.status(201).json(transaction);
});

// @desc    Get logged in user's transaction history
// @route   GET /api/v1/transactions/my-transactions
// @access  Private
export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({ userId: req.user?._id }).sort({ createdAt: -1 });
  res.json(transactions);
});

// @desc    Get all transactions across the platform
// @route   GET /api/v1/transactions
// @access  Private (Admin only)
export const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({})
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });
    
  res.json(transactions);
});