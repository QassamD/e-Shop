const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) uploadError = null;

    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    // const fileName= file.originalName.split(" ").join("_")
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});

const getBasePath = (req) => {
  if (process.env.NODE_ENV === "production") {
    return `https://your-production-api-domain.com/public/uploads/`;
  }
  return `${req.protocol}://${req.get("host")}/public/uploads/`;
};

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category", "name");
  if (!productList) res.status(500).json({ success: false });
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name _id"
  );
  if (!product) res.status(500).json({ success: false });
  res.json(product);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Received file:", req.file);

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const fileName = req.file.filename;
    const basePath = getBasePath;

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    product = await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const category = await Category.findById(req.body.category);

    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      price: Number(req.body.price),
      category: req.body.category,
      countInStock: Number(req.body.countInStock),
      rating: Number(req.body.rating),
      numReviews: Number(req.body.numReviews),
      isFeatured: req.body.isFeatured === "true",
    };

    if (req.file) {
      const basePath = getBasePath;
      updateData.image = `${basePath}${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({
      message: "Validation failed",
      error: error.message,
    });
  }
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, massage: "product is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, massage: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments({});
  if (!productCount) res.status(500).json({ success: false });
  res.send({
    count: productCount,
  });
});
router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(+count);
  if (!product) res.status(500).json({ success: false });
  res.send(product);
});

// add a images in the product
router.put(
  "/gallery-images/:id",
  upload.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const files = req.files;

    const imagePaths = [];
    const basePath = getBasePath;
    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );
    if (!product) {
      return res.status(500).send("the product cannot be Updated");
    }

    res.send(product);
  }
);

module.exports = router;
