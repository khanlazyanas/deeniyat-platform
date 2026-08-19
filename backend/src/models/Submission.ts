import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId; // 👈 NEW: Frontend se aa raha hai
  lessonId: mongoose.Types.ObjectId;
  content?: string;     // 👈 NEW: Text assignment ke liye
  audioFileUrl?: string; // Audio ab optional kar diya hai
  grade?: string;       // Ustad ka diya hua grade (A, B, C...)
  feedback?: string;    // Ustad ka comment
  status: 'Pending' | 'Graded';
}

const submissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true }, // 👈 NEW
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    content: { type: String, default: '' },      // 👈 NEW
    audioFileUrl: { type: String, default: '' },
    grade: { type: String, default: '' },
    feedback: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Graded'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);