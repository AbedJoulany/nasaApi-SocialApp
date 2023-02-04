var express = require('express');
var router = express.Router();
const Cookies = require('cookies');
const dbModels = require('../models');
// Optionally define keys to sign cookie values
// to prevent client tampering
const keys = ['keyboard cat']
// load the controllers
const apiController = require('../controller/api');

/**
 * router to add comment to the db
 */
router.post('/addComment', apiController.addComment);

/**
 * router to delete comments from db
 */
router.delete('/deleteComment/:picId/:id', apiController.deleteComment);
/**
 * router to get all comments
 */
router.post('/getComments', apiController.getAllComments);

module.exports = router;
