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
      folder: 'deeniyat_avatars', 
      allowedFormats: ['jpeg', 'png', 'jpg', 'gif'], // 👈 YAHAN CHANGE KIYA HAI (camelCase)
      public_id: `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`, 
    };
  },
});

// File validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

export default upload;