const express = require("express");
const productController = require("../controllers/product_controllers");
const authController = require("../controllers/auth_controller");

const {
  upload,
  fileUtilConfig,
} = require("../controllers/middlewares/image_upload");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("SELLER"),
    upload.single("image"),
    fileUtilConfig,
    productController.setSellerId,
    productController.createProduct
  )
  .get(productController.getAllProducts);

router
  .route("/:id")
  .get(productController.getProductById)
  .patch(
    authController.protect,
    productController.checkProductOwner,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    productController.checkProductOwner,
    productController.deleteProduct
  );

module.exports = router;
