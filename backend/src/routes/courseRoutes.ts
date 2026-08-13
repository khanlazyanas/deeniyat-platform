import express from 'express';
// 👇 NEW: getMyCourses ko import kiya
import { createCourse, getCourses, getCourseById, getMyCourses, updateCourse, deleteCourse } from '../controllers/courseController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// GET /api/v1/courses (Sabhi dekh sakte hain)
// POST /api/v1/courses (Sirf Admin aur Ustad create kar sakte hain)
router.route('/')
  .get(getCourses)
  .post(protect, authorize('Admin', 'Ustad'), createCourse);

// 👇 THE FIX: Isey /:id se UPAR rakhna zaroori hai!
// GET /api/v1/courses/my-courses (Logged in user ke kharide hue courses)
router.route('/my-courses')
  .get(protect, getMyCourses);

// GET, PUT, DELETE /api/v1/courses/:id
router.route('/:id')
  .get(getCourseById)
  // 👇 NEW: Edit aur Delete routes add kar diye with security
  .put(protect, authorize('Admin', 'Ustad'), updateCourse)
  .delete(protect, authorize('Admin', 'Ustad'), deleteCourse);
export default router;