var express = require('express');
var router = express.Router();
// var multer = require('multer');
// var upload = multer({ dest: 'public/uploads/' });

router.get('/show/:category', function(req, res, next) {
  var category = req.params.category.charAt(0).toUpperCase() + req.params.category.slice(1);
  var posts = req.app.locals.db.collection('posts');

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
  console.log('yay in res.locals!!', res.locals);
  res.render('addcategory', {
    title: "Add Categories",
    errors: [], // why need to add this?? Brad dont do it!!
  });
});

router.post('/add', function(req, res) {
  // get form values
  var name = req.body.name;
  // form validation
  req.checkBody('name','Name field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		res.render('addcategory',{
			errors: errors,
      title: title
		});
	} else {
		var categories = req.app.locals.db.collection('categories');
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
