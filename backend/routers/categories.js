const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");
const { Product } = require("../models/product");

router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) res.status(500).json({ success: false });
  res.status(200).send(categoryList);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    res
      .status(500)
      .json({ massage: "tha category with the given ID was not found" });
  res.status(200).send(category);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) {
    return res.status(404).send("the category cannot be created");
  }

  res.status(200).send(category);
});

router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );

  if (!category) {
    return res.status(404).send("the category cannot be created");
  }

  res.status(200).send(category);
});

// In your category route handler, add proper error logging:
router.delete("/:id", async (req, res) => {
  try {
    // Add population check
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete associated products
    if (Product.find({ category: req.params.id })) {
      await Product.deleteMany({ category: req.params.id });
    }

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category and all products deleted successfully",
    });
  } catch (error) {
    console.error("Server deletion error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
module.exports = router;
