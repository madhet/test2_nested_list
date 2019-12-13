const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema({
	// _id
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Item',
		default: null
	},
	ancestors: {
		type: Array,
		default: []
	}
});

module.exports = mongoose.model("List", listSchema);