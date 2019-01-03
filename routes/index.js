var express = require('express');
var router = express.Router();

// var mongo = require('mongodb');
// var db = require('monk')('localhost/blogApp');

/* GET home page. */
router.get('/', function(req, res, next) {
  var db = req.app.locals.db;
  var posts = db.collection('posts');

  posts.find().toArray().then(function(posts) {
    res.render('index', { posts: posts, title: "Blog App" });
  }).catch(function(err) {
    console.log(err);
    res.render('error', { message: err.message, error: err });
  });

});

module.exports = router;
