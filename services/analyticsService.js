const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');
const Product = require('../models/productModel');

exports.getSalesOverview = async () => {
    const salesData = await Order.aggregate([
        { $group: { _id: { month: { $month: "$created_at" }, year: { $year: "$created_at" } }, totalSales: { $sum: "$total_price" }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    return salesData;
};

exports.getTopSellingProducts = async () => {
    const topProducts = await Product.aggregate([
        { $unwind: "$variants" },
        { $group: { _id: "$title", totalSold: { $sum: "$variants.inventory_quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
    ]);
    return topProducts;
};

exports.getCustomerGrowth = async () => {
    const customerGrowth = await Customer.aggregate([
        { $group: { _id: { month: { $month: "$created_at" }, year: { $year: "$created_at" } }, newCustomers: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    return customerGrowth;
};
