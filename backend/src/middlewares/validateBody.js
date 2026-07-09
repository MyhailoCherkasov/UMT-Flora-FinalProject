const HttpError = require('./HttpError');

const validateBody = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const details = error.details.map(item => item.message).join('; ');
    next(new HttpError(400, details));
    return;
  }

  req.body = value;
  next();
};

module.exports = validateBody;
