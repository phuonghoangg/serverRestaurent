const { User } = require('../models/model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let refreshTokens = [];
const userController = {
    //register
    registerUser: async (req, res) => {
        try {
            // console.log(req.body);
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            //create new user
            const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            const user = await newUser.save();
            return res.status(200).json(user);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    //generateAccessToken
    generateAccesToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                isAdmin: user.isAdmin,
            },
            process.env.ACCESS_TOKEN,
            { expiresIn: '20s' },
        );
    },
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                isAdmin: user.isAdmin,
            },
            process.env.REFRESH_TOKEN,
            { expiresIn: '30d' },
        );
    },
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json('wrong email');
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(404).json('wrong password');
            }
            if (user && validPassword) {
                //tao Token
                const accessToken = userController.generateAccesToken(user);
                const refreshToken = userController.generateRefreshToken(user);
                //luu refresh token vao cookie
                refreshTokens.push(refreshToken);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false, //nao` deploy thi set true
                    path: '/',
                    sameSite: 'strict',
                });
                const { password, ...other } = user._doc;
                return res.status(200).json({ ...other, accessToken });
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getAllUser: async (req, res) => {
        try {
            const user = await User.find();
            res.status(200).json(user);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            res.status(200).json('success deleted');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    requestRefreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json("u're not authenticated");
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json('refresh token is not valid');
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) {
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

            //create new access token,refresh token
            const newAccessToken = userController.generateAccesToken(user);
            const newRefreshToken = userController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false, //nao` deploy thi set true
                path: '/',
                sameSite: 'strict',
            });
            res.status(200).json({ accessToken: newAccessToken });
        });
    },
    logoutUser: async (req, res) => {
        res.clearCookie('refreshToken');
        refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshToken);
        res.status(200).json('logout success');
    },
};

module.exports = userController;
