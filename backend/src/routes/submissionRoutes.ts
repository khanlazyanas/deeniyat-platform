import express from 'express';
import { submitAssignment, gradeSubmission, getSubmissionsByLesson, getAllSubmissions } from '../controllers/submissionController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Student assignment submit karega
router.post('/', protect, authorize('Student'), submitAssignment);

router.get('/all', protect, authorize('Admin', 'Ustad'), getAllSubmissions);

// Ustad assignment grade karega
router.put('/:id/grade', protect, authorize('Admin', 'Ustad'), gradeSubmission);

// Ustad kisi specific lesson ke saare submissions dekh sakta hai
router.get('/lesson/:lessonId', protect, authorize('Admin', 'Ustad'), getSubmissionsByLesson);

export default router;