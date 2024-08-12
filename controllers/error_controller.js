const AppError = require("./../utils/appError");

/* MONGOOSE VALIDATION ERROR HANDLING HELPER FUNCTIONS */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((cur) => cur.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Token expired. Please log in again!", 401);

/* .................................................... */

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered Website
  console.error("ERROR ***** ", err);

  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A. For API
  if (req.originalUrl.startsWith("/api")) {
    // A. Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error("ERROR ***** ", err);

    // 2) Send generic message to the client
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  // B. For Rendered Website
  // A. Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      message: err.message,
    });
  }

  // B. Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error("ERROR ***** ", err);

  // 2) Send generic message to the client
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    message: "Please try again later.",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

module.exports = globalErrorHandler;
