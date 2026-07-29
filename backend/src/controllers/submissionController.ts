import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Lesson from '../models/Lesson';
import catchAsync from '../utils/catchAsync';

// @desc    Submit audio assignment (Tajweed)
// @route   POST /api/v1/submissions
// @access  Private (Student only)
export const submitAssignment = catchAsync(async (req: Request, res: Response) => {
  const { lessonId, audioFileUrl } = req.body;
  const studentId = req.user?._id;

  // Check agar lesson exist karta hai
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const submission = await Submission.create({
    studentId,
    lessonId,
    audioFileUrl,
    status: 'Pending',
  });

  res.status(201).json(submission);
});

// @desc    Grade a student's submission
// @route   PUT /api/v1/submissions/:id/grade
// @access  Private (Ustad & Admin only)
export const gradeSubmission = catchAsync(async (req: Request, res: Response) => {
  const { grade, feedback } = req.body;

  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Update grading details
  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = 'Graded';

  const updatedSubmission = await submission.save();

  res.json(updatedSubmission);
});

// @desc    Get all submissions for a specific lesson (For Ustad)
// @route   GET /api/v1/submissions/lesson/:lessonId
// @access  Private (Ustad & Admin)
export const getSubmissionsByLesson = catchAsync(async (req: Request, res: Response) => {
  const submissions = await Submission.find({ lessonId: req.params.lessonId })
    .populate('studentId', 'name email profileImage');
    
  res.json(submissions);
});

// @desc    Get ALL submissions across all lessons (For Ustad Dashboard)
// @route   GET /api/v1/submissions/all
// @access  Private (Ustad & Admin)
export const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const submissions = await Submission.find()
    .populate('studentId', 'name email profileImage')
    .populate('lessonId', 'title') // Lesson ka naam bhi chahiye UI pe dikhane ke liye
    .sort({ createdAt: -1 });
    
  res.json(submissions);
});