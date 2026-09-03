import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number; 
  // 👇 NAYA CODE: Har lesson ka time track karne ke liye
  lessonProgress: { lessonId: mongoose.Types.ObjectId; watchedSeconds: number }[]; 
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
    // 👇 NAYA CODE: Database schema array
    lessonProgress: [
      {
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        watchedSeconds: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);