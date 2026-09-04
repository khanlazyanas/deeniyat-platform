import express from 'express';
import { 
  enrollStudent, 
  getMyEnrollments, 
  getEnrolledStudents,
  updateVideoProgress,
  savePersonalNote, // 🚀 Naya function import kiya
  getMyNotes
} from '../controllers/enrollmentController'; 
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Sirf Student naye course mein enroll kar sakta hai
router.post('/', protect, authorize('Student'), enrollStudent);

// Student apne courses dekh sakta hai
router.get('/my-courses', protect, getMyEnrollments);

// STRICT ACCESS: Sirf Ustad aur Admin hi course ke students fetch kar sakte hain
router.get('/course/:courseId/students', protect, authorize('Admin', 'Ustad'), getEnrolledStudents);

// Video progress save karne ke liye
router.put('/progress', protect, updateVideoProgress);

// Personal notes save karne ke liye
router.put('/save-note', protect, savePersonalNote);

router.get('/my-notes', protect, getMyNotes);

export default router;