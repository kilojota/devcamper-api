const express = require('express');
const { getReviews } = require('../controllers/reviews');

const Review = require('../models/Review');
const router = express.Router({ mergeParams: true }); // Merge params is used to allow the re-routing of requests

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
router.route('/').get(advancedResults(Review, { path: 'bootcamp', select: 'name description' }), getReviews);

module.exports = router;
