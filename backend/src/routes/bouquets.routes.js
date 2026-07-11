const express = require('express');
const controller = require('../controllers/bouquets.controller');
const validateBody = require('../middlewares/validateBody');
const upload = require('../middlewares/upload');
const {
  bouquetCreateSchema,
  bouquetUpdateSchema,
  favoriteSchema
} = require('../schemas/bouquet.schema');

const router = express.Router();

router.get('/', controller.listBouquets);
router.get('/:id', controller.getBouquet);
router.post('/', validateBody(bouquetCreateSchema), controller.createBouquet);
router.put('/:id', validateBody(bouquetUpdateSchema), controller.updateBouquet);
router.delete('/:id', controller.deleteBouquet);
router.patch('/:id/favorite', validateBody(favoriteSchema), controller.updateFavorite);
router.post('/:id/photo', upload.single('photo'), controller.uploadPhoto);

module.exports = router;
