const express = require("express");

const authController = require("../controllers/auth_controller");
const orderController = require("../controllers/order_controller");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("BUYER"),
    orderController.createOrder
  );
router.route("/:id").get(authController.protect, orderController.getOrder);

module.exports = router;
