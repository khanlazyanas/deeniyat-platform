import express from 'express';
import { registerUser, loginUser, updatePassword, updateProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;