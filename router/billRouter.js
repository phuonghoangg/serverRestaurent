const billController = require('../controllers/billController');
const middlewareController = require('../controllers/middlewareController');
const router = require('express').Router();

router.get('/total-price', billController.allTotalBill);
router.post('/f/date', billController.findDate);
router.post('/', billController.addBill);
router.delete('/:id', middlewareController.verifyTokenAdminAndCashier, billController.deleteBill);

//get bill with role
router.get('/:id', middlewareController.verifyToken, billController.getAllBill);
router.post('/find', middlewareController.verifyTokenAndAdmin, billController.getAllBillPage);
//bill user cms
router.post('/a/:id', middlewareController.verifyToken, billController.getBillWithUserActive);

//get bill successs
router.post('/success', middlewareController.verifyToken, billController.getBillSuccess);
//get bill use cms
router.get('/u/:id', middlewareController.verifyToken, billController.getBillWithUser);

router.post('/accept-bill', middlewareController.verifyTokenAdminAndCashier, billController.acceptBillStaff);

router.post('/accept-chef', middlewareController.verifyTokenAndChef, billController.acceptBillChef);

router.post('/accept-dishout', middlewareController.verifyTokenAdminAndCashier, billController.accecptDishOut);
router.post('/fail-bill', middlewareController.verifyTokenAndCashier, billController.failBill);
router.post('/reject-bill', middlewareController.verifyTokenAdminAndCashier, billController.rejectBill);

router.get('/get-all-billaccept', billController.getAllBillAccept);
module.exports = router;
