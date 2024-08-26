import path from 'path';
import multer from 'multer';

function fileFilter(req, file, cb) {
  const filetypes = /pem|crt|key/;
  const extname = filetypes.test(path.extname(file.originalname));
  if (extname) {
    return cb(null, true);
  } else {
    return cb(new Error('Only .pem, .crt, .key files are allowed!'), false);
  }
}

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 MB file size limit
  },
});

export default upload;
