const productController = require('../controllers/productController');

const router = require('express').Router();

//create product
router.post('/', productController.addProduct);
router.post('/:id', productController.updateProduct);
router.get('/', productController.getAllProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/f/:id', productController.findProduct);
module.exports = router;
