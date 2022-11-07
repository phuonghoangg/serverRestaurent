const billController = require('../controllers/billController');
const middlewareController = require('../controllers/middlewareController');
const router = require('express').Router();

router.post('/', billController.addBill);
router.delete('/:id', middlewareController.verifyTokenAdminAndCashier, billController.deleteBill);
router.get('/', middlewareController.verifyToken, billController.getAllBill);
router.post('/accept-bill', middlewareController.verifyTokenAdminAndCashier, billController.acceptBill);
router.post('/fail-bill', middlewareController.verifyTokenAndCashier, billController.failBill);
router.post('/accept-dishout', middlewareController.verifyTokenAdminAndCashier, billController.accecptDishOut);
router.get('/total-price', billController.allTotalBill);

router.get('/get-all-billaccept', billController.getAllBillAccept);
module.exports = router;
