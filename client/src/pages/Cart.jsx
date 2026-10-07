import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const {
    cart,
    loading,
    updateItem,
    removeItem,
    clearAll,
  } = useCart();

  const { isAuthenticated } = useAuth();

  // ======================================
  // LOGIN CHECK
  // ======================================
  if (!isAuthenticated) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🔐</div>

          <h2 style={styles.messageTitle}>
            Login to view your cart
          </h2>

          <p style={styles.messageText}>
            Please login to see your selected food items.
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

  // ======================================
  // LOADING
  // ======================================
  if (loading && !cart) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🛒</div>

          <h2 style={styles.messageTitle}>
            Loading your cart...
          </h2>

          <p style={styles.messageText}>
            Please wait daa ❤️
          </p>
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
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🛒</div>

          <h2 style={styles.messageTitle}>
            Your cart is empty
          </h2>

          <p style={styles.messageText}>
            Add some delicious food and come back here.
          </p>

          <button
            type="button"
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
  // QUANTITY UPDATE
  // ======================================
  const decreaseQuantity = async (item) => {
    try {
      await updateItem(
        item.food?._id,
        item.quantity - 1
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const increaseQuantity = async (item) => {
    try {
      await updateItem(
        item.food?._id,
        item.quantity + 1
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // ======================================
  // REMOVE
  // ======================================
  const handleRemove = async (item) => {
    try {
      await removeItem(item.food?._id);
    } catch (error) {
      alert(error.message);
    }
  };

  // ======================================
  // CLEAR CART
  // ======================================
  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) return;

    try {
      await clearAll();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ======================================
            HEADER
        ====================================== */}
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>
              YOUR ORDER
            </span>

            <h1 style={styles.title}>
              Shopping Cart
            </h1>

            <p style={styles.subtitle}>
              Review your items before checkout.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Continue Shopping
          </button>
        </div>

        <div style={styles.grid}>
          {/* ======================================
              LEFT — CART ITEMS
          ====================================== */}
          <section style={styles.itemsCard}>
            <div style={styles.restaurantHeader}>
              <div>
                <span style={styles.smallLabel}>
                  RESTAURANT
                </span>

                <h2 style={styles.restaurantName}>
                  {cart.restaurant?.name ||
                    cart.items?.[0]?.restaurant?.name ||
                    "ASUNAM FOOD"}
                </h2>
              </div>

              <span style={styles.itemCount}>
                {cart.items.length}{" "}
                {cart.items.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>

            <div style={styles.itemsList}>
              {cart.items.map((item) => {
                const itemFood = item.food;
                const itemName =
                  itemFood?.name || "Food item";

                const itemImage =
                  itemFood?.image ||
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=85";

                const itemTotal =
                  Number(item.price || 0) *
                  Number(item.quantity || 0);

                return (
                  <article
                    key={item._id}
                    style={styles.itemCard}
                  >
                    {/* IMAGE */}
                    <img
                      src={itemImage}
                      alt={itemName}
                      style={styles.itemImage}
                    />

                    {/* INFO */}
                    <div style={styles.itemInfo}>
                      <span style={styles.foodCategory}>
                        {itemFood?.category ||
                          "Food"}
                      </span>

                      <h3 style={styles.itemName}>
                        {itemName}
                      </h3>

                      <p style={styles.unitPrice}>
                        ₹{item.price} each
                      </p>

                      {/* QUANTITY */}
                      <div style={styles.quantityRow}>
                        <div
                          style={styles.quantityControl}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item)
                            }
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>

                          <strong>
                            {item.quantity}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          style={styles.removeButton}
                          onClick={() =>
                            handleRemove(item)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* ITEM TOTAL */}
                    <strong style={styles.itemTotal}>
                      ₹{itemTotal}
                    </strong>
                  </article>
                );
              })}
            </div>

            <div style={styles.itemFooter}>
              <button
                type="button"
                style={styles.clearButton}
                onClick={handleClearCart}
              >
                🗑 Clear Cart
              </button>
            </div>
          </section>

          {/* ======================================
              RIGHT — SUMMARY
          ====================================== */}
          <aside style={styles.summaryCard}>
            <span style={styles.eyebrow}>
              BILL SUMMARY
            </span>

            <h2 style={styles.summaryTitle}>
              Order Summary
            </h2>

            <div style={styles.summaryRows}>
              <div style={styles.priceRow}>
                <span>Item Total</span>
                <strong>
                  ₹{cart.subtotal || 0}
                </strong>
              </div>

              <div style={styles.priceRow}>
                <span>Delivery Fee</span>
                <strong>
                  ₹{cart.deliveryFee || 0}
                </strong>
              </div>

              <div style={styles.priceRow}>
                <span>Discount</span>
                <strong style={styles.discount}>
                  - ₹{cart.discount || 0}
                </strong>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.totalRow}>
              <span>Total to Pay</span>

              <strong>
                ₹{cart.totalAmount || 0}
              </strong>
            </div>

            <div style={styles.deliveryInfo}>
              <span>🛵</span>

              <div>
                <strong>
                  Delivery fee
                </strong>

                <p>
                  Final delivery details will be
                  shown during checkout.
                </p>
              </div>
            </div>

            <button
              type="button"
              style={styles.checkoutButton}
              onClick={() => {
                window.location.href = "/checkout";
              }}
            >
              Proceed to Checkout →
            </button>

            <button
              type="button"
              style={styles.continueButton}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Continue Shopping
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f7f7",
    padding: "38px 20px 50px",
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
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  eyebrow: {
    display: "block",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.8px",
    color: "#ff5a36",
    marginBottom: "6px",
  },

  title: {
    margin: 0,
    fontSize: "35px",
    color: "#222",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  backButton: {
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    padding: "11px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.45fr) minmax(310px, 0.75fr)",
    gap: "24px",
    alignItems: "start",
  },

  itemsCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow:
      "0 6px 20px rgba(0,0,0,0.06)",
  },

  restaurantHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    paddingBottom: "18px",
    borderBottom: "1px solid #eee",
  },

  smallLabel: {
    display: "block",
    fontSize: "9px",
    letterSpacing: "1.4px",
    color: "#999",
    marginBottom: "3px",
    fontWeight: "800",
  },

  restaurantName: {
    margin: 0,
    fontSize: "20px",
    color: "#222",
  },

  itemCount: {
    background: "#fff1e8",
    color: "#e85d04",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },

  itemsList: {
    display: "flex",
    flexDirection: "column",
  },

  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "19px 0",
    borderBottom: "1px solid #eee",
  },

  itemImage: {
    width: "90px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "14px",
    background: "#f1f1f1",
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  foodCategory: {
    fontSize: "9px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "700",
  },

  itemName: {
    margin: "5px 0",
    fontSize: "18px",
    color: "#222",
  },

  unitPrice: {
    margin: 0,
    color: "#888",
    fontSize: "13px",
  },

  quantityRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "11px",
    flexWrap: "wrap",
  },

  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "4px",
    width: "fit-content",
  },

  removeButton: {
    border: "none",
    background: "transparent",
    color: "#c62828",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  itemTotal: {
    color: "#222",
    fontSize: "17px",
    whiteSpace: "nowrap",
  },

  itemFooter: {
    paddingTop: "18px",
    display: "flex",
    justifyContent: "flex-end",
  },

  clearButton: {
    border: "none",
    background: "transparent",
    color: "#c62828",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },

  summaryCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow:
      "0 6px 20px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "20px",
  },

  summaryTitle: {
    margin: "4px 0 20px",
    color: "#222",
    fontSize: "22px",
  },

  summaryRows: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    color: "#666",
    fontSize: "14px",
  },

  discount: {
    color: "#21843a",
  },

  divider: {
    height: "1px",
    background: "#eee",
    margin: "20px 0",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    color: "#222",
    fontSize: "18px",
    fontWeight: "800",
  },

  deliveryInfo: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    padding: "13px",
    background: "#faf7f5",
    borderRadius: "12px",
  },

  checkoutButton: {
    width: "100%",
    border: "none",
    background: "#ff5a36",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "20px",
  },

  continueButton: {
    width: "100%",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "10px",
  },

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  messageCard: {
    width: "100%",
    maxWidth: "430px",
    background: "#fff",
    padding: "45px 25px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 6px 20px rgba(0,0,0,0.06)",
  },

  bigIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },

  messageTitle: {
    margin: 0,
    color: "#222",
  },

  messageText: {
    color: "#777",
    lineHeight: 1.6,
  },

  primaryButton: {
    border: "none",
    background: "#ff5a36",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "12px",
  },
};

// ======================================
// GLOBAL BUTTON STYLES
// ======================================
const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  .quantityControl button {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: #fff1e8;
    color: #ff5a36;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
  }

  .quantityControl button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .deliveryInfo strong {
    display: block;
    color: #444;
    font-size: 12px;
    margin-bottom: 3px;
  }

  .deliveryInfo p {
    margin: 0;
    color: #999;
    font-size: 11px;
    line-height: 1.4;
  }

  @media (max-width: 800px) {
    .cart-grid {
      grid-template-columns: 1fr;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default Cart;