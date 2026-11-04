
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../services/api";

const GREEN = "#166534";
const DARK_GREEN = "#14532D";
const LIGHT_GREEN = "#DCFCE7";
const PALE_GREEN = "#F0FDF4";
const BORDER_GREEN = "#BBF7D0";
const TEXT_MUTED = "#64816F";

const STATUS_STEPS = {
  accepted: {
    label: "Order Accepted",
    next: "picked_up",
    button: "Mark as Picked Up",
  },
  picked_up: {
    label: "Picked Up",
    next: "out_for_delivery",
    button: "Start Delivery",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    next: "delivered",
    button: "Mark as Delivered",
  },
  delivered: {
    label: "Delivered",
    next: null,
    button: null,
  },
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getAddress = (location) => {
  if (!location) return "Address unavailable";
  if (typeof location === "string") return location;
  return location.address || "Address unavailable";
};

export default function DeliverOrders() {
  const { token } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("active");

  const loadDeliveries = useCallback(async () => {
    if (!token) {
      setError("Please log in as a delivery partner.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/delivery/mine", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeliveries(
        Array.isArray(data.deliveries) ? data.deliveries : []
      );
    } catch (err) {
      setError(err.message || "Unable to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const updateStatus = async (delivery) => {
    const step = STATUS_STEPS[delivery.status];

    if (!step?.next || !token) return;

    const confirmed = window.confirm(
      `Are you sure you want to update this order to "${step.next.replaceAll("_", " ")}"?`
    );

    if (!confirmed) return;

    setUpdatingId(delivery._id);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(
        `/delivery/${delivery._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: step.next }),
        }
      );

      setNotice(
        data.message || "Delivery status updated successfully."
      );

      await loadDeliveries();
    } catch (err) {
      setError(err.message || "Unable to update delivery status.");
    } finally {
      setUpdatingId("");
    }
  };

  const visibleDeliveries = deliveries.filter((delivery) =>
    filter === "active"
      ? delivery.status !== "delivered"
      : delivery.status === "delivered"
  );

  const activeCount = deliveries.filter(
    (delivery) => delivery.status !== "delivered"
  ).length;

  const completedCount = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  ).length;

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

    card: {
      background: "#FFFFFF",
      border: "1px solid #D1FAE5",
      borderRadius: "16px",
      padding: "22px",
      boxShadow: "0 5px 20px rgba(22,101,52,0.07)",
    },

    primary: {
      background: GREEN,
      color: "#FFFFFF",
      border: "1px solid " + GREEN,
      borderRadius: "10px",
      padding: "12px 16px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "background 0.2s ease",
    },

    secondary: {
      background: LIGHT_GREEN,
      color: GREEN,
      border: "1px solid " + BORDER_GREEN,
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
    },

    mutedText: {
      color: TEXT_MUTED,
      fontSize: "14px",
      lineHeight: 1.7,
    },

    notice: {
      background: LIGHT_GREEN,
      color: DARK_GREEN,
      border: "1px solid " + BORDER_GREEN,
      borderRadius: "10px",
      padding: "14px",
      marginTop: "18px",
    },

    error: {
      background: "#FFFFFF",
      color: DARK_GREEN,
      border: "1px solid " + BORDER_GREEN,
      borderLeft: "4px solid " + GREEN,
      borderRadius: "10px",
      padding: "14px",
      marginTop: "18px",
    },
  };

  const tabs = [
    {
      value: "active",
      label: `Active (${activeCount})`,
    },
    {
      value: "completed",
      label: `Completed (${completedCount})`,
    },
  ];

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
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.5px",
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
          }}
        >
          <div>
            <h1
              style={{
                color: DARK_GREEN,
                fontSize: "clamp(27px, 4vw, 34px)",
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              My Deliveries
            </h1>

            <p style={{ ...styles.mutedText, margin: 0 }}>
              Track your accepted orders and update each delivery step.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.secondary,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={loadDeliveries}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "16px",
            marginTop: "26px",
          }}
        >
          {[
            {
              label: "Active Deliveries",
              count: activeCount,
              icon: "🛵",
            },
            {
              label: "Completed Deliveries",
              count: completedCount,
              icon: "✓",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                ...styles.card,
                padding: "19px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    color: TEXT_MUTED,
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: "0 0 8px",
                  }}
                >
                  {item.label}
                </p>

                <p
                  style={{
                    color: GREEN,
                    fontSize: "30px",
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  {loading ? "—" : item.count}
                </p>
              </div>

              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  background: LIGHT_GREEN,
                  color: GREEN,
                  fontSize: "22px",
                  fontWeight: 800,
                }}
              >
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Success message */}
        {notice && (
          <p role="status" style={styles.notice}>
            <strong>✓ </strong>
            {notice}
          </p>
        )}

        {/* Error message */}
        {error && (
          <div role="alert" style={styles.error}>
            <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>

            <button
              type="button"
              style={{
                ...styles.secondary,
                marginTop: "12px",
              }}
              onClick={loadDeliveries}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Active / Completed filters */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            margin: "26px 0 20px",
            flexWrap: "wrap",
          }}
        >
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              style={
                filter === item.value
                  ? styles.primary
                  : styles.secondary
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              padding: "45px 20px",
              color: GREEN,
              fontWeight: 600,
            }}
          >
            Loading your deliveries...
          </div>
        ) : visibleDeliveries.length === 0 ? (
          /* Empty state */
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              padding: "48px 20px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
                borderRadius: "20px",
                background: LIGHT_GREEN,
                fontSize: "32px",
              }}
            >
              🛵
            </div>

            <h2
              style={{
                color: DARK_GREEN,
                fontSize: "21px",
                margin: "0 0 10px",
              }}
            >
              {filter === "active"
                ? "No active deliveries"
                : "No completed deliveries yet"}
            </h2>

            <p style={{ ...styles.mutedText, margin: 0 }}>
              {filter === "active"
                ? "Accept an available order to start a delivery."
                : "Completed orders will appear here."}
            </p>
          </div>
        ) : (
          /* Delivery cards */
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "18px",
            }}
          >
            {visibleDeliveries.map((delivery) => {
              const step =
                STATUS_STEPS[delivery.status] || STATUS_STEPS.accepted;

              const order =
                delivery.order && typeof delivery.order === "object"
                  ? delivery.order
                  : {};

              const restaurant =
                delivery.restaurant &&
                typeof delivery.restaurant === "object"
                  ? delivery.restaurant
                  : order.restaurant || {};

              const customer =
                order.customer && typeof order.customer === "object"
                  ? order.customer
                  : {};

              const isUpdating = updatingId === delivery._id;

              return (
                <article
                  key={delivery._id}
                  style={{
                    ...styles.card,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                  }}
                >
                  {/* Order ID and status */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
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
                        DELIVERY ORDER
                      </p>

                      <h3
                        style={{
                          color: DARK_GREEN,
                          margin: 0,
                          overflowWrap: "anywhere",
                          fontSize: "16px",
                        }}
                      >
                        #
                        {String(
                          order._id || delivery.order?._id || delivery._id
                        )
                          .slice(-8)
                          .toUpperCase()}
                      </h3>
                    </div>

                    <span
                      style={{
                        background: LIGHT_GREEN,
                        color: GREEN,
                        border: "1px solid " + BORDER_GREEN,
                        borderRadius: "20px",
                        padding: "6px 9px",
                        fontSize: "10px",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.label.toUpperCase()}
                    </span>
                  </div>

                  {/* Restaurant */}
                  <h2
                    style={{
                      color: DARK_GREEN,
                      fontSize: "19px",
                      margin: "20px 0 12px",
                    }}
                  >
                    {restaurant.name || "Restaurant"}
                  </h2>

                  {/* Pickup address */}
                  <p style={styles.mutedText}>
                    <strong style={{ color: GREEN }}>📍 Pickup:</strong>{" "}
                    {getAddress(delivery.pickupLocation)}
                  </p>

                  {/* Delivery address */}
                  <p style={styles.mutedText}>
                    <strong style={{ color: GREEN }}>🏠 Delivery:</strong>{" "}
                    {getAddress(delivery.deliveryLocation)}
                  </p>

                  {/* Customer details */}
                  {customer.name && (
                    <p style={styles.mutedText}>
                      <strong style={{ color: GREEN }}>👤 Customer:</strong>{" "}
                      {customer.name}
                    </p>
                  )}

                  {customer.phone && (
                    <p style={styles.mutedText}>
                      <strong style={{ color: GREEN }}>☎ Phone:</strong>{" "}
                      {customer.phone}
                    </p>
                  )}

                  {/* Order summary */}
                  <div
                    style={{
                      background: PALE_GREEN,
                      border: "1px solid #E5F5E9",
                      borderRadius: "12px",
                      padding: "15px",
                      margin: "18px 0",
                    }}
                  >
                    <p
                      style={{
                        color: DARK_GREEN,
                        margin: "0 0 10px",
                        fontSize: "14px",
                      }}
                    >
                      <strong>Delivery fee:</strong>{" "}
                      <span style={{ color: GREEN, fontWeight: 800 }}>
                        {money(delivery.deliveryFee)}
                      </span>
                    </p>

                    <p
                      style={{
                        color: TEXT_MUTED,
                        fontSize: "13px",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {Array.isArray(order.items) && order.items.length
                        ? order.items
                            .map(
                              (item) =>
                                `${item.name || item.foodName || item.menuItem?.name || "Item"} × ${item.quantity || 1}`
                            )
                            .join(", ")
                        : "Order details"}
                    </p>
                  </div>

                  {/* Update delivery status */}
                  <div style={{ marginTop: "auto" }}>
                    {step.next ? (
                      <button
                        type="button"
                        style={{
                          ...styles.primary,
                          width: "100%",
                          opacity: isUpdating ? 0.7 : 1,
                          cursor: isUpdating ? "wait" : "pointer",
                        }}
                        onClick={() => updateStatus(delivery)}
                        disabled={Boolean(updatingId)}
                      >
                        {isUpdating
                          ? "Updating..."
                          : `${step.button} →`}
                      </button>
                    ) : (
                      <div
                        style={{
                          background: LIGHT_GREEN,
                          border: "1px solid " + BORDER_GREEN,
                          color: GREEN,
                          padding: "13px",
                          borderRadius: "10px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        ✓ Delivery completed
                      </div>
                    )}
                  </div>
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
