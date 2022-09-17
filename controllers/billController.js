const { Bill, User } = require('../models/model');

const billController = {
    addBill: async (req, res) => {
        try {
            const newBill = await new Bill(req.body);
            const bill = await newBill.save();
            if (req.body.user) {
                const user = await User.findById(req.body.user);
                await user.updateOne({ $push: { bills: bill._id } });
            }

            return res.status(200).json('success add bill');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getAllBill: async (req, res) => {
        try {
            const allBill = await Bill.find().populate('products', 'name');
            return res.status(200).json(allBill);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    deleteBill: async (req, res) => {
        try {
            await User.updateMany({ bills: req.params.id }, { $pull: { bills: req.params.id } });
            await Bill.findByIdAndDelete(req.params.id);
            return res.status(200).json('delete Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
};

module.exports = billController;
