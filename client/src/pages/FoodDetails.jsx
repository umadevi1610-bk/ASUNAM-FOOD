
import { useEffect, useState } from "react";
import { getFoodById } from "../services/foodService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const FoodDetails = ({ foodId }) => {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // LOAD FOOD
  useEffect(() => {
    const loadFood = async () => {
      if (!foodId) {
        setError("Food item not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getFoodById(foodId);

        if (!data?.food) {
          throw new Error("Food item not found.");
        }

        setFood(data.food);
        setQuantity(1);
      } catch (err) {
        console.error("Food details error:", err);
        setError(err.message || "Failed to load food details.");
      } finally {
        setLoading(false);
      }
    };

    loadFood();
  }, [foodId]);

  // QUANTITY
  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  // ADD TO CART
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login first to add food to your cart.");
      return;
    }

    if (!food?.isAvailable) {
      alert("This food is currently unavailable.");
      return;
    }

    try {
      setAdding(true);
      await addItem(food._id, quantity);
      alert(`${food.name} × ${quantity} added to cart 🛒`);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(err.message || "Unable to add this food to your cart.");
    } finally {
      setAdding(false);
    }
  };

  // GO BACK
  const goBack = () => {
    window.history.back();
  };

  // LOADING
  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🍽️</div>
          <h2>Loading food...</h2>
          <p style={styles.messageText}>
            Getting the latest food details.
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error || !food) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>😕</div>
          <h2>Unable to load food</h2>
          <p style={styles.messageText}>
            {error || "Food item not found."}
          </p>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={goBack}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const foodImage =
    food.image ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85";

  const restaurantName = food.restaurant?.name || "ASUNAM FOOD";
  const restaurantId = food.restaurant?._id || food.restaurant || null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          type="button"
          style={styles.backButton}
          onClick={goBack}
        >
          ← Back
        </button>

        <section
          className="food-details-main-card"
          style={styles.mainCard}
        >
          {/* FOOD IMAGE */}
          <div style={styles.imageSection}>
            <img
              src={foodImage}
              alt={food.name}
              style={styles.mainImage}
            />

            {!food.isAvailable && (
              <div style={styles.unavailableOverlay}>
                Currently unavailable
              </div>
            )}

            {food.isVeg && (
              <span style={styles.vegBadge}>● VEG</span>
            )}
          </div>

          {/* FOOD DETAILS */}
          <div style={styles.detailsSection}>
            <span style={styles.category}>
              {food.category || "FOOD"}
            </span>

            <h1 style={styles.foodName}>{food.name}</h1>

            <button
              type="button"
              style={styles.restaurantButton}
              onClick={() => {
                if (restaurantId) {
                  window.location.href = `/restaurants/${restaurantId}`;
                }
              }}
              disabled={!restaurantId}
            >
              🍽️ {restaurantName}
            </button>

            <p style={styles.description}>
              {food.description ||
                "Freshly prepared and made with quality ingredients."}
            </p>

            {/* FOOD INFORMATION */}
            <div className="metaGrid" style={styles.metaGrid}>
              <div className="metaBox" style={styles.metaBox}>
                <span>⏱️</span>
                <div>
                  <small>Preparation</small>
                  <strong>
                    {food.preparationTime || "-"} min
                  </strong>
                </div>
              </div>

              <div className="metaBox" style={styles.metaBox}>
                <span>⭐</span>
                <div>
                  <small>Rating</small>
                  <strong>
                    {Number(food.rating || 0).toFixed(1)}
                  </strong>
                </div>
              </div>

              <div className="metaBox" style={styles.metaBox}>
                <span>{food.isVeg ? "🌱" : "🍗"}</span>
                <div>
                  <small>Type</small>
                  <strong>
                    {food.isVeg ? "Vegetarian" : "Non-Veg"}
                  </strong>
                </div>
              </div>
            </div>

            {/* PRICE */}
            <div className="priceSection" style={styles.priceSection}>
              <span>Price</span>
              <strong>₹{food.price}</strong>
            </div>

            {/* QUANTITY AND TOTAL */}
            <div style={styles.quantitySection}>
              <div>
                <span style={styles.quantityLabel}>Quantity</span>

                <div
                  className="quantityControl"
                  style={styles.quantityControl}
                >
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <strong>{quantity}</strong>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="totalPrice" style={styles.totalPrice}>
                <span>Total</span>
                <strong>
                  ₹{Number(food.price) * quantity}
                </strong>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              type="button"
              disabled={!food.isAvailable || adding}
              style={{
                ...styles.addButton,
                opacity: !food.isAvailable || adding ? 0.6 : 1,
                cursor: !food.isAvailable || adding
                  ? "not-allowed"
                  : "pointer",
              }}
              onClick={handleAddToCart}
            >
              {adding
                ? "Adding to Cart..."
                : `Add ${quantity} to Cart 🛒`}
            </button>

            {!food.isAvailable && (
              <p style={styles.unavailableText}>
                This item is currently unavailable.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F0FDF4",
    padding: "28px 20px 50px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#166534",
    padding: 0,
    marginBottom: "18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  mainCard: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(22, 101, 52, 0.08)",
  },

  imageSection: {
    position: "relative",
    minWidth: 0,
    minHeight: "500px",
    background: "#DCFCE7",
  },

  mainImage: {
    width: "100%",
    height: "100%",
    minHeight: "500px",
    objectFit: "cover",
    display: "block",
  },

  unavailableOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: "18px",
  },

  vegBadge: {
    position: "absolute",
    top: "18px",
    left: "18px",
    background: "#DCFCE7",
    color: "#166534",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
  },

  detailsSection: {
    minWidth: 0,
    padding: "38px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  category: {
    color: "#166534",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },

  foodName: {
    margin: "8px 0",
    fontSize: "38px",
    lineHeight: 1.15,
    color: "#14532D",
    overflowWrap: "anywhere",
  },

  restaurantButton: {
    alignSelf: "flex-start",
    border: "1px solid #D1FAE5",
    background: "#F0FDF4",
    color: "#166534",
    padding: "7px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  description: {
    color: "#475569",
    lineHeight: 1.7,
    fontSize: "14px",
    margin: "20px 0",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  metaBox: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#F0FDF4",
    border: "1px solid #D1FAE5",
    borderRadius: "12px",
    padding: "12px 10px",
  },

  priceSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "25px",
    paddingBottom: "18px",
    borderBottom: "1px solid #D1FAE5",
    color: "#64748B",
  },

  quantitySection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "22px",
  },

  quantityLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748B",
    marginBottom: "8px",
  },

  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #D1FAE5",
    borderRadius: "12px",
    padding: "5px",
    background: "#FFFFFF",
  },

  totalPrice: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  addButton: {
    width: "100%",
    marginTop: "24px",
    border: "none",
    background: "#166534",
    color: "#FFFFFF",
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  unavailableText: {
    textAlign: "center",
    color: "#B91C1C",
    fontSize: "12px",
    margin: "10px 0 0",
  },

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "#F0FDF4",
    boxSizing: "border-box",
  },

  messageCard: {
    width: "100%",
    maxWidth: "430px",
    boxSizing: "border-box",
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    padding: "45px 25px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(22, 101, 52, 0.06)",
  },

  bigIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },

  messageText: {
    color: "#475569",
    lineHeight: 1.6,
  },

  primaryButton: {
    border: "none",
    background: "#166534",
    color: "#FFFFFF",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "10px",
  },
};

