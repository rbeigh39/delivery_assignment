const crypto = require("crypto");

const mongoose = require("mongoose");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

const Delivery = require("../models/delivery_model");
const Order = require("../models/order_model");

const requestDelivery = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  // 1. Check if the order actually exists
  const order = await Order.findById(orderId);
  if (!order) return next(new AppError("No order found with that Id", 400));

  // 2. Check if the seller belongs to the order
  if (order.seller.toString() !== req.user._id.toString())
    return next(
      new AppError("You are not authorized to perform this action", 401)
    );

  const randomOTP = `${crypto.randomInt(100000, 1000000)}`;
  const hashedOTP = crypto.createHash("sha256").update(randomOTP).digest("hex");

  // 3. Create the delivery document
  const delivery = await Delivery.create({
    order: order._id,
    pickupAddress: order.sellerAddress,
    dropAddress: order.buyerAddress,
    deliveryCode: hashedOTP,
  });

  res.status(201).json({
    status: "success",
    message: "delivery successfully requested",
    data: { delivery },
  });
});

module.exports = {
  requestDelivery,
};
