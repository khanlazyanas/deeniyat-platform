import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId; // Kisne pay kiya
  amount: number;
  type: 'Fee' | 'Donation';
  status: 'Pending' | 'Completed' | 'Failed';
  transactionId?: string; // Stripe ya Razorpay ka ID
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['Fee', 'Donation'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    transactionId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);