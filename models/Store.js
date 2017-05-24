const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {type: String, trim: true, required: "Please enter a valid name!"},
	slug: String,
	description: {type: String, trim: true},
	tags: [String],
	created: {type: Date, default: Date.now},
	location: {
		type: {type: String, default: 'Point'}, 
		coordinates: [{type: Number, required: "Must supply coordinates!"}], 
		address: {type: String, required: "Must supply an address!"} 
	}
});

storeSchema.pre('save', function(next) {
	if(!this.isModified('name')) {
		return next(); // same as:
		// next(); skip it
		// return; stop this function from running
	}
	this.slug = slug(this.name);
	next();
})

module.exports = mongoose.model('Store', storeSchema);