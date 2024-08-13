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

const getInitiatedDeliveries = catchAsync(async (req, res, next) => {
  const initiatedDeliveriesQuery = new APIFeatures(
    Delivery.find({ deliveryStatus: "INITIATED" }),
    req.query
  );

  const initiatedDeliveries = await initiatedDeliveriesQuery.query;

  res.status(200).json({
    status: "success",
    results: initiatedDeliveries.length,
    data: {
      deliveries: initiatedDeliveries,
    },
  });
});

const requestDeliveryJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError("Invalid id", 400));

  // 1. CHECK: Verify that the user has no active deliveries
  const activeDelivery = await Delivery.findOne({
    fulfilmentPartner: req.user._id,
    active: true,
  });

  if (activeDelivery)
    return next(
      new AppError(
        "You already have an active delivery. Please fulfil the delivery before requesting another delivery",
        400
      )
    );

  // 2. CHECK: Verify that the delivery exists
  const deliveryDoc = await Delivery.findById(id);
  if (!deliveryDoc)
    return next(new AppError("No delivery found with that id", 400));

  // 3. CHECK: Verify that the delivery hasn't been already assigned fulfilment partner
  if (deliveryDoc.fulfilmentPartner)
    return next(
      new AppError(
        "The delivery has already been assigned a fulfilment partner",
        400
      )
    );

  // 4. Assign the user as the fulfilment partner for the delivery
  deliveryDoc.fulfilmentPartner = req.user._id;
  await deliveryDoc.save();

  res.status(200).json({
    status: "success",
    data: {
      delivery: deliveryDoc,
    },
  });
});

module.exports = {
  requestDelivery,
  getInitiatedDeliveries,
  requestDeliveryJob,
};
