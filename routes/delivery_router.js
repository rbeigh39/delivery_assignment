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

router
  .route("/initiated")
  .get(
    authController.protect,
    authController.restrictTo("DELIVERY"),
    deliveryController.getInitiatedDeliveries
  );

router
  .route("/:id/requestJob")
  .post(
    authController.protect,
    authController.restrictTo("DELIVERY"),
    deliveryController.requestDeliveryJob
  );

module.exports = router;
