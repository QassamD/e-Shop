const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  reichDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  cloudinary_id: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    require: true,
  },
  countInStock: {
    type: Number,
    require: true,
    min: 0,
    max: 255,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dataCreated: {
    type: Date,
    default: Date.now,
  },
});

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", {
  virtuals: true,
});

exports.Product = mongoose.model("Product", productSchema);
