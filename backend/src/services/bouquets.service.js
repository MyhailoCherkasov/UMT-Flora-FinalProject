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

  const { rows, count } = await Bouquet.findAndCountAll({
    where: buildWhere(query),
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  return {
    items: rows.map(serializeBouquet),
    total: count,
    page,
    limit,
    hasMore: offset + rows.length < count
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
