var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, required: true }
});

CategorySchema.virtual('url').get(function(){
	return '/category/' + this._id;
});

CategorySchema.virtual('edit_url').get(function() {
	return '/category/' + this._id + '/edit'
});

CategorySchema.virtual('update_url').get(function() {
	return '/category/' + this._id + '/update'
});

CategorySchema.virtual('delete_url').get(function() {
	return '/category/' + this._id + '/delete'
});

module.exports = mongoose.model('Category', CategorySchema);
