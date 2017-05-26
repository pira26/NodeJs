const passport = require('passport');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'Logged in!'
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out!');
	res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()) return next();
	req.flash('error', 'You must be logged in to do that!');

	res.redirect('/login');
};

exports.forgot = async (req, res) => {
	// check if email exists
	const user = await User.findOne({ email: req.body.email });
	if(!user) {
		req.flash('error', 'A password reset has been mailed to you ;)!');
		return res.redirect('/login');
	}

	// reset
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); // generate the string
	user.resetPasswordExpires = Date.now() + 3600000; // 1h from now
	await user.save();

	// send email with the token
	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	
	await mail.send({
		user,
		subject: 'Password Reset',
		filename: 'password-reset',
		resetURL
	});
	
	req.flash('success', 'You have been emailed a password reset link.');

	res.redirect('/login');  
};

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	
	if(!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	res.render('reset', {title: 'Reset your password'});

};

exports.confirmedPasswords = (req, res, next) => {
	if(req.body.password === req.body['password-confirm']) {
		return next(); 
	}

	req.flash('error', 'Password does not match!');
	res.redirect('back');
};

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});

	if(!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword, user);
	await setPassword(res.body.password);
	user.resetPasswordToken = undefined; 
	user.resetPasswordExpires = undefined;

	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Nice! Your password has been reset, you are now logged in!');
	res.redirect('/');
}