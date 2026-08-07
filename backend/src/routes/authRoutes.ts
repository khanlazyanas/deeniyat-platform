import express from 'express';
import { registerUser, loginUser, updatePassword, updateProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware'; // Make sure this middleware exists!

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Added upload.single('avatar') middleware
router.put('/profile', protect, upload.single('avatar'), updateProfile);

router.put('/password', protect, updatePassword);

export default router;