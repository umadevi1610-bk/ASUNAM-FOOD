
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../services/orderService";

// ======================================
// ORDER STATUS STEPS
// ======================================

const STATUS_STEPS = [
  {
    key: "placed",
    label: "Order Placed",
    icon: "🧾",
    description: "Your order has been received.",
  },
  {
    key: "restaurant_accepted",
    label: "Restaurant Accepted",
    icon: "✅",
    description: "The restaurant accepted your order.",
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: "👨‍🍳",
    description: "Your food is being prepared.",
  },
  {
    key: "ready_for_pickup",
    label: "Ready for Pickup",
    icon: "📦",
    description: "Your order is ready for the delivery partner.",
  },
  {
    key: "delivery_assigned",
    label: "Delivery Partner Assigned",
    icon: "🛵",
    description: "A delivery partner has been assigned.",
  },
  {
    key: "picked_up",
    label: "Picked Up",
    icon: "🙋‍♂️",
    description: "Your delivery partner picked up the order.",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    icon: "🚴",
    description: "Your order is on the way.",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "🎉",
    description: "Your order has been delivered.",
  },
];

// ======================================
// ORDER TRACKING COMPONENT
// ======================================

const OrderTracking = ({ orderId }) => {
  const { token, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // LOAD ORDER
  // AUTO REFRESH EVERY 5 SECONDS
  // ======================================

  useEffect(() => {
    let isActive = true;
    let intervalId;

    if (!isAuthenticated || !token || !orderId) {
      setLoading(false);
      return;
    }

    const terminalStatuses = new Set([
      "delivered",
      "cancelled",
      "rejected",
    ]);

    const loadOrder = async (initialLoad = false) => {
      try {
        if (initialLoad) {
          setLoading(true);
        }

        const data = await getOrderById(orderId, token);

        if (!data?.order) {
          throw new Error("Order details were not found.");
        }

        if (!isActive) return;

        setOrder(data.order);
        setError("");

        if (
          terminalStatuses.has(data.order.orderStatus) &&
          intervalId
        ) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
      } catch (err) {
        console.error("Load order tracking error:", err);

        if (isActive && initialLoad) {
          setError(
            err.message || "Failed to load order details."
          );
        }
      } finally {
        if (isActive && initialLoad) {
          setLoading(false);
        }
      }
    };

    loadOrder(true);

    intervalId = window.setInterval(() => {
      loadOrder(false);
    }, 5000);

    return () => {
      isActive = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [orderId, token, isAuthenticated]);

  // ======================================
  // CURRENT STEP
  // ======================================

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;

    return STATUS_STEPS.findIndex(
      (step) => step.key === order.orderStatus
    );
  }, [order]);

  // ======================================
  // STATUS LABEL
  // ======================================

  const getStatusLabel = (status) => {
    if (status === "cancelled") return "Order Cancelled";
    if (status === "rejected") return "Order Rejected";

    return (
      STATUS_STEPS.find((step) => step.key === status)?.label ||
      status
    );
  };

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  // ======================================
  // NAVIGATION
  // ======================================

  const goToOrders = () => {
    window.location.href = "/orders";
  };

  // ======================================
  // AUTH CHECK
  // ======================================

  if (!isAuthenticated) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🔐</div>

          <h2>Please login first</h2>

          <p>
            Login to view your order details and tracking.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>📦</div>

          <h2>Loading your order...</h2>

          <p>Please wait daa ❤️</p>
        </div>
      </div>
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (error || !order) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>😕</div>

          <h2>Order not found</h2>

          <p>
            {error || "We couldn't find this order."}
          </p>

          <button
            style={styles.primaryButton}
            onClick={goToOrders}
          >
            ← My Orders
          </button>
        </div>
      </div>
    );
  }

  // ======================================
  // TERMINAL STATUS
  // ======================================

  const isTerminal =
    order.orderStatus === "cancelled" ||
    order.orderStatus === "rejected";

  // ======================================
  // MAIN TRACKING PAGE
  // ======================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>
              ASUNAM FOOD
            </span>

            <h1 style={styles.title}>
              Track Your Order
            </h1>

            <p style={styles.subtitle}>
              Order #{order.orderNumber}
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={goToOrders}
          >
            ← My Orders
          </button>
        </div>

        {/* CURRENT STATUS BANNER */}

        <section
          style={{
            ...styles.statusBanner,
            ...(isTerminal
              ? styles.statusBannerDanger
              : styles.statusBannerActive),
          }}
        >
          <div style={styles.statusBannerIcon}>
            {order.orderStatus === "cancelled"
              ? "❌"
              : order.orderStatus === "rejected"
              ? "🚫"
              : "🍔"}
          </div>

          <div style={{ flex: 1 }}>
            <span style={styles.statusCaption}>
              CURRENT STATUS
            </span>

            <h2 style={styles.statusTitle}>
              {getStatusLabel(order.orderStatus)}
            </h2>

            <p style={styles.statusDescription}>
              {isTerminal
                ? order.cancellationReason ||
                  "This order is no longer active."
                : "We'll keep your order status updated here."}
            </p>
          </div>
        </section>

        {/* MAIN GRID */}

        <div style={styles.grid}>

          {/* LEFT COLUMN */}

          <div>

            {/* ORDER JOURNEY */}

            <section style={styles.card}>
              <span style={styles.eyebrow}>
                ORDER JOURNEY
              </span>

              <h2 style={styles.cardTitle}>
                Track Order
              </h2>

              {isTerminal ? (
                <div style={styles.terminalBox}>
                  <span style={styles.terminalIcon}>
                    {order.orderStatus === "cancelled"
                      ? "❌"
                      : "🚫"}
                  </span>

                  <div>
                    <strong>
                      {order.orderStatus === "cancelled"
                        ? "This order was cancelled."
                        : "This order was rejected."}
                    </strong>

                    {order.cancellationReason && (
                      <p style={styles.smallText}>
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={styles.timeline}>
                  {STATUS_STEPS.map((step, index) => {
                    const completed =
                      index <= currentStepIndex;

                    const current =
                      index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        style={styles.timelineItem}
                      >
                        <div style={styles.timelineRail}>
                          <div
                            style={{
                              ...styles.timelineCircle,
                              ...(completed
                                ? styles.timelineCircleCompleted
                                : styles.timelineCircleUpcoming),
                              ...(current
                                ? styles.timelineCircleCurrent
                                : {}),
                            }}
                          >
                            {step.icon}
                          </div>

                          {index < STATUS_STEPS.length - 1 && (
                            <div
                              style={{
                                ...styles.timelineLine,
                                background:
                                  index < currentStepIndex
                                    ? "#267449"
                                    : "#e4ece4",
                              }}
                            />
                          )}
                        </div>

                        <div style={styles.timelineContent}>
                          <div style={styles.timelineTitleRow}>
                            <strong
                              style={{
                                ...styles.timelineTitle,
                                color:
                                  index > currentStepIndex
                                    ? "#9baa9e"
                                    : "#244e36",
                              }}
                            >
                              {step.label}
                            </strong>

                            {current && (
                              <span style={styles.currentBadge}>
                                CURRENT
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              ...styles.timelineDescription,
                              color:
                                index > currentStepIndex
                                  ? "#a3afa5"
                                  : "#718275",
                            }}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ORDER ITEMS */}

            <section style={styles.card}>
              <span style={styles.eyebrow}>
                YOUR FOOD
              </span>

              <h2 style={styles.cardTitle}>
                Order Items
              </h2>

              <div style={styles.itemsList}>
                {order.items.map((item, index) => (
                  <div
                    key={`${item.food}-${index}`}
                    style={styles.item}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.itemImage}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div style={styles.itemInfo}>
                      <strong style={styles.itemName}>
                        {item.name}
                      </strong>

                      <span style={styles.itemMeta}>
                        ₹{item.price} × {item.quantity}
                      </span>
                    </div>

                    <strong style={styles.itemTotal}>
                      ₹{item.total}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* DELIVERY ADDRESS */}

            <section style={styles.card}>
              <span style={styles.eyebrow}>
                DELIVER TO
              </span>

              <h2 style={styles.cardTitle}>
                Delivery Address
              </h2>

              <div style={styles.addressBox}>
                <strong>
                  {order.deliveryAddress?.name}
                </strong>

                <p style={styles.addressParagraph}>
                  {order.deliveryAddress?.street}
                  <br />
                  {order.deliveryAddress?.city},{" "}
                  {order.deliveryAddress?.state} -{" "}
                  {order.deliveryAddress?.pincode}
                </p>

                <span>
                  📞 {order.deliveryAddress?.phone}
                </span>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <div>

            {/* ORDER SUMMARY */}

            <section style={styles.summaryCard}>
              <span style={styles.eyebrow}>
                ORDER SUMMARY
              </span>

              <h2 style={styles.cardTitle}>
                {order.restaurant?.name || "Restaurant"}
              </h2>

              {order.restaurant?.cuisine?.length > 0 && (
                <p style={styles.restaurantCuisine}>
                  {order.restaurant.cuisine.join(" • ")}
                </p>
              )}

              <div style={styles.divider} />

              <div style={styles.priceRow}>
                <span>Item Total</span>
                <strong>₹{order.subtotal}</strong>
              </div>

              <div style={styles.priceRow}>
                <span>Delivery Fee</span>
                <strong>₹{order.deliveryFee}</strong>
              </div>

              <div style={styles.priceRow}>
                <span>Discount</span>
                <strong>₹{order.discount || 0}</strong>
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span>Total</span>
                <strong>₹{order.totalAmount}</strong>
              </div>

              <div style={styles.infoBox}>
                <span>Payment</span>

                <strong>
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online"}
                </strong>
              </div>

              <div style={styles.infoBox}>
                <span>Payment Status</span>
                <strong>{order.paymentStatus}</strong>
              </div>

              <div style={styles.infoBox}>
                <span>Placed On</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
            </section>

            {/* DELIVERY PARTNER */}

            {order.deliveryPartner && (
              <section style={styles.card}>
                <span style={styles.eyebrow}>
                  DELIVERY PARTNER
                </span>

                <h2 style={styles.cardTitle}>
                  {order.deliveryPartner.name}
                </h2>

                {order.deliveryPartner.phone && (
                  <p style={styles.partnerPhone}>
                    📞 {order.deliveryPartner.phone}
                  </p>
                )}
              </section>
            )}

            {/* CUSTOMER NOTE */}

            {order.customerNote && (
              <section style={styles.card}>
                <span style={styles.eyebrow}>
                  YOUR NOTE
                </span>

                <p style={styles.noteText}>
                  “{order.customerNote}”
                </p>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ======================================
// STYLES
// ======================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f8f4",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  eyebrow: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.8px",
    color: "#b08b3c",
    marginBottom: "6px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    color: "#183d29",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#75877a",
  },

  backButton: {
    border: "1px solid #dce8dc",
    background: "#fff",
    color: "#24573a",
    padding: "11px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  statusBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "24px",
  },

  statusBannerActive: {
    background: "#edf7ef",
    border: "1px solid #cfe4d2",
  },

  statusBannerDanger: {
    background: "#fff0f0",
    border: "1px solid #ffd2d2",
  },

  statusBannerIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    fontSize: "27px",
    flexShrink: 0,
  },

  statusCaption: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#829287",
  },

  statusTitle: {
    margin: "4px 0",
    fontSize: "22px",
    color: "#183d29",
  },

  statusDescription: {
    margin: 0,
    color: "#75877a",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.45fr) minmax(300px, 0.8fr)",
    gap: "24px",
    alignItems: "start",
  },

  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(29, 78, 45, 0.055)",
  },

  summaryCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(29, 78, 45, 0.055)",
    position: "sticky",
    top: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#183d29",
  },

  restaurantCuisine: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#809083",
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    marginTop: "18px",
  },

  timelineItem: {
    display: "flex",
    gap: "16px",
  },

  timelineRail: {
    width: "44px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },

  timelineCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    border: "2px solid #dfe9df",
    boxSizing: "border-box",
    background: "#fff",
  },

  timelineCircleCompleted: {
    background: "#eff7ef",
    borderColor: "#398255",
  },

  timelineCircleUpcoming: {
    opacity: 0.65,
  },

  timelineCircleCurrent: {
    boxShadow: "0 0 0 5px rgba(23, 107, 67, 0.13)",
  },

  timelineLine: {
    width: "3px",
    minHeight: "42px",
    flex: 1,
    margin: "4px 0",
    borderRadius: "99px",
  },

  timelineContent: {
    flex: 1,
    padding: "2px 0 24px",
  },

  timelineTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  timelineTitle: {
    fontSize: "15px",
  },

  currentBadge: {
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.8px",
    color: "#176b43",
    background: "#edf6ee",
    padding: "4px 7px",
    borderRadius: "999px",
  },

  timelineDescription: {
    margin: "5px 0 0",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  terminalBox: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    padding: "16px",
    marginTop: "18px",
    borderRadius: "12px",
    background: "#fff5f5",
    color: "#a42626",
  },

  terminalIcon: {
    fontSize: "26px",
  },

  smallText: {
    margin: "5px 0 0",
    fontSize: "13px",
  },

  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "18px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
  },

  itemImage: {
    width: "58px",
    height: "58px",
    borderRadius: "12px",
    objectFit: "cover",
    background: "#f2f2f2",
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  itemName: {
    fontSize: "15px",
    color: "#183d29",
  },

  itemMeta: {
    fontSize: "13px",
    color: "#75877a",
  },

  itemTotal: {
    fontSize: "15px",
    color: "#183d29",
  },

  addressBox: {
    background: "#f4f9f4",
    border: "1px solid #e3eee3",
    borderRadius: "12px",
    padding: "16px",
    lineHeight: 1.6,
    marginTop: "18px",
    color: "#315940",
  },

  addressParagraph: {
    margin: "6px 0",
  },

  divider: {
    height: "1px",
    background: "#e7eee7",
    margin: "18px 0",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "11px",
    fontSize: "14px",
    color: "#718275",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    fontSize: "18px",
    fontWeight: "800",
    color: "#183d29",
  },

  infoBox: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "11px 0",
    borderBottom: "1px solid #e7eee7",
    fontSize: "13px",
  },

  partnerPhone: {
    margin: "8px 0 0",
    color: "#718275",
  },

  noteText: {
    margin: "12px 0 0",
    color: "#718275",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
    background: "#f5f8f4",
  },

  messageCard: {
    width: "100%",
    maxWidth: "430px",
    background: "#fff",
    padding: "45px 25px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(29, 78, 45, 0.055)",
  },

  bigIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },

  primaryButton: {
    border: "none",
    background: "#176b43",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "12px",
  },
};

export default OrderTracking;
