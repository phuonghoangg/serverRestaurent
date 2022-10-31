const { Bill, User,Product } = require('../models/model');

const billController = {
    addBill: async (req, res) => {
        try {
            const newBill = await new Bill(req.body);
            const bill = await newBill.save();
            if (req.body.user) {
                const user = await User.findById(req.body.user);
                await user.updateOne({ $push: { bills: bill._id } });     

            }
            const product = await Product.findById(req.body.id)  
            req.body.products?.map(async(product)=>{
                const dataProduct = await Product.findById(product)
                await dataProduct.updateOne({$push:{ bills:bill._id}})
            })
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
          
            let billId = req.params.id
            const billData = await Bill.findById(billId)
         
            await billData.products?.map(async(product)=>{
                await Product.updateMany({product},{$pull:{bills:billId}})
            })
            await User.updateMany({ bills: req.params.id }, { $pull: { bills: req.params.id } });
            await Bill.findByIdAndDelete(req.params.id);
            return res.status(200).json('delete Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    acceptBill: async (req,res)=>{
        try {
            
            const billData = await Bill.findById(req.body.id)
            await billData.updateOne({$set:{isActiveBill:true}})
            return res.status(200).json('don hang da duoc nhan')
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    accecptDishOut: async (req,res)=>{
        try {
            const billData = await Bill.findById(req.body.id)
            await billData.updateOne({$set:{isDishOut:true}})
            return res.status(200).json('da nhan mon tu bep')
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    failBill: async (req,res)=>{
        try {
            let newPrice
            const billData = await Bill.findById(req.body.id)
            if(billData.isFailBill == false){
                newPrice = billData.priceBill + billData.priceBill*0.5
                await billData.updateOne({$set:{isFailBill:true,priceBill:newPrice}})
                return res.status(200).json('Bill den')
            }else{
                newPrice = billData.priceBill*2/3
                await billData.updateOne({$set:{isFailBill:false,priceBill:newPrice}})
                return res.status(200).json('khong den bill')
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    allTotalBill: async(req,res)=>{
        try {
            let total = 0
            const bills = await Bill.find()
            bills.map(bill =>{
                total = total + bill.priceBill
            })
            return res.status(200).json(total)
        } catch (error) {
            return res.status(500).json(error);
        }
    }
};

module.exports = billController;
