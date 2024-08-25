// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    _id: Number,
    title: String,
    product_type: String,
    vendor: String,
    variants: Array,
    status: String,
});

module.exports = mongoose.model('Product', productSchema, 'shopifyProducts');  // Third parameter is the collection name