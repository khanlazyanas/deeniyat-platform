import { Request, Response } from 'express';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import catchAsync from '../utils/catchAsync';

// @desc    Create a new transaction (Course Fee/Donation)
// @route   POST /api/v1/transactions
// @access  Private (Logged in users)
export const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const { amount, type, transactionId, courseId } = req.body;
  const userId = req.user?._id;

  // Auto-generate a secure transaction ID if gateway hasn't provided one yet
  const generatedTxnId = transactionId || `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

  const transaction = await Transaction.create({
    userId,
    courseId,
    amount,
    type,
    status: 'Pending', // Real app mein webhook se 'Completed' hoga
    transactionId: generatedTxnId,
  });

  res.status(201).json(transaction);
});

// @desc    Get logged in user's transaction history
// @route   GET /api/v1/transactions/my-transactions
// @access  Private
export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  // Populate 'courseId' so the frontend can display the course title in the table
  const transactions = await Transaction.find({ userId: req.user?._id })
    .populate('courseId', 'title') 
    .sort({ createdAt: -1 });
    
  res.json(transactions);
});

// @desc    Get all transactions across the platform
// @route   GET /api/v1/transactions
// @access  Private (Admin only)
export const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  // Professional API with population for Admin tracking
  const transactions = await Transaction.find({})
    .populate('userId', 'name email role')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });
    
  res.json(transactions);
});