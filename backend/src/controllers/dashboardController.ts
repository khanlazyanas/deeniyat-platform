import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Course from '../models/Course';
import Submission from '../models/Submission';

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
    
    const submissions = await Submission.find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('lessonId', 'title');
      
    // FIX: Explicitly type 'sub' as 'any' to bypass TypeScript strict checking for timestamps
    recentActivities = submissions.map((sub: any) => ({
      id: sub._id,
      title: 'Submitted Assignment',
      description: sub.lessonId ? sub.lessonId.title : 'Unknown Lesson',
      date: sub.createdAt,
      type: 'submission'
    }));

  } else {
    enrolledCourses = await Course.countDocuments();
    pendingAssignments = await Submission.countDocuments(); 
    
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('lessonId', 'title')
      .populate('studentId', 'name');
      
    // FIX: Explicitly type 'sub' as 'any'
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