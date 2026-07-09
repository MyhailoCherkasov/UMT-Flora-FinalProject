const bouquetsService = require('../services/bouquets.service');

const listBouquets = async (req, res, next) => {
  try {
    const result = await bouquetsService.listBouquets(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getBouquet = async (req, res, next) => {
  try {
    const result = await bouquetsService.getBouquetById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createBouquet = async (req, res, next) => {
  try {
    const result = await bouquetsService.createBouquet(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateBouquet = async (req, res, next) => {
  try {
    const result = await bouquetsService.updateBouquet(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteBouquet = async (req, res, next) => {
  try {
    await bouquetsService.removeBouquet(req.params.id);
    res.status(200).json({ message: 'Bouquet deleted' });
  } catch (error) {
    next(error);
  }
};

const updateFavorite = async (req, res, next) => {
  try {
    const result = await bouquetsService.updateFavorite(req.params.id, req.body.favorite);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    const result = await bouquetsService.saveBouquetPhoto(req.params.id, req.file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBouquets,
  getBouquet,
  createBouquet,
  updateBouquet,
  deleteBouquet,
  updateFavorite,
  uploadPhoto
};
