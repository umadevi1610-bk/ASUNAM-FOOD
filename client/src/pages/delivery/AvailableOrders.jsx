
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../services/api";

const GREEN = "#166534";
const DARK_GREEN = "#14532D";
const LIGHT_GREEN = "#DCFCE7";
const PALE_GREEN = "#F0FDF4";
const BORDER_GREEN = "#BBF7D0";
const TEXT_MUTED = "#64816F";

const styles = {
  page: {
    minHeight: "100vh",
    background: PALE_GREEN,
    padding: "32px 20px",
    color: DARK_GREEN,
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  heading: {
    color: DARK_GREEN,
    fontSize: "clamp(27px, 4vw, 34px)",
    fontWeight: 800,
    margin: "0 0 8px",
  },

  subtitle: {
    color: TEXT_MUTED,
    margin: "0 0 26px",
    lineHeight: 1.7,
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 5px 20px rgba(22,101,52,0.07)",
    minWidth: 0,
  },

  button: {
    background: GREEN,
    color: "#FFFFFF",
    border: `1px solid ${GREEN}`,
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  secondaryButton: {
    background: LIGHT_GREEN,
    color: GREEN,
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  message: {
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    lineHeight: 1.6,
  },
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AvailableOrders() {
  const { token, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    if (!token) {
      setError("Please log in as a delivery partner to view orders.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/delivery/available", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || "Unable to load available orders.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleAccept = async (order) => {
    if (!token || !order?._id) return;

    const confirmed = window.confirm(
      "Do you want to accept this delivery order?"
    );

    if (!confirmed) return;

    setAcceptingId(order._id);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(
        `/delivery/orders/${order._id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((current) =>
        current.filter((item) => item._id !== order._id)
      );

      setNotice(
        data.message ||
          "Order accepted successfully! Check your deliveries."
      );
    } catch (err) {
      setError(err.message || "Unable to accept this order.");
      await loadOrders();
    } finally {
      setAcceptingId("");
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Brand */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            padding: "8px 13px",
            marginBottom: "20px",
            background: "#FFFFFF",
            border: "1px solid #D1FAE5",
            borderRadius: "30px",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: GREEN,
            }}
          />

          <p
            style={{
              color: GREEN,
              fontWeight: 800,
              letterSpacing: "1.5px",
              fontSize: "11px",
              margin: 0,
            }}
          >
            ASUNAM FOOD · DELIVERY PARTNER
          </p>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "26px",
          }}
        >
          <div>
            <h1 style={styles.heading}>Available Orders</h1>

            <p style={{ ...styles.subtitle, marginBottom: 0 }}>
              Hi{user?.name ? `, ${user.name}` : ""}! Find an order ready
              for pickup and accept a delivery.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={loadOrders}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh Orders"}
          </button>
        </div>

        {/* Success message */}
        {notice && (
          <div
            role="status"
            style={{
              ...styles.message,
              background: LIGHT_GREEN,
              color: DARK_GREEN,
              border: `1px solid ${BORDER_GREEN}`,
            }}
          >
            <strong>✓ </strong>
            {notice}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            style={{
              ...styles.message,
              background: "#FFFFFF",
              color: DARK_GREEN,
              border: `1px solid ${BORDER_GREEN}`,
              borderLeft: `4px solid ${GREEN}`,
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>

            <button
              type="button"
              style={{
                ...styles.secondaryButton,
                marginTop: "12px",
              }}
              onClick={loadOrders}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Available orders count */}
        <div
          style={{
            ...styles.card,
            marginBottom: "22px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              flexShrink: 0,
              borderRadius: "14px",
              background: LIGHT_GREEN,
              display: "grid",
              placeItems: "center",
              fontSize: "27px",
            }}
          >
            🛵
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: TEXT_MUTED,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Orders ready for pickup
            </p>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "30px",
                fontWeight: 800,
                color: GREEN,
              }}
            >
              {loading ? "—" : orders.length}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              padding: "45px 20px",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                color: GREEN,
                fontWeight: 700,
              }}
            >
              Loading available orders...
            </p>

            <p style={{ color: TEXT_MUTED }}>
              Please wait a moment.
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
                borderRadius: "20px",
                background: LIGHT_GREEN,
                fontSize: "36px",
              }}
            >
              🍃
            </div>

            <h2
              style={{
                color: DARK_GREEN,
                margin: "0 0 10px",
                fontSize: "21px",
              }}
            >
              No orders available right now
            </h2>

            <p
              style={{
                color: TEXT_MUTED,
                lineHeight: 1.7,
                marginBottom: "22px",
              }}
            >
              New orders will appear here when restaurants mark them
              ready for pickup.
            </p>

            <button
              type="button"
              style={styles.button}
              onClick={loadOrders}
            >
              Check Again →
            </button>
          </div>
        ) : (
          /* Orders grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "18px",
            }}
          >
            {orders.map((order) => {
              const restaurant =
                order.restaurant && typeof order.restaurant === "object"
                  ? order.restaurant
                  : null;

              const isAccepting = acceptingId === order._id;

              return (
                <article
                  key={order._id}
                  style={{
                    ...styles.card,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Order ID and status */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "18px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          color: TEXT_MUTED,
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          margin: "0 0 6px",
                        }}
                      >
                        ORDER ID
                      </p>

                      <h3
                        style={{
                          color: GREEN,
                          fontSize: "16px",
                          margin: 0,
                          overflowWrap: "anywhere",
                        }}
                      >
                        #{String(order._id).slice(-8).toUpperCase()}
                      </h3>
                    </div>

                    <span
                      style={{
                        background: LIGHT_GREEN,
                        color: GREEN,
                        border: `1px solid ${BORDER_GREEN}`,
                        padding: "7px 10px",
                        borderRadius: "20px",
                        fontSize: "10px",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      READY FOR PICKUP
                    </span>
                  </div>

                  {/* Restaurant details */}
                  <h2
                    style={{
                      margin: "0 0 8px",
                      fontSize: "20px",
                      color: DARK_GREEN,
                    }}
                  >
                    {restaurant?.name || "Restaurant"}
                  </h2>

                  <p
                    style={{
                      color: TEXT_MUTED,
                      fontSize: "14px",
                      lineHeight: 1.7,
                      margin: "0 0 18px",
                    }}
                  >
                    <strong style={{ color: GREEN }}>📍 Pickup:</strong>{" "}
                    {restaurant?.address || "Pickup address not available"}
                  </p>

                  {/* Order summary */}
                  <div
                    style={{
                      background: PALE_GREEN,
                      border: "1px solid #E5F5E9",
                      borderRadius: "12px",
                      padding: "15px",
                      marginBottom: "20px",
                      flex: 1,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px",
                        color: GREEN,
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      ORDER DETAILS
                    </p>

                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: "14px",
                        color: DARK_GREEN,
                        lineHeight: 1.7,
                      }}
                    >
                      <strong>Items:</strong>{" "}
                      {Array.isArray(order.items) && order.items.length
                        ? order.items
                            .map((item) => {
                              const name =
                                item.name ||
                                item.foodName ||
                                item.menuItem?.name ||
                                "Item";

                              return `${name} × ${item.quantity || 1}`;
                            })
                            .join(", ")
                        : "Order items"}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: DARK_GREEN,
                      }}
                    >
                      <strong>Order total:</strong>{" "}
                      <span style={{ color: GREEN, fontWeight: 800 }}>
                        {money(
                          order.totalAmount ??
                            order.totalPrice ??
                            order.total
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Accept order */}
                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      width: "100%",
                      opacity: isAccepting ? 0.7 : 1,
                      cursor: isAccepting ? "wait" : "pointer",
                    }}
                    onClick={() => handleAccept(order)}
                    disabled={Boolean(acceptingId)}
                  >
                    {isAccepting
                      ? "Accepting Order..."
                      : "Accept Delivery →"}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #D1FAE5",
            marginTop: "34px",
            paddingTop: "20px",
            textAlign: "center",
            color: TEXT_MUTED,
            fontSize: "12px",
            letterSpacing: "0.4px",
          }}
        >
          ASUNAM FOOD <span style={{ margin: "0 7px" }}>•</span>
          Delivery Partner Portal
        </footer>
      </div>
    </main>
  );
}
