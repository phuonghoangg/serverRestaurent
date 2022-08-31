const middlewareController = require('../controllers/middlewareController');
const userController = require('../controllers/userController');

const router = require('express').Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/', middlewareController.verifyToken, userController.getAllUser);
router.delete('/:id', middlewareController.verifyTokenAndAdmin, userController.deleteUser);

module.exports = router;
