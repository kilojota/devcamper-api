const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a a course title']
	},
	description: {
		type: String,
		required: [true, 'Please add a description']
	},
	weeks: {
		type: String,
		required: [true, 'Please add a number of weeks']
	},
	tuition: {
		type: Number,
		required: [true, 'Please add a tuiton cost']
	},
	minimumSkill: {
		type: String,
		required: [true, 'Please add a minimum skill'],
		enum: ['beginner', 'intermediate', 'advanced']
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false
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
// Static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
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
				averageCost: { $avg: '$tuition' }
			}
		}
	]);
	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10
		});
	} catch (err) {
		console.error(err);
	}
};

// Call getAverageCost after save
CourseSchema.post('save', function() {
	// As this is a static method for the Courses, we can use this.constructor to call it, and as we are doing this operation after saving the schema, bootcamp (id) is available for us to use
	this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function() {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
