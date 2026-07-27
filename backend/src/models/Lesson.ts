import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  videoUrl?: string; // Video ka link (agar ho)
  audioUrl?: string; // Audio ka link (jaise tilawat)
  pdfUrl?: string;   // Notes ya Kitab ka link
  order: number;     // Chapter number (1, 2, 3...)
}

const lessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILesson>('Lesson', lessonSchema);