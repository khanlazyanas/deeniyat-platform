import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Course from '../models/Course';
import Submission from '../models/Submission';
import Attendance from '../models/Attendance'; 

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
    // Teacher (Ustad) Logic
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