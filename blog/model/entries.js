var mongoose = require('mongoose');
var entrySchema = new mongoose.Schema({
	author: String,
	postTitle: String,
	postBody: String,
	date: { type: Date, default: Date.now }
});
mongoose.model('Entry', entrySchema);