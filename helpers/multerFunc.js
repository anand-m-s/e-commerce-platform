const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/images/uploads")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const Multer = multer({ storage })
module.exports = {
    Multer
}