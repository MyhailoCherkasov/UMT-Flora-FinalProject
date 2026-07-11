const { Bouquet, Feedback } = require('../models');
const seedBouquets = require('../data/seedBouquets');
const seedFeedbacks = require('../data/seedFeedbacks');


const bouquetKey = item => [
  String(item.title || item.name || '').trim().toLowerCase(),
  String(item.image || item.photoUrl || '').trim().toLowerCase(),
  String(item.price || '').trim(),
  String(item.category || '').trim().toLowerCase()
].join('|');

const removeDuplicateBouquets = async () => {
  const rows = await Bouquet.findAll({ order: [['id', 'ASC']] });
  const seen = new Set();

  for (const row of rows) {
    const key = bouquetKey(row);

    if (seen.has(key)) {
      await row.destroy();
      continue;
    }

    seen.add(key);
  }
};


const feedbackKey = item => [
  String(item.author || '').trim().toLowerCase(),
  String(item.text || '').trim().toLowerCase()
].join('|');

const seedFeedbackTable = async () => {
  const rows = await Feedback.findAll({ order: [['id', 'ASC']] });
  const existingKeys = new Set(rows.map(feedbackKey));
  const missingItems = seedFeedbacks.filter(item => !existingKeys.has(feedbackKey(item)));

  if (missingItems.length) {
    await Feedback.bulkCreate(missingItems);
  }
};

const seedDatabase = async () => {
  await removeDuplicateBouquets();

  const existingRows = await Bouquet.findAll({ order: [['id', 'ASC']] });
  const existingKeys = new Set(existingRows.map(bouquetKey));
  const missingItems = seedBouquets.filter(item => !existingKeys.has(bouquetKey(item)));

  if (missingItems.length) {
    await Bouquet.bulkCreate(missingItems);
  }

  await removeDuplicateBouquets();
  await seedFeedbackTable();
};

module.exports = { seedDatabase };
