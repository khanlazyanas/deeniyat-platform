import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import catchAsync from '../utils/catchAsync';

export const submitFeedback = catchAsync(async (req: Request, res: Response) => {
  const { rating, review } = req.body;
  const studentId = req.user?._id;

  const feedback = await Feedback.create({ studentId, rating, review });
  res.status(201).json({ success: true, data: feedback });
});

export const getFeedbacks = catchAsync(async (req: Request, res: Response) => {
  // Latest 10 reviews fetch karenge jinme achhi rating ho (4 ya 5)
  const feedbacks = await Feedback.find({ rating: { $gte: 4 } })
    .populate('studentId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);
    
  res.status(200).json({ success: true, data: feedbacks });
});