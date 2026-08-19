import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { submitAssignment, gradeSubmission, getSubmissionsByLesson, getAllSubmissions, getMySubmissions } from '../controllers/submissionController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage for audio files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Save file as: audio-1623456789.webm
    cb(null, 'audio-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
// Student routes
router.post('/', protect, authorize('Student'), upload.single('audio'), submitAssignment);
router.get('/my-submissions', protect, authorize('Student'), getMySubmissions);

// Ustad/Admin routes
router.get('/all', protect, authorize('Admin', 'Ustad'), getAllSubmissions);
router.put('/:id/grade', protect, authorize('Admin', 'Ustad'), gradeSubmission);
router.get('/lesson/:lessonId', protect, authorize('Admin', 'Ustad'), getSubmissionsByLesson);

export default router;