import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  audioFileUrl: string; // Student ki record ki hui awaaz
  grade?: string;       // Ustad ka diya hua grade (A, B, C...)
  feedback?: string;    // Ustad ka comment
  status: 'Pending' | 'Graded';
}

const submissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    audioFileUrl: { type: String, required: true },
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