const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/show/:category', function(req, res, next) {
  let category = req.params.category.charAt(0).toUpperCase() + req.params.category.slice(1);
  let posts = req.app.locals.db.collection('posts');

  posts.find({category: category}).toArray().then(function(posts) {
    res.render('index', {
      title: "Blog App | " + category,
      posts: posts
    });
  }).catch(function(err) {
    console.log(err);
    res.render('error', { message: err.message, error: err });
  });
});

router.get('/add', function(req, res) {
  res.render('addcategory', {
    title: "Add Categories",
    errors: [],
  });
});

router.post('/add', [
  check('name').not().isEmpty().withMessage('Name field is required'),
], function(req, res) {
  // get form values
  let name = req.body.name;

	// Check Errors
	const errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('addcategory',{
			errors: errors.array(),
      title: 'Add Categories'
		});
	} else {
		let categories = req.app.locals.db.collection('categories');
		categories.insert({
			name: name
		}).then(function(post){
      req.flash('success','Category Added');
      res.location('/');
      res.redirect('/');
		}).catch(function(err) {
      res.send(err);
    });
  }
});

module.exports = router;
