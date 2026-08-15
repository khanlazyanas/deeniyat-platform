import express from 'express';
import { 
  registerUser, 
  loginUser, 
  updatePassword, 
  updateProfile,
  forgotPassword, // 👈 NEW
  resetPassword   // 👈 NEW
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware'; 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/password', protect, updatePassword);

// 👇 NEW: Forgot and Reset Password Routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword); // 👈 PUT request for updating password via token

export default router;