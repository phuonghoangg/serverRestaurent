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
        let min;
        let max;
        if (req.body.stage === 'STAGE_1') {
            min = 1;
            max = 6;
        } else if (req.body.stage === 'STAGE_2') {
            min = 7;
            max = 12;
        }
        try {
            if (role === 'chef') {
                const allBill =[]
                bills = await Bill.find() //Check lai cho nay
                    .populate('products', 'name')
                    .populate('user', ['username', 'role'])
                    .sort({ createdAt: 1 });
                    bills.map(item=>{
                        if( item.status === 'DON_DA_XAC_NHAN' ||item.status ===  'BEP_XAC_NHAN' || item.status === 'NHAN_VIEN_NHAN_MON' ){
                            allBill.push(item)
                        }
                    })
                return res.status(200).json(allBill);
            } else {
                allBill = await Bill.find()
                    .populate('products', 'name')
                    .populate('user', ['username', 'role', 'stage'])
                    .sort({ createdAt: 1 });

                allBill.map((item) => {
                    if (
                        item.status !== 'NHAN_VIEN_NHAN_MON' &&
                        item.status !== 'HUY_DON' &&
                        item.status !== 'DA_THANH_TOAN' &&
                        item.status !== 'FAIL_BILL' &&
                        item.status !== 'BEP_XAC_NHAN'
                    ) {
                        if (min <= parseInt(item.numberTable) && parseInt(item.numberTable) <= max) {
                            billWait.push(item);
                        } else {
                            console.log('false');
                        }
                        // console.log(parseInt(item.numberTable));
                        // console.log(req.body.stage);
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
        let total = 0;
        try {
            let time = new Date();
            allBill = await Bill.find()
                .populate('products', 'name')
                .populate('user', 'username')
                .populate('userPlaced', 'username')
                .sort({ createdAt: -1 });

            allBill.map((item) => {
                if (
                    item.status === 'NHAN_VIEN_NHAN_MON' ||
                    item.status === 'FAIL_BILL' ||
                    item.status === 'DA_THANH_TOAN' ||
                    item.status === 'BEP_XAC_NHAN'
                ) {
                    if (req.body.type === 'day') {
                        if (time.getFullYear() === item.createdAt.getFullYear()) {
                            if (time.getMonth() === item.createdAt.getMonth()) {
                                if (time.getDate() === item.createdAt.getDate()) {
                                    arr.push(item);
                                    total = total + item.priceBill;
                                }
                            }
                        }
                    } else {
                        arr.push(item);
                        total = total + item.priceBill;
                    }
                }
            });
            return res.status(200).json({ bills: arr, total: total });
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
        console.log(req.body);
        const dateTemp = new Date(req.body.date);
        const currentDay = new Date();

        let month;
        let year;
        if (req.body.month === 'Month') {
            month = '02';
        } else {
            month = req.body.month;
        }

        if (req.body.year === 'Year') {
            year = '2020';
        } else {
            year = req.body.year;
        }

        let datePickString = `${month}/13/${year}`;

        const datePick = new Date(datePickString);
        let priceAll = 0;
        let bills = [];
        let total = 0;
        let bonous = false;

        let bonousCheck = 0;
        const allBill = await Bill.find({ userActive: req.params.id }).populate('products');
        allBill.map((item) => {
            if (
                item.status === 'NHAN_VIEN_NHAN_MON' ||
                item.status === 'FAIL_BILL' ||
                item.status === 'DA_THANH_TOAN'
            ) {
                if (item.isRejectBill == false) {
                    if (req.body.month !== 'Month' && req.body.year === 'Year') {
                        if (
                            currentDay.getFullYear() === item.createdAt.getFullYear() &&
                            datePick.getMonth() === item.createdAt.getMonth()
                        ) {
                            bills.push(item);
                            total = total + 1;
                            priceAll = priceAll + item.priceBill;
                            bonousCheck = bonousCheck + 1;
                        }
                    } else if (req.body.month === 'Month' && req.body.year !== 'Year') {
                        if (datePick.getFullYear() === item.createdAt.getFullYear()) {
                            bills.push(item);
                            total = total + 1;
                            priceAll = priceAll + item.priceBill;
                            // bonousCheck = bonousCheck + 1;
                        }
                    } else if (req.body.month !== 'Month' && req.body.year !== 'Year') {
                        if (
                            datePick.getFullYear() === item.createdAt.getFullYear() &&
                            datePick.getMonth() === item.createdAt.getMonth()
                        ) {
                            bills.push(item);
                            total = total + 1;
                            priceAll = priceAll + item.priceBill;
                            bonousCheck = bonousCheck + 1;
                        }
                    } else if (req.body.date) {
                        if (
                            dateTemp.getFullYear() === item.createdAt.getFullYear() &&
                            dateTemp.getMonth() === item.createdAt.getMonth() &&
                            dateTemp.getDate() === item.createdAt.getDate()
                        ) {
                            bills.push(item);
                            total = total + 1;
                            priceAll = priceAll + item.priceBill;
                            // bonousCheck = bonousCheck + 1;
                        }
                    } else {
                        bills.push(item);
                        total = total + 1;
                        priceAll = priceAll + item.priceBill;
                    }
                }
            }
        });
        if (bonousCheck > 15) {
            bonous = true;
        }
        return res.status(200).json({ allBill: bills, total: total, price: priceAll, isBonous: bonous });
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
    // fix chef select cashier
    acceptBillChef: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            if (!billData.chefActive && req.body.userPlaced) {
                await billData.updateOne({
                    $set: { chefActive: req.body.user, status: 'BEP_XAC_NHAN', userPlaced: req.body.userPlaced },
                });
                return res.status(200).json('bep da xac nhan don hang');
            } else {
                console.log('khong co user nao nhan mon');
                return res.status(400).json('don hang da duoc bep xac nhan');
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    // true cashier accept next step bill
    accecptDishOut: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            // console.log("client: ",req.body.user);
            // console.log("client: ",billData.userPlaced.toString());
            if (
                billData.chefActive &&
                billData.isDishOut == false &&
                billData.userPlaced.toString() === req.body.user
            ) {
                await billData.updateOne({ $set: { isDishOut: true, status: 'NHAN_VIEN_NHAN_MON' } });
                return res.status(200).json('da nhan mon tu bep');
            } else {
                console.log('khong dung nguoi nhan mon');
                return res.status(400).json('bep chua ra mon');
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    // take money bill
    takeMoney: async (req, res) => {
        try {
            const billData = await Bill.findById(req.body.id);
            if (billData.status === 'DA_THANH_TOAN') {
                if (billData.isFailBill == true) {
                    await billData.updateOne({ $set: { userTakeMoney: null, status: 'FAIL_BILL' } });
                } else {
                    await billData.updateOne({ $set: { userTakeMoney: null, status: 'NHAN_VIEN_NHAN_MON' } });
                }
                return res.status(200).json('chua thanh toan');
            } else {
                await billData.updateOne({ $set: { status: 'DA_THANH_TOAN', userTakeMoney: req.body.user } });
                return res.status(200).json('da thanh toan');
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
    chartBill: async (req, res) => {
        const arr = [];
        let dateNow = new Date();
        if (req.body.year !== 'Year') {
            dateNow = new Date(`${req.body.year}/02/02`);
        }
        let t1 = new Date('2022/01/02');
        let t2 = new Date('2022/02/02');
        let t3 = new Date('2022/03/02');
        let t4 = new Date('2022/04/02');
        let t5 = new Date('2022/05/02');
        let t6 = new Date('2022/06/02');
        let t7 = new Date('2022/07/02');
        let t8 = new Date('2022/08/02');
        let t9 = new Date('2022/09/02');
        let t10 = new Date('2022/10/02');
        let t11 = new Date('2022/11/02');
        let t12 = new Date('2022/12/02');
        let total1 = 0;
        let total2 = 0;
        let total3 = 0;
        let total4 = 0;
        let total5 = 0;
        let total6 = 0;
        let total7 = 0;
        let total8 = 0;
        let total9 = 0;
        let total10 = 0;
        let total11 = 0;
        let total12 = 0;

        const bills = await Bill.find();

        bills.map((item) => {
            if (item.isRejectBill == false) {
                if (dateNow.getFullYear() == item.createdAt.getFullYear()) {
                    if (t1.getMonth() === item.createdAt.getMonth()) {
                        total1 = total1 + item.priceBill;
                    }
                    if (t2.getMonth() === item.createdAt.getMonth()) {
                        total2 = total2 + item.priceBill;
                    }
                    if (t3.getMonth() === item.createdAt.getMonth()) {
                        total3 = total3 + item.priceBill;
                    }
                    if (t4.getMonth() === item.createdAt.getMonth()) {
                        total4 = total4 + item.priceBill;
                    }
                    if (t5.getMonth() === item.createdAt.getMonth()) {
                        total5 = total5 + item.priceBill;
                    }
                    if (t6.getMonth() === item.createdAt.getMonth()) {
                        total6 = total6 + item.priceBill;
                    }
                    if (t7.getMonth() === item.createdAt.getMonth()) {
                        total7 = total7 + item.priceBill;
                    }
                    if (t8.getMonth() === item.createdAt.getMonth()) {
                        total8 = total8 + item.priceBill;
                    }
                    if (t9.getMonth() === item.createdAt.getMonth()) {
                        total9 = total9 + item.priceBill;
                    }
                    if (t10.getMonth() === item.createdAt.getMonth()) {
                        total10 = total10 + item.priceBill;
                    }
                    if (t11.getMonth() === item.createdAt.getMonth()) {
                        total11 = total11 + item.priceBill;
                    }
                    if (t12.getMonth() === item.createdAt.getMonth()) {
                        total12 = total12 + item.priceBill;
                    }
                }
            }
        });
        arr.push(total1, total2, total3, total4, total5, total6, total7, total8, total9, total10, total11, total12);
        console.log(arr);
        return res.status(200).json(arr);
    },
    allTotalBill: async (req, res) => {
        let currentDay = new Date();
        const dateTemp = new Date(req.body.date);
        console.log(req.body);

        let month;
        let year;
        if (req.body.month === 'Month') {
            month = '02';
        } else {
            month = req.body.month;
        }

        if (req.body.year === 'Year') {
            year = '2020';
        } else {
            year = req.body.year;
        }

        let datePickString = `${month}/13/${year}`;

        const datePick = new Date(datePickString);
        // console.log(datePick.getMonth());
        try {
            let total = 0;
            const bills = await Bill.find();
            bills.map((bill) => {
                if (bill.isRejectBill == false) {
                    if (req.body.month !== 'Month' && req.body.year !== 'Year') {
                        if (
                            datePick.getFullYear() === bill.createdAt.getFullYear() &&
                            datePick.getMonth() === bill.createdAt.getMonth()
                        ) {
                            total = total + bill.priceBill;
                        }
                    } else if (req.body.month != 'Month' && req.body.year === 'Year') {
                        if (
                            currentDay.getFullYear() === bill.createdAt.getFullYear() &&
                            datePick.getMonth() == bill.createdAt.getMonth()
                        ) {
                            total = total + bill.priceBill;
                        }
                    } else if (req.body.year !== 'Year') {
                        if (datePick.getFullYear() === bill.createdAt.getFullYear()) {
                            total = total + bill.priceBill;
                        }
                    } else if (req.body.date) {
                        if (
                            dateTemp.getFullYear() === bill.createdAt.getFullYear() &&
                            dateTemp.getMonth() === bill.createdAt.getMonth() &&
                            dateTemp.getDate() === bill.createdAt.getDate()
                        ) {
                            total = total + bill.priceBill;
                        }
                    } else if (req.body.month === 'Month' && req.body.year === 'Year') {
                        total = total + bill.priceBill;
                    } else {
                        total = total + bill.priceBill;
                    }
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
        let currentDay = new Date();
        const dateTemp = new Date(req.body.date);

        console.log(req.body);

        let month;
        let year;
        if (req.body.month === 'Month') {
            month = '02';
        } else {
            month = req.body.month;
        }

        if (req.body.year === 'Year') {
            year = '2020';
        } else {
            year = req.body.year;
        }

        let datePickString = `${month}/13/${year}`;

        const datePick = new Date(datePickString);

        const allBill = [];
        let total = 0;
        let price = 0;
        const bills = await Bill.find()
            .populate('user', 'username')
            .populate('userActive', 'username')
            .populate('chefActive', 'username')
            .populate('userTakeMoney', 'username')
            .populate('userPlaced', 'username')
            .sort({ updatedAt: -1 });

        bills.map((item) => {
            if (req.body.month !== 'Month' && req.body.year === 'Year') {
                if (
                    currentDay.getFullYear() === item.createdAt.getFullYear() &&
                    datePick.getMonth() === item.createdAt.getMonth()
                ) {
                    allBill.push(item);
                    price = price + item.priceBill;
                    total = total + 1;
                }
            } else if (req.body.year !== 'Year' && req.body.month === 'Month') {
                if (datePick.getFullYear() === item.createdAt.getFullYear()) {
                    allBill.push(item);
                    price = price + item.priceBill;
                    total = total + 1;
                }
            } else if (req.body.year !== 'Year' && req.body.month !== 'Month') {
                if (
                    datePick.getFullYear() === item.createdAt.getFullYear() &&
                    datePick.getMonth() === item.createdAt.getMonth()
                ) {
                    allBill.push(item);
                    price = price + item.priceBill;
                    total = total + 1;
                }
            } else if (req.body.date && req.body.year === 'Year' && req.body.month === 'Month') {
                if (
                    dateTemp.getFullYear() === item.createdAt.getFullYear() &&
                    dateTemp.getMonth() === item.createdAt.getMonth() &&
                    dateTemp.getDate() === item.createdAt.getDate()
                ) {
                    allBill.push(item);
                    price = price + item.priceBill;
                    total = total + 1;
                }
            } else {
                allBill.push(item);
                price = price + item.priceBill;
                total = total + 1;
            }
            // if (req.body.date) {
            //     if (req.body.type === 'month') {
            //         if (
            //             dateCheck.getFullYear() === item.createdAt.getFullYear() &&
            //             dateCheck.getMonth() === item.createdAt.getMonth()
            //         ) {
            //             allBill.push(item);
            //             total = total + 1;
            //             price = price + item.priceBill;
            //         }
            //     } else if (req.body.type === 'year') {
            //         if (dateCheck.getFullYear() === item.createdAt.getFullYear()) {
            //             allBill.push(item);
            //             total = total + 1;
            //             price = price + item.priceBill;
            //         }
            //     } else if (req.body.type === 'day') {
            //         if (
            //             dateCheck.getFullYear() === item.createdAt.getFullYear() &&
            //             dateCheck.getMonth() === item.createdAt.getMonth() &&
            //             dateCheck.getDate() === item.createdAt.getDate()
            //         ) {
            //             allBill.push(item);
            //             total = total + 1;
            //             price = price + item.priceBill;
            //         }
            //     }
            // } else {
            //     allBill.push(item);
            //     total = total + 1;
            //     if (item.isRejectBill == false) {
            //         price = price + item.priceBill;
            //     }
            // }
        });
        return res.status(200).json({ bills: allBill, total: total, price: price });
    },
    getAllBillWithUser: async (req, res) => {},
};

module.exports = billController;
