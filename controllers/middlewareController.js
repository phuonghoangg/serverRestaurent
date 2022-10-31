const jwt = require('jsonwebtoken');

const middlewareController = {
    verifyToken: (req, res, next) => {
        const token = req.headers.token;

        if (token) {
            const accessToken = token.split(' ')[1];

            jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
                if (err) {
                    return res.status(403).json('Token is not valid ');
                }
              
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json("u're not authenticated token ");
        }
    },
    verifyTokenAndAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                next();
            } else {
                res.status(403).json("u a're not  admin");
            }
        });
    },
    verifyTokenAndCashier: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.role === "cashier") {
                next();
            } else {
                res.status(403).json("u a're not cashier");
            }
        });
    },
    verifyTokenAndChef: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.role === "chef") {
                next();
            } else {
                res.status(403).json("u a're not chef");
            }
        });
    },
    verifyTokenAdminAndCashier: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.isAdmin || req.user.role ==='cashier') {
                next();
            } else {
                res.status(403).json("u a're not  admin or cashier");
            }
        });
    },
};
module.exports = middlewareController;
