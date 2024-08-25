// routes/shopifyRoutes.js
const express = require('express');
const {
    getCustomerLifetimeValue,
    getGeoDistribution,
    getNewCustomers,
    getRepeatCustomers,
    getSalesGrowthRate,
    getSalesOverTime
} = require('../controllers/shopifyController');

const router = express.Router();

router.get('/customer-lifetime-value', getCustomerLifetimeValue);
router.get('/geo-distribution', getGeoDistribution);
router.get('/new-customers', getNewCustomers);
router.get('/repeat-customers', getRepeatCustomers);
router.get('/sales-growth-rate', getSalesGrowthRate);
router.get('/sales-over-time', getSalesOverTime);

module.exports = router;