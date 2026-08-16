import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Course from '../models/Course';
import Submission from '../models/Submission';
import Attendance from '../models/Attendance';
import User from '../models/User';

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
    // 🛑 STUDENT LOGIC FIX: Student ko sirf wahi courses dikhne chahiye jisme wo enroll hai
    const studentInfo = await User.findById(userId);
    enrolledCourses = studentInfo?.enrolledCourses?.length || 0; 

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
    // 🛑 TEACHER (USTAD) LOGIC FIX: Sirf apne courses ka data dikhega!
    
    // 1. Sabse pehle is Ustad ke banaye hue saare courses nikal lo
    const myCourses = await Course.find({ teacherId: userId }).select('_id');
    const myCourseIds = myCourses.map(course => course._id);

    enrolledCourses = myCourseIds.length;
    
    // 2. Sirf unhi submissions ko count karo jo is Ustad ke courses ki hain
    // Note: Iske liye tumhare Submission model mein 'courseId' hona zaroori hai.
    pendingAssignments = await Submission.countDocuments({ courseId: { $in: myCourseIds } }); 
    
    // 3. Attendance bhi sirf iske courses ki calculate hogi
    const totalSystemAttendance = await Attendance.countDocuments({ courseId: { $in: myCourseIds } });
    const totalSystemPresent = await Attendance.countDocuments({ courseId: { $in: myCourseIds }, status: 'Present' });
    
    if (totalSystemAttendance > 0) {
      attendanceRate = Math.round((totalSystemPresent / totalSystemAttendance) * 100);
    }
    
    // 4. Latest Submissions sirf iske apne students ki aayengi
    const submissions = await Submission.find({ courseId: { $in: myCourseIds } })
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
export const getUstadStats = catchAsync(async (req: any, res: Response) => {
  const userId = req.user._id;

  // Security check: Sirf Ustad access kar paye
  if (req.user.role !== 'Ustad') {
    return res.status(403).json({ message: 'Access denied. You are not an Ustad.' });
  }

  // 1. Ustad ne kitne active courses banaye hain
  const activeCourses = await Course.countDocuments({ teacherId: userId });

  // 2. Is Ustad ke courses ki list nikal rahe hain filter karne ke liye
  const myCourses = await Course.find({ teacherId: userId }).select('_id');
  const myCourseIds = myCourses.map(course => course._id);

  // 3. Sirf wo Students gino jinke 'enrolledCourses' array mein is Ustad ka course hai!
  const totalStudents = await User.countDocuments({ 
    role: 'Student',
    enrolledCourses: { $in: myCourseIds } 
  });

  // 4. Pending Submissions sirf inke apne courses ke liye
  const pendingSubmissions = await Submission.countDocuments({
    courseId: { $in: myCourseIds }
  });

  res.status(200).json({
    totalStudents,
    activeCourses,
    pendingSubmissions
  });
});