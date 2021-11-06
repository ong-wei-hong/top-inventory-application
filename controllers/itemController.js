var Item = require('../models/item');
var Category = require('../models/category');

var async = require('async');
var { body, validationResult } = require('express-validator')

exports.index = function(req, res, next) {
	Item.find()
	.sort({ name: 1 })
	.exec(function(err, items) {
		if(err) { return next(err); }
		res.render('item_index', { title: 'Item Index', items: items })
	});
};

exports.new = function(req, res, next) {
	Category.find()
	.sort({ name: 1 })
	.exec(function(err, categories) {
		if(err) { return next(err); }
		res.render('item_new', { title: 'New Item', categories: categories });
	});
}

exports.create = [
	body('name', 'Item name required').trim().isLength({ min: 1 }).escape(),
	body('description', 'Item description required').trim().isLength({ min: 1}).escape(),
	body('price', 'Item price must be an integer at least 0').trim().isInt({ min: 0 }),
	body('category').escape(),
	body('quantity', 'Item quantity must be an integer at least 0').trim().isInt({ min: 0 }),
	function(req, res, next){
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			Category.find().sort({name: 1}).exec(function(err, categories) {
				if(err) { return next(err) }
				res.render('item_new',
				{
					title: 'New Item',
					categories: categories,
					prev_name: req.body.name,
					prev_description: req.body.description,
					prev_category: req.body.category,
					prev_price: req.body.price,
					prev_quantity: req.body.quantity,
					alert: 'Unable to save item due to errors below',
					errors: errors.array()
				})
			})
		}else{
			Item.findOne({ name: req.body.name })
			.populate('category')
			.exec(function(err, found_item){
				if(found_item!=null) {
					if(err) { return next(err); }
					res.render('item_show', {
						title: found_item.name,
						item: found_item,
						alert: 'Item already exists'
					});
				}else{
					var item = new Item({
						name: req.body.name,
						description: req.body.description,
						category: req.body.category,
						price: req.body.price,
						quantity: req.body.quantity
					});
					item.save(function(er) {
						if(er) { return next(er); }
						Item.findOne({name: req.body.name}).populate('category').exec(function(e, saved_item) {
							if(e) { return next(e); }
							res.render('item_show', { title: saved_item.name, item: saved_item, notice:'Item saved' })
						});
					});
				}
			});
		}
	}
]

exports.show = function(req, res, next) {
	Item.findById(req.params.id)
	.populate('category')
	.exec(function(err, item) {
		if(err) { return next(err); }
		res.render('item_show', { title: item.name, item: item });
	});
}

exports.delete_get = function(req, res, next) {
	Item.findById(req.params.id)
	.exec(function(err, item){
		if(err) { return next(err); }
		if(item == null){
			var err = new Error('item does not exists');
			err.status = 404;
			return next(err);
		}
		res.render('item_delete', { title: item.name, item: item })
	})
}

exports.delete_post = function(req, res, next) {
	Item.findByIdAndRemove(req.body.id, function(err) {
		if(err) { return next(err); }
		async.parallel({
			category_count: function(callback) {
				Category.countDocuments({}, callback);
			},
			item_count: function(callback) {
				Item.countDocuments({}, callback);
			}
		}, function(err, results){
			res.render('index', { title: 'Home', data: results, notice: 'Item deleted', error:err })
		});
	})
}

exports.edit = function(req, res, next) {
	async.parallel({
		categories: function(callback) {
			Category.find().sort({ name: 1}).exec(callback)
		},
		item: function(callback) {
			Item.findById(req.params.id).exec(callback)
		}
	}, function(err, results) {
		if(err) { return next(err); }
		if(results.item == null) {
			var err = new Error('Item not found');
			err.status = 404;
			return next(err);
		}
		res.render('item_edit', {
			title: results.item.name,
			item: results.item,
			name: results.item.name,
			description: results.item.description,
			categories: results.categories,
			item_category: results.item.category,
			price: results.item.price,
			quantity: results.item.quantity
		})
	})
}

exports.update = [
	body('name', 'Item name required').trim().isLength({ min: 1 }).escape(),
	body('description', 'Item description required').trim().isLength({ min: 1}).escape(),
	body('price', 'Item price must be an integer at least 0').trim().isInt({ min: 0 }),
	body('category').escape(),
	body('quantity', 'Item quantity must be an integer at least 0').trim().isInt({ min: 0 }),
	function(req, res, next){
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			async.parallel({
				categories: function(callback) {
					Category.find().sort({ name: 1}).exec(callback)
				},
				item: function(callback) {
					Item.findById(req.params.id).exec(callback)
				}
			}, function(err, results) {
				if(err) { return next(err); }
				if(results.item == null) {
					var err = new Error('Item not found');
					err.status = 404;
					return next(err);
				}
				res.render('item_edit', {
					title: results.item.name,
					item: results.item,
					name: req.body.name,
					description: req.body.desscription,
					categories: results.categories,
					item_category: req.body.category,
					price: req.body.price,
					quantity: req.body.quantity,
					errors: errors.array(),
					alert:'Unable to update item due to errors below'})
			});
		} else {
			Item.findOne({ name: req.body.name }).populate('category').exec(function(err, found_item){
				if(err) { return next(err) }else
				if((found_item != null) && (found_item._id != req.params.id)){
					res.render('item_show', {
						title: found_item.name,
						item: found_item,
						alert: 'Item already exists'
					});
				}else{
					async.series({
						update_item: function(callback) {
							Item.findByIdAndUpdate(req.params.id, {
								name: req.body.name,
								description: req.body.description,
								category: req.body.category,
								price: req.body.price,
								quantity: req.body.quantity
							}, callback);
						},
						item: function(callback) {
							Item.findById(req.params.id).populate('category').exec(callback);
						}
					}, function(err, results) {
						if(err) { return next(err); }
						res.render('item_show', {
							title: results.item.name,
							item: results.item,
							notice: 'Item updated'
						})
					})
				}
			});
		}
	}
]
