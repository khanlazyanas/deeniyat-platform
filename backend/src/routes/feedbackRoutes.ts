import express from 'express';
import { submitFeedback, getFeedbacks } from '../controllers/feedbackController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getFeedbacks); // Public route landing page ke liye
router.post('/', protect, authorize('Student'), submitFeedback); // Sirf students ke liye

export default router;