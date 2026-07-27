import mongoose, { Document, Schema } from 'mongoose';

// TypeScript ke liye Course Interface
export interface ICourse extends Document {
  title: string;
  description: string;
  level: string; // e.g., Beginner, Tajweed, Hifz
  teacherId: mongoose.Types.ObjectId; // Kis Ustad ka course hai
  thumbnail?: string;
}

// Mongoose Schema
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    level: {
      type: String,
      required: [true, 'Course level is required'],
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Yeh hamare User model (Ustad) se link karega
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;