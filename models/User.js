const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');
const validator = require('validator');

const userSchema = new Schema({
	email: { 
		type: String, 
		unique: true, 
		lowercase: true, 
		trim: true, 
		validate: [validator.isEmail, 'Invalid Email Address!'], 
		required: 'Supply an Email!'
	},
	name: {
		type: String,
		trim: true,
		required: 'Supply a Name!'
	}	
});

userSchema.virtual('gravatar').get(function(){
	const hash = md5(this.email);
	return `htpps://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);  