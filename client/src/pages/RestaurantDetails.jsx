import { useEffect, useMemo, useState } from "react";
import { getRestaurantById } from "../services/restaurantService";
import { getFoods } from "../services/foodService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const RestaurantDetails = ({ restaurantId }) => {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingFoodId, setAddingFoodId] = useState(null);

  // ======================================
  // LOAD RESTAURANT + MENU
  // ======================================
  useEffect(() => {
    const loadRestaurant = async () => {
      if (!restaurantId) {
        setError("Restaurant not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [restaurantData, foodData] = await Promise.all([
          getRestaurantById(restaurantId),
          getFoods({ restaurant: restaurantId }),
        ]);

        if (!restaurantData?.restaurant) {
          throw new Error("Restaurant not found.");
        }

        setRestaurant(restaurantData.restaurant);
        setFoods(foodData?.foods || []);
      } catch (err) {
        console.error("Restaurant details error:", err);

        setError(
          err.message ||
            "Failed to load restaurant and menu."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  // ======================================
  // MENU CATEGORIES
  // ======================================
  const menuCategories = useMemo(() => {
    const categories = foods
      .map((food) => food.category)
      .filter(Boolean);

    return ["All", ...new Set(categories)];
  }, [foods]);

  // ======================================
  // FILTER FOODS
  // ======================================
  const filteredFoods = useMemo(() => {
    if (selectedCategory === "All") {
      return foods;
    }

    return foods.filter(
      (food) => food.category === selectedCategory
    );
  }, [foods, selectedCategory]);

  // ======================================
  // ADD TO CART
  // ======================================
  const handleAddToCart = async (food) => {
    if (!isAuthenticated) {
      alert("Please login first to add food to your cart.");
      return;
    }

    try {
      setAddingFoodId(food._id);

      await addItem(food._id, 1);

      alert(`${food.name} added to cart 🛒`);
    } catch (err) {
      console.error("Add food error:", err);

      alert(
        err.message ||
          "Unable to add this food to your cart."
      );
    } finally {
      setAddingFoodId(null);
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

          <h2>Loading restaurant...</h2>

          <p style={styles.messageText}>
            Getting the latest menu from ASUNAM FOOD.
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // ERROR
  // ======================================
  if (error || !restaurant) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>😕</div>

          <h2>Unable to load restaurant</h2>

          <p style={styles.messageText}>
            {error || "Restaurant not found."}
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

  const cuisineText = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(" • ")
    : restaurant.cuisine || "Food & Restaurant";

  const restaurantImage =
    restaurant.image ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ======================================
            BACK
        ====================================== */}
        <button
          style={styles.backButton}
          onClick={goBack}
        >
          ← Back to restaurants
        </button>

        {/* ======================================
            RESTAURANT HERO
        ====================================== */}
        <section style={styles.heroCard}>
          <img
            src={restaurantImage}
            alt={restaurant.name}
            style={styles.heroImage}
          />

          <div style={styles.heroOverlay}></div>

          <div style={styles.heroContent}>
            <span style={styles.openBadge}>
              {restaurant.isOpen ? "OPEN NOW" : "CLOSED"}
            </span>

            <h1 style={styles.restaurantName}>
              {restaurant.name}
            </h1>

            <p style={styles.cuisine}>
              {cuisineText}
            </p>

            <div style={styles.heroMeta}>
              <span>
                ⭐ {Number(restaurant.rating || 0).toFixed(1)}
              </span>

              <span>
                🛵{" "}
                {restaurant.deliveryFee
                  ? `₹${restaurant.deliveryFee} delivery`
                  : "Free delivery"}
              </span>

              <span>
                🕐{" "}
                {restaurant.openingTime &&
                restaurant.closingTime
                  ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                  : "Hours unavailable"}
              </span>
            </div>
          </div>
        </section>

        {/* ======================================
            RESTAURANT INFO
        ====================================== */}
        <section style={styles.infoCard}>
          <div>
            <span style={styles.infoLabel}>
              ABOUT
            </span>

            <p style={styles.description}>
              {restaurant.description ||
                "Delicious food made fresh for you."}
            </p>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span>📍</span>

              <div>
                <small>Address</small>

                <strong>
                  {restaurant.address?.street || "-"},{" "}
                  {restaurant.address?.city || "-"}
                </strong>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>💰</span>

              <div>
                <small>Minimum Order</small>

                <strong>
                  ₹{restaurant.minimumOrderAmount || 0}
                </strong>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>📞</span>

              <div>
                <small>Phone</small>

                <strong>
                  {restaurant.phone || "Not available"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================
            MENU HEADER
        ====================================== */}
        <div style={styles.menuHeader}>
          <div>
            <span style={styles.eyebrow}>
              MENU
            </span>

            <h2 style={styles.menuTitle}>
              What are you having?
            </h2>

            <p style={styles.menuSubtitle}>
              {foods.length}{" "}
              {foods.length === 1 ? "item" : "items"}{" "}
              available
            </p>
          </div>
        </div>

        {/* ======================================
            CATEGORY FILTER
        ====================================== */}
        {menuCategories.length > 1 && (
          <div style={styles.categoryList}>
            {menuCategories.map((category) => (
              <button
                key={category}
                type="button"
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === category
                    ? styles.categoryButtonActive
                    : {}),
                }}
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* ======================================
            MENU
        ====================================== */}
        {filteredFoods.length === 0 ? (
          <div style={styles.emptyMenu}>
            <div style={styles.bigIcon}>🍽️</div>

            <h3>No food available</h3>

            <p>
              There are no food items in this category
              right now.
            </p>
          </div>
        ) : (
          <div style={styles.foodGrid}>
            {filteredFoods.map((food) => (
              <article
                key={food._id}
                style={{
                  ...styles.foodCard,
                  cursor: "pointer",
                }}
                onClick={() => {
                  window.location.href = `/foods/${food._id}`;
                }}
              >
                <div style={styles.foodImageWrap}>
                  <img
                    src={
                      food.image ||
                      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=85"
                    }
                    alt={food.name}
                    style={styles.foodImage}
                  />

                  {!food.isAvailable && (
                    <div style={styles.unavailable}>
                      Currently unavailable
                    </div>
                  )}

                  {food.isVeg && (
                    <span style={styles.vegBadge}>
                      ● VEG
                    </span>
                  )}
                </div>

                <div style={styles.foodContent}>
                  <div>
                    <span style={styles.foodCategory}>
                      {food.category}
                    </span>

                    <h3 style={styles.foodName}>
                      {food.name}
                    </h3>

                    <p style={styles.foodDescription}>
                      {food.description ||
                        "Fresh and delicious."}
                    </p>
                  </div>

                  <div style={styles.foodBottom}>
                    <div>
                      <strong style={styles.foodPrice}>
                        ₹{food.price}
                      </strong>

                      <span style={styles.prepTime}>
                        ⏱ {food.preparationTime || "-"} min
                      </span>
                    </div>

                      <button
                        type="button"
                        disabled={
                          !food.isAvailable ||
                          addingFoodId === food._id
                        }
                        style={{
                          ...styles.addButton,
                          opacity:
                            !food.isAvailable ||
                            addingFoodId === food._id
                              ? 0.6
                              : 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(food);
                        }}
                      >
                        {addingFoodId === food._id
                          ? "Adding..."
                          : "Add +"}
                      </button>
                  </div>
                </div>
              </article>
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
    background: "#F0FDF4",
    padding: "28px 20px 50px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1150px",
    margin: "0 auto",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#166534",
    padding: "0",
    marginBottom: "18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  heroCard: {
    position: "relative",
    height: "360px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(22, 101, 52, 0.12)",
  },

  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.78))",
  },

  heroContent: {
    position: "absolute",
    left: "28px",
    right: "28px",
    bottom: "25px",
    color: "#FFFFFF",
  },

  openBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#DCFCE7",
    color: "#166534",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "10px",
  },

  restaurantName: {
    margin: 0,
    fontSize: "38px",
    lineHeight: 1.15,
  },

  cuisine: {
    margin: "8px 0",
    fontSize: "14px",
    opacity: 0.9,
  },

  heroMeta: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    fontSize: "13px",
    marginTop: "10px",
  },

  infoCard: {
    background: "#FFFFFF",
    marginTop: "20px",
    padding: "23px",
    border: "1px solid #D1FAE5",
    borderRadius: "18px",
    boxShadow: "0 6px 20px rgba(22, 101, 52, 0.05)",
  },

  infoLabel: {
    display: "block",
    color: "#166534",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontSize: "10px",
  },

  description: {
    margin: "7px 0 20px",
    color: "#475569",
    lineHeight: 1.6,
    maxWidth: "750px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
  },

  infoItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    background: "#F0FDF4",
    border: "1px solid #D1FAE5",
    borderRadius: "12px",
    padding: "14px",
  },

  infoItemSpan: {
    fontSize: "20px",
  },

  infoItemSmall: {
    display: "block",
    fontSize: "11px",
    color: "#64748B",
    marginBottom: "4px",
  },

  menuHeader: {
    marginTop: "34px",
    marginBottom: "15px",
  },

  eyebrow: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.8px",
    color: "#166534",
  },

  menuTitle: {
    margin: "5px 0 4px",
    fontSize: "28px",
    color: "#14532D",
  },

  menuSubtitle: {
    margin: 0,
    color: "#64748B",
    fontSize: "13px",
  },

  categoryList: {
    display: "flex",
    gap: "9px",
    overflowX: "auto",
    paddingBottom: "5px",
    marginBottom: "18px",
  },

  categoryButton: {
    border: "1px solid #D1FAE5",
    background: "#FFFFFF",
    color: "#166534",
    padding: "9px 15px",
    borderRadius: "999px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: "600",
  },

  categoryButtonActive: {
    background: "#166534",
    borderColor: "#166534",
    color: "#FFFFFF",
  },

  foodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  foodCard: {
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(22, 101, 52, 0.06)",
  },

  foodImageWrap: {
    position: "relative",
    height: "210px",
    background: "#F0FDF4",
  },

  foodImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  unavailable: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    color: "#FFFFFF",
    fontWeight: "700",
  },

  vegBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#FFFFFF",
    color: "#166534",
    padding: "5px 8px",
    border: "1px solid #BBF7D0",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "800",
  },

  foodContent: {
    padding: "17px",
  },

  foodCategory: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#166534",
    fontWeight: "700",
  },

  foodName: {
    margin: "5px 0",
    color: "#14532D",
    fontSize: "19px",
  },

  foodDescription: {
    margin: 0,
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.5,
    minHeight: "39px",
  },

  foodBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginTop: "16px",
  },

  foodPrice: {
    display: "block",
    color: "#14532D",
    fontSize: "18px",
  },

  prepTime: {
    display: "block",
    color: "#64748B",
    fontSize: "11px",
    marginTop: "3px",
  },

  addButton: {
    border: "none",
    background: "#166534",
    color: "#FFFFFF",
    padding: "10px 15px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  emptyMenu: {
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "18px",
    padding: "50px 20px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(22, 101, 52, 0.05)",
  },

  centerPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "#F0FDF4",
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


export default RestaurantDetails;