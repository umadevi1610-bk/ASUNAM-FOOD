
import { useEffect, useState } from "react";
import {
  getMyOrders,
  createReview,
  getOrderReviews,
} from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
  const { user, token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // REVIEW STATES
  // ======================================

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [orderReviews, setOrderReviews] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ======================================
  // LOAD ORDERS AND EXISTING REVIEWS
  // ======================================

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      if (!isAuthenticated || !token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders(token);
        const loadedOrders = data.orders || [];

        if (!isActive) return;

        setOrders(loadedOrders);

        const deliveredOrders = loadedOrders.filter(
          (order) => order.orderStatus === "delivered"
        );

        const reviewEntries = await Promise.all(
          deliveredOrders.map(async (order) => {
            try {
              const reviewData = await getOrderReviews(
                order._id,
                token
              );

              return [
                order._id,
                reviewData.reviews || [],
              ];
            } catch (reviewLookupError) {
              console.error(
                `Could not load reviews for order ${order._id}:`,
                reviewLookupError.message
              );

              return [order._id, []];
            }
          })
        );

        if (isActive) {
          setOrderReviews(Object.fromEntries(reviewEntries));
        }
      } catch (err) {
        console.error("Load orders error:", err);

        if (isActive) {
          setError(err.message || "Failed to load orders");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, [token, isAuthenticated]);

  // ======================================
  // ORDER STATUS
  // ======================================

  const getStatusLabel = (status) => {
    const statusMap = {
      placed: "Order Placed",
      restaurant_accepted: "Restaurant Accepted",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      delivery_assigned: "Delivery Partner Assigned",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };

    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === "delivered") return "status-delivered";

    if (status === "cancelled" || status === "rejected") {
      return "status-cancelled";
    }

    return "status-active";
  };

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================
  // GET FOOD ID
  // ======================================

  const getFoodId = (itemOrReview) => {
    if (!itemOrReview) return null;

    const foodValue =
      itemOrReview.food !== undefined
        ? itemOrReview.food
        : itemOrReview;

    if (foodValue && typeof foodValue === "object") {
      return foodValue._id || foodValue.id || null;
    }

    return foodValue || null;
  };

  // ======================================
  // CHECK IF ALREADY REVIEWED
  // ======================================

  const isReviewSubmitted = (orderId, foodItem = null) => {
    const reviews = orderReviews[orderId] || [];

    const targetFoodId = foodItem
      ? getFoodId(foodItem)
      : null;

    return reviews.some((review) => {
      const reviewedFoodId = getFoodId(review);

      if (targetFoodId) {
        return String(reviewedFoodId) === String(targetFoodId);
      }

      return !reviewedFoodId;
    });
  };

  // ======================================
  // OPEN REVIEW FORM
  // ======================================

  const openReviewModal = async (order, food = null) => {
    setSelectedOrder(order);
    setSelectedFood(food);

    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
    setReviewModalOpen(true);

    try {
      const data = await getOrderReviews(order._id, token);

      const reviews = data.reviews || [];

      setOrderReviews((previous) => ({
        ...previous,
        [order._id]: reviews,
      }));

      const targetFoodId = food
        ? getFoodId(food)
        : null;

      const existingReview = reviews.find((review) => {
        const existingFoodId = getFoodId(review);

        return targetFoodId
          ? String(existingFoodId) === String(targetFoodId)
          : !existingFoodId;
      });

      if (existingReview) {
        setReviewError(
          "You have already reviewed this item."
        );
      }
    } catch (reviewLookupError) {
      console.error("Review loading error:", reviewLookupError);

      setReviewError(
        "Could not check previous reviews. Please try again."
      );
    }
  };

  // ======================================
  // SUBMIT REVIEW
  // ======================================

  const handleReviewSubmit = async () => {
    if (!selectedOrder || !token) {
      setReviewError(
        "Please login to submit your review."
      );

      return;
    }

    const selectedFoodId = selectedFood
      ? getFoodId(selectedFood)
      : null;

    if (selectedFood && !selectedFoodId) {
      setReviewError(
        "Could not identify this food item. Please refresh your orders."
      );

      return;
    }

    if (
      isReviewSubmitted(
        selectedOrder._id,
        selectedFood
      )
    ) {
      setReviewError(
        "You have already reviewed this item."
      );

      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewSuccess("");

      const reviewData = {
        orderId: selectedOrder._id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      if (selectedFoodId) {
        reviewData.foodId = selectedFoodId;
      }

      const response = await createReview(
        reviewData,
        token
      );

      if (response.review) {
        setOrderReviews((previous) => ({
          ...previous,
          [selectedOrder._id]: [
            ...(previous[selectedOrder._id] || []),
            response.review,
          ],
        }));
      }

      setReviewSuccess(
        response.message ||
          "Review submitted successfully!"
      );
    } catch (submitError) {
      setReviewError(
        submitError.message ||
          "Could not submit your review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ======================================
  // CLOSE REVIEW MODAL
  // ======================================

  const closeReviewModal = () => {
    if (reviewSubmitting) return;

    setReviewModalOpen(false);
    setSelectedOrder(null);
    setSelectedFood(null);
    setReviewError("");
    setReviewSuccess("");
  };

  const selectedItemAlreadyReviewed = selectedOrder
    ? isReviewSubmitted(
        selectedOrder._id,
        selectedFood
      )
    : false;

  // ======================================
  // AUTH CHECK
  // ======================================

  if (!isAuthenticated) {
    return (
      <div style={styles.centerMessage}>
        <h2>Please login to view your orders</h2>

        <button
          style={styles.primaryButton}
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          Login
        </button>
      </div>
    );
  }

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div style={styles.centerMessage}>
        <h2>Loading your orders...</h2>
        <p>Please wait daa ❤️</p>
      </div>
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (error) {
    return (
      <div style={styles.centerMessage}>
        <h2>Unable to load orders</h2>
        <p>{error}</p>

        <button
          style={styles.primaryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ======================================
  // MAIN ORDERS PAGE
  // ======================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Orders</h1>

            <p style={styles.subtitle}>
              Welcome back, {user?.name || "User"} 👋
            </p>
          </div>

<div style={styles.headerActions}>
  <div style={styles.orderCount}>
    {orders.length}{" "}
    {orders.length === 1 ? "Order" : "Orders"}
  </div>

  <button
    type="button"
    style={styles.homeButton}
    onClick={() => {
      window.location.href = "/";
    }}
  >
    🏠 Home
  </button>
</div>
</div>
        {/* EMPTY ORDERS */}

        {orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📦</div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet.
              Explore restaurants and order your
              favourite food ❤️
            </p>

            <button
              style={styles.primaryButton}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Browse Food
            </button>
          </div>
        ) : (

          <div style={styles.ordersList}>

            {orders.map((order) => (

              <div
                key={order._id}
                style={styles.orderCard}
              >

                {/* ORDER HEADER */}

                <div style={styles.orderTop}>
                  <div>
                    <p style={styles.orderNumber}>
                      #{order.orderNumber}
                    </p>

                    <h2 style={styles.restaurantName}>
                      {order.restaurant?.name || "Restaurant"}
                    </h2>

                    <p style={styles.date}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div
                    className={getStatusClass(order.orderStatus)}
                    style={{
                      ...styles.status,

                      ...(order.orderStatus === "delivered"
                        ? styles.statusDelivered
                        : order.orderStatus === "cancelled" ||
                          order.orderStatus === "rejected"
                        ? styles.statusCancelled
                        : styles.statusActive),
                    }}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </div>
                </div>

                {/* ORDER ITEMS */}

                <div style={styles.itemsSection}>

                  {order.items.map((item, index) => {

                    const foodReviewed =
                      isReviewSubmitted(order._id, item);

                    return (
                      <div
                        key={`${getFoodId(item) || item.name}-${index}`}
                        style={styles.item}
                      >

                        <img
                          src={item.image}
                          alt={item.name}
                          style={styles.itemImage}
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div style={styles.itemInfo}>
                          <h3 style={styles.itemName}>
                            {item.name}
                          </h3>

                          <p style={styles.itemMeta}>
                            ₹{item.price} × {item.quantity}
                          </p>

                          {/* FOOD REVIEW BUTTON */}

                          {order.orderStatus === "delivered" && (
                            <button
                              type="button"
                              style={
                                foodReviewed
                                  ? styles.reviewedButton
                                  : styles.itemReviewButton
                              }
                              disabled={foodReviewed}
                              onClick={() =>
                                openReviewModal(order, item)
                              }
                            >
                              {foodReviewed
                                ? "✓ Food Reviewed"
                                : "⭐ Rate Food"}
                            </button>
                          )}
                        </div>

                        <div style={styles.itemTotal}>
                          ₹{item.total}
                        </div>

                      </div>
                    );
                  })}

                </div>

                {/* PAYMENT DETAILS */}

                <div style={styles.bottomSection}>
                  <div>
                    <p style={styles.paymentText}>
                      Payment:{" "}
                      <strong>
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online"}
                      </strong>
                    </p>

                    <p style={styles.paymentText}>
                      Payment Status:{" "}
                      <strong>{order.paymentStatus}</strong>
                    </p>
                  </div>

                  <div style={styles.totalBox}>
                    <span>Total</span>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                </div>

                {/* ORDER ACTIONS */}

                <div style={styles.actionRow}>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => {
                      window.location.href =
                        `/orders/${order._id}`;
                    }}
                  >
                    View Order
                  </button>

                  {order.orderStatus !== "delivered" &&
                    order.orderStatus !== "cancelled" &&
                    order.orderStatus !== "rejected" && (

                      <button
                        style={styles.primaryButton}
                        onClick={() => {
                          window.location.href =
                            `/orders/${order._id}`;
                        }}
                      >
                        Track Order
                      </button>
                    )}

                  {/* RESTAURANT REVIEW BUTTON */}

                  {order.orderStatus === "delivered" && (
                    <button
                      type="button"
                      style={
                        isReviewSubmitted(order._id)
                          ? styles.reviewedButton
                          : styles.reviewButton
                      }
                      disabled={isReviewSubmitted(order._id)}
                      onClick={() =>
                        openReviewModal(order)
                      }
                    >
                      {isReviewSubmitted(order._id)
                        ? "✓ Restaurant Reviewed"
                        : "⭐ Review Restaurant"}
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}
      </div>

      {/* ======================================
          REVIEW MODAL
      ====================================== */}

      {reviewModalOpen && selectedOrder && (

        <div
          style={styles.modalOverlay}
          onClick={closeReviewModal}
        >

          <div
            style={styles.reviewModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalEyebrow}>
                  ASUNAM FOOD
                </span>

                <h2
                  id="review-modal-title"
                  style={styles.modalTitle}
                >
                  {selectedFood
                    ? "Rate this food"
                    : "Review restaurant"}
                </h2>

                <p style={styles.modalSubtitle}>
                  {selectedFood?.name ||
                    selectedOrder.restaurant?.name ||
                    "Your order"}
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={closeReviewModal}
                disabled={reviewSubmitting}
                aria-label="Close review"
              >
                ×
              </button>
            </div>

            {/* SUCCESS MESSAGE */}

            {reviewSuccess ? (

              <div style={styles.successBox}>
                <div style={styles.successIcon}>✓</div>

                <h3>Thank you for your review!</h3>

                <p>{reviewSuccess}</p>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={closeReviewModal}
                >
                  Done
                </button>
              </div>

            ) : (

              <>

                {/* STAR RATING */}

                <p style={styles.ratingPrompt}>
                  How was your experience?
                </p>

                <div style={styles.starsRow}>

                  {[1, 2, 3, 4, 5].map((star) => (

                    <button
                      key={star}
                      type="button"
                      style={{
                        ...styles.starButton,

                        color:
                          star <= reviewRating
                            ? "#f5a623"
                            : "#d1d5db",
                      }}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      disabled={
                        selectedItemAlreadyReviewed ||
                        reviewSubmitting
                      }
                    >
                      ★
                    </button>

                  ))}

                </div>

                <p style={styles.ratingLabel}>
                  {reviewRating === 5
                    ? "Excellent"
                    : reviewRating === 4
                    ? "Very Good"
                    : reviewRating === 3
                    ? "Good"
                    : reviewRating === 2
                    ? "Fair"
                    : "Poor"}
                </p>

                {/* COMMENT */}

                <label
                  htmlFor="review-comment"
                  style={styles.commentLabel}
                >
                  Your comments (optional)
                </label>

                <textarea
                  id="review-comment"
                  style={styles.commentInput}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us about your experience..."
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(e.target.value)
                  }
                  disabled={
                    selectedItemAlreadyReviewed ||
                    reviewSubmitting
                  }
                />

                <div style={styles.charCount}>
                  {reviewComment.length}/500
                </div>

                {/* ERROR */}

                {reviewError && (
                  <div style={styles.errorBox}>
                    {reviewError}
                  </div>
                )}

                {/* ALREADY REVIEWED */}

                {selectedItemAlreadyReviewed && (
                  <div style={styles.infoBox}>
                    You have already submitted a review
                    for this item.
                  </div>
                )}

                {/* MODAL BUTTONS */}

                <div style={styles.modalActions}>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={closeReviewModal}
                    disabled={reviewSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={handleReviewSubmit}
                    disabled={
                      reviewSubmitting ||
                      selectedItemAlreadyReviewed
                    }
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>

                </div>

              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

// ======================================
// STYLES
// ======================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f7f7f7",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    color: "#222",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#666",
  },

  orderCount: {
    background: "#fff",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },
  headerActions: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
},

homeButton: {
  background: "#166534",
  color: "#ffffff",
  border: "none",
  padding: "11px 18px",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
},

  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  orderCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    paddingBottom: "18px",
    borderBottom: "1px solid #eee",
  },

  orderNumber: {
    margin: 0,
    fontSize: "13px",
    color: "#888",
  },

  restaurantName: {
    margin: "5px 0",
    fontSize: "20px",
    color: "#222",
  },

  date: {
    margin: 0,
    fontSize: "13px",
    color: "#888",
  },

  status: {
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  statusActive: {
    background: "#fff1e8",
    color: "#e85d04",
  },

  statusDelivered: {
    background: "#e9f8ef",
    color: "#1f8f4d",
  },

  statusCancelled: {
    background: "#fdecec",
    color: "#c62828",
  },

  itemsSection: {
    padding: "18px 0",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "10px 0",
  },

  itemImage: {
    width: "62px",
    height: "62px",
    objectFit: "cover",
    borderRadius: "12px",
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    margin: 0,
    fontSize: "16px",
    color: "#222",
  },

  itemMeta: {
    margin: "5px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  itemTotal: {
    fontWeight: "700",
    color: "#222",
    whiteSpace: "nowrap",
  },

  itemReviewButton: {
    marginTop: "8px",
    border: "none",
    background: "#f0fdf4",
    color: "#166534",
    padding: "7px 11px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  bottomSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
    padding: "16px 0",
    flexWrap: "wrap",
  },

  paymentText: {
    margin: "4px 0",
    fontSize: "13px",
    color: "#777",
  },

  totalBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "18px",
    flexWrap: "wrap",
  },

  primaryButton: {
    border: "none",
    background: "#166534",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryButton: {
    border: "1px solid #ddd",
    background: "#fff",
    color: "#222",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  reviewButton: {
    border: "none",
    background: "#166534",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  reviewedButton: {
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
    padding: "9px 13px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "default",
    fontSize: "12px",
  },

  emptyBox: {
    background: "#fff",
    borderRadius: "18px",
    padding: "60px 25px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  emptyIcon: {
    fontSize: "55px",
    marginBottom: "10px",
  },

  centerMessage: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    textAlign: "center",
    padding: "20px",
  },

  // ======================================
  // REVIEW MODAL STYLES
  // ======================================

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(0,0,0,0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    boxSizing: "border-box",
  },

  reviewModal: {
    width: "100%",
    maxWidth: "480px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "20px",
    padding: "26px",
    boxSizing: "border-box",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  modalEyebrow: {
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  modalTitle: {
    margin: "7px 0 4px",
    color: "#17251c",
    fontSize: "23px",
  },

  modalSubtitle: {
    margin: 0,
    color: "#777",
    fontSize: "14px",
  },

  closeButton: {
    border: "none",
    background: "#f3f4f6",
    color: "#333",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },

  ratingPrompt: {
    textAlign: "center",
    margin: "28px 0 8px",
    color: "#444",
    fontWeight: "600",
  },

  starsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },

  starButton: {
    border: "none",
    background: "transparent",
    fontSize: "42px",
    padding: "0 2px",
    cursor: "pointer",
    lineHeight: 1.2,
  },

  ratingLabel: {
    textAlign: "center",
    color: "#a16207",
    fontWeight: "700",
    margin: "6px 0 22px",
  },

  commentLabel: {
    display: "block",
    color: "#333",
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "8px",
  },

  commentInput: {
    width: "100%",
    resize: "vertical",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "12px",
    boxSizing: "border-box",
    font: "inherit",
    outlineColor: "#15803d",
  },

  charCount: {
    textAlign: "right",
    color: "#888",
    fontSize: "11px",
    marginTop: "4px",
  },

  errorBox: {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "9px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
  },

  infoBox: {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "9px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "13px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  successBox: {
    textAlign: "center",
    padding: "32px 10px 10px",
  },

  successIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 14px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "800",
  },
};


export default Orders;
