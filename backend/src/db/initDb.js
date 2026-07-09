const { Bouquet } = require('../models');
const seedBouquets = require('../data/seedBouquets');


const obsoleteDemoTitles = new Set([
  'spring elegance',
  'crimson rose',
  'lavender dream',
  'sunny bliss'
]);

const removeObsoleteDemoRows = async () => {
  const rows = await Bouquet.findAll({ order: [['id', 'ASC']] });

  for (const row of rows) {
    const title = String(row.title || '').trim().toLowerCase();
    if (obsoleteDemoTitles.has(title)) {
      await row.destroy();
    }
  }
};

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

const seedDatabase = async () => {
  await removeObsoleteDemoRows();
  await removeDuplicateBouquets();

  const existingRows = await Bouquet.findAll({ order: [['id', 'ASC']] });
  const existingKeys = new Set(existingRows.map(bouquetKey));
  const missingItems = seedBouquets.filter(item => !existingKeys.has(bouquetKey(item)));

  if (missingItems.length) {
    await Bouquet.bulkCreate(missingItems);
  }

  await removeDuplicateBouquets();
};

module.exports = { seedDatabase };
