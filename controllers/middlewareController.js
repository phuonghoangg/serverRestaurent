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
                console.log(user);
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json("u're not authenticated ");
        }
    },
    verifyTokenAndAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                next();
            } else {
                res.status(403).json('khong xoa dc ');
            }
        });
    },
};
module.exports = middlewareController;
