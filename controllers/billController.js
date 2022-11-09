const { Bill, User, Product } = require('../models/model');
const Queue = require('bull');
const { REDIS_PORT, REDIS_URI } = require('../config/RedisCredentials');

const billQueue = new Queue('billQueue', {
    redis: {
        port: REDIS_PORT,
        host: REDIS_URI,
    },
});

const billController = {
    addBill: async (req, res) => {
        try {
            const dataBill = req.body;
            //Queue
            // await new Promise(res=>billQueue.add({dataBill},)
            //             .then(job=>job.finished().then(result=>{
            //                 res(result)
            //                 job.remove()
            //             })))
            const newBill = await new Bill(req.body);
            const bill = await newBill.save();
            if (req.body.user) {
                const user = await User.findById(req.body.user);
                await user.updateOne({ $push: { bills: bill._id } });
            }
            const product = await Product.findById(req.body.id);
            req.body.products?.map(async (product) => {
                const dataProduct = await Product.findById(product);
                await dataProduct.updateOne({ $push: { bills: bill._id } });
            });
            return res.status(200).json('success add bill');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getAllBill: async (req, res) => {
        try {
            const allBill = await Bill.find().populate('products');
            return res.status(200).json(allBill);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    deleteBill: async (req, res) => {
        try {
            let billId = req.params.id;
            const billData = await Bill.findById(billId);

            await billData.products?.map(async (product) => {
                await Product.updateMany({ product }, { $pull: { bills: billId } });
            });
            await User.updateMany({ bills: req.params.id }, { $pull: { bills: req.params.id } });
            await Bill.findByIdAndDelete(req.params.id);
            return res.status(200).json('delete Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    acceptBillStaff: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
           if(!billData.chefActive && billData.isActiveBill ==false){
            await billData.updateOne({ $set: { isActiveBill: true, userActive: req.body.user,status:'DON_DA_XAC_NHAN' } });
            return res.status(200).json('don hang da duoc nhan');
           }else{
            return res.status(400).json("don hang da dc nhan");
           }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    acceptBillChef: async (req,res) =>{
        try {
            const billData = await Bill.findById(req.body.id);
            if(billData.chefActive=""){
                await billData.updateOne({$set:{ chefActive:req.body.user,status:"BEP_XAC_NHAN"}})
                return res.status(200).json('bep da xac nhan don hang')
            }else{
                return res.status(400).json('don hang da duoc bep xac nhan')
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    accecptDishOut: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            if(billData.chefActive){
                await billData.updateOne({ $set: {isDishOut:true,status:"NHAN_VIEN_NHAN_MON" } });
                return res.status(200).json('da nhan mon tu bep');
            }else{
                return res.status(400).json('bep chua ra mon')
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    failBill: async (req, res) => {
        try {
            let newPrice;
            const billData = await Bill.findById(req.body.id);
            if (billData.isFailBill == false) {
                newPrice = billData.priceBill + billData.priceBill * 0.5;
                await billData.updateOne({ $set: { isFailBill: true, priceBill: newPrice } });
                return res.status(200).json('Bill den');
            } else {
                newPrice = (billData.priceBill * 2) / 3;
                await billData.updateOne({ $set: { isFailBill: false, priceBill: newPrice } });
                return res.status(200).json('khong den bill');
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    allTotalBill: async (req, res) => {
        try {
            let total = 0;
            const bills = await Bill.find();
            bills.map((bill) => {
                total = total + bill.priceBill;
            });
            return res.status(200).json(total);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getAllBillAccept: async (req, res) => {
        const bills = await Bill.find({ isActiveBill: true });
        return res.status(200).json(bills);
    },
};

module.exports = billController;
