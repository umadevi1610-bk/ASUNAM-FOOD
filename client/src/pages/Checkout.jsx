import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

const Checkout = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { cart } = useCart();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    customerNote: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------
  // Handle input changes
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------------
  // Place order
  // -------------------------------
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");

    if (!isAuthenticated || !token) {
      setError("Please login before placing an order.");
      return;
    }

    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !formData.name ||
      !formData.phone ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      setError("Please fill all delivery address fields.");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        deliveryAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          latitude: null,
          longitude: null,
        },

        paymentMethod,

        customerNote: formData.customerNote,
      };

      const response = await createOrder(orderData, token);

      if (response.success && response.order) {
        window.location.href = `/orders/${response.order._id}`;
      } else {
        setError(response.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Not logged in
  // -------------------------------
  if (!isAuthenticated) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageBox}>
          <div style={styles.icon}>🔐</div>

          <h2>Please login first</h2>

          <p>
            You need to login before continuing to checkout.
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

  // -------------------------------
  // Empty cart
  // -------------------------------
  if (!cart?.items?.length) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageBox}>
          <div style={styles.icon}>🛒</div>

          <h2>Your cart is empty</h2>

          <p>Add some delicious food before checkout.</p>

          <button
            style={styles.primaryButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Browse Food
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>ASUNAM FOOD</span>

            <h1 style={styles.title}>Checkout</h1>

            <p style={styles.subtitle}>
              Complete your order and enjoy your meal ❤️
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() => {
              window.history.back();
            }}
          >
            ← Back
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={styles.grid}>
            {/* LEFT */}
            <div>
              {/* DELIVERY ADDRESS */}
              <section style={styles.card}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}>📍</div>

                  <div>
                    <h2 style={styles.sectionTitle}>
                      Delivery Address
                    </h2>

                    <p style={styles.sectionText}>
                      Where should we deliver your food?
                    </p>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label>Full Name</label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div style={styles.field}>
                    <label>Phone Number</label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div
                    style={{
                      ...styles.field,
                      gridColumn: "1 / -1",
                    }}
                  >
                    <label>Street / Address</label>

                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="House no, street, area"
                    />
                  </div>

                  <div style={styles.field}>
                    <label>City</label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </div>

                  <div style={styles.field}>
                    <label>State</label>

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </div>

                  <div style={styles.field}>
                    <label>Pincode</label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section style={styles.card}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}>💳</div>

                  <div>
                    <h2 style={styles.sectionTitle}>
                      Payment Method
                    </h2>

                    <p style={styles.sectionText}>
                      Choose how you want to pay
                    </p>
                  </div>
                </div>

                <label style={styles.paymentOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your order arrives</p>
                  </div>
                </label>

                <label style={styles.paymentOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <strong>Online Payment</strong>
                    <p>Payment gateway will be connected later</p>
                  </div>
                </label>

                {/* NOTE */}
                <div style={styles.noteField}>
                  <label>Delivery Note (Optional)</label>

                  <textarea
                    name="customerNote"
                    value={formData.customerNote}
                    onChange={handleChange}
                    placeholder="Example: Please call when you arrive..."
                    maxLength={300}
                    rows={4}
                  />
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div>
              <section style={styles.summaryCard}>
                <h2 style={styles.summaryTitle}>
                  Order Summary
                </h2>

                <div style={styles.restaurantBox}>
                  <div>
                    <span style={styles.smallLabel}>
                      RESTAURANT
                    </span>

                    <strong>
                      {cart.restaurant?.name ||
                        cart.items?.[0]?.restaurant?.name ||
                        "ASUNAM FOOD"}
                    </strong>
                  </div>
                </div>

                {/* ITEMS */}
                <div style={styles.items}>
                  {cart.items.map((item) => (
                    <div
                      key={item._id}
                      style={styles.item}
                    >
                      <img
                        src={item.food?.image}
                        alt={item.food?.name || "Food"}
                        style={styles.itemImage}
                      />

                      <div style={styles.itemInfo}>
                        <strong>
                          {item.food?.name || "Food item"}
                        </strong>

                        <span>
                          ₹{item.price} × {item.quantity}
                        </span>
                      </div>

                      <strong>
                        ₹{item.price * item.quantity}
                      </strong>
                    </div>
                  ))}
                </div>

                <div style={styles.divider}></div>

                <div style={styles.priceRow}>
                  <span>Item Total</span>
                  <span>₹{cart.subtotal || 0}</span>
                </div>

                <div style={styles.priceRow}>
                  <span>Delivery Fee</span>
                  <span>₹{cart.deliveryFee || 0}</span>
                </div>

                <div style={styles.priceRow}>
                  <span>Discount</span>
                  <span>- ₹{cart.discount || 0}</span>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.totalRow}>
                  <span>Total to Pay</span>

                  <strong>
                    ₹{cart.totalAmount || 0}
                  </strong>
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.placeOrderButton,
                    opacity: loading ? 0.7 : 1,
                  }}
                  disabled={loading}
                >
                  {loading
                    ? "Placing Order..."
                    : "Place Order →"}
                </button>

                <p style={styles.secureText}>
                  🔒 Your order information is secure
                </p>
              </section>
            </div>
          </div>
        </form>
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
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  eyebrow: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#ff6b00",
  },

  title: {
    margin: "8px 0 4px",
    fontSize: "36px",
    color: "#222",
  },

  subtitle: {
    margin: 0,
    color: "#777",
  },

  backButton: {
    background: "#fff",
    border: "1px solid #ddd",
    padding: "11px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  errorBox: {
    background: "#fff0f0",
    color: "#c62828",
    border: "1px solid #ffd0d0",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.8fr)",
    gap: "24px",
    alignItems: "start",
  },

  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  summaryCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "20px",
  },

  sectionHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    marginBottom: "22px",
  },

  sectionIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff1e8",
    fontSize: "22px",
  },

  sectionTitle: {
    margin: 0,
    color: "#222",
    fontSize: "20px",
  },

  sectionText: {
    margin: "4px 0 0",
    color: "#888",
    fontSize: "13px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  noteField: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "20px",
  },

  paymentOption: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "10px",
    cursor: "pointer",
  },

  summaryTitle: {
    margin: "0 0 18px",
    fontSize: "22px",
    color: "#222",
  },

  restaurantBox: {
    background: "#fff7f1",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "18px",
  },

  smallLabel: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#999",
    marginBottom: "4px",
  },

  items: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  itemImage: {
    width: "55px",
    height: "55px",
    borderRadius: "10px",
    objectFit: "cover",
  },

  itemInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  divider: {
    height: "1px",
    background: "#eee",
    margin: "18px 0",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    color: "#666",
    fontSize: "14px",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
    color: "#222",
  },

  placeOrderButton: {
    width: "100%",
    border: "none",
    background: "#ff6b00",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "22px",
  },

  secureText: {
    textAlign: "center",
    color: "#999",
    fontSize: "12px",
    margin: "12px 0 0",
  },

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  messageBox: {
    background: "#fff",
    borderRadius: "18px",
    padding: "50px 25px",
    textAlign: "center",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  icon: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  primaryButton: {
    border: "none",
    background: "#ff6b00",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "12px",
  },
};

export default Checkout;