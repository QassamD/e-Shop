// Description: Order model schema.
const mongoose = require("mongoose");
const Product = require("./product");

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderItems",
      require: true,
    },
  ],
  shippingAddress1: {
    type: String,
    require: true,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    require: true,
  },
  zip: {
    type: String,
    require: true,
  },
  country: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
    // enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Placed",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  dataOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("order", orderSchema);
