
const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");

const getPartnerId = (req) =>
  req.user?.userId || req.user?.id || req.user?._id;

const requireDeliveryPartner = (req, res) => {
  if (req.user?.role !== "delivery") {
    res.status(403).json({
      success: false,
      message: "Only delivery partners can access this feature.",
    });
    return false;
  }

  const partnerId = getPartnerId(req);

  if (!partnerId || !mongoose.isValidObjectId(partnerId)) {
    res.status(401).json({
      success: false,
      message: "Valid delivery partner login is required.",
    });
    return false;
  }

  return true;
};

// GET /api/delivery/available
// List orders that are ready for pickup and not yet assigned.
const getAvailableOrders = async (req, res) => {
  if (!requireDeliveryPartner(req, res)) return;

  try {
    const orders = await Order.find({
      orderStatus: "ready_for_pickup",
      deliveryPartner: null,
    })
      .select("-deliveryAddress -customer")
      .populate("restaurant", "name address cuisine")
      .sort({ readyAt: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get available orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load available orders.",
    });
  }
};

// GET /api/delivery/mine
// List deliveries assigned to the logged-in delivery partner.
const getMyDeliveries = async (req, res) => {
  if (!requireDeliveryPartner(req, res)) return;

  try {
    const deliveries = await Delivery.find({
      deliveryPartner: getPartnerId(req),
    })
      .populate("restaurant", "name address phone")
      .populate({
        path: "order",
        populate: [
          { path: "customer", select: "name phone email" },
          { path: "restaurant", select: "name address phone" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    console.error("Get my deliveries error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your deliveries.",
    });
  }
};

// POST /api/delivery/orders/:orderId/accept
// Atomically claim a ready order so two partners cannot accept it.
const acceptDeliveryOrder = async (req, res) => {
  if (!requireDeliveryPartner(req, res)) return;

  const { orderId } = req.params;
  const partnerId = getPartnerId(req);

  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }

  let claimedOrder = null;

  try {
    claimedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: "ready_for_pickup",
        $or: [
          { deliveryPartner: null },
          { deliveryPartner: { $exists: false } },
        ],
      },
      {
        $set: {
          deliveryPartner: partnerId,
          orderStatus: "delivery_assigned",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!claimedOrder) {
      const existingOrder = await Order.findById(orderId)
        .select("_id orderStatus deliveryPartner");

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This order is no longer available for pickup.",
      });
    }

    try {
      const restaurant = await Restaurant.findById(
        claimedOrder.restaurant
      ).select("name address");

      if (!restaurant) {
        throw new Error("Restaurant for this order was not found.");
      }

      const address = claimedOrder.deliveryAddress || {};

      const deliveryAddress = [
        address.street,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      const delivery = await Delivery.create({
        order: claimedOrder._id,
        deliveryPartner: partnerId,
        restaurant: claimedOrder.restaurant,
        pickupLocation: {
          address: restaurant.address || "",
        },
        deliveryLocation: {
          address: deliveryAddress,
          latitude: address.latitude ?? null,
          longitude: address.longitude ?? null,
        },
        deliveryFee: claimedOrder.deliveryFee || 0,
        status: "accepted",
        acceptedAt: new Date(),
      });

      const populatedDelivery = await Delivery.findById(delivery._id)
        .populate("restaurant", "name address phone")
        .populate({
          path: "order",
          populate: [
            { path: "customer", select: "name phone email" },
            { path: "restaurant", select: "name address phone" },
          ],
        });

      return res.status(200).json({
        success: true,
        message: "Order accepted successfully.",
        delivery: populatedDelivery,
      });
    } catch (creationError) {
      // Roll the order back if its delivery record could not be created.
      await Order.updateOne(
        {
          _id: claimedOrder._id,
          deliveryPartner: partnerId,
          orderStatus: "delivery_assigned",
        },
        {
          $set: {
            deliveryPartner: null,
            orderStatus: "ready_for_pickup",
          },
        }
      );

      throw creationError;
    }
  } catch (error) {
    console.error("Accept delivery order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to accept this order. Please try again.",
    });
  }
};

// PATCH /api/delivery/:deliveryId/status
// Progress: accepted -> picked_up -> out_for_delivery -> delivered
const updateDeliveryStatus = async (req, res) => {
  if (!requireDeliveryPartner(req, res)) return;

  const { deliveryId } = req.params;
  const { status } = req.body;
  const partnerId = getPartnerId(req);

  if (!mongoose.isValidObjectId(deliveryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid delivery ID.",
    });
  }

  const nextStatus = {
    accepted: "picked_up",
    picked_up: "out_for_delivery",
    out_for_delivery: "delivered",
  };

  const expectedOrderStatus = {
    accepted: "delivery_assigned",
    picked_up: "picked_up",
    out_for_delivery: "out_for_delivery",
  };

  if (!["picked_up", "out_for_delivery", "delivered"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid delivery status.",
    });
  }

  try {
    const delivery = await Delivery.findOne({
      _id: deliveryId,
      deliveryPartner: partnerId,
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found for your account.",
      });
    }

    if (nextStatus[delivery.status] !== status) {
      return res.status(400).json({
        success: false,
        message: `You cannot change delivery status from ${delivery.status} to ${status}.`,
      });
    }

    const order = await Order.findById(delivery.order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Related order not found.",
      });
    }

    if (
      String(order.deliveryPartner) !== String(partnerId) ||
      order.orderStatus !== expectedOrderStatus[delivery.status]
    ) {
      return res.status(409).json({
        success: false,
        message:
          "The order status has changed. Refresh your deliveries and try again.",
      });
    }

    const now = new Date();

    delivery.status = status;
    order.orderStatus = status;

    if (status === "picked_up") {
      delivery.pickedUpAt = now;
      order.pickedUpAt = now;
    } else if (status === "out_for_delivery") {
      delivery.outForDeliveryAt = now;
    } else if (status === "delivered") {
      delivery.deliveredAt = now;
      order.deliveredAt = now;
    }

    await order.save();
    await delivery.save();

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate("restaurant", "name address phone")
      .populate({
        path: "order",
        populate: [
          { path: "customer", select: "name phone email" },
          { path: "restaurant", select: "name address phone" },
        ],
      });

    return res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}.`,
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error("Update delivery status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update delivery status.",
    });
  }
};

module.exports = {
  getAvailableOrders,
  getMyDeliveries,
  acceptDeliveryOrder,
  updateDeliveryStatus,
};
