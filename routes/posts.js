var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

/* GET users listing. */
router.get('/add', function(req, res, next) {
  var categories = req.db.get('categories');
  categories.find({}, {}, function(err, categories) {
    res.render('addpost', {
      title: "Add Posts",
      errors: [], // why need to add this?? Brad dont do it!!
      categories: categories
    });
  });
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  if (req.file) {
    var mainimage = req.file.filename;
  } else {
    var mainimage = 'noimage.jpg';
  }

  // form validation
  req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		res.render('addpost',{
			"errors": errors,
      "title": title,
      categories: []
		});
	} else {
		var posts = req.db.get('posts');
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainimage
		}, function(err, post){
			if(err){
				res.send(err);
			} else {
				req.flash('success','Post Added');
				res.location('/');
				res.redirect('/');
			}
		});
  }
});

router.get('/show/:id', function(req, res) {
  var id = req.params.id;
  var posts = req.db.get('posts');
  console.log(posts);

  posts.findOne({_id: id}, function(err, post) {
    res.render('show', {
      title: "Blog App | " + post.title,
      post: post,
      errors: ""
    })
  });
});

router.post('/addcomment', function(req, res) {
  // get form values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var commentDate = new Date();
  var postId = req.body.postid;

  // form validation
  req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required, but never displayed').notEmpty();
  req.checkBody('email', 'Email is not formatted properly').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if (errors){
    var posts = req.db.get('posts');
    posts.findOne({_id: postId}, function(err, post) {
      res.render('show', {
  			"errors": errors,
        title: "Blog App | " + post.title,
        "post": post
  		});
    });
	} else {
		var comment = {
      name,
      email,
      body,
      commentDate
    }
    var posts = req.db.get('posts');
    posts.update({
      _id: postId
    }, {
      $push: {
        comments: comment
      }
    }, function(err, doc) {
      if (err) throw err;
      req.flash('success', 'Comment added');
      res.location('/posts/show/'+postId);
      res.redirect('/posts/show/'+postId);
    })
  }
});

module.exports = router;
