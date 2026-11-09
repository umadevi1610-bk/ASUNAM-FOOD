
import { useCallback, useEffect, useState } from "react";
import "./App.css";

import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import RestaurantOnboarding from "./pages/RestaurantOnboarding";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import RestaurantDetails from "./pages/RestaurantDetails";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";

import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import ManageMenu from "./pages/restaurant/ManageMenu";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";

import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryProfile from "./pages/DeliveryProfile";

import { getRestaurants } from "./services/restaurantService";
import { getFoods } from "./services/foodService";

import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

// ======================================
// CATEGORY DATA
// ======================================

const categories = [
  {
    name: "All",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
  },
  {
    name: "Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=200",
  },
  {
    name: "South Indian",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200",
  },
  {
    name: "North Indian",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200",
  },
  {
    name: "Chicken",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200",
  },
  {
    name: "Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
  },
  {
    name: "Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
  },
  {
    name: "Chinese",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200",
  },
  {
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200",
  },
  {
    name: "Drinks",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200",
  },
];

// ======================================
// CATEGORY MATCHING
// ======================================

const categoryKeywords = {
  "Biryani": ["biryani"],
  "South Indian": [
    "south indian", "dosa", "idli", "uttapam",
    "sambar", "pongal", "tiffin",
  ],
  "North Indian": [
    "north indian", "naan", "roti", "paneer",
    "punjabi", "paratha",
  ],
  "Chicken": ["chicken"],
  "Pizza": ["pizza"],
  "Burger": ["burger"],
  "Chinese": [
    "chinese", "noodles", "manchurian", "fried rice",
  ],
  "Desserts": [
    "dessert", "cake", "ice cream", "sweet",
  ],
  "Drinks": [
    "drink", "juice", "shake", "coffee", "tea",
  ],
};

const matchesCategory = (category, value) => {
  if (category === "All") return true;

  const text = String(value || "").toLowerCase();

  const keywords = categoryKeywords[category] || [
    category.toLowerCase(),
  ];

  return keywords.some((keyword) => text.includes(keyword));
};

