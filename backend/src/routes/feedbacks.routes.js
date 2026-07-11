const express = require('express');
const controller = require('../controllers/feedbacks.controller');
const validateBody = require('../middlewares/validateBody');
const { feedbackCreateSchema } = require('../schemas/feedback.schema');

const router = express.Router();

router.get('/', controller.listFeedbacks);
router.post('/', validateBody(feedbackCreateSchema), controller.createFeedback);

module.exports = router;
