const dbModels = require('../models');
var Cookies = require('cookies');
const keys = ['keyboard cat']
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var showError = false;
// the controllers folder allows us to separate the logic from the routes.
// this is a good practice because it allows us to reuse the logic in multiple routes.
// note that this controller returns HTML only! it sometimes also redirects to other routes.
// if it was a REST API, it would return JSON.
// pay attention NOT TO MIX HTML and JSON in the same controller.

/**
 * function to save user in db
 * @param req
 * @param res
 * @param next
 */
exports.addUser = (req, res, next) => {

    const cookies = new Cookies(req, res, { keys: keys })
    // Get the cookie
    const lastVisit = cookies.get('LastVisit', { signed: true })
    // ---------- checking if cookies expired before rendering login page ----------//
    // ----------  if cookies expired redirecting to register page -------------------//
    if (!lastVisit) {
        req.session.showMsg = true;
        req.session.Msg = "You should complete registration in 30 seconds";
        res.redirect('/register')
    }
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
    let u = dbModels.User.build({
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        password: hash,
        email: req.session.email });

    // ----------  if cookies not expired redirecting to login page -------------------//
    return u.save()
        .then((contact) =>
        {
            req.session.showMsg = true;
            req.session.Msg = "Registration is successful";
            res.redirect('/')
        })
        .catch((err) => {
            req.session.showMsg = true;
            req.session.Msg = `input validation error: ${err}`;
            res.redirect('/')
        })
};
/**
 * function to check login for user
 * @param req
 * @param res
 * @param next
 */
exports.checkLogin = (req, res, next) => {

    dbModels.User.findOne({
        where: {
            email: req.body.Email,
        }
    }).then(user => {
        if (user === null)
            throw `Email not registered`
        if(bcrypt.compareSync(req.body.Password, user.password)) {
            req.session.email = user.email;
            req.session.userId = user.id;
            req.session.firstName = user.firstName;
            req.session.lastName = user.lastName;
            req.session.loggedIn = true;
            res.redirect('/nasa');
        } else {
            throw `Password isn't correct`;
        }

    }).catch(err => {
        req.session.showMsg = true;
        req.session.Msg = err;
        res.redirect('/');
    });
};
/**
 * function to check registration of the suer
 * @param req
 * @param res
 * @param next
 */
exports.checkRegistration = (req, res, next) => {

    // ---------- defining cookies when entering password page with max age of 60 seconds -------//
    const cookies = new Cookies(req, res, {keys: keys})

    //-----------------------------------------------------------------------------//
    dbModels.User.findOne({
        where: {
            email: req.body.Email_address,
        }
    }).then(user => {
        if (user == null)
            throw "Email not found"
        showError = true;
        req.session.showMsg = true;
        req.session.Msg = "Email is already registered!"
        res.redirect('/register');

    }).catch(err => {
        req.session.email = req.body.Email_address;
        req.session.firstName = req.body.First_name;
        req.session.lastName = req.body.Last_name;
        cookies.set('LastVisit', new Date().toISOString(), {signed: true, maxAge: 30 * 1000});
        res.redirect('/register/password');
    });
};

/**
 * function to render the password page
 * @param req
 * @param res
 * @param next
 */
exports.getPasswordPage = (req, res, next) => {

    const cookies = new Cookies(req, res, {keys: keys})
    const lastVisit = cookies.get('LastVisit', { signed: true })

    if (!lastVisit) {
        res.redirect('/register');
    }
    else {
        //-----------------------------------------------------------------------------//
        res.render('password', {title: 'password page'});
    }

};
/**
 * function to handle logout of the user
 * @param req
 * @param res
 * @param next
 */
exports.logout = (req, res, next) => {
    req.session.destroy(function(err) {
        if(err) {
            return next(err);
        } else {
            req.session = null;
            return res.redirect('/');
        }
    });
};

