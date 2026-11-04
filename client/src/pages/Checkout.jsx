
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

const Checkout = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { cart } = useCart();

  const customerId = user?._id || user?.id || user?.userId;

  // ======================================
  // SAVED ADDRESS
  // ======================================

  const [savedAddress, setSavedAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(true);

  // ======================================
  // FORM DATA
  // ======================================

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

  // ======================================
  // LOAD SAVED ADDRESS
  // ======================================

  useEffect(() => {
    if (!customerId) return;

    try {
      const storageKey = `asunam_saved_address_${customerId}`;
      const storedAddress = localStorage.getItem(storageKey);

      if (storedAddress) {
        const address = JSON.parse(storedAddress);

        setSavedAddress(address);

        setFormData((previous) => ({
          ...previous,
          ...address,
          customerNote: "",
        }));

        setIsEditingAddress(false);
      } else {
        setFormData((previous) => ({
          ...previous,
          name: previous.name || user?.name || "",
          phone: previous.phone || user?.phone || "",
        }));
      }
    } catch (storageError) {
      console.error("Saved address loading error:", storageError);
    }
  }, [customerId]);

  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ======================================
  // CHANGE SAVED ADDRESS
  // ======================================

  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setError("");
  };

  const handleCancelAddressEdit = () => {
    if (!savedAddress) return;

    setFormData((previous) => ({
      ...previous,
      ...savedAddress,
      customerNote: previous.customerNote,
    }));

    setIsEditingAddress(false);
    setError("");
  };

  // ======================================
  // PLACE ORDER
  // ======================================

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
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setError("Please complete your delivery address.");
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);

      const addressToSave = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      const orderData = {
        deliveryAddress: {
          ...addressToSave,
          latitude: null,
          longitude: null,
        },

        paymentMethod,

        customerNote: formData.customerNote.trim(),
      };

      const response = await createOrder(orderData, token);

      if (response.success && response.order) {
        // Remember address separately for this customer
        if (customerId) {
          try {
            localStorage.setItem(
              `asunam_saved_address_${customerId}`,
              JSON.stringify(addressToSave)
            );

            setSavedAddress(addressToSave);
          } catch (storageError) {
            console.error(
              "Could not save delivery address:",
              storageError
            );
          }
        }

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

  // ======================================
  // NOT LOGGED IN
  // ======================================

  if (!isAuthenticated) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageBox}>
          <div style={styles.messageIcon}>🔐</div>
          <h2>Please login first</h2>
          <p>You need to login before continuing to checkout.</p>

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
  // EMPTY CART
  // ======================================

  if (!cart?.items?.length) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageBox}>
          <div style={styles.messageIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add something delicious before checkout.</p>

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

  // ======================================
  // MAIN CHECKOUT
  // ======================================

  return (
    <div style={styles.page}>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .checkout-field {
          width: 100%;
          border: 1px solid #e0e7df;
          background: #fbfdfb;
          border-radius: 10px;
          padding: 13px 14px;
          font-size: 14px;
          color: #203d2c;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          font-family: inherit;
        }

        .checkout-field:focus {
          border-color: #23734b;
          box-shadow: 0 0 0 3px rgba(35, 115, 75, .09);
          background: #fff;
        }

        .checkout-field::placeholder {
          color: #a0aaa2;
        }

        .checkout-label {
          display: block;
          color: #405c49;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .checkout-radio {
          accent-color: #176b43;
          width: 17px;
          height: 17px;
        }

        .checkout-payment {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          border: 1px solid #e4eae3;
          border-radius: 12px;
          cursor: pointer;
          transition: all .2s;
        }

        .checkout-payment.selected {
          background: #f0f7f1;
          border-color: #4a9064;
        }

        .checkout-payment:hover {
          border-color: #4a9064;
        }

        .checkout-place-button:hover {
          background: #105b37 !important;
          transform: translateY(-1px);
        }

        .checkout-edit-button:hover {
          background: #e9f3eb;
        }

        @media (max-width: 820px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }

          .checkout-summary {
            position: static !important;
          }

          .checkout-header {
            align-items: flex-start !important;
          }
        }

        @media (max-width: 520px) {
          .checkout-page-inner {
            padding: 25px 14px !important;
          }

          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }

          .checkout-header h1 {
            font-size: 29px !important;
          }

          .checkout-main-panel {
            padding: 21px 17px !important;
          }

          .checkout-summary {
            padding: 21px 17px !important;
          }

          .checkout-header button {
            padding: 9px 12px !important;
          }
        }
      `}</style>

      <div className="checkout-page-inner" style={styles.container}>

        {/* HEADER */}

        <div className="checkout-header" style={styles.header}>
          <div>
            <div style={styles.brand}>
              <span style={styles.brandSymbol}></span>
              ASUNAM FOOD
            </div>

            <h1 style={styles.title}>Checkout</h1>

            <p style={styles.subtitle}>
              Almost there! Your delicious food is waiting. 💚
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => {
              window.location.href = "/cart";
            }}
          >
            ← Back to Cart
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div
            className="checkout-layout"
            style={styles.grid}
          >

            {/* LEFT SIDE */}

            <div
              className="checkout-main-panel"
              style={styles.mainPanel}
            >

              {/* DELIVERY ADDRESS */}

              <section>
                <div style={styles.sectionHeader}>
                  <div style={styles.number}>01</div>

                  <div>
                    <h2 style={styles.sectionTitle}>
                      Delivery address
                    </h2>

                    <p style={styles.sectionText}>
                      Where would you like your order delivered?
                    </p>
                  </div>
                </div>

                {/* SAVED ADDRESS DISPLAY */}

                {savedAddress && !isEditingAddress ? (
                  <div style={styles.savedAddress}>
                    <div style={styles.savedAddressTop}>
                      <div>
                        <span style={styles.savedBadge}>
                          ✓ SAVED ADDRESS
                        </span>

                        <h3 style={styles.savedName}>
                          {savedAddress.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        className="checkout-edit-button"
                        style={styles.editButton}
                        onClick={handleEditAddress}
                      >
                        ✎ Change
                      </button>
                    </div>

                    <p style={styles.savedAddressText}>
                      {savedAddress.street}
                    </p>

                    <p style={styles.savedAddressText}>
                      {savedAddress.city}, {savedAddress.state} -{" "}
                      {savedAddress.pincode}
                    </p>

                    <p style={styles.savedPhone}>
                      ☎ {savedAddress.phone}
                    </p>
                  </div>
                ) : (

                  <div className="checkout-form-grid" style={styles.formGrid}>

                    <div>
                      <label className="checkout-label">
                        Full name
                      </label>

                      <input
                        className="checkout-field"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="checkout-label">
                        Phone number
                      </label>

                      <input
                        className="checkout-field"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="checkout-label">
                        House no. / Street / Area
                      </label>

                      <input
                        className="checkout-field"
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="House number, street, landmark"
                        required
                      />
                    </div>

                    <div>
                      <label className="checkout-label">
                        City
                      </label>

                      <input
                        className="checkout-field"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        required
                      />
                    </div>

                    <div>
                      <label className="checkout-label">
                        State
                      </label>

                      <input
                        className="checkout-field"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        required
                      />
                    </div>

                    <div>
                      <label className="checkout-label">
                        Pincode
                      </label>

                      <input
                        className="checkout-field"
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </div>

                    {savedAddress && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <button
                          type="button"
                          style={styles.cancelEdit}
                          onClick={handleCancelAddressEdit}
                        >
                          Cancel address changes
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </section>

              <div style={styles.sectionDivider} />

              {/* PAYMENT METHOD */}

              <section>
                <div style={styles.sectionHeader}>
                  <div style={styles.number}>02</div>

                  <div>
                    <h2 style={styles.sectionTitle}>
                      Payment method
                    </h2>

                    <p style={styles.sectionText}>
                      Choose your preferred payment option.
                    </p>
                  </div>
                </div>

                <div style={styles.paymentList}>

                  <label
                    className={`checkout-payment ${
                      paymentMethod === "cod" ? "selected" : ""
                    }`}
                  >
                    <input
                      className="checkout-radio"
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <div>
                      <strong style={styles.paymentTitle}>
                        Cash on Delivery
                      </strong>

                      <p style={styles.paymentDescription}>
                        Pay when your order arrives.
                      </p>
                    </div>

                    <span style={styles.paymentIcon}>💵</span>
                  </label>

                  <label
                    className={`checkout-payment ${
                      paymentMethod === "online" ? "selected" : ""
                    }`}
                  >
                    <input
                      className="checkout-radio"
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <div>
                      <strong style={styles.paymentTitle}>
                        Online Payment
                      </strong>

                      <p style={styles.paymentDescription}>
                        Payment gateway will be connected later.
                      </p>
                    </div>

                    <span style={styles.paymentIcon}>💳</span>
                  </label>

                </div>
              </section>

              <div style={styles.sectionDivider} />

              {/* DELIVERY NOTE */}

              <section>
                <div style={styles.noteHeading}>
                  <div>
                    <h2 style={styles.sectionTitle}>
                      Delivery instructions
                    </h2>

                    <p style={styles.sectionText}>
                      Any special instructions? (Optional)
                    </p>
                  </div>

                  <span style={styles.noteIcon}>📝</span>
                </div>

                <textarea
                  className="checkout-field"
                  name="customerNote"
                  value={formData.customerNote}
                  onChange={handleChange}
                  placeholder="Example: Please call when you arrive..."
                  maxLength={300}
                  rows={3}
                  style={styles.noteInput}
                />

                <p style={styles.noteCount}>
                  {formData.customerNote.length}/300
                </p>
              </section>

            </div>

            {/* RIGHT SIDE - ORDER SUMMARY */}

            <div
              className="checkout-summary"
              style={styles.summaryCard}
            >

              <div style={styles.summaryHeading}>
                <div>
                  <span style={styles.summaryEyebrow}>
                    YOUR ORDER
                  </span>

                  <h2 style={styles.summaryTitle}>
                    Order summary
                  </h2>
                </div>

                <span style={styles.bagIcon}>🛍️</span>
              </div>

              {/* RESTAURANT */}

              <div style={styles.restaurantInfo}>
                <span style={styles.smallLabel}>
                  FROM RESTAURANT
                </span>

                <strong>
                  {cart.restaurant?.name ||
                    cart.items?.[0]?.restaurant?.name ||
                    "ASUNAM FOOD"}
                </strong>
              </div>

              {/* FOOD ITEMS */}

              <div style={styles.items}>
                {cart.items.map((item, index) => (
                  <div
                    key={item._id || index}
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

                    <strong style={styles.itemPrice}>
                      ₹{item.price * item.quantity}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={styles.divider} />

              {/* PRICE DETAILS */}

              <div style={styles.priceRow}>
                <span>Item total</span>
                <span>₹{cart.subtotal || 0}</span>
              </div>

              <div style={styles.priceRow}>
                <span>Delivery fee</span>
                <span>₹{cart.deliveryFee || 0}</span>
              </div>

              <div style={styles.priceRow}>
                <span>Discount</span>
                <span style={styles.discountText}>
                  - ₹{cart.discount || 0}
                </span>
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span>Total to pay</span>
                <strong>
                  ₹{cart.totalAmount || 0}
                </strong>
              </div>

              {/* PLACE ORDER */}

              <button
                type="submit"
                className="checkout-place-button"
                style={{
                  ...styles.placeOrderButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading
                  ? "Placing your order..."
                  : "Place Order  →"}
              </button>

              <div style={styles.secureText}>
                <span>🔒</span>
                Your order information is secure.
              </div>

              <div style={styles.deliveryPromise}>
                <span>💚</span>
                <p>
                  Freshly prepared and delivered with care.
                </p>
              </div>

            </div>

          </div>
        </form>

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
    padding: "0",
    color: "#203d2c",
  },

  container: {
    maxWidth: "1160px",
    width: "100%",
    margin: "0 auto",
    padding: "38px 24px 55px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2.5px",
    color: "#187047",
  },

  brandSymbol: {
    color: "#d4a94c",
    fontSize: "17px",
  },

  title: {
    margin: "9px 0 5px",
    fontSize: "36px",
    lineHeight: 1.2,
    fontWeight: "750",
    color: "#153c28",
  },

  subtitle: {
    margin: 0,
    color: "#75877a",
    fontSize: "14px",
  },

  backButton: {
    background: "#fff",
    color: "#24573a",
    border: "1px solid #dce8dc",
    padding: "12px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  errorBox: {
    background: "#fff1f0",
    color: "#b42318",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, 0.8fr)",
    gap: "27px",
    alignItems: "start",
  },

  mainPanel: {
    background: "#fff",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(30,70,40,0.045)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "25px",
  },

  number: {
    width: "37px",
    height: "37px",
    minWidth: "37px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background: "#edf5ed",
    color: "#176b43",
    fontSize: "13px",
    fontWeight: "800",
  },

  sectionTitle: {
    margin: 0,
    color: "#183d29",
    fontSize: "19px",
    fontWeight: "700",
  },

  sectionText: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#87948a",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "19px 17px",
  },

  sectionDivider: {
    height: "1px",
    background: "#edf1ec",
    margin: "30px 0",
  },

  savedAddress: {
    padding: "20px",
    background: "#f5faf5",
    borderRadius: "13px",
    borderLeft: "3px solid #267449",
  },

  savedAddressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "13px",
  },

  savedBadge: {
    color: "#267449",
    fontWeight: "800",
    fontSize: "10px",
    letterSpacing: "1.2px",
  },

  savedName: {
    margin: "6px 0 0",
    fontSize: "17px",
    color: "#183d29",
  },

  savedAddressText: {
    margin: "5px 0",
    color: "#526c59",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  savedPhone: {
    margin: "10px 0 0",
    color: "#526c59",
    fontSize: "13px",
    fontWeight: "600",
  },

  editButton: {
    background: "#fff",
    border: "1px solid #cddfcf",
    color: "#176b43",
    borderRadius: "8px",
    padding: "9px 12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "12px",
  },

  cancelEdit: {
    background: "transparent",
    color: "#176b43",
    border: "none",
    cursor: "pointer",
    padding: "5px 0",
    fontWeight: "600",
    fontSize: "13px",
  },

  paymentList: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },

  paymentTitle: {
    display: "block",
    color: "#245239",
    fontSize: "14px",
  },

  paymentDescription: {
    margin: "5px 0 0",
    color: "#849187",
    fontSize: "12px",
  },

  paymentIcon: {
    marginLeft: "auto",
    fontSize: "20px",
  },

  noteHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "17px",
  },

  noteIcon: {
    fontSize: "21px",
  },

  noteInput: {
    display: "block",
    width: "100%",
    resize: "vertical",
    lineHeight: 1.5,
  },

  noteCount: {
    textAlign: "right",
    margin: "5px 0 0",
    color: "#9aa49b",
    fontSize: "11px",
  },

  // ORDER SUMMARY

  summaryCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "27px",
    boxShadow: "0 8px 30px rgba(30,70,40,0.055)",
    position: "sticky",
    top: "22px",
  },

  summaryHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "21px",
  },

  summaryEyebrow: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#b08b3c",
    letterSpacing: "1.8px",
  },

  summaryTitle: {
    margin: "6px 0 0",
    color: "#183d29",
    fontSize: "22px",
  },

  bagIcon: {
    fontSize: "24px",
  },

  restaurantInfo: {
    padding: "13px 0",
    marginBottom: "17px",
    borderTop: "1px solid #edf1ec",
    borderBottom: "1px solid #edf1ec",
  },

  smallLabel: {
    display: "block",
    fontSize: "9px",
    color: "#9a9e91",
    fontWeight: "700",
    letterSpacing: "1.4px",
    marginBottom: "5px",
  },

  items: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  itemImage: {
    width: "53px",
    height: "53px",
    objectFit: "cover",
    borderRadius: "11px",
    background: "#f2f5f1",
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  itemPrice: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    color: "#245239",
  },

  divider: {
    height: "1px",
    background: "#edf1ec",
    margin: "21px 0",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "13px",
    color: "#78857b",
    fontSize: "13px",
  },

  discountText: {
    color: "#24804e",
    fontWeight: "600",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#183d29",
    fontSize: "16px",
  },

  placeOrderButton: {
    width: "100%",
    border: "none",
    background: "#176b43",
    color: "#fff",
    padding: "16px",
    borderRadius: "11px",
    fontSize: "15px",
    fontWeight: "750",
    marginTop: "24px",
    transition: "all .2s",
  },

  secureText: {
    textAlign: "center",
    color: "#929c94",
    fontSize: "11px",
    marginTop: "13px",
  },

  deliveryPromise: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#f5faf5",
    borderRadius: "9px",
    padding: "10px",
    marginTop: "18px",
  },

  deliveryPromiseText: {
  margin: 0,
  fontSize: "11px",
  color: "#607767",
},

  // EMPTY / AUTH MESSAGES

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "#f5f8f4",
  },

  messageBox: {
    background: "#fff",
    padding: "45px 25px",
    borderRadius: "20px",
    textAlign: "center",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  },

  messageIcon: {
    fontSize: "45px",
    marginBottom: "12px",
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

export default Checkout;
