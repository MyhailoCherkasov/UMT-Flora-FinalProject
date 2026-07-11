const feedbacksService = require('../services/feedbacks.service');

const listFeedbacks = async (req, res, next) => {
  try {
    const result = await feedbacksService.listFeedbacks();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createFeedback = async (req, res, next) => {
  try {
    const result = await feedbacksService.createFeedback(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listFeedbacks,
  createFeedback
};
