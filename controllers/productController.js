const { Product, User } = require('../models/model');

const productController = {
    //create product:
    addProduct: async (req, res) => {
        try {
            const newProduct = await new Product(req.body);
            const product = await newProduct.save();
            if (req.body.user) {
                const user = await User.findById(req.body.user);
                await user.updateOne({ $push: { products: product._id } });
            }

            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getAllProduct: async (req, res) => {
        try {
            console.log(req.query.type);
            const type = req.query.type;
            if (!type) {
                const allProduct = await Product.find().populate('user', 'username');
                return res.status(200).json(allProduct);
            } else {
                const allProduct = await Product.find({ type: type }).populate('user', 'username');
                return res.status(200).json(allProduct);
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getByType: async (req, res) => {
        console.log(req.query);
    },
    updateProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            await product.updateOne({ $set: req.body });
            return res.status(200).json('Updated Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    deleteProduct: async (req, res) => {
        try {
            try {
                await User.updateMany({ products: req.params.id }, { $pull: { products: req.params.id } });
                await Product.findByIdAndDelete(req.params.id);
                res.status(200).json('delete success');
            } catch (error) {
                return res.status(500).json(error);
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    findProduct: async (req, res) => {
        try {
            const product = await Product.find({ type: { $regex: `${req.params.id}` } });
            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
};

module.exports = productController;
