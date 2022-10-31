const billController = require('../controllers/billController');
const middlewareController = require('../controllers/middlewareController');

const router = require('express').Router();

router.post('/', billController.addBill);
router.delete('/:id',middlewareController.verifyTokenAdminAndCashier, billController.deleteBill);
router.get('/',middlewareController.verifyToken, billController.getAllBill);
router.post('/accept-bill',middlewareController.verifyTokenAndCashier,billController.acceptBill)
router.post('/fail-bill',middlewareController.verifyTokenAndCashier,billController.failBill)
router.get('/total-price',billController.allTotalBill)
module.exports = router;