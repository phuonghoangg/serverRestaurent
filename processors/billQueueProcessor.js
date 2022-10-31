const { Bill, User,Product } = require('../models/model');

const billQueueProcessor = async (job,done) =>{
   try {
    const dataBill= job.data.dataBill
    const newBill = await new Bill(dataBill);
    console.log(newBill);
    // await newBill.save();
        // if (dataBill.user) {
        //     const user = await User.findById(dataBill.user);
        //     await user.updateOne({ $push: { bills: bill._id } });     

        // }
        // const product = await Product.findById(dataBill.id)  
        // dataBill.products?.map(async(product)=>{
        //     const dataProduct = await Product.findById(product)
        //     await dataProduct.updateOne({$push:{ bills:bill._id}})
        // })
    done()
   } catch (error) {
    console.log(error);
   }
    // try {
    //     console.log(dataBill);
    //     const newBill = await new Bill(dataBill);
    //     const bill = await newBill.save();
    //     if (dataBill.user) {
    //         const user = await User.findById(dataBill.user);
    //         await user.updateOne({ $push: { bills: bill._id } });     

    //     }
    //     const product = await Product.findById(dataBill.id)  
    //     dataBill.products?.map(async(product)=>{
    //         const dataProduct = await Product.findById(product)
    //         await dataProduct.updateOne({$push:{ bills:bill._id}})
    //     })
    //     done()
    // } catch (error) {
        
    // }
}

module.exports = billQueueProcessor