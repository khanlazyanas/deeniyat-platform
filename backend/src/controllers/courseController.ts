import { Request, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User'; // 👈 NEW: User import zaroori hai my courses nikalne ke liye
import catchAsync from '../utils/catchAsync';

// @desc    Create a new course
// @route   POST /api/v1/courses
// @access  Private (Admin & Ustad only)
export const createCourse = catchAsync(async (req: Request, res: Response) => {
  const { title, description, level, thumbnail } = req.body;

  const teacherId = req.user?._id;

  const course = await Course.create({
    title,
    description,
    level,
    teacherId,
    thumbnail,
  });

  res.status(201).json(course);
});

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
export const getCourses = catchAsync(async (req: Request, res: Response) => {
  const courses = await Course.find({}).populate('teacherId', 'name email profileImage');
  res.json(courses);
});

// @desc    Get a single course by ID
// @route   GET /api/v1/courses/:id
// @access  Public
export const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id).populate('teacherId', 'name email');

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// 👇 NEW API FUNCTION: Yeh tumhare "My Learning Journey" page ke liye courses layega!
// @desc    Get logged in user's enrolled courses
// @route   GET /api/v1/courses/my-courses
// @access  Private
export const getMyCourses = catchAsync(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).populate({
    path: 'enrolledCourses',
    populate: { path: 'teacherId', select: 'name email profileImage' } // Saath mein teacher details bhi
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Returns array of full course objects
  res.json(user.enrolledCourses);
});