//models/customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    _id: Number,
    first_name: String,
    last_name: String,
    email: String,
    orders_count: Number,
    total_spent: String,
    addresses: Array,
    default_address: Object,
    created_at: Date,
    updated_at: Date,
});

module.exports = mongoose.model('Customer', customerSchema, 'shopifyCustomers');