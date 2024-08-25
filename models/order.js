//models/order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    _id: Number,
    total_price: String,
    subtotal_price: String,
    total_tax: String,
    financial_status: String,
    created_at: Date,
    customer: Object,
    line_items: Array,
    updated_at: Date,
});

module.exports = mongoose.model('Order', orderSchema, 'shopifyOrders');