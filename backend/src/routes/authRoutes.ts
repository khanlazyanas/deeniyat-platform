import express from 'express';
import { registerUser, loginUser, updatePassword, updateProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware'; // YEH IMPORT KARNA ZAROORI HAI

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/profile', protect, upload.single('avatar'), updateProfile);

router.put('/password', protect, updatePassword);

export default router;