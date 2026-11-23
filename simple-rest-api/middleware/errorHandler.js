/**
 * Middleware for unmatched routes and unexpected server errors.
 */

/**
 * 404 Not Found - runs only when no earlier route handled the request.
 */
const notFoundHandler = (req, res) =>
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} was not found.`
  });

/**
 * Global error handler - must keep 4 arguments to be recognized by Express.
 * 500 Internal Server Error in JSON for anything unexpected.
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  // Body-parser errors (e.g. malformed JSON) are client errors, not server crashes.
  if (err.status === 400 || err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Bad Request'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
