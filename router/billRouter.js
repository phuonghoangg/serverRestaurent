const billController = require('../controllers/billController');

const router = require('express').Router();

router.post('/', billController.addBill);
router.delete('/:id', billController.deleteBill);
router.get('/', billController.getAllBill);
module.exports = router;
