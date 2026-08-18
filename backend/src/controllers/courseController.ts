import { Request, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User'; 
import catchAsync from '../utils/catchAsync';

// @desc    Create a new course
// @route   POST /api/v1/courses
// @access  Private (Admin & Ustad only)
export const createCourse = catchAsync(async (req: Request, res: Response) => {
  // 👇 FIX: gstPercentage ko bhi yahan destructure kiya gaya hai
  const { title, description, level, thumbnail, promoVideo, price, gstPercentage } = req.body;

  const teacherId = req.user?._id;

  const course = await Course.create({
    title,
    description,
    level,
    teacherId,
    thumbnail,
    promoVideo, 
    price: price || 0, 
    gstPercentage: gstPercentage || 0, // 👈 FIX: Custom GST % Database mein save hoga
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

// @desc    Get logged in user's enrolled courses
// @route   GET /api/v1/courses/my-courses
// @access  Private
export const getMyCourses = catchAsync(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).populate({
    path: 'enrolledCourses',
    populate: { path: 'teacherId', select: 'name email profileImage' } 
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Returns array of full course objects
  res.json(user.enrolledCourses);
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private (Ustad who created it & Admin)
export const updateCourse = catchAsync(async (req: any, res: Response) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Security Check: Make sure the logged-in Ustad is the owner of this course
  if (course.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to update this course' });
  }

  // req.body contains updated fields including gstPercentage
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(course);
});

// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Private (Ustad who created it & Admin)
export const deleteCourse = catchAsync(async (req: any, res: Response) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Security Check: Make sure the logged-in Ustad is the owner
  if (course.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to delete this course' });
  }

  await course.deleteOne();
  res.json({ message: 'Course removed successfully' });
});