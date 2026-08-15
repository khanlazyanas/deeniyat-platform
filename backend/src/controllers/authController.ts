import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // 👈 NEW: Secure token generate karne ke liye
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { generateToken } from '../utils/generateToken';
import sendEmail from '../utils/sendEmail'; // 👈 NEW: Email send karne ka function (ise hum next banayenge)

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
    enrolledCourses: [], // New array initialize
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      enrolledCourses: user.enrolledCourses, 
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
      enrolledCourses: user.enrolledCourses || [], 
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
  const updateData: any = {};
  
  if (req.body.name) updateData.name = req.body.name;
  if (req.file) updateData.avatar = req.file.path;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar, 
    enrolledCourses: updatedUser.enrolledCourses || [], 
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

// 👇 NEW: FORGOT PASSWORD CONTROLLER
// @desc    Forgot Password - Send reset email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'There is no user with that email address.' });
  }

  // Generate random 20-character reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and save it to database
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set token expiration to 15 minutes from now
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  // Create the reset URL (Frontend URL /reset-password/:token)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const message = `
    <h1>You requested a password reset</h1>
    <p>Please click on the link below to reset your password. This link is valid for 15 minutes.</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <br/><br/>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Deeniyat Platform - Password Reset Request',
      message,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    // Agar email send hone mein error aaye, toh DB se token clear kar do
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: 'Error sending the email. Please try again later.' });
  }
});

// 👇 NEW: RESET PASSWORD CONTROLLER
// @desc    Reset Password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // 👇 FIX: 'req.params.token as string' lagaya hai yahan
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token as string).digest('hex');

  // Find user with this token and check if it hasn't expired yet
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired' });
  }

  // Hash new password and save it
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  // Clear the reset token fields as they are no longer needed
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Return new fresh token so user gets logged in automatically after reset
  res.status(200).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    enrolledCourses: user.enrolledCourses || [],
    token: generateToken(user.id),
    message: 'Password reset successful!'
  });
});