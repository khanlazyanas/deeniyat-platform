import express from 'express';
import { createLesson, getLessonsByCourse, updateLesson, deleteLesson } from '../controllers/lessonController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Naya lesson sirf Ustad ya Admin bana sakte hain
router.post('/', protect, authorize('Admin', 'Ustad'), createLesson);

// Course ke saare lessons dekhne ke liye user ka login hona zaroori hai
router.get('/course/:courseId', protect, getLessonsByCourse);

// 👇 NEW: Update aur Delete ke routes (Sirf Admin/Ustad ke liye)
router.put('/:id', protect, authorize('Admin', 'Ustad'), updateLesson);
router.delete('/:id', protect, authorize('Admin', 'Ustad'), deleteLesson);

export default router;