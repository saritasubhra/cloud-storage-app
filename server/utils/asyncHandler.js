// Wraps an async route handler so any thrown/rejected error is
// forwarded to Express's error handler via next(), instead of
// needing a try/catch in every controller function.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
