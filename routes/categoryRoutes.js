const express = require('express');
const categoryController = require('./../controllers/categoryController')
const authController = require('./../controllers/authController');

const router = express.Router();

router
.route('/')
.get(categoryController.getAllCategorys)

router
  .route('/:id')
  .get(categoryController.getCategory)
  .delete(
    authController.protect,
    categoryController.deleteCategory
  );
  
// router.use(
//   authController.protect,
//   authController.restrictTo('admin'),
//   );

//   router.post('/upload', categoryController.uploadCategoryPhoto, (req, res) => {
//     // Check if the file is uploaded successfully
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
  
//     // Retrieve the uploaded image URL from Cloudinary
//     const imageUrl = req.file.path; // This will be the Cloudinary URL
  
//     // Example: You can save the URL in the database or send it back to the client
//     res.status(200).json({
//       status: 'success',
//       message: 'Category photo uploaded successfully',
//       imageUrl: imageUrl, // Cloudinary image URL
//     });
//   });
  
router
  .route('/addCategory')
  .post(
    categoryController.resizeCategoryImage,
    categoryController.uploadCategoryPhoto,
    categoryController.createCategory
  );

module.exports = router;