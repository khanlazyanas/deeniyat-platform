import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Lesson from '../models/Lesson';
import catchAsync from '../utils/catchAsync';

// @desc    Submit audio assignment (Tajweed)
// @route   POST /api/v1/submissions
// @access  Private (Student only)
export const submitAssignment = catchAsync(async (req: any, res: Response) => {
  const { lessonId } = req.body;
  const studentId = req.user?._id;

  let audioFileUrl = req.body.audioFileUrl; 

  // Check if a real-time recorded file was uploaded via Multer
  if (req.file) {
    // Generate public accessible URL for the uploaded audio file
    audioFileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  if (!audioFileUrl) {
    res.status(400);
    throw new Error('Please provide an audio recording or URL');
  }

  // Verify that the lesson exists
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Create the submission record in the database
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

// @desc    Get logged in student's submissions
// @route   GET /api/v1/submissions/my-submissions
// @access  Private (Student)
export const getMySubmissions = catchAsync(async (req: any, res: Response) => {
  // Fetch submissions only for the currently logged-in student
  const submissions = await Submission.find({ studentId: req.user?._id })
    .populate('lessonId', 'title')
    .sort({ createdAt: -1 });
    
  res.json(submissions);
});