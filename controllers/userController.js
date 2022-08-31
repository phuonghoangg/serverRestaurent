const { User } = require('../models/model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
                const accessToken = jwt.sign(
                    {
                        id: user.id,
                        isAdmin: user.isAdmin,
                    },
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '300s' },
                );
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
};

module.exports = userController;