// ======================================
// APP
// ======================================

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const isHome = window.location.pathname === "/";
    const alreadyShown =
      sessionStorage.getItem("asunamSplashShown") === "true";

    return isHome && !alreadyShown;
  });

  const [restaurants, setRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [vegMode, setVegMode] = useState(false);
  const [under250, setUnder250] = useState(false);
  const [topRated, setTopRated] = useState(false);

  const [showCart, setShowCart] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const {
    cart,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clearAll,
  } = useCart();

  const currentPath = window.location.pathname;

  const restaurantMatch = currentPath.match(
    /^\/restaurants\/([^/]+)$/
  );

  const foodMatch = currentPath.match(
    /^\/foods\/([^/]+)$/
  );

  const orderMatch = currentPath.match(
    /^\/orders\/([^/]+)$/
  );

  // ======================================
  // SPLASH SCREEN
  // ======================================

  const finishSplash = useCallback(() => {
    sessionStorage.setItem("asunamSplashShown", "true");
    setShowSplash(false);
    window.location.replace("/login");
  }, []);

  useEffect(() => {
    if (!showSplash || authLoading) return;

    const timer = setTimeout(finishSplash, 5000);

    return () => clearTimeout(timer);
  }, [showSplash, authLoading, finishSplash]);

  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {
    if (currentPath !== "/") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setFetchError("");

        const [restaurantData, foodData] = await Promise.all([
          getRestaurants(),
          getFoods(),
        ]);

        if (cancelled) return;

        const restaurantList =
          restaurantData?.restaurants ||
          (Array.isArray(restaurantData) ? restaurantData : []);

        const foodList =
          foodData?.foods ||
          (Array.isArray(foodData) ? foodData : []);

        setRestaurants(
          restaurantList.map((restaurant) => ({
            id: restaurant._id,
            name: restaurant.name,

            cuisine: Array.isArray(restaurant.cuisine)
              ? restaurant.cuisine.join(" • ")
              : restaurant.cuisine || "Food & Restaurant",

            rating: Number(restaurant.rating || 0),
            isOpen: Boolean(restaurant.isOpen),

            image:
              restaurant.image ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700",

            minimumOrderAmount:
              Number(restaurant.minimumOrderAmount || 0),

            openingTime: restaurant.openingTime,
            closingTime: restaurant.closingTime,
          }))
        );

        setPopularFoods(
          foodList.map((food) => ({
            id: food._id,
            name: food.name,
            restaurant: food.restaurant?.name || "ASUNAM FOOD",
            restaurantId: food.restaurant?._id || food.restaurant,
            category: food.category || "",
            price: Number(food.price || 0),
            rating: Number(food.rating || 0),
            isVeg: Boolean(food.isVeg),
            isAvailable: food.isAvailable !== false,

            image:
              food.image ||
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700",
          }))
        );
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setFetchError("Unable to load food. Please check your connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentPath]);

  // ======================================
  // FILTER DATA
  // ======================================

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const text = `${restaurant.name} ${restaurant.cuisine}`;

    const categoryMatch = matchesCategory(activeCategory, text);
    const searchMatch = text.toLowerCase().includes(search.toLowerCase());

    const ratingMatch = !topRated || restaurant.rating >= 4;

    return categoryMatch && searchMatch && ratingMatch;
  });

  const filteredFoods = popularFoods.filter((food) => {
    const text =
      `${food.name} ${food.category} ${food.restaurant}`;

    const categoryMatch = matchesCategory(
      activeCategory,
      `${food.category} ${food.name}`
    );

    const searchMatch = text.toLowerCase().includes(search.toLowerCase());

    const vegMatch = !vegMode || food.isVeg;
    const priceMatch = !under250 || food.price < 250;
    const ratingMatch = !topRated || food.rating >= 4;

    return (
      categoryMatch &&
      searchMatch &&
      vegMatch &&
      priceMatch &&
      ratingMatch
    );
  });

  // ======================================
  // SEARCH
  // ======================================

  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    document.getElementById("home-food-search")?.focus();
  };

  const handleSearch = () => {
    document.getElementById("recommended")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ======================================
  // CATEGORY CLICK
  // ======================================

  const handleCategoryClick = (category) => {
    setActiveCategory(category);

    document.getElementById("recommended")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ======================================
  // ADD TO CART
  // ======================================

  const handleAddToCart = async (food) => {
    if (!isAuthenticated) {
      alert("Please login first to add food to your cart.");
      window.location.href = "/login";
      return;
    }

    if (!food.isAvailable) {
      alert("This food is currently unavailable.");
      return;
    }

    try {
      await addItem(food.id, 1);
      setShowCart(true);
    } catch (error) {
      alert(error.message);
    }
  };

  // ======================================
  // ROUTES
  // ======================================

  if (showSplash) return <SplashScreen />;

  if (currentPath === "/login") return <Login />;

  if (currentPath === "/signup") {
    return <Login initialView="signup" />;
  }

  if (currentPath === "/orders") return <Orders />;
  if (currentPath === "/checkout") return <Checkout />;
  if (currentPath === "/cart") return <Cart />;
  if (currentPath === "/profile") return <Profile />;

  if (currentPath === "/restaurant/onboarding") {
    return <RestaurantOnboarding />;
  }

  if (currentPath === "/restaurant/dashboard") {
    return <RestaurantDashboard />;
  }

  if (currentPath === "/restaurant/menu") {
    return <ManageMenu />;
  }

  if (currentPath === "/restaurant/orders") {
    return <RestaurantOrders />;
  }

if (currentPath === "/delivery/onboarding") {
  return <DeliveryProfile />;
}

  if (currentPath === "/restaurant/profile") {
    return <RestaurantProfile />;
  }

  if (currentPath === "/delivery/dashboard") {
    return <DeliveryDashboard />;
  }

  if (currentPath === "/delivery/profile") {
    return <DeliveryProfile />;
  }

  if (restaurantMatch) {
    return (
      <RestaurantDetails restaurantId={restaurantMatch[1]} />
    );
  }

  if (foodMatch) {
    return <FoodDetails foodId={foodMatch[1]} />;
  }

  if (orderMatch) {
    return <OrderTracking orderId={orderMatch[1]} />;
  }

  // ======================================
  // HOME PAGE
  // ======================================

  return (
    <div className="app home-page">

      {/* HEADER */}

      <header className="navbar">
        <a href="#home" className="logo">
          <div className="logo-mark">A</div>

          <div>
            <h2>ASUNAM</h2>
            <span>FOOD</span>
          </div>
        </a>

        <nav>
          <a href="#home" className="active">Home</a>
          <a href="#categories">Categories</a>
          <a href="#recommended">Restaurants</a>
          <a href="#popular">Popular Food</a>
        </nav>

        <div className="nav-actions">
          <button
            className="header-orders-btn"
            onClick={() => window.location.href = "/orders"}
          >
            Orders
          </button>

          <button
            className="cart-btn"
            onClick={() => setShowCart(true)}
            aria-label="Open cart"
          >
            🛒
            {itemCount > 0 && <b>{itemCount}</b>}
          </button>

          <button
            className="profile-btn"
            onClick={() => window.location.href = "/profile"}
            aria-label="Profile"
          >
            👤
          </button>
        </div>
      </header>

      <main id="home">

        {/* SEARCH AND VEG FILTER */}

        <section className="search-area">
          <div className="search-box">
            <span>🔍</span>

            <input
              id="home-food-search"
              type="search"
              placeholder='Search "spicy biryani"'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            {search && (
              <button
                className="clear-search-btn"
                onClick={() => setSearch("")}
                type="button"
              >
                ×
              </button>
            )}

            <button
              className="search-submit"
              onClick={handleSearch}
              type="button"
            >
              Search
            </button>
          </div>

          <button
            className={`veg-toggle ${vegMode ? "veg-enabled" : ""}`}
            onClick={() => setVegMode(!vegMode)}
            type="button"
            aria-pressed={vegMode}
          >
            <span>VEG</span>
            <small>MODE</small>
            <i />
          </button>
        </section>

        {/* PROMOTIONAL BANNER */}

        <section className="promo-banner">
          <div className="promo-content">
            <span className="promo-kicker">WELCOME TO ASUNAM FOOD</span>

            <h1>
              Good food.
              <br />
              <span>Great moments.</span>
            </h1>

            <p>
              Discover delicious meals from your favourite local restaurants.
            </p>

            <button
              type="button"
              onClick={() => {
                document.getElementById("recommended")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Explore restaurants →
            </button>
          </div>

          <div className="promo-image">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
              alt="Fresh delicious food"
            />
          </div>

          <div className="promo-decoration">✦</div>
        </section>

        {/* CATEGORIES */}

        <section className="categories-section" id="categories">
          <div className="category-carousel">
            {categories.map((category) => (
              <button
                className={`category-item ${
                  activeCategory === category.name ? "selected" : ""
                }`}
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                type="button"
                aria-pressed={activeCategory === category.name}
              >
                <img src={category.image} alt="" loading="lazy" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FILTER CHIPS */}

        <section className="filter-section">
          <button
            type="button"
            className="filter-chip"
            onClick={() => {
              setVegMode(!vegMode);
            }}
          >
            ♧ {vegMode ? "Veg only ✓" : "Filters"}
          </button>

          <button
            type="button"
            className={`filter-chip ${under250 ? "filter-active" : ""}`}
            onClick={() => setUnder250(!under250)}
          >
            Under ₹250 {under250 ? "✓" : ""}
          </button>

          <button
            type="button"
            className={`filter-chip ${topRated ? "filter-active" : ""}`}
            onClick={() => setTopRated(!topRated)}
          >
            ★ Top rated {topRated ? "✓" : ""}
          </button>
        </section>

        {/* RECOMMENDED RESTAURANTS */}

        <section className="recommended-section" id="recommended">
          <div className="section-heading">
            <div>
              <span className="eyebrow">RECOMMENDED FOR YOU</span>

              <h2>
                {activeCategory === "All"
                  ? "Restaurants to explore"
                  : activeCategory + " favourites"}
              </h2>
            </div>

            <span className="result-count">
              {filteredRestaurants.length} places
            </span>
          </div>

          {loading ? (
            <div className="loading-message">Finding delicious places...</div>
          ) : fetchError ? (
            <div className="loading-message">{fetchError}</div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="restaurant-strip">
              {filteredRestaurants.map((restaurant) => (
                <article
                  className="restaurant-card"
                  key={restaurant.id}
                  onClick={() => {
                    window.location.href =
                      `/restaurants/${restaurant.id}`;
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      window.location.href =
                        `/restaurants/${restaurant.id}`;
                    }
                  }}
                >
                  <div className="restaurant-image">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      loading="lazy"
                    />

                    <span className={`restaurant-status ${
                      restaurant.isOpen ? "open" : "closed"
                    }`}>
                      {restaurant.isOpen ? "OPEN" : "CLOSED"}
                    </span>
                  </div>

                  <div className="restaurant-info">
                    <div className="restaurant-name-row">
                      <h3>{restaurant.name}</h3>

                      <span className="rating">
                        {restaurant.rating > 0
                          ? `★ ${restaurant.rating.toFixed(1)}`
                          : "NEW"}
                      </span>
                    </div>

                    <p>{restaurant.cuisine}</p>

                    <div className="restaurant-meta">
                      <span>
                        {restaurant.minimumOrderAmount > 0
                          ? `Minimum ₹${restaurant.minimumOrderAmount}`
                          : "Order your favourites"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="restaurant-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        window.location.href =
                          `/restaurants/${restaurant.id}`;
                      }}
                    >
                      View menu →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="loading-message">
              No restaurants found. Try another category.
            </div>
          )}
        </section>

        {/* POPULAR FOOD */}

        <section className="popular-section" id="popular">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MADE FOR YOUR CRAVINGS</span>
              <h2>Popular food</h2>
            </div>

            <span className="result-count">
              {filteredFoods.length} items
            </span>
          </div>

          {loading ? (
            <div className="loading-message">
              Loading popular food...
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="food-grid">
              {filteredFoods.map((food) => (
                <article className="food-card" key={food.id}>
                  <div
                    className="food-image"
                    onClick={() => {
                      window.location.href = `/foods/${food.id}`;
                    }}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        window.location.href = `/foods/${food.id}`;
                      }
                    }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      loading="lazy"
                    />

                    <span className={food.isVeg ? "veg-label" : "nonveg-label"}>
                      {food.isVeg ? "● VEG" : "● NON VEG"}
                    </span>

                    <button
                      type="button"
                      className="add-btn"
                      disabled={!food.isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(food);
                      }}
                    >
                      {food.isAvailable ? "+" : "−"}
                    </button>
                  </div>

                  <div className="food-info">
                    <small>{food.restaurant}</small>

                    <h3>{food.name}</h3>

                    <div className="food-bottom">
                      <strong>₹{food.price}</strong>

                      <span>
                        {food.rating > 0
                          ? `★ ${food.rating.toFixed(1)}`
                          : "New"}
                      </span>
                    </div>

                    {!food.isAvailable && (
                      <small className="unavailable">
                        Currently unavailable
                      </small>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="loading-message">
              No food items match these filters.
            </div>
          )}
        </section>

        {/* BRAND PROMOTION */}

        <section className="brand-promo">
          <div>
            <span>ASUNAM FOOD</span>
            <h2>Every craving has a story.</h2>

            <p>
              Find your favourites, explore new tastes and enjoy every bite.
            </p>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Explore now ↑
            </button>
          </div>

          <div className="brand-promo-icon">🍽️</div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="home-footer">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-mark">A</div>

            <div>
              <h2>ASUNAM</h2>
              <span>FOOD</span>
            </div>
          </div>

          <p>Good food. Good mood. Delivered with love.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Company</h4>
            <a href="#home">About us</a>
            <a href="#recommended">Restaurants</a>
            <a href="#popular">Popular food</a>
          </div>

          <div>
            <h4>Support</h4>
            <a href="#home">Help Center</a>
            <a href="#home">Contact us</a>
            <a href="#home">Terms</a>
          </div>

          <div>
            <h4>Partners</h4>
            <a href="/restaurant/onboarding">Add restaurant</a>
            <a href="#home">Delivery partners</a>
          </div>
        </div>
      </footer>

      <div className="copyright">
        © 2026 ASUNAM FOOD. All rights reserved.
      </div>

      {/* CART DRAWER */}

      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">YOUR ORDER</span>
                <h2>Shopping Cart</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {!cart?.items?.length ? (
              <div className="empty-cart">
                <span>🛒</span>
                <h3>Your cart is empty</h3>
                <p>Add something delicious to get started.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <img
                        src={item.food?.image}
                        alt={item.food?.name || "Food"}
                      />

                      <div className="cart-item-details">
                        <h4>{item.food?.name || "Food item"}</h4>

                        <span>
                          {item.restaurant?.name ||
                            cart.restaurant?.name ||
                            "Restaurant"}
                        </span>

                        <strong>
                          ₹{item.price} × {item.quantity}
                        </strong>

                        <div className="cart-quantity-controls">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(
                                item.food?._id,
                                item.quantity - 1
                              )
                            }
                            disabled={!item.food?._id}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateItem(
                                item.food?._id,
                                item.quantity + 1
                              )
                            }
                            disabled={!item.food?._id}
                          >
                            +
                          </button>

                          <button
                            type="button"
                            className="remove-cart-item"
                            onClick={() =>
                              removeItem(item.food?._id)
                            }
                            disabled={!item.food?._id}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <strong>₹{cart.totalAmount || 0}</strong>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  onClick={() => {
                    setShowCart(false);
                    window.location.href = "/checkout";
                  }}
                >
                  Proceed to Checkout →
                </button>

                <button
                  type="button"
                  className="clear-cart-btn"
                  onClick={async () => {
                    try {
                      await clearAll();
                    } catch (error) {
                      alert(error.message);
                    }
                  }}
                >
                  Clear Cart
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}

      <nav className="mobile-bottom-nav">
        <a className="mobile-nav-active" href="#home">
          <span>⌂</span>
          <small>Home</small>
        </a>

        <button type="button" onClick={focusSearch}>
          <span>⌕</span>
          <small>Search</small>
        </button>

        <a href="/orders">
          <span>▤</span>
          <small>Orders</small>
        </a>

        <button
          type="button"
          onClick={() => setShowCart(true)}
        >
          <span>🛒</span>
          <small>Cart {itemCount > 0 ? `(${itemCount})` : ""}</small>
        </button>

        <a href="/profile">
          <span>♙</span>
          <small>Profile</small>
        </a>
      </nav>
    </div>
  );
}

export default App;
