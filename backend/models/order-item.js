const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    require: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    require: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

exports.OrderItem = mongoose.model("orderItems", orderItemSchema);
