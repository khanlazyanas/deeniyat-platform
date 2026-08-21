import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Lesson from '../models/Lesson';
import Course from '../models/Course'; // 
import catchAsync from '../utils/catchAsync';

// @desc    Submit assignment (Text, Audio, or Document)
// @route   POST /api/v1/submissions
// @access  Private (Student only)
export const submitAssignment = catchAsync(async (req: any, res: Response) => {
  const { lessonId, courseId, content } = req.body; 
  const studentId = req.user?._id;

  let audioFileUrl = req.body.audioFileUrl || ''; 
  let documentUrl = req.body.documentUrl || ''; 

  // Check for files array when using upload.fields
  if (req.files) {
    // Process Audio File if it exists
    if (req.files['audio'] && req.files['audio'].length > 0) {
      audioFileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files['audio'][0].filename}`;
    }
    // Process Document File if it exists
    if (req.files['document'] && req.files['document'].length > 0) {
      documentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files['document'][0].filename}`;
    }
  }

  // Validation: Kam se kam Text(content), Audio, ya Document hona zaroori hai
  if (!audioFileUrl && !content && !documentUrl) {
    res.status(400);
    throw new Error('Please provide text, an audio recording, or upload a document');
  }

  // Verify that the lesson exists
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Create the submission record in the database
  const submission = await Submission.create({
    studentId,
    courseId, 
    lessonId,
    content,  
    audioFileUrl,
    documentUrl,
    status: 'Pending',
  });

  res.status(201).json(submission);
});

// @desc    Grade a student's submission
// @route   PUT /api/v1/submissions/:id/grade
// @access  Private (Ustad & Admin only)
export const gradeSubmission = catchAsync(async (req: Request, res: Response) => {
  const { grade, feedback } = req.body;

  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Update grading details
  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = 'Graded';

  const updatedSubmission = await submission.save();

  res.json(updatedSubmission);
});

// @desc    Get all submissions for a specific lesson (For Ustad)
// @route   GET /api/v1/submissions/lesson/:lessonId
// @access  Private (Ustad & Admin)
export const getSubmissionsByLesson = catchAsync(async (req: Request, res: Response) => {
  const submissions = await Submission.find({ lessonId: req.params.lessonId })
    .populate('studentId', 'name email profileImage');
    
  res.json(submissions);
});

// @desc    Get ALL submissions across all lessons (Filtered by Ustad)
// @route   GET /api/v1/submissions/all
// @access  Private (Ustad & Admin)
export const getAllSubmissions = catchAsync(async (req: any, res: Response) => {
  let filter = {};

  // 👇 MAIN LOGIC: Agar Ustad hai, toh sirf uske courses ke submissions filter karo
  if (req.user?.role === 'Ustad') {
    // 1. Ustad ke saare courses find karo
    const myCourses = await Course.find({ teacherId: req.user._id }).select('_id');
    const myCourseIds = myCourses.map(course => course._id);
    
    // 2. Filter me courseId set kar do
    filter = { courseId: { $in: myCourseIds } };
  }

  const submissions = await Submission.find(filter)
    .populate('studentId', 'name email profileImage')
    .populate('lessonId', 'title')
    .populate('courseId', 'title') // 👈 NEW: Frontend ko course ka naam bhejne ke liye 
    .sort({ createdAt: -1 });
    
  res.json(submissions);
});

// @desc    Get logged in student's submissions
// @route   GET /api/v1/submissions/my-submissions
// @access  Private (Student)
export const getMySubmissions = catchAsync(async (req: any, res: Response) => {
  // Fetch submissions only for the currently logged-in student
  const submissions = await Submission.find({ studentId: req.user?._id })
    .populate('lessonId', 'title')
    .populate('courseId', 'title') // 👈 NEW: Frontend ko course ka naam bhejne ke liye
    .sort({ createdAt: -1 });
    
  res.json(submissions);
});