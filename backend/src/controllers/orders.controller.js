const createOrder = (req, res) => {
  res.status(201).json({
    id: Date.now(),
    message: 'Order request accepted',
    order: req.body
  });
};

const createSubscription = (req, res) => {
  res.status(201).json({
    id: Date.now(),
    message: 'Subscription accepted',
    subscription: {
      email: req.body.email
    }
  });
};

module.exports = {
  createOrder,
  createSubscription
};
