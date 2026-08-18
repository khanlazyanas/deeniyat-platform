import mongoose, { Document, Schema } from 'mongoose';

// TypeScript ke liye Course Interface
export interface ICourse extends Document {
  title: string;
  description: string;
  level: string; // e.g., Beginner, Tajweed, Hifz
  teacherId: mongoose.Types.ObjectId; // Kis Ustad ka course hai
  thumbnail?: string;
  promoVideo?: string; 
  price: number; 
  gstPercentage: number; // 👈 NEW: Custom GST Percentage field add kiya
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
    promoVideo: {
      type: String,
      default: '', 
    },
    price: {
      type: Number,
      default: 0, 
    },
    gstPercentage: { // 👈 NEW: Database mein GST % save hoga
      type: Number,
      default: 0, // Default 0% GST (Free courses ya bina GST wale courses ke liye)
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Fix: Prevents OverwriteModelError in Next.js/Express
export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);