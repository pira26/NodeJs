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

router.get('/', catchErrors(storeController.getStores));

router.get('/stores', catchErrors(storeController.getStores));

router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post('/add', 
  storeController.upload, 
  catchErrors(storeController.resize), 
  catchErrors(storeController.createStore)
);


router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.post('/add/:id', 
  storeController.upload, 
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));

router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

module.exports = router;