const fs = require('fs/promises');
const path = require('path');
const { Op } = require('sequelize');
const { Bouquet, sequelize } = require('../models');
const HttpError = require('../middlewares/HttpError');

const normalizePage = value => Math.max(Number(value) || 1, 1);
const normalizeLimit = value => Math.min(Math.max(Number(value) || 8, 1), 24);

const serializeBouquet = item => ({
  id: item.id,
  title: item.title,
  name: item.title,
  description: item.description,
  price: item.price,
  category: item.category,
  favorite: item.favorite,
  photoUrl: item.photoUrl,
  image: item.image,
  alt: item.alt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const bouquetUniqueKey = item => [
  String(item.title || item.name || '').trim().toLowerCase(),
  String(item.image || item.photoUrl || '').trim().toLowerCase(),
  String(item.price || '').trim(),
  String(item.category || '').trim().toLowerCase()
].join('|');

const getUniqueBouquets = rows => {
  const seen = new Set();

  return rows.filter(row => {
    const key = bouquetUniqueKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildWhere = query => {
  const where = {};

  if (query.search) {
    const likeOperator = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
    where.title = { [likeOperator]: `%${query.search}%` };
  }

  if (query.category && query.category !== 'all') {
    where.category = query.category;
  }

  if (query.priceMax && query.priceMax !== 'all') {
    where.price = { [Op.lte]: Number(query.priceMax) };
  }

  if (query.favorite !== undefined) {
    where.favorite = query.favorite === 'true';
  }

  return where;
};

const listBouquets = async query => {
  const page = normalizePage(query.page);
  const limit = normalizeLimit(query.limit);
  const offset = (page - 1) * limit;

  // Важно: пагинация считается после удаления дублей.
  // На Render база могла накопить повторные seed-записи, и из-за этого
  // backend сообщал hasMore=true даже когда уникальные букеты уже закончились.
  const allRows = await Bouquet.findAll({
    where: buildWhere(query),
    order: [['id', 'ASC']]
  });

  const uniqueRows = getUniqueBouquets(allRows);
  const pageRows = uniqueRows.slice(offset, offset + limit);
  const total = uniqueRows.length;

  return {
    items: pageRows.map(serializeBouquet),
    total,
    page,
    limit,
    hasMore: offset + pageRows.length < total
  };
};

const getBouquetById = async id => {
  const bouquet = await Bouquet.findByPk(id);

  if (!bouquet) throw new HttpError(404, 'Bouquet not found');

  return serializeBouquet(bouquet);
};

const createBouquet = async payload => {
  const bouquet = await Bouquet.create(payload);
  return serializeBouquet(bouquet);
};

const updateBouquet = async (id, payload) => {
  const bouquet = await Bouquet.findByPk(id);

  if (!bouquet) throw new HttpError(404, 'Bouquet not found');

  await bouquet.update(payload);
  return serializeBouquet(bouquet);
};

const removeBouquet = async id => {
  const bouquet = await Bouquet.findByPk(id);

  if (!bouquet) throw new HttpError(404, 'Bouquet not found');

  await bouquet.destroy();
};

const updateFavorite = async (id, favorite) => updateBouquet(id, { favorite });

const saveBouquetPhoto = async (id, file) => {
  if (!file) throw new HttpError(400, 'Photo file is required');

  const bouquet = await Bouquet.findByPk(id);

  if (!bouquet) {
    await fs.rm(file.path, { force: true });
    throw new HttpError(404, 'Bouquet not found');
  }

  const photosDir = path.join(process.cwd(), 'public/photos');
  await fs.mkdir(photosDir, { recursive: true });

  const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
  const fileName = `bouquet-${id}-${Date.now()}${extension}`;
  const destination = path.join(photosDir, fileName);

  await fs.rename(file.path, destination);
  await bouquet.update({ photoUrl: `/photos/${fileName}` });

  return serializeBouquet(bouquet);
};

module.exports = {
  listBouquets,
  getBouquetById,
  createBouquet,
  updateBouquet,
  removeBouquet,
  updateFavorite,
  saveBouquetPhoto
};
