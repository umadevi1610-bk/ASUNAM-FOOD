
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../services/orderService";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: "🧾", description: "Your order has been received." },
  { key: "restaurant_accepted", label: "Restaurant Accepted", icon: "✅", description: "The restaurant accepted your order." },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳", description: "Your food is being prepared." },
  { key: "ready_for_pickup", label: "Ready for Pickup", icon: "📦", description: "Your order is ready for the delivery partner." },
  { key: "delivery_assigned", label: "Delivery Partner Assigned", icon: "🛵", description: "A delivery partner has been assigned." },
  { key: "picked_up", label: "Picked Up", icon: "🙋‍♂️", description: "Your delivery partner picked up the order." },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🚴", description: "Your order is on the way." },
  { key: "delivered", label: "Delivered", icon: "🎉", description: "Your order has been delivered." },
];

const OrderTracking = ({ orderId }) => {
  const { token, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    let intervalId;

    if (!isAuthenticated || !token || !orderId) {
      setLoading(false);
      return;
    }

    const terminalStatuses = new Set(["delivered", "cancelled", "rejected"]);

    const loadOrder = async (initialLoad = false) => {
      try {
        if (initialLoad) setLoading(true);

        const data = await getOrderById(orderId, token);

        if (!data?.order) {
          throw new Error("Order details were not found.");
        }

        if (!isActive) return;

        setOrder(data.order);
        setError("");

        if (terminalStatuses.has(data.order.orderStatus) && intervalId) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
      } catch (err) {
        console.error("Load order tracking error:", err);

        if (isActive && initialLoad) {
          setError(err.message || "Failed to load order details.");
        }
      } finally {
        if (isActive && initialLoad) setLoading(false);
      }
    };

    loadOrder(true);

    intervalId = window.setInterval(() => {
      loadOrder(false);
    }, 5000);

    return () => {
      isActive = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [orderId, token, isAuthenticated]);

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    return STATUS_STEPS.findIndex((step) => step.key === order.orderStatus);
  }, [order]);

  const getStatusLabel = (status) => {
    if (status === "cancelled") return "Order Cancelled";
    if (status === "rejected") return "Order Rejected";

    return STATUS_STEPS.find((step) => step.key === status)?.label || status;
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const goToOrders = () => {
    window.location.href = "/orders";
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🔐</div>
          <h2>Please login first</h2>
          <p>Login to view your order details and tracking.</p>
          <button style={styles.primaryButton} onClick={() => {
            window.location.href = "/login";
          }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

  if (error || !order) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>😕</div>
          <h2>Order not found</h2>
          <p>{error || "We couldn't find this order."}</p>
          <button style={styles.primaryButton} onClick={goToOrders}>
            ← My Orders
          </button>
        </div>
      </div>
    );
  }

  const isTerminal =
    order.orderStatus === "cancelled" ||
    order.orderStatus === "rejected";

  return (
    <div className="tracking-page" style={styles.page}>
      <style>{`
        .tracking-page, .tracking-page * {
          box-sizing: border-box;
        }

        .tracking-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .tracking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .tracking-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(300px, .8fr);
          gap: 24px;
          align-items: start;
        }

        .tracking-main-column,
        .tracking-side-column {
          min-width: 0;
        }

        .tracking-summary-card {
          position: sticky;
          top: 20px;
        }

        .tracking-card {
          min-width: 0;
        }

        .tracking-timeline-item {
          display: flex;
          gap: 15px;
        }

        .tracking-timeline-content {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .tracking-item {
          min-width: 0;
        }

        .tracking-item-name {
          overflow-wrap: anywhere;
        }

        @media (max-width: 760px) {
          .tracking-page {
            padding: 22px 13px 85px !important;
          }

          .tracking-header {
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 18px !important;
          }

          .tracking-title {
            font-size: 27px !important;
            line-height: 1.2 !important;
          }

          .tracking-order-number {
            font-size: 13px !important;
            overflow-wrap: anywhere;
          }

          .tracking-back-button {
            padding: 9px 11px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }

          .tracking-status-banner {
            padding: 16px !important;
            gap: 12px !important;
            border-radius: 16px !important;
            margin-bottom: 17px !important;
          }

          .tracking-status-icon {
            width: 48px !important;
            height: 48px !important;
            font-size: 23px !important;
            border-radius: 13px !important;
          }

          .tracking-status-title {
            font-size: 19px !important;
            line-height: 1.3 !important;
          }

          .tracking-status-description {
            font-size: 12px !important;
            line-height: 1.5 !important;
          }

          .tracking-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 0 !important;
          }

          /* Summary appears before the timeline on mobile */
          .tracking-side-column {
            order: -1;
          }

          .tracking-main-column {
            order: 0;
          }

          /* Prevent sticky summary from overlapping other cards */
          .tracking-summary-card {
            position: static !important;
            top: auto !important;
          }

          .tracking-card,
          .tracking-summary-card {
            padding: 18px !important;
            border-radius: 16px !important;
            margin-bottom: 14px !important;
            width: 100% !important;
          }

          .tracking-card-title {
            font-size: 19px !important;
          }

          .tracking-timeline {
            margin-top: 20px !important;
          }

          .tracking-timeline-item {
            gap: 12px !important;
          }

          .tracking-timeline-rail {
            width: 40px !important;
          }

          .tracking-timeline-circle {
            width: 40px !important;
            height: 40px !important;
            font-size: 17px !important;
          }

          .tracking-timeline-line {
            min-height: 36px !important;
          }

          .tracking-timeline-content {
            padding-bottom: 23px !important;
          }

          .tracking-timeline-title {
            font-size: 13px !important;
          }

          .tracking-timeline-description {
            font-size: 11px !important;
          }

          .tracking-current-badge {
            font-size: 8px !important;
          }

          .tracking-price-row {
            font-size: 13px !important;
          }

          .tracking-total-row {
            font-size: 17px !important;
          }

          .tracking-info-row {
            align-items: flex-start !important;
            font-size: 12px !important;
          }

          .tracking-info-row strong {
            max-width: 58%;
            text-align: right;
            overflow-wrap: anywhere;
          }

          .tracking-item {
            gap: 10px !important;
          }

          .tracking-item-image {
            width: 52px !important;
            height: 52px !important;
          }

          .tracking-item-name {
            font-size: 13px !important;
          }

          .tracking-item-meta {
            font-size: 11px !important;
          }

          .tracking-item-total {
            font-size: 13px !important;
            white-space: nowrap;
          }

          .tracking-address-box {
            padding: 13px !important;
            font-size: 13px;
          }

          .tracking-cuisine {
            font-size: 12px !important;
          }
        }

        @media (max-width: 360px) {
          .tracking-header {
            flex-direction: column;
          }

          .tracking-title {
            font-size: 24px !important;
          }

          .tracking-status-banner {
            align-items: flex-start !important;
          }

          .tracking-status-icon {
            width: 42px !important;
            height: 42px !important;
          }
        }
      `}</style>

      <div className="tracking-container" style={styles.container}>
        {/* HEADER */}
        <div className="tracking-header" style={styles.header}>
          <div>
            <span style={styles.eyebrow}>ASUNAM FOOD</span>
            <h1 className="tracking-title" style={styles.title}>
              Track Your Order
            </h1>
            <p className="tracking-order-number" style={styles.subtitle}>
              Order #{order.orderNumber}
            </p>
          </div>

          <button
            className="tracking-back-button"
            style={styles.backButton}
            onClick={goToOrders}
          >
            ← My Orders
          </button>
        </div>

        {/* CURRENT STATUS */}
        <section
          className="tracking-status-banner"
          style={{
            ...styles.statusBanner,
            ...(isTerminal
              ? styles.statusBannerDanger
              : styles.statusBannerActive),
          }}
        >
          <div className="tracking-status-icon" style={styles.statusBannerIcon}>
            {order.orderStatus === "cancelled"
              ? "❌"
              : order.orderStatus === "rejected"
              ? "🚫"
              : "🍔"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={styles.statusCaption}>CURRENT STATUS</span>
            <h2 className="tracking-status-title" style={styles.statusTitle}>
              {getStatusLabel(order.orderStatus)}
            </h2>
            <p className="tracking-status-description" style={styles.statusDescription}>
              {isTerminal
                ? order.cancellationReason || "This order is no longer active."
                : "We'll keep your order status updated here."}
            </p>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="tracking-grid" style={styles.grid}>
          {/* TIMELINE, ITEMS AND ADDRESS */}
          <div className="tracking-main-column">
            <section className="tracking-card" style={styles.card}>
              <span style={styles.eyebrow}>ORDER JOURNEY</span>
              <h2 className="tracking-card-title" style={styles.cardTitle}>
                Track Order
              </h2>

              {isTerminal ? (
                <div style={styles.terminalBox}>
                  <span style={styles.terminalIcon}>
                    {order.orderStatus === "cancelled" ? "❌" : "🚫"}
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
                <div className="tracking-timeline" style={styles.timeline}>
                  {STATUS_STEPS.map((step, index) => {
                    const completed = index <= currentStepIndex;
                    const current = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="tracking-timeline-item"
                        style={styles.timelineItem}
                      >
                        <div className="tracking-timeline-rail" style={styles.timelineRail}>
                          <div
                            className="tracking-timeline-circle"
                            style={{
                              ...styles.timelineCircle,
                              ...(completed
                                ? styles.timelineCircleCompleted
                                : styles.timelineCircleUpcoming),
                              ...(current ? styles.timelineCircleCurrent : {}),
                            }}
                          >
                            {step.icon}
                          </div>

                          {index < STATUS_STEPS.length - 1 && (
                            <div
                              className="tracking-timeline-line"
                              style={{
                                ...styles.timelineLine,
                                background:
                                  index < currentStepIndex ? "#267449" : "#e4ece4",
                              }}
                            />
                          )}
                        </div>

                        <div
                          className="tracking-timeline-content"
                          style={styles.timelineContent}
                        >
                          <div style={styles.timelineTitleRow}>
                            <strong
                              className="tracking-timeline-title"
                              style={{
                                ...styles.timelineTitle,
                                color: index > currentStepIndex ? "#9baa9e" : "#244e36",
                              }}
                            >
                              {step.label}
                            </strong>

                            {current && (
                              <span
                                className="tracking-current-badge"
                                style={styles.currentBadge}
                              >
                                CURRENT
                              </span>
                            )}
                          </div>

                          <p
                            className="tracking-timeline-description"
                            style={{
                              ...styles.timelineDescription,
                              color: index > currentStepIndex ? "#a3afa5" : "#718275",
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
            <section className="tracking-card" style={styles.card}>
              <span style={styles.eyebrow}>YOUR FOOD</span>
              <h2 className="tracking-card-title" style={styles.cardTitle}>
                Order Items
              </h2>

              <div style={styles.itemsList}>
                {(order.items || []).map((item, index) => (
                  <div
                    key={`${item.food}-${index}`}
                    className="tracking-item"
                    style={styles.item}
                  >
                    <img
                      className="tracking-item-image"
                      src={item.image}
                      alt={item.name}
                      style={styles.itemImage}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div style={styles.itemInfo}>
                      <strong className="tracking-item-name" style={styles.itemName}>
                        {item.name}
                      </strong>
                      <span className="tracking-item-meta" style={styles.itemMeta}>
                        ₹{item.price} × {item.quantity}
                      </span>
                    </div>

                    <strong className="tracking-item-total" style={styles.itemTotal}>
                      ₹{item.total}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* DELIVERY ADDRESS */}
            <section className="tracking-card" style={styles.card}>
              <span style={styles.eyebrow}>DELIVER TO</span>
              <h2 className="tracking-card-title" style={styles.cardTitle}>
                Delivery Address
              </h2>

              <div className="tracking-address-box" style={styles.addressBox}>
                <strong>{order.deliveryAddress?.name}</strong>
                <p style={styles.addressParagraph}>
                  {order.deliveryAddress?.street}
                  <br />
                  {order.deliveryAddress?.city},{" "}
                  {order.deliveryAddress?.state} -{" "}
                  {order.deliveryAddress?.pincode}
                </p>
                <span>📞 {order.deliveryAddress?.phone}</span>
              </div>
            </section>
          </div>

          {/* SUMMARY AND EXTRA DETAILS */}
          <div className="tracking-side-column">
            <section
              className="tracking-summary-card"
              style={styles.summaryCard}
            >
              <span style={styles.eyebrow}>ORDER SUMMARY</span>
              <h2 className="tracking-card-title" style={styles.cardTitle}>
                {order.restaurant?.name || "Restaurant"}
              </h2>

              {order.restaurant?.cuisine?.length > 0 && (
                <p className="tracking-cuisine" style={styles.restaurantCuisine}>
                  {order.restaurant.cuisine.join(" • ")}
                </p>
              )}

              <div style={styles.divider} />

              <div className="tracking-price-row" style={styles.priceRow}>
                <span>Item Total</span>
                <strong>₹{order.subtotal}</strong>
              </div>
              <div className="tracking-price-row" style={styles.priceRow}>
                <span>Delivery Fee</span>
                <strong>₹{order.deliveryFee}</strong>
              </div>
              <div className="tracking-price-row" style={styles.priceRow}>
                <span>Discount</span>
                <strong>₹{order.discount || 0}</strong>
              </div>

              <div style={styles.divider} />

              <div className="tracking-total-row" style={styles.totalRow}>
                <span>Total</span>
                <strong>₹{order.totalAmount}</strong>
              </div>

              <div className="tracking-info-row" style={styles.infoBox}>
                <span>Payment</span>
                <strong>
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                </strong>
              </div>

              <div className="tracking-info-row" style={styles.infoBox}>
                <span>Payment Status</span>
                <strong>{order.paymentStatus}</strong>
              </div>

              <div className="tracking-info-row" style={styles.infoBox}>
                <span>Placed On</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
            </section>

            {order.deliveryPartner && (
              <section className="tracking-card" style={styles.card}>
                <span style={styles.eyebrow}>DELIVERY PARTNER</span>
                <h2 className="tracking-card-title" style={styles.cardTitle}>
                  {order.deliveryPartner.name}
                </h2>
                {order.deliveryPartner.phone && (
                  <p style={styles.partnerPhone}>
                    📞 {order.deliveryPartner.phone}
                  </p>
                )}
              </section>
            )}

            {order.customerNote && (
              <section className="tracking-card" style={styles.card}>
                <span style={styles.eyebrow}>YOUR NOTE</span>
                <p style={styles.noteText}>“{order.customerNote}”</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f8f4",
    padding: "40px 20px",
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
    marginBottom: "7px",
  },
  title: {
    margin: 0,
    fontSize: "36px",
    color: "#183d29",
  },
  subtitle: {
    margin: "7px 0 0",
    color: "#75877a",
  },
  backButton: {
    border: "1px solid #dce8dc",
    background: "#fff",
    color: "#24573a",
    padding: "11px 16px",
    borderRadius: "11px",
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
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.8fr)",
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
    overflowWrap: "anywhere",
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
    minWidth: 0,
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
    overflowWrap: "anywhere",
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
    background: "#f5f8f4",
  },
  messageCard: {
    width: "100%",
    maxWidth: "430px",
    background: "#fff",
    padding: "40px 24px",
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
