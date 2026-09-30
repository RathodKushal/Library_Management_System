/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // Database constraint errors
  if (err.message?.includes('UNIQUE constraint failed')) {
    const field = err.message.split('.').pop();
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.'
    });
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`
  });
}
