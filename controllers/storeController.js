const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage:  multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto) {
			next(null, true); // callback 
		}
		else {
			next({message: "That filetype isn't allowed!"}, false);
		}
	}
}

exports.homePage = (req, res) => {
	// console.log(req.name);
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', {title: "Add Store"});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	// check if there is some file to resize
	if(!req.file) return next();

	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;

	const photo = await jimp.read(req.file.buffer); 
	// jimp a package based on Promise
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);

	next();
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

exports.getStoresBySlug = async (req, res, next) => {
	const store = await Store.findOne({ slug: req.params.slug });
	if(!store) return next();

	res.render('store', {title: store.name, store});
};

exports.getStoresByTag = async (req, res) => {
	const tag = req.params.tag;
	const tagQuery = tag || { $exists: true};

	const tagsPromise = Store.getTagsList();
	const storePromise = Store.find({ tags: tagQuery});
	const [tags, stores] = await Promise.all([tagsPromise, storePromise]);

	res.render('tag', {title: 'Tags', tags, stores, tag});
};