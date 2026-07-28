import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Course from '../models/Course';
import Submission from '../models/Submission'; // Ensure you have this model imported

// @desc    Get stats for the dashboard
// @route   GET /api/v1/dashboard/stats
// @access  Private (Logged in users)
export const getDashboardStats = catchAsync(async (req: any, res: Response) => {
  const userId = req.user._id;
  const userRole = req.user.role; 

  let enrolledCourses = 0;
  let pendingAssignments = 0;
  let attendanceRate = 95; // Abhi ke liye 95% fix rakhte hain, baad mein iska logic add karenge

  if (userRole === 'Student') {
    // Student ke liye: Total courses aur uske apne pending assignments check karo
    enrolledCourses = await Course.countDocuments(); 
    pendingAssignments = await Submission.countDocuments({ studentId: userId }); 
  } else {
    // Ustad (Teacher) ke liye: Total courses aur check karne wale sabhi assignments
    enrolledCourses = await Course.countDocuments();
    pendingAssignments = await Submission.countDocuments(); 
  }

  res.status(200).json({
    enrolledCourses,
    pendingAssignments,
    attendanceRate
  });
});