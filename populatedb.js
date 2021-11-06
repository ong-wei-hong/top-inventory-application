#! /usr/env/env node

console.log('This script populates some test categories and items to your database. Specify database as argument - e.g.: populatedb mongodb+srv://user:password@cluster.code.mongodb.net/db_name?retryWrites=true');

var userArgs = process.argv.slice(2);

var async = require('async');
var Category = require('./models/category');
var Item = require('./models/item');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var categories = [];
var items = [];

function categoryCreate(name, description, cb) {
	categoryDetail = { name: name, description: description};
	var category = new Category(categoryDetail);
	category.save(function(err) {
		if (err) {
			cb(err, null)
			return
		}
		console.log('New Category: ' + category);
		categories.push(category)
		cb(null, category)
	});
}

function itemCreate(name, description, category, price, quantity, cb) {
	itemDetail = { name: name, description: description, price: price, quantity: quantity};
	if (category != false) {itemDetail.category = category;}

	var item = new Item(itemDetail);
	item.save(function(err) {
		if(err) {
			cb(err, null)
			return
		}
		console.log('New item: ' + item);
		items.push(item);
		cb(null, item);
	});
}

function createCategories(cb) {
	async.series([
		function(callback) {
			categoryCreate('Raw Materials', 'Unprocessed materials which is used to build products', callback);
		},
		function(callback) {
			categoryCreate('Work In Progress', 'Components needed to assemble products', callback)
		},
		function(callback) {
			categoryCreate('Finished products', 'Products ready to ship', callback)
		}
	], cb)
}

function createItems(cb) {
	async.parallel([
		function(callback) {
			itemCreate('Copper Wiring', 'Wires are needed for circuits', categories[0], 1, 16, callback);
		},
		function(callback) {
			itemCreate('CPUs', 'Computing units needed for various computers', categories[0], 109, 3, callback);
		},
		function(callback) {
			itemCreate('Glass', 'Glass is needed for screens', categories[0], 11, 11, callback);
		},
		function(callback) {
			itemCreate('Aluminium', 'Aluminium is required for casing', categories[0], 12, 9, callback);
		},
		function(callback) {
			itemCreate('Completed PCBs', 'A completed printed circuit board', categories[1], 129, 12, callback);
		},
		function(callback) {
			itemCreate('Screens', 'A built phone screen', categories[1], 34, 9, callback);
		},
		function(callback) {
			itemCreate('Batteries', 'A power source for electronics', categories[1], 19, 14, callback);
		},
		function(callback) {
			itemCreate('Phone', 'A handheld computer', categories[2], 219, 14, callback)
		},
		function(callback) {
			itemCreate('Laptop', 'A portable computer', categories[2], 401, 12, callback)
		},
		function(callback) {
			itemCreate('Keyboard', 'Can be connected to a computer', categories[2], 109, 16, callback);
		}
	], cb)
}

async.series([
	createCategories,
	createItems
],
function(err, callback){
	if(err){
		console.log('FINAL ERR: ' + err);
	}else{
		console.log('ITEMS: ' + items);
	}

	mongoose.connection.close();
})
