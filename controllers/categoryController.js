var Category = require('../models/category');
var Item = require('../models/item');

var async = require('async');
var { body, validationResult } = require('express-validator');

exports.index = function(req, res, next) {
	Category.find()
	.sort({ name: 1 })
	.exec(function(err, categories){
		if(err) { return next(err); }
		res.render('category_index', { title: 'Category Index', categories: categories })
	});
};

exports.new = function(req, res, next) {
	res.render('category_new', { title: 'New Category' })
}

exports.create = [
	body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
	body('description', 'Category description required').trim().isLength( { min: 1 }).escape(),
	function(req, res, next) {
		const errors = validationResult(req);
		var category = new Category({ name: req.body.name, description: req.body.description });
		if(!errors.isEmpty()) {
			res.render('category_new', {
				title: 'New Category',
				errors: errors.array(),
				prev_name: req.body.name,
				prev_description: req.body.description,
				alert: 'Unable to save category due to errors below'
			});
			return;
		}

		Category.findOne({ name: req.body.name })
		.exec(function(err, found_category) {

			if(found_category) {
				Item.find({ category: found_category})
				.exec(function(er, items) {
					if(er) { return next(er); }
					res.render('category_show', {
						title: found_category.name,
						category: found_category,
						items: items,
						alert: 'Category already exists' });
					return;
				})
			}else{
				category.save(function(er) {
					if(er) { return next(er); }
					res.render('category_show', { title: category.name, category: category, notice: 'Category created', items:[] });
				});
			}
		});
	}
]

exports.show = function(req, res, next) {
	async.parallel({
		category: function(callback) {
			Category.findById(req.params.id)
			.exec(callback);
		},
		items: function(callback) {
			Item.find({category: req.params.id})
			.exec(callback);
		}
	}, function(err, results) {
		if(err) { return next(err); }
		if (results.category == null) {
			var err = ('Category not found');
			err.status = 404;
			return next(err);
		}
		res.render('category_show', { title: results.category.name, category: results.category, items: results.items });
	});
}

exports.delete_get = function(req, res, next) {
	async.parallel({
		category: function(callback) {
			Category.findById(req.params.id)
			.exec(callback);
		},
		items: function(callback) {
			Item.find({category: req.params.id})
			.exec(callback);
		}
	}, function(err, results) {
		if(err) { return next(err); }
		if (results.category == null) {
			var err = new Error('Category not found');
			err.status = 404;
			return next(err);
		}
		res.render('category_delete', { title: results.category.name, category: results.category, items: results.items });
	});
}

exports.delete_post = function(req, res, next) {
	async.parallel([
		function(callback){
			Category.findByIdAndRemove(req.body.id, callback)
		},
		function(callback){
			Item.deleteMany({ category: req.body.id }, callback)
		}
	], function(err, results){
		if(err) { return next(err); }

		async.parallel({
			category_count: function(callback) {
				Category.countDocuments({}, callback);
			},
			item_count: function(callback) {
				Item.countDocuments({}, callback);
			}
		}, function(err, results){
			res.render('index', { title: 'Home', data: results, notice: 'Category deleted', error:err })
		});
	})

}

exports.edit = function(req, res, next) {
	Category.findById(req.params.id).exec(function(err, category) {
		if(err) { return next(err); }
		if(category == null) {
			var err = new Error('Category not found');
			err.status = 404;
			return next(err);
		}
		res.render('category_edit', { title: category.name, category: category, name: category.name, description: category.description })
	})
}

exports.update = [
	body('name', 'Category name required').trim().isLength({ min: 1}).escape(),
	body('description', 'Category description required').trim().isLength({ min: 1 }).escape(),
	function(req, res, next) {
		const errors = validationResult(req);
		Category.findById(req.params.id).exec(function(err, original_category) {
			console.log(original_category.update_url)
			if(err) { return next(err); } else
			if(!errors.isEmpty()) {
				res.render('category_edit', {
					title: original_category.name,
					category: original_category,
					alert: 'Unable to update category due to errors below',
					errors: errors.array(),
					name: req.body.name,
					description: req.body.description
				})
			}else{
				Category.findOne({ name: req.body.name }).exec(function(err, found_category){
					if(err) { return next(err)} else
					if((found_category != null) && (found_category._id.toString() != req.params.id)){
						Item.find({ category: found_category }).exec(function(err, items) {
							if(err) { return next(err); }
							res.render('category_show', {
								title: found_category.name,
								category: found_category,
								items: items,
								alert: 'Category already exists'
							});
						});
					} else {
						async.series({
							update_category: function(callback) {
								Category.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description}, callback)
							},
							items: function(callback) {
								Item.find({category: req.params.id}).exec(callback)
							},
							category: function(callback) {
								Category.findById(req.params.id).exec(callback);
							}
						}, function(err, results) {
							if(err) { return next(err); }
							res.render('category_show', {
								title: results.category.name,
								category: results.category,
								items: results.items,
								notice: 'Category updated'
							})
						})
					}
				});
			}
		});
	}
]
