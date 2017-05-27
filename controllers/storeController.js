const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
	req.body.author = req.user._id;

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
	const page = req.params.page || 1;
	const limit = 4;
	const skip = (page * limit) - limit; 

	const storesPromise = Store
		.find()
		.skip(skip)
		.limit(limit)
		.sort({ created: 'desc' });
	
	const countPromise = Store.count();

	const [stores, count] = await Promise.all([storesPromise, countPromise]);

	const pages = Math.ceil(count / limit);

	if(!stores.length && skip) {
		req.flash('info', `You asked for page ${page}. But it doesn't exist. So I redirected you on page ${pages}`);
		res.redirect(`/stores/page/${page}`);
		return;
	}

	res.render('stores', { title: 'Stores', stores, page, pages, count });
};

const confirmOwner = (store, user) => {
	if(!store.author.equals(user._id)) {
		throw Error('Must own a store in order to edit it!');
	}
};

exports.editStore = async (req, res) => {
	// find the given id
	const store = await Store.findOne({ _id: req.params.id });

	// confirm they are the owner of the store
	confirmOwner(store, req.user);
	
	// update the store
	res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
	// set the location data to be a point
	req.body.location.type = 'Point';
	// find and update the store 
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true, // return the new store instead of the old one
		runValidators: true 
	}).exec();
	req.flash('success', `${store.name} has been successfully updated <a href="/stores/${store.slug}">View Store -> </a>`);

	res.redirect(`/stores/${store.id}/edit`); 
};

exports.getStoresBySlug = async (req, res, next) => {
	const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
	if(!store) return next();

	res.render('store', { title: store.name, store });
};

exports.getStoresByTag = async (req, res) => {
	const tag = req.params.tag;
	const tagQuery = tag || { $exists: true};

	const tagsPromise = Store.getTagsList();
	const storePromise = Store.find({ tags: tagQuery });
	const [tags, stores] = await Promise.all([ tagsPromise, storePromise ]);

	res.render('tag', { title: 'Tags', tags, stores, tag });
};

exports.searchStores = async (req, res) => {
	// Find matches
	const stores = await Store.find({
		$text: {
			$search: req.query.q
		}
	}, 
	{
		score: {
			$meta: 'textScore'
		}
	})

	// Then sort them and limited to 5
	.sort({
		score: {
			$meta: 'textScore'
		}
	})
	.limit(5);

	res.json(stores);

};

exports.mapStores = async (req, res) => {
	const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
	const q = {
		location: {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates
				},
				$maxDistance: 10000 // 10km 
			}
		}
	};

	const stores = await Store.find(q).select('slug name description location photo').limit(10);
	res.json(stores);
};

exports.mapPage = (req, res) => {
	res.render('map', { title: 'Map' });
}

exports.heartStore = async (req, res) => {
	const hearts = req.user.hearts.map(obj => obj.toString());
	const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
	const user = await User.
		findByIdAndUpdate(req.user._id, { 
			[operator]: {
				hearts: req.params.id 
			} 
		},
		{
			new: true
		}
	);
	res.json(user);
};

exports.getHearts = async (req, res) => {
	const stores = await Store.find({
		_id: { $in: req.user.hearts }
	});
	res.render('stores', { title: 'Hearted Sotres', stores });
};

exports.getTopStores = async (req, res) => {
	const stores = await Store.getTopStores();
	res.render('topStores', { title: 'Top Stores', stores });
};