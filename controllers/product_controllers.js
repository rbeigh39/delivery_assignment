const Product = require("../models/product_model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handlerFactory");

// const getAllProducts = Factory.getAll(Product);
const getProductById = Factory.updateOne(Product);
const updateProduct = Factory.updateOne(Product);
const deleteProduct = Factory.deleteOne(Product);

const getAllProducts = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.user && req.user.role === "SELLER") {
    filter.seller = req.user._id;
  }

  const products = await Product.find(filter);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      data: products,
    },
  });
});

// MIDDLEWARES
const checkProductOwner = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!product)
    return next(
      new AppError(
        `product either doesn't exist or doesn't belong to the user`,
        400
      )
    );
  next();
});

const setSellerId = catchAsync(async (req, res, next) => {
  req.body.seller = req.user._id;
  next();
});

const createProduct = catchAsync(async (req, res, next) => {
  try {
    if (!req.file || !req.file.filename) {
      return next(
        new AppError("Missing image. Please add image and try again.", 400)
      );
    }

    req.body.imageUrl = req.file.path;
    req.body.location = JSON.parse(JSON.stringify(req.body.location));
    req.body._id = undefined;

    const product = await Product.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    if (req.deleteFile) req.deleteFile();
    throw error;
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  checkProductOwner,
  setSellerId,
};
