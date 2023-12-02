const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload =multer ({
  storage,
  fileFilter: function (req, file, cb) {
    // Check file type and reject if not an allowed type (e.g., image)
    if (file.mimetype.startsWith('image/webp') || file.mimetype.startsWith('image/jpeg') ||file.mimetype.startsWith('image/jpg')||file.mimetype.startsWith('image/png') ) {
      return cb(null, true);
    } else {
      console.error('Rejected file:', file.originalname, 'with mimetype:', file.mimetype);
      return cb(new Error('File Format Not Supported'), false);
    }
  },
});

module.exports = {
  upload,
};
