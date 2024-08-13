const express = require("express");

const authController = require("../controllers/auth_controller");
const deliveryController = require("../controllers/deliveryController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("SELLER"),
    deliveryController.requestDelivery
  );

module.exports = router;
