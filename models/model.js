const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
    {
        nameKH: {
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
            default: '',
        },
        description: {
            type: String,
            default: '',
            require: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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
    imageURL: {
        type: String,
        default: '',
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
        required: true,
        default: '',
    },
    priceC: {
        type: Number,
        required: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    imgUrlZoom: {
        type: String,
        required: true,
        default: '',
    },
    type: {
        type: String,
        required: true,
        default: '',
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
