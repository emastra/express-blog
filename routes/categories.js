var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

router.get('/show/:category', function(req, res, next) {
  var posts = req.db.get('posts');
  posts.find({category: req.params.category}, {}, function(err, posts) {
    res.render('index', {
      title: "Blog App | " + req.params.category,
      posts: posts
    });
  });
});

router.get('/add', function(req, res, next) {
  res.render('addcategory', {
    title: "Add Categories",
    errors: [], // why need to add this?? Brad dont do it!!
  });
});

router.post('/add', function(req, res, next) {
  // get form values
  var name = req.body.name;
  // form validation
  req.checkBody('name','Name field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		res.render('addcategory',{
			"errors": errors,
      "title": title
		});
	} else {
		var categories = req.db.get('categories');
		categories.insert({
			"name": name
		}, function(err, post){
			if(err){
				res.send(err);
			} else {
				req.flash('success','Category Added');
				res.location('/');
				res.redirect('/');
			}
		});
  }
});

module.exports = router;
