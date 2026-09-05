import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  studentId: mongoose.Types.ObjectId;
  rating: number;
  review: string;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);