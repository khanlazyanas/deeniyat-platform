import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// 🚨 FIX 1: Ensure env variables are loaded before Cloudinary configures
dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'deeniyat_avatars', 
      
      // 🚨 FIX 2: Cloudinary STRICTLY needs snake_case 'allowed_formats'
      allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'], 
      
      public_id: `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`, 
    } as any; // 👈 'as any' lagaya hai taaki VS Code TypeScript error na de
  },
});

// File validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

export default upload;