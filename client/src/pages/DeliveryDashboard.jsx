
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  getAvailableOrders,
  getMyDeliveries,
  acceptDeliveryOrder,
  updateDeliveryStatus,
} from "../services/deliveryService";

const GREEN = "#166534";
const DARK_GREEN = "#14532D";
const LIGHT_GREEN = "#DCFCE7";
const PALE_GREEN = "#F0FDF4";
const BORDER_GREEN = "#BBF7D0";
const MUTED_GREEN = "#64816F";

const styles = {
  page: {
    minHeight: "100vh",
    background: PALE_GREEN,
    fontFamily: "Arial, sans-serif",
    color: DARK_GREEN,
  },
  header: {
    background: "#FFFFFF",
    borderBottom: `1px solid ${BORDER_GREEN}`,
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    boxShadow: "0 2px 10px rgba(22,101,52,0.04)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    width: "43px",
    height: "43px",
    borderRadius: "13px",
    background: GREEN,
    color: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    fontWeight: 800,
  },
  brandName: {
    margin: 0,
    fontSize: "19px",
    color: DARK_GREEN,
  },
  brandSub: {
    color: GREEN,
    fontSize: "10px",
    letterSpacing: "3px",
    fontWeight: 800,
  },
  logoutButton: {
    padding: "10px 16px",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "10px",
    background: "#FFFFFF",
    color: DARK_GREEN,
    cursor: "pointer",
    fontWeight: 700,
  },
  container: {
    maxWidth: "1150px",
    width: "90%",
    margin: "0 auto",
    padding: "32px 0 50px",
  },
  welcome: {
    marginBottom: "25px",
  },
  eyebrow: {
    color: GREEN,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.8px",
  },
  title: {
    margin: "8px 0",
    fontSize: "clamp(25px, 4vw, 34px)",
    color: DARK_GREEN,
  },
  subtitle: {
    color: MUTED_GREEN,
    lineHeight: 1.6,
    margin: 0,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  statCard: {
    background: "#FFFFFF",
    padding: "20px",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "16px",
    boxShadow: "0 5px 18px rgba(22,101,52,0.04)",
    minWidth: 0,
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: 800,
    margin: "8px 0 4px",
    color: GREEN,
    overflowWrap: "anywhere",
  },
  statLabel: {
    color: MUTED_GREEN,
    fontSize: "13px",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: "34px",
  },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "17px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: DARK_GREEN,
  },
  refreshText: {
    fontSize: "12px",
    color: MUTED_GREEN,
  },
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
    gap: "18px",
  },
  card: {
    background: "#FFFFFF",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "17px",
    padding: "20px",
    boxShadow: "0 5px 18px rgba(22,101,52,0.05)",
    minWidth: 0,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  orderNumber: {
    fontWeight: 800,
    fontSize: "14px",
    color: DARK_GREEN,
    overflowWrap: "anywhere",
  },
  badge: {
    display: "inline-block",
    background: LIGHT_GREEN,
    color: GREEN,
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  restaurantName: {
    fontSize: "18px",
    margin: "0 0 7px",
    color: DARK_GREEN,
  },
  muted: {
    color: MUTED_GREEN,
    fontSize: "13px",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
  divider: {
    height: "1px",
    background: BORDER_GREEN,
    margin: "15px 0",
  },
  foodLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    margin: "9px 0",
    fontSize: "13px",
    color: DARK_GREEN,
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    fontWeight: 800,
    marginTop: "15px",
    color: DARK_GREEN,
  },
  primaryButton: {
    width: "100%",
    padding: "12px 15px",
    border: `1px solid ${GREEN}`,
    borderRadius: "11px",
    background: GREEN,
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "15px",
    transition: "background 0.2s ease",
  },
  secondaryButton: {
    width: "100%",
    padding: "12px 15px",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "11px",
    background: LIGHT_GREEN,
    color: DARK_GREEN,
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "15px",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "wait",
  },
  message: {
    background: "#FFFFFF",
    padding: "26px 18px",
    textAlign: "center",
    borderRadius: "15px",
    border: `1px solid ${BORDER_GREEN}`,
    color: MUTED_GREEN,
    lineHeight: 1.7,
  },
  notice: {
    background: LIGHT_GREEN,
    border: `1px solid ${BORDER_GREEN}`,
    color: GREEN,
    borderRadius: "12px",
    padding: "13px 15px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  error: {
    background: "#F0FDF4",
    border: `1px solid ${BORDER_GREEN}`,
    color: DARK_GREEN,
    borderRadius: "12px",
    padding: "13px 15px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  authCard: {
    maxWidth: "450px",
    margin: "100px auto",
    padding: "30px",
    background: "#FFFFFF",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "18px",
    textAlign: "center",
    color: DARK_GREEN,
    boxShadow: "0 8px 28px rgba(22,101,52,0.06)",
  },
};

const formatStatus = (status = "") =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatAddress = (address) => {
  if (!address) return "Address not available";

  if (typeof address === "string") return address;

  if (typeof address.address === "string" && address.address.trim()) {
    return address.address;
  }

  return [
    address.street,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ") || "Address not available";
};

function DeliveryDashboard() {
  const {
    user,
    token,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuth();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refreshDashboard = useCallback(
    async (showLoader = false) => {
      if (!token) return;

      if (showLoader) setLoading(true);

      try {
        const [availableData, deliveryData] = await Promise.all([
          getAvailableOrders(token),
          getMyDeliveries(token),
        ]);

        setAvailableOrders(availableData.orders || []);
        setDeliveries(deliveryData.deliveries || []);
        setError("");
      } catch (err) {
        console.error("Load delivery dashboard error:", err);

        setError(
          err.message ||
            "Could not load delivery data. Please try again."
        );
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      user?.role !== "delivery"
    ) {
      return;
    }

    refreshDashboard(true);

    const intervalId = window.setInterval(() => {
      refreshDashboard(false);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [
    authLoading,
    isAuthenticated,
    user?.role,
    refreshDashboard,
  ]);

  const activeDeliveries = deliveries.filter(
    (delivery) =>
      !["delivered", "cancelled"].includes(delivery.status)
  );

  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  );

  // Income is calculated only from completed deliveries.
  const totalIncome = completedDeliveries.reduce(
    (total, delivery) =>
      total + Number(delivery.deliveryFee || 0),
    0
  );

  const handleAcceptOrder = async (order) => {
    if (!window.confirm(`Accept order ${order.orderNumber}?`)) {
      return;
    }

    setProcessingId(order._id);
    setError("");
    setNotice("");

    try {
      const data = await acceptDeliveryOrder(order._id, token);

      setNotice(data.message || "Order accepted successfully.");
      await refreshDashboard(false);
    } catch (err) {
      console.error("Accept order error:", err);

      setError(err.message || "Unable to accept this order.");
      await refreshDashboard(false);
    } finally {
      setProcessingId("");
    }
  };

  const handleUpdateStatus = async (delivery, nextStatus) => {
    const labels = {
      picked_up: "mark this order as picked up",
      out_for_delivery: "start the delivery",
      delivered: "mark this order as delivered",
    };

    if (
      !window.confirm(
        `Are you sure you want to ${labels[nextStatus]}?`
      )
    ) {
      return;
    }

    setProcessingId(delivery._id);
    setError("");
    setNotice("");

    try {
      const data = await updateDeliveryStatus(
        delivery._id,
        nextStatus,
        token
      );

      setNotice(data.message || "Delivery status updated.");
      await refreshDashboard(false);
    } catch (err) {
      console.error("Update delivery status error:", err);

      setError(err.message || "Unable to update delivery status.");
      await refreshDashboard(false);
    } finally {
      setProcessingId("");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const activeOrdersCount = activeDeliveries.length;

  if (authLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.authCard}>Checking your login...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "delivery") {
    return (
      <div style={styles.page}>
        <div style={styles.authCard}>
          <div style={{ fontSize: "45px" }}>🔐</div>
          <h2>Delivery Partner Login Required</h2>
          <p style={styles.muted}>
            Please log in using your delivery partner account.
          </p>

          <button
            type="button"
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.authCard}>
          <div style={{ fontSize: "42px" }}>🛵</div>
          <h2>Loading your dashboard...</h2>
          <p style={styles.muted}>Fetching available deliveries.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>A</div>

          <div>
            <h2 style={styles.brandName}>ASUNAM FOOD</h2>
            <span style={styles.brandSub}>DELIVERY PARTNER</span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.logoutButton}
            onClick={() => {
              window.location.href = "/delivery/profile";
            }}
          >
            👤 My Profile
          </button>

          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Log out ↗
          </button>
        </div>
      </header>

      <main style={styles.container}>
        <section style={styles.welcome}>
          <span style={styles.eyebrow}>DELIVERY PARTNER PORTAL</span>

          <h1 style={styles.title}>
            Hey, {user?.name || "Partner"}! 🛵
          </h1>

          <p style={styles.subtitle}>
            Find ready orders, manage your deliveries and keep customers
            updated.
          </p>
        </section>

        {notice && <div style={styles.notice}>✅ {notice}</div>}
        {error && <div style={styles.error}>⚠️ {error}</div>}

        <section style={styles.stats}>
          <div style={styles.statCard}>
            <span>📦</span>
            <div style={styles.statNumber}>{availableOrders.length}</div>
            <div style={styles.statLabel}>Available orders</div>
          </div>

          <div style={styles.statCard}>
            <span>🛵</span>
            <div style={styles.statNumber}>{activeOrdersCount}</div>
            <div style={styles.statLabel}>Active deliveries</div>
          </div>

          <div style={styles.statCard}>
            <span>✅</span>
            <div style={styles.statNumber}>
              {completedDeliveries.length}
            </div>
            <div style={styles.statLabel}>Completed deliveries</div>
          </div>

          <div style={styles.statCard}>
            <span>💰</span>
            <div style={styles.statNumber}>
              ₹{totalIncome.toLocaleString("en-IN")}
            </div>
            <div style={styles.statLabel}>Total income earned</div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <h2 style={styles.sectionTitle}>Available Orders</h2>
            <span style={styles.refreshText}>
              Refreshes automatically every 10 seconds
            </span>
          </div>

          {availableOrders.length === 0 ? (
            <div style={styles.message}>
              <div style={{ fontSize: "38px" }}>🍽️</div>
              <strong>No orders available right now</strong>
              <div>
                New orders will appear here when restaurants mark them
                ready for pickup.
              </div>
            </div>
          ) : (
            <div style={styles.grid}>
              {availableOrders.map((order) => (
                <article key={order._id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.orderNumber}>
                      Order #{order.orderNumber}
                    </div>

                    <span style={styles.badge}>READY FOR PICKUP</span>
                  </div>

                  <h3 style={styles.restaurantName}>
                    {order.restaurant?.name || "Restaurant"}
                  </h3>

                  <p style={styles.muted}>
                    📍 {formatAddress(order.restaurant?.address)}
                  </p>

                  <div style={styles.divider} />

                  {order.items?.map((item, index) => (
                    <div
                      key={`${order._id}-${index}`}
                      style={styles.foodLine}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <strong>₹{item.total}</strong>
                    </div>
                  ))}

                  <div style={styles.total}>
                    <span>Customer bill</span>
                    <span>₹{order.totalAmount}</span>
                  </div>

                  <p style={styles.muted}>
                    Payment:{" "}
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online"}
                  </p>

                  <button
                    type="button"
                    style={{
                      ...styles.primaryButton,
                      ...(processingId === order._id
                        ? styles.disabledButton
                        : {}),
                    }}
                    disabled={!!processingId}
                    onClick={() => handleAcceptOrder(order)}
                  >
                    {processingId === order._id
                      ? "Accepting..."
                      : "Accept Order →"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <h2 style={styles.sectionTitle}>My Deliveries</h2>
            <span style={styles.refreshText}>
              Your accepted and completed orders
            </span>
          </div>

          {deliveries.length === 0 ? (
            <div style={styles.message}>
              <div style={{ fontSize: "38px" }}>🛵</div>
              <strong>No deliveries assigned yet</strong>
              <div>Accept an available order to see it here.</div>
            </div>
          ) : (
            <div style={styles.grid}>
              {deliveries.map((delivery) => {
                const order = delivery.order;
                const status = delivery.status;

                let nextStatus = null;
                let actionLabel = "";

                if (status === "accepted") {
                  nextStatus = "picked_up";
                  actionLabel = "Confirm Pickup";
                } else if (status === "picked_up") {
                  nextStatus = "out_for_delivery";
                  actionLabel = "Start Delivery";
                } else if (status === "out_for_delivery") {
                  nextStatus = "delivered";
                  actionLabel = "Mark as Delivered";
                }

                return (
                  <article key={delivery._id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <div style={styles.orderNumber}>
                        Order #{order?.orderNumber || "Order"}
                      </div>

                      <span style={styles.badge}>
                        {formatStatus(status).toUpperCase()}
                      </span>
                    </div>

                    <h3 style={styles.restaurantName}>
                      {delivery.restaurant?.name ||
                        order?.restaurant?.name ||
                        "Restaurant"}
                    </h3>

                    <p style={styles.muted}>
                      📍 Pickup: {formatAddress(delivery.pickupLocation)}
                    </p>

                    <p style={styles.muted}>
                      🏠 Deliver to: {formatAddress(order?.deliveryAddress)}
                    </p>

                    {order?.deliveryAddress?.name && (
                      <p style={styles.muted}>
                        Customer: {order.deliveryAddress.name}
                      </p>
                    )}

                    {order?.deliveryAddress?.phone && (
                      <p style={styles.muted}>
                        📞 {order.deliveryAddress.phone}
                      </p>
                    )}

                    <div style={styles.divider} />

                    {order?.items?.map((item, index) => (
                      <div
                        key={`${delivery._id}-${index}`}
                        style={styles.foodLine}
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>

                        <strong>₹{item.total}</strong>
                      </div>
                    ))}

                    <div style={styles.total}>
                      <span>Delivery fee</span>
                      <span>₹{delivery.deliveryFee || 0}</span>
                    </div>

                    {nextStatus ? (
                      <button
                        type="button"
                        style={{
                          ...styles.primaryButton,
                          ...(processingId === delivery._id
                            ? styles.disabledButton
                            : {}),
                        }}
                        disabled={!!processingId}
                        onClick={() =>
                          handleUpdateStatus(delivery, nextStatus)
                        }
                      >
                        {processingId === delivery._id
                          ? "Updating..."
                          : `${actionLabel} →`}
                      </button>
                    ) : (
                      <div
                        style={{
                          ...styles.notice,
                          marginTop: "15px",
                          marginBottom: 0,
                        }}
                      >
                        ✅{" "}
                        {status === "delivered"
                          ? "Delivery completed"
                          : formatStatus(status)}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => refreshDashboard(true)}
        >
          ↻ Refresh dashboard
        </button>
      </main>
    </div>
  );
}

export default DeliveryDashboard;
