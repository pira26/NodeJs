const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
	// console.log(req.name);
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', {title: "Add Store"});
};

exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();
	req.flash('success', `Successfully Created ${store.name}. Care to leave a review ?`);
	res.redirect(`/store/${store.slug}`);
};

/* Same as 
exports.createStore = (req, res) => {
	const store = new Store(req.body);
	store
		.save()
		.then(store => {
			return Store.find();
		})
		.then(stores => {
			res.render('storeList', {stores: stores});
		})
		.catch(err => {
			throw Error(err);
		});
}
*/

exports.getStores = async (req, res) => {
	// query the db for a list of all stores
	const stores = await Store.find();
	//console.log(stores);
	res.render('stores', {title: 'Stores', stores});
};

exports.editStore = async (req, res) => {
	// find the given id
	const store = await Store.findOne({ _id: req.params.id });

	// confirm they are the owner of the store
	
	
	// update the store
	res.render('editStore', {title: `Edit ${store.name}`, store});
};

exports.updateStore = async (req, res) => {
	// set the location data to be a point
	req.body.location.type = 'Point';
	// find and update the store 
	const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true, // return the new store instead of the old one
		runValidators: true 
	}).exec();
	req.flash('success', `${store.name} has been successfully updated <a href="/stores/${store.slug}">View Store -> </a>`);

	res.redirect(`/stores/${store.id}/edit`); 
};