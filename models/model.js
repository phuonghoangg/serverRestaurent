const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
    {
        nameHD: {
            type: String,
            default: '',
            require: true,
        },
        mailKH: {
            type: String,
            default: '',
            require: true,
        },
        phone: {
            type: String,
            default: '',
            require: true,
        },
        priceBill: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            default: '',
            require: true,
        },
        isDishOut: {
            type: Boolean,
            default: false,
        },
        isActiveBill: {
            type: Boolean,
            default: false,
        },
        isFailBill: {
            type: Boolean,
            default: false,
        },
        isRejectBill: {
            type: Boolean,
            default: false,
        },
        numberTable: {
            type: String,
            default: '',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        userActive: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        chefActive: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        userPlaced: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        userTakeMoney: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            default: 'DON_MOI', //DON_DA_XAC_NHAN || BEP_XAC_NHAN || NHAN_VIEN_NHAN_MON || DA_THANH_TOAN || HUY_DON
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
    },
    { timestamps: true },
);

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        default: '',
        unique: true,
    },

    username: {
        type: String,
        required: true,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },

    password: {
        type: String,
        required: true,
        default: '',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'customer', //customer/cashier/chef
    },
    imageURL: {
        type: String,
        default: '',
    },
    stage: {
        type: String,
        default: '', //STAGE_1 tu ban 1->6
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],
    bills: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bill',
        },
    ],
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: '',
    },
    description: {
        type: String,
        required: true,
        default: '',
    },
    price: {
        type: String,
        default: '',
    },
    priceC: {
        type: Number,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    imgUrlZoom: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        required: true,
        default: '',
    },
    ingredient: {
        type: String,
        default: '',
    },
    isDelete: {
        type: String,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bills: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bill',
        },
    ],
});
let Product = mongoose.model('Product', productSchema);
let User = mongoose.model('User', userSchema);
let Bill = mongoose.model('Bill', billSchema);
module.exports = { Product, User, Bill };
