
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyRestaurantOrders } from "../../services/restaurantService";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RestaurantDashboard = () => {
  const { user, token, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [restaurantName, setRestaurantName] = useState(
    user?.name || "Restaurant Partner"
  );

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  // OPEN / CLOSE STATUS
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // ======================================
  // LOAD RESTAURANT ORDERS
  // ======================================
  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      if (!token) {
        setLoadingOrders(false);
        setError("Please log in to your restaurant account.");
        return;
      }

      try {
        setLoadingOrders(true);
        setError("");

        const data = await getMyRestaurantOrders(token);

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to load restaurant orders."
          );
        }

        if (cancelled) return;

        setOrders(data.orders || []);

        if (data.restaurant?.name) {
          setRestaurantName(data.restaurant.name);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Restaurant orders error:", err);
          setError(
            err.message || "Unable to load restaurant orders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ======================================
  // LOAD RESTAURANT OPEN / CLOSE STATUS
  // ======================================
  useEffect(() => {
    let cancelled = false;

    const loadRestaurantStatus = async () => {
      if (!token) {
        setStatusLoading(false);
        setStatusError("Please log in again.");
        return;
      }

      try {
        setStatusLoading(true);
        setStatusError("");

        const response = await fetch(`${API}/restaurants/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load restaurant status."
          );
        }

        if (cancelled) return;

        setIsRestaurantOpen(data.restaurant?.isOpen ?? true);

        if (data.restaurant?.name) {
          setRestaurantName(data.restaurant.name);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Restaurant status error:", err);

          setStatusError(
            err.message || "Unable to load restaurant status."
          );
        }
      } finally {
        if (!cancelled) {
          setStatusLoading(false);
        }
      }
    };

    loadRestaurantStatus();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ======================================
  // ORDER COUNTS
  // ======================================
  const orderCounts = useMemo(() => {
    const newOrders = orders.filter(
      (order) => order.orderStatus === "placed"
    ).length;

    const preparingOrders = orders.filter((order) =>
      ["restaurant_accepted", "preparing"].includes(
        order.orderStatus
      )
    ).length;

    const readyOrders = orders.filter(
      (order) => order.orderStatus === "ready_for_pickup"
    ).length;

    const completedOrders = orders.filter(
      (order) => order.orderStatus === "delivered"
    ).length;

    return {
      newOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
    };
  }, [orders]);

  // ======================================
  // RECENT ORDERS
  // ======================================
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [orders]);

  // ======================================
  // STATUS LABEL
  // ======================================
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

  // ======================================
  // STATUS STYLE
  // ======================================
  const getStatusStyle = (status) => {
    if (status === "placed") {
      return styles.statusNew;
    }

    if (
      ["restaurant_accepted", "preparing"].includes(status)
    ) {
      return styles.statusPreparing;
    }

    if (status === "ready_for_pickup") {
      return styles.statusReady;
    }

    if (status === "delivered") {
      return styles.statusCompleted;
    }

    if (["cancelled", "rejected"].includes(status)) {
      return styles.statusCancelled;
    }

    return styles.statusDefault;
  };

  // ======================================
  // FORMAT DATE
  // ======================================
  const formatOrderDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================
  // LOGOUT
  // ======================================
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // ======================================
  // GO ORDERS
  // ======================================
  const goToOrders = () => {
    window.location.href = "/restaurant/orders";
  };

  // ======================================
  // GO MENU
  // ======================================
  const goToMenu = () => {
    sessionStorage.setItem(
      "asunamRestaurantDashboardPath",
      window.location.pathname
    );

    window.location.href = "/restaurant/menu";
  };

  // ======================================
  // GO PROFILE
  // ======================================
  const goToProfile = () => {
    sessionStorage.setItem(
      "asunamRestaurantDashboardPath",
      window.location.pathname
    );

    window.location.href = "/restaurant/profile";
  };

  // ======================================
  // TOGGLE RESTAURANT OPEN / CLOSE
  // ======================================
  const handleToggleRestaurantStatus = async () => {
    if (!token || typeof isRestaurantOpen !== "boolean") {
      setStatusError("Restaurant status is not available yet.");
      return;
    }

    if (updatingStatus) return;

    // Confirm before closing the restaurant.
    if (isRestaurantOpen) {
      const confirmed = window.confirm(
        "Are you sure you want to close your restaurant?"
      );

      if (!confirmed) return;
    }

    const nextStatus = !isRestaurantOpen;

    try {
      setUpdatingStatus(true);
      setStatusError("");
      setStatusMessage("");

      const response = await fetch(`${API}/restaurants/mine`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isOpen: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update restaurant status."
        );
      }

      // Use the status returned by the server.
      const savedStatus =
        typeof data.restaurant?.isOpen === "boolean"
          ? data.restaurant.isOpen
          : nextStatus;

      setIsRestaurantOpen(savedStatus);

      setStatusMessage(
        savedStatus
          ? "Restaurant is now OPEN! 💚"
          : "Restaurant is now CLOSED."
      );
    } catch (err) {
      console.error("Toggle restaurant status error:", err);

      setStatusError(
        err.message || "Unable to update restaurant status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ======================================
  // DASHBOARD
  // ======================================
  return (
    <div style={styles.page}>
      {/* HEADER */}
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
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main
        style={styles.container}
        className="asunam-container"
      >
        {/* WELCOME */}
        <section
          style={styles.hero}
          className="asunam-hero"
        >
          <div>
            <span style={styles.eyebrow}>
              RESTAURANT DASHBOARD
            </span>

            <h1 style={styles.heroTitle}>
              Welcome back,
              <br />
              {restaurantName} 👋
            </h1>

            <p style={styles.heroText}>
              Manage your restaurant, menu and customer
              orders from one place.
            </p>
          </div>

          <div
            style={styles.heroIcon}
            className="asunam-hero-icon"
          >
            🏪
          </div>
        </section>

        {/* RESTAURANT OPEN / CLOSE STATUS */}
        <section style={styles.statusCard}>
          <div style={styles.statusLeft}>
            <div
              style={{
                ...styles.statusIcon,
                background:
                  isRestaurantOpen === true
                    ? "#dcfce7"
                    : isRestaurantOpen === false
                      ? "#fee2e2"
                      : "#f1f5f9",
                color:
                  isRestaurantOpen === true
                    ? "#166534"
                    : isRestaurantOpen === false
                      ? "#b91c1c"
                      : "#64748b",
              }}
            >
              ●
            </div>

            <div>
              <span style={styles.statusLabel}>
                RESTAURANT STATUS
              </span>

              <h3 style={styles.statusTitle}>
                {statusLoading
                  ? "Checking status..."
                  : isRestaurantOpen === true
                    ? "Open & Ready"
                    : isRestaurantOpen === false
                      ? "Restaurant Closed"
                      : "Status unavailable"}
              </h3>

              <p style={styles.statusText}>
                {statusLoading
                  ? "Loading your saved restaurant status..."
                  : isRestaurantOpen === true
                    ? "Your restaurant is marked open."
                    : isRestaurantOpen === false
                      ? "Your restaurant is marked closed."
                      : "Please check your connection and reload."}
              </p>
            </div>
          </div>

          <button
            type="button"
            style={{
              ...styles.manageButton,
              background:
                isRestaurantOpen === true
                  ? "#b91c1c"
                  : "#166534",
              opacity:
                statusLoading ||
                updatingStatus ||
                typeof isRestaurantOpen !== "boolean"
                  ? 0.65
                  : 1,
              cursor:
                statusLoading ||
                updatingStatus ||
                typeof isRestaurantOpen !== "boolean"
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={
              statusLoading ||
              updatingStatus ||
              typeof isRestaurantOpen !== "boolean"
            }
            onClick={handleToggleRestaurantStatus}
          >
            {updatingStatus
              ? "Updating..."
              : statusLoading
                ? "Loading..."
                : isRestaurantOpen
                  ? "Close Restaurant"
                  : "Open Restaurant"}
          </button>
        </section>

        {statusError && (
          <div style={styles.errorBox} role="alert">
            ⚠️ {statusError}
          </div>
        )}

        {statusMessage && (
          <div style={styles.successBox} role="status">
            ✅ {statusMessage}
          </div>
        )}

        {/* ORDER STATS */}
        <section
          style={styles.statsGrid}
          className="asunam-stats-grid"
        >
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🛎️</div>
            <span style={styles.statLabel}>NEW ORDERS</span>
            <strong style={styles.statValue}>
              {loadingOrders ? "..." : orderCounts.newOrders}
            </strong>
            <span style={styles.statHint}>Waiting for action</span>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🍳</div>
            <span style={styles.statLabel}>PREPARING</span>
            <strong style={styles.statValue}>
              {loadingOrders
                ? "..."
                : orderCounts.preparingOrders}
            </strong>
            <span style={styles.statHint}>Orders in kitchen</span>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <span style={styles.statLabel}>READY</span>
            <strong style={styles.statValue}>
              {loadingOrders ? "..." : orderCounts.readyOrders}
            </strong>
            <span style={styles.statHint}>Waiting for pickup</span>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <span style={styles.statLabel}>COMPLETED</span>
            <strong style={styles.statValue}>
              {loadingOrders
                ? "..."
                : orderCounts.completedOrders}
            </strong>
            <span style={styles.statHint}>Delivered orders</span>
          </div>
        </section>

        {/* ORDER ERROR */}
        {error && (
          <div style={styles.errorBox} role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* QUICK ACTIONS */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>QUICK ACTIONS</span>

              <h2 style={styles.sectionTitle}>
                Manage your restaurant
              </h2>
            </div>
          </div>

          <div
            style={styles.actionGrid}
            className="asunam-action-grid"
          >
            {/* ORDERS */}
            <button
              type="button"
              style={styles.actionCard}
              onClick={goToOrders}
            >
              <div style={styles.actionIcon}>📋</div>

              <div style={styles.actionContent}>
                <strong>Orders</strong>
                <span>
                  View and manage customer orders
                </span>
              </div>

              <div style={styles.actionArrow}>→</div>
            </button>

            {/* MENU */}
            <button
              type="button"
              style={styles.actionCard}
              onClick={goToMenu}
            >
              <div style={styles.actionIcon}>🍽️</div>

              <div style={styles.actionContent}>
                <strong>Manage Menu</strong>
                <span>
                  Add, edit and manage food items
                </span>
              </div>

              <div style={styles.actionArrow}>→</div>
            </button>

            {/* PROFILE */}
            <button
              type="button"
              style={styles.actionCard}
              onClick={goToProfile}
            >
              <div style={styles.actionIcon}>⚙️</div>

              <div style={styles.actionContent}>
                <strong>Restaurant Profile</strong>
                <span>
                  Manage restaurant information
                </span>
              </div>

              <div style={styles.actionArrow}>→</div>
            </button>
          </div>
        </section>

        {/* RECENT ORDERS */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>ORDERS</span>

              <h2 style={styles.sectionTitle}>
                Recent orders
              </h2>
            </div>

            <button
              type="button"
              style={styles.viewAllButton}
              onClick={goToOrders}
            >
              View all →
            </button>
          </div>

          {loadingOrders ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>⏳</div>
              <h3 style={styles.emptyTitle}>
                Loading orders...
              </h3>
              <p style={styles.emptyText}>
                Getting the latest customer orders.
              </p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>🛵</div>
              <h3 style={styles.emptyTitle}>No orders yet</h3>
              <p style={styles.emptyText}>
                Customer orders will appear here as soon
                as they are placed.
              </p>
            </div>
          ) : (
            <div style={styles.ordersList}>
              {recentOrders.map((order) => (
                <article
                  key={order._id}
                  style={styles.orderCard}
                  className="asunam-order-card"
                >
                  <div style={styles.orderMain}>
                    <div style={styles.orderTop}>
                      <span style={styles.orderNumber}>
                        {order.orderNumber}
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(order.orderStatus),
                        }}
                      >
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </div>

                    <h3 style={styles.customerName}>
                      {order.customer?.name ||
                        order.deliveryAddress?.name ||
                        "Customer"}
                    </h3>

                    <p style={styles.orderDate}>
                      {formatOrderDate(order.createdAt)}
                    </p>

                    <div style={styles.itemsList}>
                      {order.items?.map((item, index) => (
                        <span
                          key={`${order._id}-${index}`}
                          style={styles.itemTag}
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={styles.orderRight}
                    className="asunam-order-right"
                  >
                    <strong style={styles.orderAmount}>
                      ₹{order.totalAmount}
                    </strong>

                    <span style={styles.paymentText}>
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>

                    <button
                      type="button"
                      style={styles.orderButton}
                      onClick={goToOrders}
                    >
                      View Order →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ACCOUNT INFO */}
        <section style={styles.accountCard}>
          <div>
            <span style={styles.eyebrow}>PARTNER ACCOUNT</span>

            <h2 style={styles.accountTitle}>
              {user?.name || restaurantName}
            </h2>

            <p style={styles.accountText}>
              {user?.email || "Restaurant email not available"}
            </p>

            {user?.phone && (
              <p style={styles.accountText}>
                📞 {user.phone}
              </p>
            )}
          </div>

          <div style={styles.roleBadge}>RESTAURANT</div>
        </section>
      </main>
    </div>
  );
};

// ======================================
// FOREST GREEN + WHITE STYLES
// ======================================
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0fdf4 0%, #f7f7f7 55%, #ecfdf5 100%)",
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
    borderBottom: "1px solid #e2e8e3",
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
    color: "#ffffff",
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

  logoutButton: {
    border: "1px solid #cfe3d4",
    background: "#ffffff",
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

  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 25,
    padding: 32,
    borderRadius: 24,
    background:
      "linear-gradient(135deg, #ffffff, #f0fdf4)",
    border: "1px solid #dcfce7",
    boxShadow: "0 12px 35px rgba(22,101,52,0.05)",
  },

  eyebrow: {
    display: "inline-block",
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: 800,
    color: "#166534",
  },

  heroTitle: {
    margin: "8px 0 10px",
    fontSize: "clamp(28px, 4vw, 38px)",
    lineHeight: 1.12,
  },

  heroText: {
    margin: 0,
    maxWidth: 650,
    color: "#647067",
    fontSize: 14,
    lineHeight: 1.6,
  },

  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #dcfce7",
    fontSize: 48,
    flexShrink: 0,
  },

  statusCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #e2e8e3",
    boxShadow: "0 6px 20px rgba(22,101,52,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 15,
  },

  statusLeft: {
    display: "flex",
    alignItems: "center",
    gap: 13,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },

  statusLabel: {
    display: "block",
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#647067",
    fontWeight: 800,
  },

  statusTitle: {
    margin: "4px 0 2px",
    fontSize: 16,
  },

  statusText: {
    margin: 0,
    color: "#647067",
    fontSize: 12,
    lineHeight: 1.5,
  },

  manageButton: {
    border: "none",
    borderRadius: 10,
    color: "#ffffff",
    padding: "11px 15px",
    fontWeight: 700,
  },

  successBox: {
    marginTop: 12,
    padding: "13px 15px",
    borderRadius: 12,
    background: "#dcfce7",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: 13,
    fontWeight: 700,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 15,
    marginTop: 20,
  },

  statCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 19,
    border: "1px solid #e2e8e3",
    boxShadow: "0 6px 20px rgba(22,101,52,0.04)",
  },

  statIcon: {
    fontSize: 22,
    marginBottom: 14,
  },

  statLabel: {
    display: "block",
    color: "#647067",
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: 800,
  },

  statValue: {
    display: "block",
    marginTop: 5,
    fontSize: 30,
    color: "#166534",
  },

  statHint: {
    display: "block",
    marginTop: 4,
    color: "#647067",
    fontSize: 11,
  },

  errorBox: {
    marginTop: 20,
    padding: "13px 15px",
    borderRadius: 12,
    background: "#fff1f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 600,
  },

  section: {
    marginTop: 35,
  },

  sectionHeading: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 15,
  },

  sectionTitle: {
    margin: "5px 0 0",
    fontSize: 25,
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 15,
  },

  actionCard: {
    border: "1px solid #e2e8e3",
    background: "#ffffff",
    borderRadius: 17,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 13,
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 6px 18px rgba(22,101,52,0.04)",
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },

  actionContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#171717",
  },

  actionArrow: {
    color: "#166534",
    fontSize: 20,
    fontWeight: 800,
  },

  viewAllButton: {
    border: "none",
    background: "transparent",
    color: "#166534",
    cursor: "pointer",
    fontWeight: 700,
  },

  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  orderCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    background: "#ffffff",
    borderRadius: 18,
    border: "1px solid #e2e8e3",
    padding: 18,
    boxShadow: "0 6px 18px rgba(22,101,52,0.04)",
  },

  orderMain: {
    flex: 1,
    minWidth: 0,
  },

  orderTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  orderNumber: {
    fontSize: 11,
    color: "#647067",
    fontWeight: 700,
    letterSpacing: 0.5,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 9px",
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.4,
  },

  statusNew: {
    background: "#dcfce7",
    color: "#166534",
  },

  statusPreparing: {
    background: "#fef3c7",
    color: "#92400e",
  },

  statusReady: {
    background: "#d1fae5",
    color: "#065f46",
  },

  statusCompleted: {
    background: "#bbf7d0",
    color: "#166534",
  },

  statusCancelled: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  statusDefault: {
    background: "#f1f5f9",
    color: "#475569",
  },

  customerName: {
    margin: "9px 0 3px",
    fontSize: 16,
  },

  orderDate: {
    margin: 0,
    color: "#647067",
    fontSize: 11,
  },

  itemsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },

  itemTag: {
    padding: "6px 9px",
    borderRadius: 8,
    background: "#f0fdf4",
    border: "1px solid #e2e8e3",
    color: "#475569",
    fontSize: 11,
  },

  orderRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },

  orderAmount: {
    fontSize: 19,
    color: "#166534",
  },

  paymentText: {
    color: "#647067",
    fontSize: 10,
    textAlign: "right",
  },

  orderButton: {
    marginTop: 5,
    border: "none",
    background: "#166534",
    color: "#ffffff",
    padding: "9px 12px",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
  },

  emptyCard: {
    background: "#ffffff",
    borderRadius: 18,
    border: "1px solid #e2e8e3",
    padding: "45px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 46,
    marginBottom: 10,
  },

  emptyTitle: {
    margin: "5px 0",
    fontSize: 18,
  },

  emptyText: {
    margin: "5px auto 0",
    maxWidth: 430,
    color: "#647067",
    fontSize: 13,
    lineHeight: 1.6,
  },

  accountCard: {
    marginTop: 35,
    background: "#171717",
    color: "#ffffff",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  accountTitle: {
    margin: "6px 0 4px",
    fontSize: 21,
  },

  accountText: {
    margin: "4px 0",
    color: "#d1d5db",
    fontSize: 12,
  },

  roleBadge: {
    padding: "8px 11px",
    borderRadius: 999,
    background: "#166534",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1,
    whiteSpace: "nowrap",
  },
};

// ======================================
// RESPONSIVE CSS
// ======================================
const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  @media (max-width: 900px) {
    .asunam-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .asunam-action-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .asunam-order-card {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .asunam-order-right {
      align-items: flex-start !important;
    }
  }

  @media (max-width: 600px) {
    .asunam-container {
      padding: 18px 12px 36px !important;
    }

    .asunam-hero {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 10px !important;
      padding: 20px 17px !important;
      border-radius: 18px !important;
    }

    .asunam-hero-icon {
      display: none !important;
    }

    .asunam-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
    }

    .asunam-action-grid {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }

    .asunam-order-card {
      padding: 13px !important;
      gap: 12px !important;
    }

    .asunam-order-right {
      align-items: stretch !important;
      width: 100% !important;
    }

    .asunam-container,
    .asunam-container * {
      min-width: 0;
    }

    .asunam-container {
      overflow-wrap: anywhere;
    }
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed !important;
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default RestaurantDashboard;
