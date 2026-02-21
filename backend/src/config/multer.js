import multer from 'multer';
import path from 'path';

// Use memoryStorage — files stay in RAM as buffer, no disk writes
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB raw limit (we compress heavily)
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, or WebP allowed.'));
    }
  },
});

export default upload;