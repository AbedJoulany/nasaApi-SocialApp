var express = require('express');
var router = express.Router();
const Cookies = require('cookies');

// Optionally define keys to sign cookie values
// to prevent client tampering
const keys = ['keyboard cat']

// load the controllers
const usersController = require('../controller/users');

/* GET home page. */
/**
 * function to render the index page
 */
router.get('/', function(req, res, next) {

  if (req.session.loggedIn === true)
  {
    res.redirect('/nasa');
  }
  else if(req.session.showMsg)
  {
    req.session.showMsg = false;
    res.render('index', {title: 'login page', showError: true, errorMsg: req.session.Msg});
  }
  else{
    res.render('index', {title: 'login page', showError: false, errorMsg: ''});
  }

});

/* post to verify login. */
router.post('/login', usersController.checkLogin);

/* redirect to home page. */
router.get('/login', function (req, res, next) {
    res.redirect('/');
});


/* redirect to home page. */
router.get('/logout', usersController.logout);
/**
 * render the register page
 */
router.get('/register', function(req, res, next) {

  if(req.session.showMsg)
  {
    req.session.showMsg = false;
    res.render('register', {title: 'Register page', showError: true, errorMsg: req.session.Msg});
  }
  else{
    res.render('register', {title: 'Register page', showError: false, errorMsg: req.session.Msg});
  }
});
/**
 * verify login of the user
 */
router.post('/register/verify-registration', usersController.checkRegistration);

/* get password, redirect to register page*/
router.get('/register/password', usersController.getPasswordPage);

/**
 * adding user to the db
 */
router.post('/register/password/add-user', usersController.addUser);


router.get('/register/password/add-user', function(req, res, next) {
  res.redirect('/');
});


/* GET nasa api, redirect to login*/
router.get('/nasa', function (req, res, next) {
  if (req.session.loggedIn ===true)
    res.render('nasaApi', {title: 'nasa api', fname: req.session.firstName, lname: req.session.lastName});
  else
    res.redirect('/');
});

module.exports = router;
