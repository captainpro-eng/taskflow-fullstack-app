function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Malformed JSON payload in request body.'
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
    ...(isDev && err.stack ? { stack: err.stack } : {})
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
