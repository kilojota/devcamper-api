const express = require('express');
const { getUsers, getUser, updateUser, createUser, deleteUser } = require('../controllers/users');

const User = require('../models/User');
const router = express.Router({ mergeParams: true }); // Merge params is used to allow the re-routing of requests
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // all below this wil use protect
router.use(authorize('admin')); // all below this wil use protect

router
	.route('/')
	.get(advancedResults(User), getUsers)
	.post(createUser);
router
	.route('/:id')
	.get(getUser)
	.put(updateUser)
	.delete(deleteUser);
module.exports = router;
