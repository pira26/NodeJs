const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
	created: {
		type: Date,
		defaut: Date.now
	},
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'Must supply an author!'
	},
	store: {
		type: mongoose.Schema.ObjectId,
		ref: 'Store',
		required: 'Must supply an store!'
	},
	text: {
		type: String,
		required: 'Review must have a text!'
	},
	rating: {
		type: Number,
		min: 1,
		max: 5
	}
});

function autopopulate(next) {
	this.populate('author');
	next();  
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);