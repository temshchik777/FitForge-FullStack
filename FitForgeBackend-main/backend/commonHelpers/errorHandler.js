// Error response helper
const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ error: message });
};

const sendSuccess = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

// Not found error
const notFound = (res, resourceType, id) => {
  sendError(res, 404, `${resourceType} with id "${id}" not found`);
};

// Unauthorized error
const unauthorized = (res, message = "Unauthorized action") => {
  sendError(res, 403, message);
};

// Server error
const serverError = (res, error) => {
  sendError(res, 500, "Server error");
};

module.exports = {
  sendError,
  sendSuccess,
  notFound,
  unauthorized,
  serverError
};
