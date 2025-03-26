// order.js
const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const { verifyToken } = require("../middleware/auth");
const { Product } = require("../models/product");

router.use(verifyToken);

router.get("/", async (req, res) => {
  const orderList = await Order.find().populate("User", "name");
  // .sort({ dataOrdered: -1 });
  if (!orderList) res.status(500).json({ success: false });
  res.send(orderList);
});

router.get("/active", async (req, res) => {
  try {
    // Check if user is valid
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find the order first
    let order = await Order.findOne({
      user: req.user._id,
      status: "Placed",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No active order found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Active order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching active order",
    });
  }
});

router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "orderItems",
    populate: {
      path: "product",
      model: "Product",
      select: "name price",
    },
  });

  if (!order) res.status(500).json({ success: false });
  res.send(order);
});

router.post("/", async (req, res) => {
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        product: orderItem.product,
        quantity: orderItem.quantity,
      });

      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const totalPrice = await Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "Product",
        "price"
      );
      return orderItem.product.price * orderItem.quantity;
    })
  );

  const totalPriceSum = totalPrice.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPriceSum,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res.status(404).send("the order cannot be created");
  }

  res.status(201).send(order);
});

router.put("/:id", async (req, res) => {
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (item) => {
      // Check if item exists
      if (item._id) {
        const updatedItem = await OrderItem.findByIdAndUpdate(
          item._id,
          { quantity: item.quantity },
          { new: true }
        );
        return updatedItem._id;
      }
      const newItem = new OrderItem({
        product: item.product,
        quantity: item.quantity,
      });
      await newItem.save();
      return newItem._id;
    })
  );
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
    },
    { new: true }
  ).populate({
    path: "orderItems",
    populate: {
      path: "product",
      model: "Product",
    },
  });
  if (!order) {
    return res.status(404).send("the order cannot be created");
  }

  res.status(200).send(order);
});

// POST /api/v1/order/:orderId/items - Add item to existing order
// router.post("/:orderId/items", async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId);
//     const newItem = new OrderItem({
//       product: req.body.product,
//       quantity: req.body.quantity,
//     });
//     await newItem.save();
//     order.orderItems.push(newItem._id);
//     await order.save();

//     const populatedOrder = await Order.findById(order._id).populate({
//       path: "orderItems",
//       populate: {
//         path: "product",
//         model: "Product",
//       },
//     });

//     res.status(201).json(populatedOrder);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add item" });
//   }
// });

// // PUT /api/v1/order/:orderId/items/:itemId - Update item quantity
// router.put("/:orderId/items/:itemId", async (req, res) => {
//   const item = await OrderItem.findByIdAndUpdate(
//     req.params.itemId,
//     { quantity: req.body.quantity },
//     { new: true }
//   );
//   res.send(item);
// });

// // Delete order item
// router.delete("/:orderId/items/:itemId", async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId);

//     // 1. Check if order exists
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // 2. Find item index
//     const itemIndex = order.orderItems.findIndex(
//       (item) => item._id.toString() === req.params.itemId
//     );

//     // 3. Check if item exists
//     if (itemIndex === -1) {
//       return res.status(404).json({ message: "Item not found in order" });
//     }

//     // 4. Remove item from array
//     order.orderItems.splice(itemIndex, 1);

//     // 5. Save the order (this will trigger the pre-save hook for totalPrice)
//     await order.save();

//     // 6. Return updated order
//     res.status(200).json(order);
//   } catch (error) {
//     console.error("Delete item error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// routes/order.js

// POST /api/v1/order/:orderId/items - Add item to existing order
router.post("/:orderId/items", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    const product = await Product.findById(req.body.product);

    // Create new order item WITH PRICE
    const newItem = new OrderItem({
      product: req.body.product,
      quantity: req.body.quantity,
      price: product.price, // Store price at time of addition
    });

    await newItem.save();
    order.orderItems.push(newItem._id);

    // Recalculate total
    const items = await OrderItem.find({ _id: { $in: order.orderItems } });
    order.totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Update order status
router.put("/:orderId/status", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate input
    if (
      !status ||
      !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: Add authorization check (user can only update their own orders)
    if (updatedOrder.user._id.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error updating order status" });
  }
});

// PUT /api/v1/order/:orderId/items/:itemId
router.put("/:orderId/items/:itemId", async (req, res) => {
  try {
    const item = await OrderItem.findByIdAndUpdate(
      req.params.itemId,
      { quantity: req.body.quantity },
      { new: true }
    );

    // Recalculate order total
    const order = await Order.findById(req.params.orderId);
    const items = await OrderItem.find({ _id: { $in: order.orderItems } });
    order.totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE /api/v1/order/:orderId/items/:itemId
router.delete("/:orderId/items/:itemId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    // Remove item
    const index = order.orderItems.findIndex(
      (item) => item.toString() === req.params.itemId
    );
    order.orderItems.splice(index, 1);

    // Recalculate total
    const items = await OrderItem.find({ _id: { $in: order.orderItems } });
    order.totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await order.save();
    await OrderItem.findByIdAndDelete(req.params.itemId);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, massage: "order is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, massage: "order not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales)
    return res.status(400).send("the total sales can't be generated");

  res.send({ totalSales: totalSales.pop().totalsales });
});

router.get("/get/count", async (req, res) => {
  const orderCount = await Order.countDocuments({});
  if (!orderCount) res.status(500).json({ success: false });
  res.send({
    orderCount: orderCount,
  });
});
// get order list for one user
// Update the route in routes/order.js
router.get("/get/userorder/:userid", verifyToken, async (req, res) => {
  try {
    // Validate user ID parameter
    if (!mongoose.isValidObjectId(req.params.userid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Verify user authorization
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.userId !== req.params.userid && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these orders",
      });
    }

    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          model: "Product",
          select: "name price image countInStock",
        },
      })
      .sort({ dateOrdered: -1 })
      .lean();

    if (!userOrderList || userOrderList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user",
      });
    }

    res.status(200).json({
      success: true,
      count: userOrderList.length,
      data: userOrderList,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
});
// router.get("/get/userorder/:userid", verifyToken, async (req, res) => {
//   const userOrderList = await Order.find({ user: req.params.userid })
//     .populate({
//       path: "orderItems",
//       populate: { path: "product", model: "Product", select: "name price" },
//     })
//     .sort({ dataOrdered: -1 });
//   if (!userOrderList) res.status(500).send("the order list is empty");

//   res.status(200).send(userOrderList);
// });

module.exports = router;
