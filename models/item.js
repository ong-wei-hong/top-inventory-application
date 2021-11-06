var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
	price: { type: Number, required: true },
	quantity: { type: Number, required: true }
});

ItemSchema.virtual('url').get(function() {
	return '/item/' + this._id
});

ItemSchema.virtual('edit_url').get(function() {
	return '/item/' + this._id + '/edit'
});

ItemSchema.virtual('update_url').get(function() {
	return '/item/' + this._id + '/update'
});

ItemSchema.virtual('delete_url').get(function() {
	return '/item/' + this._id + '/delete'
});

module.exports = mongoose.model('Item', ItemSchema);
