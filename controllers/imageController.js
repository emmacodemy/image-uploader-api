const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const { v4: uuidv4 } = require('uuid');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = async (req, res, next) => {
  try {
    if (!req.file)
      return next(new AppError('no image was sent with this request', 400));

    req.file.filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/${req.file.filename}`);

    res.status(200).json({
      status: 'sucess',
      data: {
        image: `/img/${req.file.filename}`,
      },
    });
  } catch (error) {
    next(error);
  }
};
