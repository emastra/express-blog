const express = require('express');
const router = express.Router();

// GET home page
router.get('/', function(req, res, next) {
  let db = req.app.locals.db;
  let posts = db.collection('posts');

  posts.find().toArray().then(function(posts) {
    res.render('index', { posts: posts, title: "Blog App" });
  }).catch(next);

});

module.exports = router;
