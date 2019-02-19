const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const ObjectId = require('mongodb').ObjectID;
const { check, validationResult } = require('express-validator/check');

// PROMISES ERROR HANDLING
// .catch(next); // cambia dappertutto!!!!!!!!!


router.get('/add', function(req, res, next) {
  res.render('addpost', {
    title: 'Add Posts'
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

  if (req.file) {
    var mainimage = req.file.filename;
  } else {
    var mainimage = 'noimage.jpg';
  }

	// Check Errors
  const errors = validationResult(req);

	if(!errors.isEmpty()){
    errors.array().forEach(function(error) {
      req.flash('danger', error);
    });
    res.redirect('/posts/add');
	} else {
		let posts = req.app.locals.db.collection('posts');
		posts.insertOne({
			title: title,
			body: body,
			category: category,
			date: date,
			author: author,
			mainimage: mainimage
		}).then(function() {
      req.flash('success','Post Added');
			res.redirect('/');
    }).catch(next);
  }
});

router.get('/show/:id', function(req, res, next) {
  let id = req.params.id;
  let posts = req.app.locals.db.collection('posts');

  posts.findOne({_id: new ObjectId(id)}).then(function(post) {
    res.render('show', {
      title: 'Blog App | ' + post.title,
      post: post,
      errors: ''
    });
  }).catch(next);
});

router.post('/addcomment', [
  check('name').not().isEmpty().withMessage('Name field is required'),
	check('email').not().isEmpty().withMessage('Email field is required'),
  check('email').isEmail().withMessage('Email is not formatted properly'),
  check('body').not().isEmpty().withMessage('Body field is required')
], function(req, res, next) {
  // get form values
  let name = req.body.name;
  let email = req.body.email;
  let body = req.body.body;
  let commentDate = new Date();
  let postId = req.body.postid;

	// Check Errors
	const errors = validationResult(req);

	if (!errors.isEmpty()){
    let posts = req.app.locals.db.collection('posts');
    posts.findOne({_id: new ObjectId(postId)}).then(function(post) {
      res.render('show', {
  			errors: errors.array(),
        title: 'Blog App | ' + post.title,
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
      res.redirect('/posts/show/' + postId);
    }).catch(next);
  }
});

module.exports = router;
