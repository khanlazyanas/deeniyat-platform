import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { generateToken } from '../utils/generateToken';

// @desc    Register new user
// @route   POST /api/v1/auth/register
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'Student',
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar, 
      token: generateToken(user.id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Update user profile (Name and Avatar)
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = catchAsync(async (req: any, res: Response) => {
  
  // 🚨 EXTREME DEBUGGING BLOCK: Agar file Render par fail hui, toh sachai bahar aayegi
  if (!req.file) {
    return res.status(400).json({
      message: "BACKEND BLOCK: File Cloudinary tak nahi pahuchi. Render par Cloudinary variables missing hain!",
      DEBUG_INFO: {
        cloudinaryKeysExist: {
          cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: !!process.env.CLOUDINARY_API_KEY,
          apiSecret: !!process.env.CLOUDINARY_API_SECRET
        }
      }
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update name if provided
  user.name = req.body.name || user.name;

  // Cloudinary se jo link aayi, usko DB mein save karo
  user.avatar = req.file.path; 

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar, 
    CLOUDINARY_NEW_LINK: req.file ? req.file.path : "File gayab hai"
  });
});

// @desc    Update user password
// @route   PUT /api/v1/auth/password
// @access  Private
export const updatePassword = catchAsync(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);

  if (isMatch) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    
    await user.save(); 
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});