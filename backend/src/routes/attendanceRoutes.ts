import express from 'express';
import { markAttendance, getAttendanceByCourse, getMyAttendance } from '../controllers/attendanceController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// STRICT ACCESS: Sirf Ustad aur Admin hi attendance mark kar sakte hain
router.post('/', protect, authorize('Admin', 'Ustad'), markAttendance);

// STRICT ACCESS: Sirf Ustad aur Admin course ki attendance report dekh sakte hain
router.get('/course/:courseId', protect, authorize('Admin', 'Ustad'), getAttendanceByCourse);

// Student sirf apni attendance check kar sakta hai
router.get('/my-attendance', protect, authorize('Student'), getMyAttendance);

export default router;