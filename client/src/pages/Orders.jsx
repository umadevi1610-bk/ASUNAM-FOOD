import { useEffect, useState } from "react";
import { getMyOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
  const { user, token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders(token);

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Load orders error:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, isAuthenticated]);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (loading) {
    return (
      <div style={styles.centerMessage}>
        <h2>Loading your orders...</h2>
        <p>Please wait daa ❤️</p>
      </div>
    );
  }

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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Orders</h1>
            <p style={styles.subtitle}>
              Welcome back, {user?.name || "User"} 👋
            </p>
          </div>

          <div style={styles.orderCount}>
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📦</div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet. Explore restaurants and order
              your favourite food ❤️
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
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderTop}>
                  <div>
                    <p style={styles.orderNumber}>#{order.orderNumber}</p>

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

                <div style={styles.itemsSection}>
                  {order.items.map((item, index) => (
                    <div key={`${item.food}-${index}`} style={styles.item}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={styles.itemImage}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      <div style={styles.itemInfo}>
                        <h3 style={styles.itemName}>{item.name}</h3>

                        <p style={styles.itemMeta}>
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>

                      <div style={styles.itemTotal}>
                        ₹{item.total}
                      </div>
                    </div>
                  ))}
                </div>

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
                      Payment Status: <strong>{order.paymentStatus}</strong>
                    </p>
                  </div>

                  <div style={styles.totalBox}>
                    <span>Total</span>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                </div>

                <div style={styles.actionRow}>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => {
                      window.location.href = `/orders/${order._id}`;
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
                          window.location.href = `/orders/${order._id}`;
                        }}
                      >
                        Track Order
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
  },

  itemInfo: {
    flex: 1,
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
    background: "#ff6b00",
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
};

export default Orders;