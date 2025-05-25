const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { fromEnv } = require("@aws-sdk/credential-provider-env");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

// File validation constants
const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

// Multer memory storage
const storage = multer.memoryStorage();

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."),
      false
    );
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

// Cloud upload middleware
const uploadToCloud = async (file, folder = "products") => {
  try {
    const extension = ALLOWED_MIME_TYPES[file.mimetype];
    const Key = `${folder}/${uuidv4()}.${extension}`;

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    await s3Client.send(new PutObjectCommand(params));
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to cloud storage");
  }
};

// Validation middleware
const validateProduct = [
  upload.single("image"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Product image is required" });
    }

    try {
      req.imageUrl = await uploadToCloud(req.file);
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// Get all products with advanced filtering
router.get("/", async (req, res) => {
  try {
    const { categories, featured, limit, sort } = req.query;
    const filter = {};
    const options = {};

    if (categories) {
      filter.category = { $in: categories.split(",") };
    }

    if (featured) {
      filter.isFeatured = featured === "true";
    }

    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    if (sort) {
      options.sort = sort.split(",").join(" ");
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .setOptions(options);

    res.json({
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id).populate(
      "category",
      "name description"
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ error: "Failed to retrieve product" });
  }
});

// Create product
router.post("/", validateProduct, async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const product = new Product({
      name,
      description,
      richDescription,
      image: req.imageUrl,
      brand,
      price: parseFloat(price),
      category,
      countInStock: parseInt(countInStock, 10),
      rating: parseFloat(rating),
      numReviews: parseInt(numReviews, 10),
      isFeatured: isFeatured === "true",
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.image = await uploadToCloud(req.file);
    }

    if (updates.category && !mongoose.isValidObjectId(updates.category)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Product statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: "$price" },
          totalStock: { $sum: "$countInStock" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    console.error("Product Stats Error:", error);
    res.status(500).json({ error: "Failed to get product statistics" });
  }
});

module.exports = router;
