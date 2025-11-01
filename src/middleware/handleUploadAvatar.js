import multer from "multer";
import path from "path";
import fs from "fs";

// đảm bảo folder tồn tại
const uploadDir = "uploads/user/avatars";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});


const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only images allowed"), false);
  }
  cb(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter
});
