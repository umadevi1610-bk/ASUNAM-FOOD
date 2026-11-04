import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyRestaurantOrders,
  updateRestaurantOrderStatus,
} from "../../services/restaurantService";

const RestaurantOrders = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [restaurantName, setRestaurantName] = useState(
    "Restaurant Partner"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // LOAD RESTAURANT ORDERS
  useEffect(() => {
    const loadOrders = async () => {
      if (!token) {
        setLoading(false);
        setError("Please login as a restaurant partner.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyRestaurantOrders(token);

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to load restaurant orders."
          );
        }

        setOrders(data.orders || []);

        if (data.restaurant?.name) {
          setRestaurantName(data.restaurant.name);
        }
      } catch (err) {
        console.error("Restaurant orders error:", err);
        setError(
          err.message || "Unable to load restaurant orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  // ORDER COUNTS
  const counts = useMemo(
    () => ({
      total: orders.length,
      newOrders: orders.filter(
        (order) => order.orderStatus === "placed"
      ).length,
      preparing: orders.filter((order) =>
        ["restaurant_accepted", "preparing"].includes(
          order.orderStatus
        )
      ).length,
      ready: orders.filter(
        (order) => order.orderStatus === "ready_for_pickup"
      ).length,
      completed: orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length,
    }),
    [orders]
  );

  // SORT ORDERS
  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [orders]
  );

  // STATUS LABEL
  const getStatusLabel = (status) => {
    const labels = {
      placed: "New Order",
      restaurant_accepted: "Accepted",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      delivery_assigned: "Delivery Assigned",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };

    return labels[status] || status;
  };

  // STATUS STYLE
  const getStatusStyle = (status) => {
    if (status === "placed") return styles.newStatus;

    if (
      ["restaurant_accepted", "preparing"].includes(status)
    ) {
      return styles.preparingStatus;
    }

    if (status === "ready_for_pickup") {
      return styles.readyStatus;
    }

    if (status === "delivered") {
      return styles.completedStatus;
    }

    if (["cancelled", "rejected"].includes(status)) {
      return styles.cancelledStatus;
    }

    return styles.defaultStatus;
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // UPDATE ORDER STATUS
  const handleUpdateStatus = async (order, status) => {
    if (!token) {
      setActionError("Please login again.");
      return;
    }

    if (updatingOrderId) return;

    let reason = "";

    if (status === "rejected") {
      const confirmed = window.confirm(
        `Are you sure you want to reject order ${order.orderNumber}?`
      );

      if (!confirmed) return;

      reason = "Rejected by restaurant";
    }

    const statusMessages = {
      restaurant_accepted: "Order accepted successfully",
      rejected: "Order rejected",
      preparing: "Food preparation started",
      ready_for_pickup: "Order is ready for pickup",
    };

    try {
      setUpdatingOrderId(order._id);
      setActionError("");
      setActionMessage("");

      const data = await updateRestaurantOrderStatus(
        order._id,
        status,
        token,
        reason
      );

      if (!data?.success || !data.order) {
        throw new Error(
          data?.message || "Unable to update order status."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? data.order
            : currentOrder
        )
      );

      setActionMessage(
        `${order.orderNumber}: ${
          statusMessages[status] || "Status updated"
        } ✅`
      );
    } catch (err) {
      console.error("Update order status error:", err);

      setActionError(
        err.message || "Unable to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // GO TO DASHBOARD
  const goToDashboard = () => {
    window.location.href = "/restaurant/dashboard";
  };

  // REFRESH ORDERS
  const handleRefresh = () => {
    window.location.reload();
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>📋</div>
          <h2>Loading orders...</h2>
          <p style={styles.messageText}>
            Getting the latest customer orders.
          </p>
        </div>
      </div>
    );
  }

  // ERROR SCREEN
  if (error) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>⚠️</div>
          <h2>Unable to load orders</h2>
          <p style={styles.messageText}>{error}</p>

          <div style={styles.errorActions}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={handleRefresh}
            >
              Try Again
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={goToDashboard}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PAGE
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoMark}>A</div>

          <div>
            <h2 style={styles.brandTitle}>ASUNAM</h2>
            <span style={styles.brandSub}>
              FOOD • PARTNER
            </span>
          </div>
        </div>

        <button
          type="button"
          style={styles.dashboardButton}
          onClick={goToDashboard}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.container}>
        {/* PAGE TITLE */}
        <section
          style={styles.titleSection}
          className="restaurant-orders-title-section"
        >
          <div>
            <span style={styles.eyebrow}>
              ORDER MANAGEMENT
            </span>

            <h1 style={styles.title}>Customer Orders</h1>

            <p style={styles.subtitle}>
              {restaurantName} • All customer orders appear here.
            </p>
          </div>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={handleRefresh}
          >
            ↻ Refresh
          </button>
        </section>

        {/* SUCCESS MESSAGE */}
        {actionMessage && (
          <div style={styles.successBox} role="status">
            ✅ {actionMessage}
          </div>
        )}

        {/* ACTION ERROR */}
        {actionError && (
          <div style={styles.actionErrorBox} role="alert">
            ⚠️ {actionError}
          </div>
        )}

        {/* ORDER STATS */}
        <section
          style={styles.statsGrid}
          className="restaurant-orders-stats"
        >
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📋</span>
            <span style={styles.statLabel}>TOTAL ORDERS</span>
            <strong style={styles.statValue}>{counts.total}</strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🛎️</span>
            <span style={styles.statLabel}>NEW ORDERS</span>
            <strong style={styles.statValue}>
              {counts.newOrders}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🍳</span>
            <span style={styles.statLabel}>PREPARING</span>
            <strong style={styles.statValue}>
              {counts.preparing}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📦</span>
            <span style={styles.statLabel}>READY</span>
            <strong style={styles.statValue}>{counts.ready}</strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <span style={styles.statLabel}>COMPLETED</span>
            <strong style={styles.statValue}>
              {counts.completed}
            </strong>
          </div>
        </section>

        {/* ORDER LIST */}
        <section style={styles.ordersSection}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>
                LIVE ORDER LIST
              </span>

              <h2 style={styles.sectionTitle}>
                Recent Customer Orders
              </h2>
            </div>

            <span style={styles.orderCountBadge}>
              {orders.length}{" "}
              {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {sortedOrders.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.bigIcon}>🛵</div>

              <h3 style={styles.emptyTitle}>
                No customer orders yet
              </h3>

              <p style={styles.emptyText}>
                New customer orders will appear here
                when someone places an order.
              </p>
            </div>
          ) : (
            <div style={styles.ordersList}>
              {sortedOrders.map((order) => (
                <article
                  key={order._id}
                  style={styles.orderCard}
                >
                  {/* ORDER HEADER */}
                  <div
                    style={styles.orderTop}
                    className="restaurant-orders-top"
                  >
                    <div>
                      <span style={styles.orderNumber}>
                        {order.orderNumber}
                      </span>

                      <h3 style={styles.customerName}>
                        {order.customer?.name ||
                          order.deliveryAddress?.name ||
                          "Customer"}
                      </h3>

                      <p style={styles.orderDate}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(order.orderStatus),
                      }}
                    >
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </div>

                  {/* CONTACT / PAYMENT / TOTAL */}
                  <div
                    style={styles.infoGrid}
                    className="restaurant-orders-info"
                  >
                    <div style={styles.infoBox}>
                      <span style={styles.infoIcon}>📞</span>
                      <div>
                        <small style={styles.infoLabel}>
                          CUSTOMER PHONE
                        </small>

                        <strong style={styles.infoValue}>
                          {order.customer?.phone ||
                            order.deliveryAddress?.phone ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoIcon}>💳</span>
                      <div>
                        <small style={styles.infoLabel}>
                          PAYMENT
                        </small>

                        <strong style={styles.infoValue}>
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </strong>

                        <small style={styles.paymentStatus}>
                          {order.paymentStatus || "pending"}
                        </small>
                      </div>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoIcon}>💰</span>
                      <div>
                        <small style={styles.infoLabel}>
                          TOTAL
                        </small>

                        <strong style={styles.infoValue}>
                          ₹{order.totalAmount}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* ORDER ITEMS */}
                  <div style={styles.itemsSection}>
                    <span style={styles.itemsTitle}>
                      ORDER ITEMS
                    </span>

                    <div style={styles.itemsList}>
                      {order.items?.map((item, index) => (
                        <div
                          key={`${order._id}-${index}`}
                          style={styles.itemRow}
                        >
                          <div style={styles.itemLeft}>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || "Food"}
                                style={styles.itemImage}
                              />
                            ) : (
                              <div style={styles.itemImagePlaceholder}>
                                🍽️
                              </div>
                            )}

                            <div>
                              <strong style={styles.itemName}>
                                {item.name}
                              </strong>

                              <span style={styles.itemQuantity}>
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>

                          <strong style={styles.itemTotal}>
                            ₹{item.total}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DELIVERY ADDRESS */}
                  <div style={styles.addressSection}>
                    <span style={styles.itemsTitle}>
                      DELIVERY ADDRESS
                    </span>

                    <p style={styles.addressText}>
                      📍 {order.deliveryAddress?.street || "-"}
                      {order.deliveryAddress?.city
                        ? `, ${order.deliveryAddress.city}`
                        : ""}
                      {order.deliveryAddress?.state
                        ? `, ${order.deliveryAddress.state}`
                        : ""}
                      {order.deliveryAddress?.pincode
                        ? ` - ${order.deliveryAddress.pincode}`
                        : ""}
                    </p>
                  </div>

                  {/* CUSTOMER NOTE */}
                  {order.customerNote && (
                    <div style={styles.noteBox}>
                      <strong>📝 Customer Note</strong>
                      <p style={styles.noteText}>
                        {order.customerNote}
                      </p>
                    </div>
                  )}

                  {/* ORDER SUMMARY AND ACTIONS */}
                  <div
                    style={styles.bottomRow}
                    className="restaurant-orders-bottom"
                  >
                    <div style={styles.summary}>
                      <span>Subtotal ₹{order.subtotal}</span>
                      <span>Delivery ₹{order.deliveryFee}</span>

                      {Number(order.discount || 0) > 0 && (
                        <span>
                          Discount −₹{order.discount}
                        </span>
                      )}

                      <strong>
                        Total ₹{order.totalAmount}
                      </strong>
                    </div>

                    {/* STATUS ACTIONS */}
                    <div style={styles.actionActions}>
                      {order.orderStatus === "placed" && (
                        <>
                          <button
                            type="button"
                            style={{
                              ...styles.statusActionButton,
                              ...styles.acceptActionButton,
                            }}
                            disabled={Boolean(updatingOrderId)}
                            onClick={() =>
                              handleUpdateStatus(
                                order,
                                "restaurant_accepted"
                              )
                            }
                          >
                            {updatingOrderId === order._id
                              ? "Updating..."
                              : "✓ Accept Order"}
                          </button>

                          <button
                            type="button"
                            style={{
                              ...styles.statusActionButton,
                              ...styles.rejectActionButton,
                            }}
                            disabled={Boolean(updatingOrderId)}
                            onClick={() =>
                              handleUpdateStatus(order, "rejected")
                            }
                          >
                            {updatingOrderId === order._id
                              ? "Updating..."
                              : "✕ Reject"}
                          </button>
                        </>
                      )}

                      {order.orderStatus ===
                        "restaurant_accepted" && (
                        <button
                          type="button"
                          style={{
                            ...styles.statusActionButton,
                            ...styles.prepActionButton,
                          }}
                          disabled={Boolean(updatingOrderId)}
                          onClick={() =>
                            handleUpdateStatus(order, "preparing")
                          }
                        >
                          {updatingOrderId === order._id
                            ? "Updating..."
                            : "🍳 Start Preparing"}
                        </button>
                      )}

                      {order.orderStatus === "preparing" && (
                        <button
                          type="button"
                          style={{
                            ...styles.statusActionButton,
                            ...styles.readyActionButton,
                          }}
                          disabled={Boolean(updatingOrderId)}
                          onClick={() =>
                            handleUpdateStatus(
                              order,
                              "ready_for_pickup"
                            )
                          }
                        >
                          {updatingOrderId === order._id
                            ? "Updating..."
                            : "📦 Ready for Pickup"}
                        </button>
                      )}

                      {[
                        "ready_for_pickup",
                        "delivery_assigned",
                        "picked_up",
                        "out_for_delivery",
                        "delivered",
                        "cancelled",
                        "rejected",
                      ].includes(order.orderStatus) && (
                        <span style={styles.actionDone}>
                          {order.orderStatus === "rejected"
                            ? "Order rejected"
                            : order.orderStatus === "delivered"
                              ? "Order completed"
                              : "Restaurant action complete"}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

// FOREST GREEN + WHITE THEME
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0fdf4",
    fontFamily: "Arial, sans-serif",
    color: "#171717",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #dcfce7",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#166534",
    color: "#fff",
    fontSize: 21,
    fontWeight: 800,
  },

  brandTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1,
  },

  brandSub: {
    display: "block",
    marginTop: 4,
    fontSize: 8,
    letterSpacing: 2,
    color: "#166534",
    fontWeight: 800,
  },

  dashboardButton: {
    border: "1px solid #cfe3d4",
    background: "#fff",
    color: "#166534",
    padding: "9px 15px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  container: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
    padding: "30px 20px 60px",
    boxSizing: "border-box",
  },

  titleSection: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 25,
  },

  eyebrow: {
    display: "inline-block",
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: 800,
    color: "#166534",
  },

  title: {
    margin: "7px 0 6px",
    fontSize: "clamp(28px, 4vw, 38px)",
    lineHeight: 1.15,
  },

  subtitle: {
    margin: 0,
    color: "#647067",
    fontSize: 14,
    lineHeight: 1.6,
  },

  refreshButton: {
    border: "1px solid #166534",
    background: "#166534",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  successBox: {
    marginBottom: 14,
    padding: "13px 15px",
    borderRadius: 12,
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    fontSize: 13,
    fontWeight: 700,
  },

  actionErrorBox: {
    marginBottom: 14,
    padding: "13px 15px",
    borderRadius: 12,
    background: "#fff0ed",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontSize: 13,
    fontWeight: 700,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 13,
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e2e8e3",
    borderRadius: 17,
    padding: 17,
    boxShadow: "0 6px 18px rgba(22,101,52,0.04)",
  },

  statIcon: {
    display: "block",
    fontSize: 22,
    marginBottom: 12,
  },

  statLabel: {
    display: "block",
    color: "#647067",
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: 800,
  },

  statValue: {
    display: "block",
    marginTop: 5,
    fontSize: 28,
    color: "#166534",
  },

  ordersSection: {
    marginTop: 38,
  },

  sectionHeading: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 16,
  },

  sectionTitle: {
    margin: "5px 0 0",
    fontSize: 26,
  },

  orderCountBadge: {
    padding: "8px 11px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 10,
    fontWeight: 800,
  },

  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  orderCard: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #e2e8e3",
    padding: 22,
    boxShadow: "0 8px 25px rgba(22,101,52,0.05)",
  },

  orderTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 15,
  },

  orderNumber: {
    display: "block",
    color: "#647067",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },

  customerName: {
    margin: "6px 0 3px",
    fontSize: 20,
  },

  orderDate: {
    margin: 0,
    color: "#647067",
    fontSize: 11,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  newStatus: {
    background: "#dcfce7",
    color: "#166534",
  },

  preparingStatus: {
    background: "#fef3c7",
    color: "#92400e",
  },

  readyStatus: {
    background: "#d1fae5",
    color: "#065f46",
  },

  completedStatus: {
    background: "#bbf7d0",
    color: "#166534",
  },

  cancelledStatus: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  defaultStatus: {
    background: "#f1f5f9",
    color: "#475569",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },

  infoBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 13,
    background: "#f8fcf9",
    border: "1px solid #e8f3eb",
    borderRadius: 12,
    minWidth: 0,
  },

  infoIcon: {
    fontSize: 20,
  },

  infoLabel: {
    display: "block",
    fontSize: 8,
    color: "#647067",
    letterSpacing: 1,
    fontWeight: 800,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 12,
    color: "#253b2b",
    overflowWrap: "anywhere",
  },

  paymentStatus: {
    display: "block",
    marginTop: 4,
    color: "#647067",
    fontSize: 10,
    textTransform: "capitalize",
  },

  itemsSection: {
    marginTop: 20,
  },

  itemsTitle: {
    display: "block",
    color: "#647067",
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: 800,
    marginBottom: 9,
  },

  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  itemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    padding: 10,
    borderRadius: 11,
    background: "#f0fdf4",
    border: "1px solid #e2e8e3",
  },

  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  itemImage: {
    width: 45,
    height: 45,
    borderRadius: 10,
    objectFit: "cover",
    flexShrink: 0,
  },

  itemImagePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 10,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    background: "#dcfce7",
    fontSize: 22,
  },

  itemName: {
    display: "block",
    fontSize: 13,
  },

  itemQuantity: {
    display: "block",
    color: "#647067",
    fontSize: 10,
    marginTop: 3,
  },

  itemTotal: {
    fontSize: 13,
    flexShrink: 0,
    color: "#166534",
  },

  addressSection: {
    marginTop: 19,
    paddingTop: 17,
    borderTop: "1px solid #e2e8e3",
  },

  addressText: {
    margin: 0,
    color: "#475569",
    fontSize: 12,
    lineHeight: 1.6,
  },

  noteBox: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 11,
    background: "#f0fdf4",
    border: "1px solid #dcfce7",
    color: "#166534",
    fontSize: 12,
  },

  noteText: {
    margin: "6px 0 0",
    lineHeight: 1.5,
    color: "#253b2b",
  },

  bottomRow: {
    marginTop: 18,
    paddingTop: 17,
    borderTop: "1px solid #e2e8e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },

  summary: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    color: "#647067",
    fontSize: 11,
  },

  actionActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 9,
  },

  statusActionButton: {
    border: "none",
    padding: "11px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 800,
  },

  acceptActionButton: {
    background: "#166534",
    color: "#fff",
  },

  rejectActionButton: {
    background: "#fff0ed",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },

  prepActionButton: {
    background: "#fef3c7",
    color: "#92400e",
  },

  readyActionButton: {
    background: "#d1fae5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },

  actionDone: {
    fontSize: 11,
    color: "#166534",
    fontWeight: 700,
  },

  emptyCard: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #e2e8e3",
    padding: "60px 20px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(22,101,52,0.04)",
  },

  emptyTitle: {
    margin: "6px 0",
    fontSize: 19,
  },

  emptyText: {
    maxWidth: 430,
    margin: "6px auto 0",
    color: "#647067",
    fontSize: 13,
    lineHeight: 1.6,
  },

  centerPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "#f0fdf4",
  },

  messageCard: {
    width: "100%",
    maxWidth: 430,
    background: "#fff",
    border: "1px solid #e2e8e3",
    borderRadius: 20,
    padding: "45px 25px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(22,101,52,0.07)",
  },

  bigIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  messageText: {
    color: "#647067",
    lineHeight: 1.6,
    fontSize: 13,
  },

  errorActions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 20,
  },

  primaryButton: {
    border: "1px solid #166534",
    background: "#166534",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  secondaryButton: {
    border: "1px solid #cfe3d4",
    background: "#fff",
    color: "#166534",
    padding: "11px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
};

// RESPONSIVE CSS
const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  @media (max-width: 1000px) {
    .restaurant-orders-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    .restaurant-orders-info {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 700px) {
    .restaurant-orders-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .restaurant-orders-title-section {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .restaurant-orders-top {
      flex-direction: column !important;
    }

    .restaurant-orders-bottom {
      align-items: flex-start !important;
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .restaurant-orders-stats {
      grid-template-columns: 1fr !important;
    }
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed !important;
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default RestaurantOrders;