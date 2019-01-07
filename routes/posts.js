const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const ObjectId = require('mongodb').ObjectID;
const { check, validationResult } = require('express-validator/check');


router.get('/add', function(req, res, next) {
  res.render('addpost', {
    title: "Add Posts",
    errors: [] // why need to add this?? Brad dont do it!!
  });
});

router.post('/add', upload.single('mainimage'), [
  check('title').not().isEmpty().withMessage('Title field is required'),
  check('body').not().isEmpty().withMessage('Body field is required')
], function(req, res, next) {
  // get form values
  let title = req.body.title;
  let category = req.body.category;
  let body = req.body.body;
  let author = req.body.author;
  let date = new Date();

  console.log('REQFILE', req.file);
  if (req.file) {
    var mainimage = req.file.filename;
  } else {
    var mainimage = 'noimage.jpg';
  }

	// Check Errors
  const errors = validationResult(req);

	if(!errors.isEmpty()){
    console.log('INSIDE ERRORS');
		res.render('addpost',{
			errors: errors.array(),
      title: '',
      categories: res.locals.categories
		});
	} else {
		let posts = req.app.locals.db.collection('posts');
		posts.insertOne({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainimage
		}).then(function() {
      req.flash('success','Post Added');
			res.location('/');
			res.redirect('/');
    }).catch(function(err) {
      console.log('catch in POST posts/add');
      res.send(err);
    });
  }
});

router.get('/show/:id', function(req, res) {
  let id = req.params.id;
  let posts = req.app.locals.db.collection('posts');

  posts.findOne({_id: new ObjectId(id)}).then(function(post) {
    res.render('show', {
      title: "Blog App | " + post.title,
      post: post,
      errors: ""
    });
  }).catch(function(err) {
    res.send(err);
  })
});

router.post('/addcomment', [
  check('name').not().isEmpty().withMessage('Name field is required'),
	check('email').not().isEmpty().withMessage('Email field is required'),
  check('email').isEmail().withMessage('Email is not formatted properly'),
  check('body', '').not().isEmpty().withMessage('Body field is required')
], function(req, res) {
  // get form values
  let name = req.body.name;
  let email = req.body.email;
  let body = req.body.body;
  let commentDate = new Date();
  let postId = req.body.postid;

  // form validation

	// Check Errors
	const errors = validationResult(req);

	if (!errors.isEmpty()){
    let posts = req.app.locals.db.collection('posts');
    posts.findOne({_id: new ObjectId(postId)}).then(function(post) {
      res.render('show', {
  			errors: errors.array(),
        title: "Blog App | " + post.title,
        post: post
  		});
    });
	} else {
		let comment = {
      name,
      email,
      body,
      commentDate
    }
    let posts = req.app.locals.db.collection('posts');
    posts.updateOne({_id: new ObjectId(postId)}, {
      $push: {
        comments: comment
      }
    }).then(function(doc) {
      req.flash('success', 'Comment added');
      res.location('/posts/show/'+postId);
      res.redirect('/posts/show/'+postId);
    }).catch(function(err) {
      res.send(err);
    });
  }
});

module.exports = router;
