import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'Late';
}

const attendanceSchema = new Schema<IAttendance>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);