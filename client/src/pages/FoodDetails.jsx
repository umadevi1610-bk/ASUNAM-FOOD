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

  // ======================================
  // LOAD FOOD
  // ======================================
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
      } catch (err) {
        console.error("Food details error:", err);

        setError(
          err.message || "Failed to load food details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFood();
  }, [foodId]);

  // ======================================
  // QUANTITY
  // ======================================
  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  // ======================================
  // ADD TO CART
  // ======================================
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

      alert(
        `${food.name} × ${quantity} added to cart 🛒`
      );
    } catch (err) {
      console.error("Add to cart error:", err);

      alert(
        err.message ||
          "Unable to add this food to your cart."
      );
    } finally {
      setAdding(false);
    }
  };

  // ======================================
  // GO BACK
  // ======================================
  const goBack = () => {
    window.history.back();
  };

  // ======================================
  // LOADING
  // ======================================
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

  // ======================================
  // ERROR
  // ======================================
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

  const restaurantName =
    food.restaurant?.name || "ASUNAM FOOD";

  const restaurantId =
    food.restaurant?._id || food.restaurant || null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* BACK */}
        <button
          type="button"
          style={styles.backButton}
          onClick={goBack}
        >
          ← Back
        </button>

        {/* MAIN */}
        <section style={styles.mainCard}>
          {/* IMAGE */}
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
              <span style={styles.vegBadge}>
                ● VEG
              </span>
            )}
          </div>

          {/* DETAILS */}
          <div style={styles.detailsSection}>
            <span style={styles.category}>
              {food.category || "FOOD"}
            </span>

            <h1 style={styles.foodName}>
              {food.name}
            </h1>

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

            {/* META */}
            <div style={styles.metaGrid}>
              <div style={styles.metaBox}>
                <span>⏱️</span>
                <div>
                  <small>Preparation</small>
                  <strong>
                    {food.preparationTime || "-"} min
                  </strong>
                </div>
              </div>

              <div style={styles.metaBox}>
                <span>⭐</span>
                <div>
                  <small>Rating</small>
                  <strong>
                    {Number(food.rating || 0).toFixed(1)}
                  </strong>
                </div>
              </div>

              <div style={styles.metaBox}>
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
            <div style={styles.priceSection}>
              <span>Price</span>

              <strong>₹{food.price}</strong>
            </div>

            {/* QUANTITY */}
            <div style={styles.quantitySection}>
              <div>
                <span style={styles.quantityLabel}>
                  Quantity
                </span>

                <div style={styles.quantityControl}>
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <strong>{quantity}</strong>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.totalPrice}>
                <span>Total</span>

                <strong>
                  ₹{Number(food.price) * quantity}
                </strong>
              </div>
            </div>

            {/* ADD BUTTON */}
            <button
              type="button"
              disabled={
                !food.isAvailable || adding
              }
              style={{
                ...styles.addButton,
                opacity:
                  !food.isAvailable || adding
                    ? 0.6
                    : 1,
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
    background: "#f7f7f7",
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
    color: "#666",
    padding: 0,
    marginBottom: "18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  mainCard: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(0, 1fr)",
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
  },

  imageSection: {
    position: "relative",
    minHeight: "500px",
    background: "#eee",
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
    color: "#fff",
    fontWeight: "700",
    fontSize: "18px",
  },

  vegBadge: {
    position: "absolute",
    top: "18px",
    left: "18px",
    background: "#fff",
    color: "#21843a",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
  },

  detailsSection: {
    padding: "38px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  category: {
    color: "#ff5a36",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },

  foodName: {
    margin: "8px 0 8px",
    fontSize: "38px",
    lineHeight: 1.15,
    color: "#222",
  },

  restaurantButton: {
    alignSelf: "flex-start",
    border: "none",
    background: "#fff1e8",
    color: "#e85d04",
    padding: "7px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  description: {
    color: "#666",
    lineHeight: 1.7,
    fontSize: "14px",
    margin: "20px 0",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  metaBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fafafa",
    borderRadius: "12px",
    padding: "12px 10px",
  },

  metaBoxSmall: {
    display: "block",
  },

  priceSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "25px",
    paddingBottom: "18px",
    borderBottom: "1px solid #eee",
    color: "#777",
  },

  quantitySection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginTop: "22px",
  },

  quantityLabel: {
    display: "block",
    fontSize: "12px",
    color: "#888",
    marginBottom: "8px",
  },

  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "5px",
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
    background: "#ff5a36",
    color: "#fff",
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  unavailableText: {
    textAlign: "center",
    color: "#c62828",
    fontSize: "12px",
    margin: "10px 0 0",
  },

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
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
    marginTop: "10px",
  },
};

// ======================================
// SMALL GLOBAL STYLES
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

  .metaBox small {
    display: block;
    color: #999;
    font-size: 10px;
    margin-bottom: 3px;
  }

  .metaBox strong {
    color: #333;
    font-size: 12px;
  }

  .priceSection strong {
    color: #222;
    font-size: 28px;
  }

  .quantityControl strong {
    min-width: 20px;
    text-align: center;
  }

  .totalPrice span {
    color: #999;
    font-size: 11px;
  }

  .totalPrice strong {
    color: #222;
    font-size: 22px;
  }

  @media (max-width: 800px) {
    .food-details-main-card {
      grid-template-columns: 1fr;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default FoodDetails;