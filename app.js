const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

const MongoClient = require('mongodb').MongoClient;

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');

const app = express();

// connect to mongoDB and make it available through out the app
MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true })
.then(client => {
  console.log('Connected to MongoDB server');
  let db = client.db('blogApp');
  // Make db accessible
  app.locals.db = db;
  // events for close and reconnect
  db.on('close', () => { console.log('Connection to MongoDB lost!'); });
  db.on('reconnect', () => { console.log('Reconnected to MongoDB'); });
}).catch(error => console.error(error));

// moment variable available globally in views
app.locals.moment = require('moment');
app.locals.truncateText = function(text, length) {
  return text.substring(0, length);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// MIDDLEWARE

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'dekhg37bufd',
    saveUninitialized: true,
    resave: true
}));

// Connect-Flash // requires session
app.use(flash());
// make flash messages available to views, if not present it's undefined
app.use(function (req, res, next) {
  res.locals.dangerMessages = req.flash('danger');
  res.locals.successMessages = req.flash('success');
  next();
});

// access to categories in res obj, valid only in res life cycle // must be before use() routers below
app.use(function(req, res, next) {
  let categories = req.app.locals.db.collection('categories');
  // mongodb driver returns a cursor, toArray() returns an array of the documents
  categories.find().toArray().then(function(cats) {
    res.locals.categories = cats;
    next();
  });
});


// ROUTES

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, provide error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
