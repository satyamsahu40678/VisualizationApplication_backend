// controllers/shopifyController.js
const Customer = require('../models/customer');
const Order = require('../models/order');
const Product = require('../models/product');


exports.getCustomerLifetimeValue = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const customerLifetimeValue = await Customer.aggregate([
            {
                $match: {
                    $or: [
                        { first_name: { $regex: search, $options: 'i' } },
                        { last_name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'shopifyOrders',
                    localField: '_id',
                    foreignField: 'customer.id',
                    as: 'orders'
                }
            },
            { $unwind: { path: '$orders', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    firstName: { $first: '$first_name' },
                    lastName: { $first: '$last_name' },
                    email: { $first: '$email' },
                    totalSpent: { $sum: { $toDouble: '$orders.total_price' } },
                    ordersCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    totalSpent: 1,
                    avgLifetimeValue: {
                        $cond: { if: { $eq: ['$ordersCount', 0] }, then: 0, else: { $divide: ['$totalSpent', '$ordersCount'] } }
                    }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        res.json(customerLifetimeValue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGeoDistribution = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const geoDistribution = await Customer.aggregate([
            { $unwind: "$addresses" },
            { $group: { _id: "$addresses.city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        const total = await Customer.aggregate([
            { $unwind: "$addresses" },
            { $group: { _id: "$addresses.city" } }
        ]);

        res.json({
            data: geoDistribution,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total.length / limit),
                totalItems: total.length,
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// New Customers Over Time
exports.getNewCustomers = async (req, res) => {
    try {
        const newCustomers = await Customer.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: { $dateFromString: { dateString: "$created_at" } } },
                        year: { $year: { $dateFromString: { dateString: "$created_at" } } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.json(newCustomers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Repeat Customers
exports.getRepeatCustomers = async (req, res) => {
    try {
        const repeatCustomers = await Customer.aggregate([
            { $match: { orders_count: { $gt: 1 } } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } }
        ]);
        res.json(repeatCustomers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Sales Growth Rate
exports.getSalesGrowthRate = async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: { $dateFromString: { dateString: "$created_at" } } },
                        year: { $year: { $dateFromString: { dateString: "$created_at" } } }
                    },
                    totalSales: { $sum: { $toDouble: "$total_price" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const salesGrowthRate = salesData.map((current, index, array) => {
            const previous = array[index - 1];
            const growthRate = previous
                ? ((current.totalSales - previous.totalSales) / previous.totalSales) * 100
                : 0;
            return {
                month: current._id.month,
                year: current._id.year,
                totalSales: current.totalSales,
                growthRate: growthRate.toFixed(2) + "%"
            };
        });

        res.json(salesGrowthRate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sales Over Time
exports.getSalesOverTime = async (req, res) => {
    try {
        const salesOverTime = await Order.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: { $dateFromString: { dateString: "$created_at" } } },
                        year: { $year: { $dateFromString: { dateString: "$created_at" } } }
                    },
                    totalSales: { $sum: { $toDouble: "$total_price" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.json(salesOverTime);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};