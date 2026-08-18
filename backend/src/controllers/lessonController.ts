import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import catchAsync from '../utils/catchAsync';

// @desc    Create a new lesson
// @route   POST /api/v1/lessons
// @access  Private (Admin & Ustad only)
export const createLesson = catchAsync(async (req: Request, res: Response) => {
  //  FIX: Added 'content' to destructuring so Study Material gets saved properly
  const { courseId, title, content, videoUrl, audioUrl, pdfUrl, order } = req.body;

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
    content, // 👈 Saved content to DB
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

// 👇 NEW: Update a lesson
// @desc    Update an existing lesson
// @route   PUT /api/v1/lessons/:id
// @access  Private (Admin & Ustad who owns the course)
export const updateLesson = catchAsync(async (req: any, res: Response) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  // Security Check: Verify if the logged-in Ustad owns the parent course
  const course = await Course.findById(lesson.courseId);
  if (course && course.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
     return res.status(403).json({ message: 'Not authorized to update this lesson' });
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(lesson);
});

// 👇 NEW: Delete a lesson
// @desc    Delete a lesson
// @route   DELETE /api/v1/lessons/:id
// @access  Private (Admin & Ustad who owns the course)
export const deleteLesson = catchAsync(async (req: any, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  // Security Check: Verify if the logged-in Ustad owns the parent course
  const course = await Course.findById(lesson.courseId);
  if (course && course.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
     return res.status(403).json({ message: 'Not authorized to delete this lesson' });
  }

  await lesson.deleteOne();
  res.json({ message: 'Lesson removed successfully' });
});