const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a title for the review'],
		maxlength: 100
	},
	text: {
		type: String,
		required: [true, 'Please add some text']
	},
	rating: {
		type: Number,
		required: [true, 'Please add a rating between 1 and 10.'],
		min: 1,
		max: 10
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
});

ReviewSchema.index(
	{
		bootcamp: 1,
		user: 1
	},
	{ unique: true }
); // User will only be able to add one review per bootcamp

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
	// Constructing an object with the id of the bootcamp and the average cost of all courses asociatted to that bootcamp
	// on match we specify a match for all the courses that should be averaged (this.aggregate refers to the coursesSchema)
	// All courses with the same bootcampId will be used to make the average
	// the group is the object that is going to be created, the _id is just the id and the average cost is doing an operation of avg on all the tuitions fields of all the courses taken by the bootcampId
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId }
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: { $avg: '$rating' }
			}
		}
	]);
	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: obj[0].averageRating
		});
	} catch (err) {
		console.error(err);
	}
};

// Call getAverageCost after save
ReviewSchema.post('save', function() {
	// As this is a static method for the Courses, we can use this.constructor to call it, and as we are doing this operation after saving the schema, bootcamp (id) is available for us to use
	this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageReview before remove
ReviewSchema.pre('remove', function() {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
