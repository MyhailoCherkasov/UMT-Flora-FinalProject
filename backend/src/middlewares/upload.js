const path = require('path');
const multer = require('multer');
const HttpError = require('./HttpError');

const tempDir = path.join(process.cwd(), 'temp');

const storage = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    callback(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    callback(new HttpError(400, 'Only image files are allowed'));
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024
  }
});

module.exports = upload;
