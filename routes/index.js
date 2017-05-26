const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers'); 
/*
router.get('/', (req, res) => {
  // res.send("Hey! It works!"");
  // res.send(req.query.name);
  // res.json(req.query);
  // const test = {name: "test", try: 1}
  // res.json(test);
  res.render('hello', {
  	name: req.query.name,
  	title : req.query.title
  });
});

router.get('/reverse/:name', (req, res) => {
	const reverse = [...req.params.name].reverse().join('');
	res.send(reverse);
});
*/
/* Basic Route */
router.get('/', catchErrors(storeController.getStores));

/* Stores Routes */
router.get('/stores', catchErrors(storeController.getStores));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

/* Store Route */
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

/* Add Route */
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post('/add', 
  storeController.upload, 
  catchErrors(storeController.resize), 
  catchErrors(storeController.createStore)
);

router.post('/add/:id', 
  storeController.upload, 
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

/* Tags Route */
router.get('/tags', catchErrors(storeController.getStoresByTag));

router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

/* Login Route */
router.get('/login', userController.loginForm);
router.post('/login', authController.login);

/* Register Route */
router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

/* Logout Route */
router.get('/logout', authController.logout);

/* Account Route */
router.get('/account', 
  authController.isLoggedIn, 
  userController.account
);
router.post('/account', catchErrors(userController.updateAccount));

/* Forgot Account Route */
router.post('/account/forgot', catchErrors(authController.forgot));

/* Reset Account Route */
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
  authController.confirmedPasswords, 
  catchErrors(authController.update)
);

module.exports = router;