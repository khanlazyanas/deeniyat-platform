import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    // Ye images ko tumhare existing 'uploads' folder me save karega
    cb(null, 'uploads/'); 
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    // Unique filename generate karna taaki same naam ki images clash na karein
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB ki strict limit
  fileFilter: function (req: Request, file: Express.Multer.File, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export default upload;