const { Bill, User, Product } = require('../models/model');
const Queue = require('bull');
const { REDIS_PORT, REDIS_URI } = require('../config/RedisCredentials');
const e = require('express');

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
        let role = req.params.id;
        let allBill;
        let billWait = [];
        try {
            if (role === 'chef') {
                allBill = await Bill.find({ status: 'DON_DA_XAC_NHAN' })
                    .populate('products', 'name')
                    .populate('user', ['username', 'role'])
                    .sort({ createdAt: 1 });
                return res.status(200).json(allBill);
            } else {
                allBill = await Bill.find()
                    .populate('products', 'name')
                    .populate('user', ['username', 'role'])
                    .sort({ createdAt: 1 });
                allBill.map((item) => {
                    if (
                        item.status !== 'NHAN_VIEN_NHAN_MON' &&
                        item.status !== 'HUY_DON' &&
                        item.status !== 'FAIL_BILL'
                    ) {
                        billWait.push(item);
                    }
                });
                return res.status(200).json(billWait);
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    //get bill on day
    getBillSuccess: async (req, res) => {
        const arr = [];
        try {
            let time = new Date();
            allBill = await Bill.find()
                .populate('products', 'name')
                .populate('user', 'username')
                .sort({ createdAt: -1 });
            allBill.map((item) => {
                if (item.status === 'NHAN_VIEN_NHAN_MON' || item.status === 'FAIL_BILL') {
                    if (time.getFullYear() === item.createdAt.getFullYear()) {
                        if (time.getMonth() === item.createdAt.getMonth()) {
                            if (time.getDate() === item.createdAt.getDate()) {
                                arr.push(item);
                            }
                        }
                    } else {
                        console.log('faul');
                    }
                }
            });
            return res.status(200).json(arr);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    findDate: async (req, res) => {
        // let timeLeft = new Date(req.body.timeLeft);
        // let timeRight = new Date(req.body.timeRight);
        let time = new Date();

        console.log(time.getDate());
        const bills = await Bill.find().select(['createdAt']);
        bills.map((item) => {
            if (time.getFullYear() === item.createdAt.getFullYear()) {
                if (time.getMonth() === item.createdAt.getMonth()) {
                    if (time.getDate() === item.createdAt.getDate()) {
                        console.log('true');
                    }
                }
            } else {
                console.log('faul');
            }
        });
        return res.status(200).json(bills);
    },
    getBillWithUser: async (req, res) => {
        try {
            const allBill = await User.findById(req.params.id).populate('bills', 'products');

            return res.status(200).json(allBill);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getBillWithUserActive: async (req, res) => {
        const dateTemp = new Date(req.body.date)
        console.log(dateTemp);
        try {
            let priceAll = 0;
            let bills = []
            let total = 0
            const allBill = await Bill.find({ userActive: req.params.id }).populate('products');
            let arr = allBill.length;
            allBill.map((item) => {
                if (item.status === 'NHAN_VIEN_NHAN_MON' || item.status ==='FAIL_BILL') {
                   if(req.body.date){
                    if(dateTemp.getFullYear() === item.createdAt.getFullYear()){
                        if(dateTemp.getMonth() === item.createdAt.getMonth()){
                         if(dateTemp.getDate() === item.createdAt.getDate()){
                             priceAll = priceAll + item.priceBill;
                             bills.push(item)
                             total  = total + 1
                         }
                        }
                     }
                   }else{
                    bills.push(item)
                    total = total+1
                    priceAll = priceAll + item.priceBill;
                   }
                }
            });
        
            return res.status(200).json({ allBill: bills, total: total, price: priceAll });
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
            if (!billData.chefActive && billData.isActiveBill == false) {
                await billData.updateOne({
                    $set: { isActiveBill: true, userActive: req.body.user, status: 'DON_DA_XAC_NHAN' },
                });
                return res.status(200).json('don hang da duoc nhan');
            } else {
                return res.status(400).json('don hang da dc nhan');
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    acceptBillChef: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            if (!billData.chefActive) {
                await billData.updateOne({ $set: { chefActive: req.body.user, status: 'BEP_XAC_NHAN' } });
                return res.status(200).json('bep da xac nhan don hang');
            } else {
                return res.status(400).json('don hang da duoc bep xac nhan');
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    accecptDishOut: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            if (billData.chefActive && billData.isDishOut == false) {
                await billData.updateOne({ $set: { isDishOut: true, status: 'NHAN_VIEN_NHAN_MON' } });
                return res.status(200).json('da nhan mon tu bep');
            } else {
                return res.status(400).json('bep chua ra mon');
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
                await billData.updateOne({ $set: { isFailBill: true, priceBill: newPrice, status: 'FAIL_BILL' } });
                return res.status(200).json('Bill den');
            } else {
                newPrice = (billData.priceBill * 2) / 3;
                await billData.updateOne({
                    $set: { isFailBill: false, priceBill: newPrice, status: 'NHAN_VIEN_NHAN_MON' },
                });
                return res.status(200).json('khong den bill');
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    rejectBill: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            if (billData.isActiveBill == false) {
                await billData.updateOne({
                    $set: { isRejectBill: true, userActive: req.body.user, status: 'HUY_DON' },
                });
                return res.status(200).json('success');
            } else {
                return res.status(400).json('khong reject duoc bill');
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
                if (bill.isRejectBill == false) {
                    total = total + bill.priceBill;
                }
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

    getAllBillPage: async (req, res) => {

        console.log(req.body.date);
      
        let dateCheck = new Date(req.body.date)
        const allBill = []
        let total = 0
        let price = 0
        const bills = await Bill.find()
            .populate('user', 'username')
            .populate('userActive', 'username')
            .populate('chefActive', 'username')
            .sort({ updatedAt: -1 });
        
        bills.map(item=>{
           if(req.body.date){
            if(dateCheck.getFullYear() === item.createdAt.getFullYear() && dateCheck.getMonth() === item.createdAt.getMonth()){
                allBill.push(item)
                total = total + 1
                price = price + item.priceBill
            }
           }else{
            allBill.push(item)
            total = total + 1
            price = price + item.priceBill
        }
        })
        return res.status(200).json({bills:allBill,total:total,price:price});
    },
    getAllBillWithUser: async (req, res) => {},
};

module.exports = billController;
