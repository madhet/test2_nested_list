const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  // _id
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'List'
  },
  ancestors: {
    type: Array,
    default: []
  },
  title: String,
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Item", itemSchema);
