import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number; 
  // 🚀 Har lesson ka time aur note track karne ke liye
  lessonProgress: { 
    lessonId: mongoose.Types.ObjectId; 
    watchedSeconds: number;
    personalNote: string; 
  }[]; 
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Database schema array
    lessonProgress: [
      {
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        watchedSeconds: { type: Number, default: 0 },
        personalNote: { type: String, default: '' }, // 🚀 NAYA: Backend mein note save karne ke liye
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);