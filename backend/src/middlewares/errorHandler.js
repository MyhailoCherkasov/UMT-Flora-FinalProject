const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Not found' });
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({ message });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
