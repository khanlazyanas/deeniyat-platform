import express from 'express';
import { enrollStudent, getMyEnrollments } from '../controllers/enrollmentController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Sirf Student naye course mein enroll kar sakta hai
router.post('/', protect, authorize('Student'), enrollStudent);

// Student apne courses dekh sakta hai
router.get('/my-courses', protect, getMyEnrollments);

export default router;