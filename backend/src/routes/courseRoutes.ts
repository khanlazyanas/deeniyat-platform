import express from 'express';
import { createCourse, getCourses, getCourseById } from '../controllers/courseController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// GET /api/v1/courses (Sabhi dekh sakte hain)
// POST /api/v1/courses (Sirf Admin aur Ustad create kar sakte hain)
router.route('/')
  .get(getCourses)
  .post(protect, authorize('Admin', 'Ustad'), createCourse);

router.route('/:id')
  .get(getCourseById);

export default router;