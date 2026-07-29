import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId; // Kisne pay kiya
  courseId?: mongoose.Types.ObjectId; // Kis course ke liye pay kiya
  amount: number;
  currency: string;
  type: 'Course_Fee' | 'Donation' | 'Subscription';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId: string; // Stripe ya Razorpay ka ID
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: {
      type: String,
      enum: ['Course_Fee', 'Donation', 'Subscription'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transactionId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);