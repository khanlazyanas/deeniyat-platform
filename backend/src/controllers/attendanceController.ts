import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Course from '../models/Course';
import catchAsync from '../utils/catchAsync';

// @desc    Mark attendance for a student
// @route   POST /api/v1/attendance
// @access  Private (Ustad & Admin only)
export const markAttendance = catchAsync(async (req: Request, res: Response) => {
  const { courseId, studentId, date, status } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Pehle check karte hain ki is date par is student ki attendance pehle se toh nahi lagi
  // Date format ko match karne ke liye dhyan rakhna hoga (usually start of day)
  const existingAttendance = await Attendance.findOne({
    courseId,
    studentId,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
    }
  });

  if (existingAttendance) {
    // Agar pehle se hai toh usko update kar do
    existingAttendance.status = status;
    const updated = await existingAttendance.save();
    return res.json(updated);
  }

  // Nayi attendance create karo
  const attendance = await Attendance.create({
    courseId,
    studentId,
    date,
    status,
  });

  res.status(201).json(attendance);
});

// @desc    Get attendance for a specific course (For Ustad)
// @route   GET /api/v1/attendance/course/:courseId
// @access  Private (Ustad & Admin)
export const getAttendanceByCourse = catchAsync(async (req: Request, res: Response) => {
  const attendanceRecords = await Attendance.find({ courseId: req.params.courseId })
    .populate('studentId', 'name email profileImage')
    .sort({ date: -1 }); // Nayi date pehle dikhegi
    
  res.json(attendanceRecords);
});

// @desc    Get logged in student's own attendance
// @route   GET /api/v1/attendance/my-attendance
// @access  Private (Student only)
export const getMyAttendance = catchAsync(async (req: Request, res: Response) => {
  const attendanceRecords = await Attendance.find({ studentId: req.user?._id })
    .populate('courseId', 'title level')
    .sort({ date: -1 });
    
  res.json(attendanceRecords);
});