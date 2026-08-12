import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Course from '../models/Course';
import Submission from '../models/Submission';
import Attendance from '../models/Attendance';
import User from '../models/User'; // 👈 Naya import total students count karne ke liye

// @desc    Get stats for the dashboard
// @route   GET /api/v1/dashboard/stats
// @access  Private (Logged in users)
export const getDashboardStats = catchAsync(async (req: any, res: Response) => {
  const userId = req.user._id;
  const userRole = req.user.role; 

  let enrolledCourses = 0;
  let pendingAssignments = 0;
  let attendanceRate = 0; 
  let recentActivities: any[] = [];

  if (userRole === 'Student') {
    enrolledCourses = await Course.countDocuments(); 
    pendingAssignments = await Submission.countDocuments({ studentId: userId }); 
    
    // ✅ REAL ATTENDANCE CALCULATION FOR STUDENT
    const totalAttendanceDays = await Attendance.countDocuments({ studentId: userId });
    const presentDays = await Attendance.countDocuments({ studentId: userId, status: 'Present' });
    
    if (totalAttendanceDays > 0) {
      attendanceRate = Math.round((presentDays / totalAttendanceDays) * 100);
    }

    // Fetch real latest 3 submissions for this student
    const submissions = await Submission.find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('lessonId', 'title');
      
    recentActivities = submissions.map((sub: any) => ({
      id: sub._id,
      title: 'Submitted Assignment',
      description: sub.lessonId ? sub.lessonId.title : 'Unknown Lesson',
      date: sub.createdAt,
      type: 'submission'
    }));

  } else {
    // Teacher (Ustad) Logic (Purana wala, agar kahin use ho raha ho)
    enrolledCourses = await Course.countDocuments();
    pendingAssignments = await Submission.countDocuments(); 
    
    // ✅ REAL OVERALL ATTENDANCE CALCULATION FOR USTAD
    const totalSystemAttendance = await Attendance.countDocuments();
    const totalSystemPresent = await Attendance.countDocuments({ status: 'Present' });
    
    if (totalSystemAttendance > 0) {
      attendanceRate = Math.round((totalSystemPresent / totalSystemAttendance) * 100);
    }
    
    // Fetch latest 3 submissions from ANY student
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('lessonId', 'title')
      .populate('studentId', 'name');
      
    recentActivities = submissions.map((sub: any) => ({
      id: sub._id,
      title: `Submission from ${sub.studentId?.name || 'Student'}`,
      description: sub.lessonId ? sub.lessonId.title : 'Unknown Lesson',
      date: sub.createdAt,
      type: 'submission'
    }));
  }

  res.status(200).json({
    enrolledCourses,
    pendingAssignments,
    attendanceRate,
    recentActivities
  });
});

// @desc    Get specific stats for Ustad Dashboard
// @route   GET /api/v1/dashboard/ustad-stats
// @access  Private (Ustad only)
// 👇 Yeh NAYA FUNCTION add kiya hai front-end ke liye
export const getUstadStats = catchAsync(async (req: any, res: Response) => {
  const userId = req.user._id;

  // Security check: Sirf Ustad access kar paye
  if (req.user.role !== 'Ustad') {
    return res.status(403).json({ message: 'Access denied. You are not an Ustad.' });
  }

  // 1. Ustad ne kitne active courses banaye hain
  const activeCourses = await Course.countDocuments({ teacherId: userId });

  // 2. Pending Submissions check karne ke liye (Abhi overall count rakha hai)
  const pendingSubmissions = await Submission.countDocuments();

  // 3. Platform par total kitne Students hain
  const totalStudents = await User.countDocuments({ role: 'Student' });

  res.status(200).json({
    totalStudents,
    activeCourses,
    pendingSubmissions
  });
});