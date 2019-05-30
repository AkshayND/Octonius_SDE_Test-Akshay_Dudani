var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name:   				{type: String, required: true},
	email:	 				{type: String, required: true},
	username: 				{type: String, required: true},
	password: 				{type: String, required: true},
	tasks:       			[{type: Schema.Types.ObjectId, ref: 'Task'}]
});

module.exports = mongoose.model('User', UserSchema);