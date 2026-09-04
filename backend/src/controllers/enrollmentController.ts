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

// ==========================================
// Sirf Ustad ke liye (Attendance ke waqt bacchon ki list lana)
// ==========================================

// @desc    Get all students enrolled in a specific course
// @route   GET /api/v1/enrollments/course/:courseId/students
// @access  Private (Ustad/Admin)
export const getEnrolledStudents = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  // Find enrollments and populate the student details
  const enrollments = await Enrollment.find({ courseId: courseId })
    .populate('studentId', 'name email profileImage')
    .sort({ createdAt: -1 });

  // Map to return only student data
  const students = enrollments
    .map(enrollment => enrollment.studentId)
    .filter(student => student !== null); // Filter out any nulls

  res.status(200).json(students);
});

// ==========================================
// Video Playback Progress Tracker
// ==========================================

// @desc    Update video watch progress for a specific lesson
// @route   PUT /api/v1/enrollments/progress
// @access  Private
export const updateVideoProgress = catchAsync(async (req: Request, res: Response) => {
  const { courseId, lessonId, watchedSeconds } = req.body;
  const studentId = req.user?._id;

  let enrollment = await Enrollment.findOne({ studentId, courseId });

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Check if lesson progress already exists in array
  const lessonIndex = enrollment.lessonProgress.findIndex(
    (lp: any) => lp.lessonId.toString() === lessonId
  );

  if (lessonIndex > -1) {
    // Agar pehle se hai, toh sirf seconds update karo
    enrollment.lessonProgress[lessonIndex].watchedSeconds = watchedSeconds;
  } else {
    // Naya lesson dekhna shuru kiya hai toh array mein push karo
    enrollment.lessonProgress.push({ lessonId, watchedSeconds } as any);
  }

  await enrollment.save();

  res.status(200).json({ success: true, data: enrollment.lessonProgress });
});

// ==========================================
// 🚀 NAYA CODE: Save Personal Notes per Lesson
// ==========================================

// @desc    Save personal note for a specific lesson
// @route   PUT /api/v1/enrollments/save-note
// @access  Private
export const savePersonalNote = catchAsync(async (req: Request, res: Response) => {
  const { courseId, lessonId, note } = req.body;
  const studentId = req.user?._id;

  let enrollment = await Enrollment.findOne({ studentId, courseId });

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Check if lesson progress already exists in array
  const lessonIndex = enrollment.lessonProgress.findIndex(
    (lp: any) => lp.lessonId.toString() === lessonId
  );

  if (lessonIndex > -1) {
    // Agar pehle se object bana hua hai, toh sirf note update karo
    enrollment.lessonProgress[lessonIndex].personalNote = note;
  } else {
    // Agar user ne bina video dekhe direct note likh diya (bahut rare case), tab object bana lo
    enrollment.lessonProgress.push({ lessonId, watchedSeconds: 0, personalNote: note } as any);
  }

  await enrollment.save();

  res.status(200).json({ success: true, message: 'Note saved successfully!' });
});