var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
	heading:   				{type: String, required: true},
	content:	 			{type: String},
	image:	 				{type: Object},
	savedImageName: 		{type: String},
	completed: 				{type: Boolean, required: true},
	date:					{type: Date, required: true},
	user:       			{type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Task', TaskSchema);