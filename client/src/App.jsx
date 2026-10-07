import { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import RestaurantDetails from "./pages/RestaurantDetails";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";

import { getRestaurants } from "./services/restaurantService";
import { getFoods } from "./services/foodService";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

const categories = [
  { name: "All", icon: "🍽️" },
  { name: "Biryani", icon: "🍛" },
  { name: "Pizza", icon: "🍕" },
  { name: "Burger", icon: "🍔" },
  { name: "Chinese", icon: "🥡" },
  { name: "Desserts", icon: "🍰" },
  { name: "Drinks", icon: "🥤" },
];

function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showCart, setShowCart] = useState(false);

  const { isAuthenticated } = useAuth();

  const {
    cart,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clearAll,
  } = useCart();

  const currentPath = window.location.pathname;
  const restaurantMatch = currentPath.match(/^\/restaurants\/([^/]+)$/);
  const orderMatch = currentPath.match(/^\/orders\/([^/]+)$/);
  const foodMatch = currentPath.match(/^\/foods\/([^/]+)$/);

  if (currentPath === "/login") {
    return <Login />;
  }

  if (currentPath === "/orders") {
    return <Orders />;
  }

  if (currentPath === "/checkout") {
    return <Checkout />;
  } 

  if (currentPath === "/profile") {
  return <Profile />;
  }

  if (currentPath === "/cart") {
  return <Cart />;
  }

  if (restaurantMatch) {
  return (
    <RestaurantDetails
      restaurantId={restaurantMatch[1]}
    />
  );
}

  if (foodMatch) {
  return (
    <FoodDetails
      foodId={foodMatch[1]}
    />
  );
}

  if (orderMatch) {
    const orderId = orderMatch[1];
    return <OrderTracking orderId={orderId} />;
  }

  // LOAD REAL DATA FROM BACKEND
  useEffect(() => {
    if (currentPath !== "/") {
      setLoading(false);
      return;
    }

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setFetchError("");

        const [restaurantData, foodData] = await Promise.all([
          getRestaurants(),
          getFoods(),
        ]);

        const mappedRestaurants = (restaurantData.restaurants || []).map(
          (restaurant) => ({
            id: restaurant._id,
            name: restaurant.name,
            cuisine: Array.isArray(restaurant.cuisine)
              ? restaurant.cuisine.join(" • ")
              : restaurant.cuisine || "Food & Restaurant",
            rating: Number(restaurant.rating || 0).toFixed(1),
            time:
              restaurant.openingTime && restaurant.closingTime
                ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                : "Open now",
            price:
              Number(restaurant.minimumOrderAmount || 0) > 0
                ? `Min ₹${restaurant.minimumOrderAmount}`
                : "No minimum order",
            image:
              restaurant.image ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
            cuisineList: Array.isArray(restaurant.cuisine)
              ? restaurant.cuisine
              : [],
          })
        );

        const mappedFoods = (foodData.foods || []).map((food) => ({
          id: food._id,
          name: food.name,
          restaurant:
            food.restaurant?.name ||
            "ASUNAM FOOD",
          restaurantId:
            food.restaurant?._id ||
            food.restaurant ||
            null,
          category: food.category,
          price: food.price,
          image:
            food.image ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=85",
          rating: Number(food.rating || 0).toFixed(1),
          isVeg: food.isVeg,
          isAvailable: food.isAvailable,
        }));

        setRestaurants(mappedRestaurants);
        setPopularFoods(mappedFoods);
      } catch (error) {
        console.error("Failed to load home data:", error.message);
        setFetchError(
          "Could not load restaurants and food from the server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // CATEGORY CLICK
  const handleCategoryClick = (category) => {
    setActiveCategory(category);

    setTimeout(() => {
      document
        .getElementById("restaurants")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // VIEW ALL
  const handleViewAll = () => {
    setActiveCategory("All");

    setTimeout(() => {
      document
        .getElementById("restaurants")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // ADD TO REAL BACKEND CART
  const handleAddToCart = async (food) => {
    if (!isAuthenticated) {
      alert("Please login first to add food to your cart.");
      return;
    }

    try {
      await addItem(food.id, 1);
      setShowCart(true);
    } catch (error) {
      console.error("Add to cart error:", error.message);
      alert(error.message);
    }
  };

  // SEARCH + CATEGORY FILTER
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesCategory =
      activeCategory === "All" ||
      restaurant.cuisineList.some(
        (item) =>
          item.toLowerCase() === activeCategory.toLowerCase()
      );

    const searchText =
      `${restaurant.name} ${restaurant.cuisine}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const filteredFoods = popularFoods.filter((food) => {
    const matchesCategory =
      activeCategory === "All" ||
      food.category.toLowerCase() === activeCategory.toLowerCase();

    const searchText =
      `${food.name} ${food.restaurant}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">

        <div className="logo">
          <div className="logo-mark">A</div>

          <div>
            <h2>ASUNAM</h2>
            <span>FOOD</span>
          </div>
        </div>

        <nav>
          <a className="active" href="#home">
            Home
          </a>

          <a href="#restaurants">
            Restaurants
          </a>

          <a href="#popular">
            Popular
          </a>

          <a href="#offers">
            Offers
          </a>
        </nav>

        <div className="nav-actions">

          <button className="location">
            📍 <span>Chennai</span>
          </button>

            <button
              className="cart-btn"
              onClick={() => {
                window.location.href = "/cart";
              }}
            >
              🛒
              {itemCount > 0 && <b>{itemCount}</b>}
            </button>

            <button
              className="profile-btn"
              onClick={() => {
                window.location.href = "/profile";
              }}
            >
              👤
            </button>

        </div>
      </header>


      {/* HERO */}
      <main id="home">

        <section className="hero-section">

          <div className="hero-content">

            <div className="offer-pill">
              ✨ Delicious food, delivered fast
            </div>

            <h1>
              Your favourite food,
              <br />
              <span>at your doorstep.</span>
            </h1>

            <p>
              Discover the best restaurants around you,
              order your favourite meals and enjoy them
              without leaving your home.
            </p>

            <div className="search-box">

              <span>🔍</span>

              <input
                type="text"
                placeholder="Search for food or restaurants..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <button>
                Search
              </button>

            </div>

            <div className="hero-info">

              <div>
                <strong>500+</strong>
                <span>Restaurants</span>
              </div>

              <div>
                <strong>10K+</strong>
                <span>Happy customers</span>
              </div>

              <div>
                <strong>30 min</strong>
                <span>Average delivery</span>
              </div>

            </div>

          </div>


          <div className="hero-image-area">

            <div className="hero-circle"></div>

            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85"
              alt="Delicious food"
            />

            <div className="floating-card rating-card">

              <div className="mini-icon">
                ⭐
              </div>

              <div>
                <strong>4.9/5</strong>
                <span>Customer rating</span>
              </div>

            </div>

            <div className="floating-card delivery-card">

              <div className="mini-icon">
                🚴
              </div>

              <div>
                <strong>Fast delivery</strong>
                <span>At your doorstep</span>
              </div>

            </div>

          </div>

        </section>


        {/* CATEGORIES */}
        <section className="section">

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                EXPLORE
              </span>

              <h2>
                What are you craving?
              </h2>
            </div>

            <button
              className="view-all"
              onClick={handleViewAll}
            >
              View all →
            </button>

          </div>


          <div className="category-list">

            {categories.map((category) => (

              <button
                key={category.name}
                className={
                  activeCategory === category.name
                    ? "category active-category"
                    : "category"
                }
                onClick={() =>
                  handleCategoryClick(category.name)
                }
              >

                <span>
                  {category.icon}
                </span>

                <strong>
                  {category.name}
                </strong>

              </button>

            ))}

          </div>

        </section>


        {/* RESTAURANTS */}
        <section
          className="section"
          id="restaurants"
        >

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                {activeCategory === "All"
                  ? "NEAR YOU"
                  : activeCategory.toUpperCase()}
              </span>

              <h2>
                {activeCategory === "All"
                  ? "Popular restaurants"
                  : `${activeCategory} restaurants`}
              </h2>
            </div>

            <button
              className="view-all"
              onClick={handleViewAll}
            >
              See all →
            </button>

          </div>


          {fetchError && (
            <div className="no-results">
              <span>⚠️</span>
              <h3>Server connection problem</h3>
              <p>{fetchError}</p>
            </div>
          )}

          {loading ? (
            <div className="no-results">
              <span>🍽️</span>
              <h3>Loading restaurants...</h3>
              <p>Getting fresh data from ASUNAM FOOD.</p>
            </div>
          ) : (
            <div className="restaurant-grid">

            {filteredRestaurants.map(
              (restaurant) => (

              <article
                className="restaurant-card"
                key={restaurant.id}
                onClick={() => {
                  window.location.href = `/restaurants/${restaurant.id}`;
                }}
                style={{ cursor: "pointer" }}
              >

                  <div className="restaurant-image">

                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                    />

                    <span className="discount">
                      20% OFF
                    </span>

                    <button className="heart">
                      ♡
                    </button>

                  </div>


                  <div className="restaurant-info">

                    <div className="restaurant-title">

                      <h3>
                        {restaurant.name}
                      </h3>

                      <span className="rating">
                        ★ {restaurant.rating}
                      </span>

                    </div>

                    <p>
                      {restaurant.cuisine}
                    </p>

                    <div className="restaurant-meta">

                      <span>
                        🛵 {restaurant.time}
                      </span>

                      <span>
                        {restaurant.price}
                      </span>

                    </div>

                    <button
                      className="menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/restaurants/${restaurant.id}`;
                      }}
                    >
                      View Menu →
                    </button>

                  </div>

                </article>

              )
            )}


            {filteredRestaurants.length === 0 && (

              <div className="no-results">

                <span>
                  😕
                </span>

                <h3>
                  No restaurants found
                </h3>

                <p>
                  Try another category or search.
                </p>

              </div>

            )}

            </div>
          )}

        </section>


        {/* POPULAR FOOD */}
        <section
          className="popular-section"
          id="popular"
        >

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                CUSTOMER FAVOURITES
              </span>

              <h2>
                Popular right now
              </h2>
            </div>

            <button
              className="view-all"
              onClick={handleViewAll}
            >
              View all →
            </button>

          </div>


          {loading ? (
            <div className="no-results">
              <span>🍗</span>
              <h3>Loading food...</h3>
              <p>Getting fresh food from ASUNAM FOOD.</p>
            </div>
          ) : (
            <div className="food-grid">

            {filteredFoods.map((food) => (

              <article
                className="food-card"
                key={food.name}
              >

                <div className="food-image">

                  <img
                    src={food.image}
                    alt={food.name}
                  />

                  <button
                    className="add-btn"
                    onClick={() =>
                      handleAddToCart(food)
                    }
                  >
                    +
                  </button>

                </div>


                <div className="food-info">

                  <span>
                    {food.restaurant}
                  </span>

                  <h3>
                    {food.name}
                  </h3>

                  <div className="food-bottom">

                    <strong>
                      ₹{food.price}
                    </strong>

                    <small>
                      ★ {food.rating || "0.0"}
                    </small>

                  </div>

                </div>

              </article>

            ))}


            {filteredFoods.length === 0 && (

              <div className="no-results">

                <span>
                  🍽️
                </span>

                <h3>
                  No food found
                </h3>

                <p>
                  Try another category.
                </p>

              </div>

            )}

            </div>
          )}

        </section>


        {/* OFFER */}
        <section
          className="offer-section"
          id="offers"
        >

          <div className="offer-content">

            <span className="offer-label">
              ASUNAM SPECIAL
            </span>

            <h2>
              Get <span>20% OFF</span>
              <br />
              on your first order
            </h2>

            <p>
              Use the code below during checkout
              and enjoy your first meal with
              ASUNAM FOOD.
            </p>

            <div className="coupon">

              <strong>
                ASUNAM20
              </strong>

              <button
                onClick={() =>
                  navigator.clipboard?.writeText(
                    "ASUNAM20"
                  )
                }
              >
                Copy code
              </button>

            </div>

          </div>

          <div className="offer-emoji">
            🍔
          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer>

        <div className="footer-brand">

          <div className="logo">

            <div className="logo-mark">
              A
            </div>

            <div>
              <h2>ASUNAM</h2>
              <span>FOOD</span>
            </div>

          </div>

          <p>
            Good food. Good mood.
            Delivered with love.
          </p>

        </div>


        <div className="footer-links">

          <div>
            <h4>Company</h4>
            <a href="#home">About us</a>
            <a href="#restaurants">
              Restaurants
            </a>
            <a href="#offers">
              Offers
            </a>
          </div>

          <div>
            <h4>Support</h4>
            <a href="#home">Help Center</a>
            <a href="#home">Contact us</a>
            <a href="#home">Terms</a>
          </div>

          <div>
            <h4>For partners</h4>
            <a href="#home">
              Add restaurant
            </a>
            <a href="#home">
              Become a delivery partner
            </a>
          </div>

        </div>

      </footer>


      <div className="copyright">
        © 2026 ASUNAM FOOD. All rights reserved.
      </div>


      {/* CART */}
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

              <button onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>

            {!cart?.items?.length ? (
              <div className="empty-cart">
                <span>🛒</span>

                <h3>Your cart is empty</h3>

                <p>
                  Add something delicious
                  to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div
                      className="cart-item"
                      key={item._id}
                    >
                      <img
                        src={item.food?.image}
                        alt={item.food?.name || "Food"}
                      />

                      <div>
                        <h4>
                          {item.food?.name || "Food item"}
                        </h4>

                        <span>
                          {item.restaurant?.name ||
                            cart.restaurant?.name ||
                            "Restaurant"}
                        </span>

                        <strong>
                          ₹{item.price} × {item.quantity}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "8px",
                          }}
                        >
                          <button
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

                  <strong>
                    ₹{cart.totalAmount || 0}
                  </strong>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => {
                    setShowCart(false);
                    window.location.href = "/checkout";
                  }}
                >
                  Proceed to Checkout →
                </button>

                <button
                  className="checkout-btn"
                  onClick={async () => {
                    try {
                      await clearAll();
                    } catch (error) {
                      alert(error.message);
                    }
                  }}
                  style={{ marginTop: "10px" }}
                >
                  Clear Cart
                </button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;