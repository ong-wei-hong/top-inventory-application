var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');

router.get('/', function(req, res, next) {
	async.parallel({
		category_count: function(callback) {
			Category.countDocuments({}, callback);
		},
		item_count: function(callback) {
			Item.countDocuments({}, callback);
		}
	}, function(err, results){
		res.render('index', { title: 'Home', data: results, error: err});
	});
});

module.exports = router;
