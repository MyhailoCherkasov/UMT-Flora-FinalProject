const { Feedback } = require('../models');

const serializeFeedback = item => ({
  id: item.id,
  author: item.author,
  text: item.text,
  rating: item.rating,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const listFeedbacks = async () => {
  const rows = await Feedback.findAll({ order: [['id', 'ASC']] });
  return {
    items: rows.map(serializeFeedback),
    total: rows.length
  };
};

const createFeedback = async payload => {
  const feedback = await Feedback.create(payload);
  return serializeFeedback(feedback);
};

module.exports = {
  listFeedbacks,
  createFeedback
};
