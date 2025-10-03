export function notFound(req, res, next) {
  res.status(404).json({ message: 'Resource not found' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  res.status(status).json({ message });
}