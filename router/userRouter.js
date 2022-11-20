const middlewareController = require('../controllers/middlewareController');
const userController = require('../controllers/userController');

const router = require('express').Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/:id', middlewareController.verifyTokenAndAdmin, userController.updateUser);

router.get('/', middlewareController.verifyToken, userController.getAllUser);

router.delete('/:id', middlewareController.verifyTokenAndAdmin, userController.deleteUser);

router.get('/count-user', userController.totalUser);

//refresh login  handle
router.post('/refresh', userController.requestRefreshToken);

//logout
router.post('/logout', middlewareController.verifyToken, userController.logoutUser);
module.exports = router;
