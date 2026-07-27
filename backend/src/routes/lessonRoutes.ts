import express from 'express';
import { createLesson, getLessonsByCourse } from '../controllers/lessonController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Naya lesson sirf Ustad ya Admin bana sakte hain
router.post('/', protect, authorize('Admin', 'Ustad'), createLesson);

// Course ke saare lessons dekhne ke liye user ka login hona zaroori hai
router.get('/course/:courseId', protect, getLessonsByCourse);

export default router;