import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import catchAsync from '../utils/catchAsync';

// @desc    Create a new lesson
// @route   POST /api/v1/lessons
// @access  Private (Admin & Ustad only)
export const createLesson = catchAsync(async (req: Request, res: Response) => {
  const { courseId, title, videoUrl, audioUrl, pdfUrl, order } = req.body;

  // Pehle check karte hain ki course exist karta bhi hai ya nahi
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Naya lesson create karein
  const lesson = await Lesson.create({
    courseId,
    title,
    videoUrl,
    audioUrl,
    pdfUrl,
    order,
  });

  res.status(201).json(lesson);
});

// @desc    Get all lessons for a specific course
// @route   GET /api/v1/lessons/course/:courseId
// @access  Private (Logged in users only)
export const getLessonsByCourse = catchAsync(async (req: Request, res: Response) => {
  // .sort({ order: 1 }) se chapters line-wise (1, 2, 3...) aayenge
  const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ order: 1 });
  res.json(lessons);
});