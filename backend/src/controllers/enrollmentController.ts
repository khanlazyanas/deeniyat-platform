import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import catchAsync from '../utils/catchAsync';

// @desc    Enroll a student in a course
// @route   POST /api/v1/enrollments
// @access  Private (Student only)
export const enrollStudent = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const studentId = req.user?._id;

  // Check agar course sach mein exist karta hai
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check agar student pehle se enrolled hai
  const alreadyEnrolled = await Enrollment.findOne({ studentId, courseId });
  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('You are already enrolled in this course');
  }

  // Naya enrollment create karein
  const enrollment = await Enrollment.create({
    studentId,
    courseId,
    progress: 0,
  });

  res.status(201).json(enrollment);
});

// @desc    Get logged in student's enrolled courses
// @route   GET /api/v1/enrollments/my-courses
// @access  Private (Logged in users)
export const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  // Populate se humein course ki details aur uske teacher ki thodi details mil jayengi
  const enrollments = await Enrollment.find({ studentId: req.user?._id })
    .populate({
      path: 'courseId',
      select: 'title description level thumbnail',
      populate: { path: 'teacherId', select: 'name' }
    });

  res.json(enrollments);
});