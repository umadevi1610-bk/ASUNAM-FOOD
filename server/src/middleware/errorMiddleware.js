// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
  console.error("Server Error ❌");
  console.error(err);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};

module.exports = errorMiddleware;