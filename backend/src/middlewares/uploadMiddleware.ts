import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

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
      folder: 'deeniyat_avatars', // Cloudinary mein is naam se folder ban jayega
      allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
      public_id: `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`, // Unique name
    };
  },
});

// File validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

export default upload;