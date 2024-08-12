const mongoose = require("mongoose");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

const Order = require("../models/order_model");
const Product = require("../models/product_model");

const createOrder = catchAsync(async (req, res, next) => {
  const { productId, location } = req.body;

  // 1. Check if the productId and location exsit in the request body
  if (!productId || !location)
    return next(
      new AppError("missing required fields: productId, location", 400)
    );

  // 1.1 Check if the productId is valid
  if (!mongoose.Types.ObjectId.isValid(productId))
    return next(new AppError("Invalid productId", 400));

  // 2. Send error both address and coordinates are missing at the same time
  if (!location.address && !location.coordinates)
    return next(new AppError("address or coordinates required", 400));

  // 3. Get the product id and check if it exists
  const product = await Product.findById(productId);
  if (!product) return next(new AppError("No product found with that id", 400));

  // 4. Crate the order for the user
  const order = await Order.create({
    product: productId,
    seller: product.seller,
    buyer: req.user._id,
    price: product.price,
    buyerAddress: location,
    sellerAddress: product.location,
    status: "PLACED",
    transitLogs: [{ message: "Order Placed" }],
  });

  res.status(201).json({
    status: "success",
    message: "Order successfully placed",
    data: { order },
  });
});

const getMyOrders = catchAsync(async (req, res, next) => {
  console.log("request is here rn");
  const orderQuery = new APIFeatures(
    Order.find({ buyer: req.user._id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const orders = await orderQuery.query;

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

const getMyOrderRequests = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Getting all seller orders",
  });
});

const getOrder = () => {};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderRequests,
  getOrder,
};