// RESPONSIVE AND SMALL GLOBAL STYLES
const styleSheet = document.createElement("style");

styleSheet.textContent = `
  .quantityControl button {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: #DCFCE7;
    color: #166534;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
  }

  .quantityControl button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .metaBox small {
    display: block;
    color: #64748B;
    font-size: 10px;
    margin-bottom: 3px;
  }

  .metaBox strong {
    color: #14532D;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .priceSection strong {
    color: #14532D;
    font-size: 28px;
  }

  .quantityControl strong {
    min-width: 20px;
    text-align: center;
    color: #14532D;
  }

  .totalPrice span {
    color: #64748B;
    font-size: 11px;
  }

  .totalPrice strong {
    color: #14532D;
    font-size: 22px;
  }

  @media (max-width: 800px) {
    .food-details-main-card {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .food-details-main-card > div:last-child {
      padding: 24px !important;
    }

    .food-details-main-card h1 {
      font-size: 30px !important;
    }

    .food-details-main-card > div:first-child,
    .food-details-main-card img {
      min-height: 280px !important;
    }

    .food-details-main-card .metaGrid {
      grid-template-columns: 1fr !important;
    }
  }
`;

if (!document.getElementById("food-details-global-styles")) {
  styleSheet.id = "food-details-global-styles";
  document.head.appendChild(styleSheet);
}

export default FoodDetails;
