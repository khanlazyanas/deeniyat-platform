import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  content?: string;     
  audioFileUrl?: string; 
  documentUrl?: string;  
  grade?: string;       
  feedback?: string;    
  status: 'Pending' | 'Graded';
}

const submissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true }, 
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    content: { type: String, default: '' },      
    audioFileUrl: { type: String, default: '' },
    documentUrl: { type: String, default: '' },  // 👈 NEW
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