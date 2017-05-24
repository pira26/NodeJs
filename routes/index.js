const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
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

router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));


router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.post('/add/:id', catchErrors(storeController.updateStore));

module.exports = router;
