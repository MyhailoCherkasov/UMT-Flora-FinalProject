const express = require('express');
const validateBody = require('../middlewares/validateBody');
const { orderSchema, subscriptionSchema } = require('../schemas/order.schema');
const { createOrder, createSubscription } = require('../controllers/orders.controller');

const router = express.Router();

router.post('/orders', validateBody(orderSchema), createOrder);
router.post('/subscriptions', validateBody(subscriptionSchema), createSubscription);

module.exports = router;
