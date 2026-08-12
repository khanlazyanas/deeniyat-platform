import { Request, Response } from 'express';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import catchAsync from '../utils/catchAsync';
import User from '../models/User'; 

// @desc    Create a new transaction (Course Fee/Donation)
// @route   POST /api/v1/transactions
// @access  Private (Logged in users)
export const createTransaction = catchAsync(async (req: Request, res: Response) => {
  // 👇 FIX: Frontend se aane wale status aur paymentId ko accept kiya
  const { amount, type, courseId, status, paymentId } = req.body;
  const userId = req.user?._id;

  const generatedTxnId = paymentId || `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  const finalStatus = status || 'Pending'; // Frontend "Completed" bhejega

  const transaction = await Transaction.create({
    userId,
    courseId,
    amount,
    type,
    status: finalStatus,
    transactionId: generatedTxnId,
  });

  // 🚨 THE MAGIC FIX: Agar payment success hai, toh Student ko Course ka access do!
  if (finalStatus === 'Completed' && courseId) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId } // $addToSet duplicate entry rokta hai
    });
  }

  res.status(201).json(transaction);
});

export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({ userId: req.user?._id })
    .populate('courseId', 'title') 
    .sort({ createdAt: -1 });
  res.json(transactions);
});

export const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({})
    .populate('userId', 'name email role')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });
  res.json(transactions);
});