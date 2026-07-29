import express from 'express';
import { enrollStudent, getMyEnrollments, getEnrolledStudents } from '../controllers/enrollmentController'; // Naya function import kiya
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Sirf Student naye course mein enroll kar sakta hai
router.post('/', protect, authorize('Student'), enrollStudent);

// Student apne courses dekh sakta hai
router.get('/my-courses', protect, getMyEnrollments);

// NAYA ROUTE: Ustad ke liye course ke students fetch karna
router.get('/course/:courseId/students', protect, authorize('Admin', 'Ustad'), getEnrolledStudents);

export default router;