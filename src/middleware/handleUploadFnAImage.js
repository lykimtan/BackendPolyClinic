import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/fnA');

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

export const handleUploadFnAImage = upload.single('fnAImage');

// Middleware xử lý lỗi upload
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Kích thước ảnh không được vượt quá 5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được upload một ảnh',
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Có lỗi xảy ra khi upload ảnh',
    });
  }

  next();
};

// Hàm xóa ảnh
export const deleteImage = (imagePath) => {
  if (imagePath) {
    try {
      const fullPath = path.join(__dirname, '../../uploads/fnA', path.basename(imagePath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

// Hàm lấy URL ảnh
export const getImageUrl = (filename) => {
  if (filename) {
    return `/uploads/fnA/${filename}`;
  }
  return '';
};
