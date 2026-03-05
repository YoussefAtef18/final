const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const Category = require('./../models/categoryModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.setUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }  
};

exports.resizeCategoryImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next(); // Skip if no file is uploaded
  try {
    // Resize the image using sharp and await the result
    const buffer = await sharp(req.file.buffer)
      .resize(500, 500) // Resize the image to 500x500 pixels
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();
    // Replace the req.file.buffer with the resized image buffer
    req.file.buffer = buffer;
    // Continue to the next middleware (Cloudinary upload)
    next();
  } catch (err) {
    return next(new Error('Error resizing image.'));
  }
});
  
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const uniqueFileName = `category/${Date.now()}-${req.body.name}`;
    return {
      folder: 'categories',
      public_id: uniqueFileName, // Set a unique public_id
      resource_type: 'image', // Or 'auto'
      eager_async: true,
    };
  }
});

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});

// Export the upload middleware
// exports.resizeCategoryImage;
exports.uploadCategoryPhoto = upload.single('image');
exports.getAllCategorys = factory.getAll(Category);
exports.getCategory = factory.getOne(Category);
exports.createCategory = factory.createOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);