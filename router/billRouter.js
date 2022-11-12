const billController = require('../controllers/billController');
const middlewareController = require('../controllers/middlewareController');
const router = require('express').Router();

router.get('/total-price', billController.allTotalBill);
router.post('/', billController.addBill);
router.delete('/:id', middlewareController.verifyTokenAdminAndCashier, billController.deleteBill);
router.get('/', middlewareController.verifyToken, billController.getAllBill);
router.get('/:id', middlewareController.verifyToken, billController.getBillWithUser);
router.post('/accept-bill', middlewareController.verifyTokenAdminAndCashier, billController.acceptBillStaff);

router.post('/accept-chef', middlewareController.verifyTokenAndChef, billController.acceptBillChef);

router.post('/accept-dishout', middlewareController.verifyTokenAdminAndCashier, billController.accecptDishOut);
router.post('/fail-bill', middlewareController.verifyTokenAndCashier, billController.failBill);

router.get('/get-all-billaccept', billController.getAllBillAccept);
module.exports = router;
