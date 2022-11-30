const productController = require('../controllers/productController');

const router = require('express').Router();

//create product
router.post('/', productController.addProduct);
router.post('/:id', productController.updateProduct);
router.get('/', productController.getAllProduct);

router.get('/count-product', productController.totalProduct);

router.get('/total-sell-product', productController.totalSellProduct);

router.get('/month-sell-product', productController.monthSellProduct);
// router.get('/?type', productController.getByType);

router.delete('/:id', productController.deleteProduct);
router.get('/f/:id', productController.findProduct);
module.exports = router;
