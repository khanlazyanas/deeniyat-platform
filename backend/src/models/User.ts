import mongoose, { Document, Schema } from 'mongoose';

// TypeScript ke liye User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Ustad' | 'Student';
  profileImage?: string;
  avatar?: string;
  enrolledCourses: mongoose.Types.ObjectId[];
  resetPasswordToken?: string; // 👈 NEW: Token save karne ke liye
  resetPasswordExpire?: Date;  // 👈 NEW: Token ki expiry time save karne ke liye
}

// Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['Admin', 'Ustad', 'Student'],
      default: 'Student',
    },
    profileImage: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '', // Default empty string zaroori hai
    },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    // 👇 NEW: Forgot Password Fields
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true, // Yeh database mein createdAt aur updatedAt ki details apne aap save karega
  }
);

// Prevent OverwriteModelError if hot-reloading
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;