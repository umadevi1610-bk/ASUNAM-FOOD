import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:5000/api";

const categories = [
  "Biryani",
  "Pizza",
  "Burger",
  "Chinese",
  "South Indian",
  "North Indian",
  "Desserts",
  "Drinks",
  "Snacks",
  "Other",
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "South Indian",
  image: "",
  isVeg: true,
  preparationTime: 20,
};

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || "Unable to complete your request."
    );
  }

  return data;
}

export default function ManageMenu() {
  const { token, user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // LOAD RESTAURANT AND MENU
  const loadMenu = useCallback(async () => {
    if (!token) {
      setError("Please log in to your restaurant account.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const restaurantData = await apiRequest(
        "/restaurants/mine",
        token
      );

      const currentRestaurant =
        restaurantData.restaurant ||
        restaurantData.data?.restaurant;

      if (!currentRestaurant?._id) {
        throw new Error(
          "Restaurant profile not found. Please complete restaurant setup."
        );
      }

      setRestaurant(currentRestaurant);

      const foodData = await apiRequest(
        `/food?restaurant=${encodeURIComponent(
          currentRestaurant._id
        )}`,
        token
      );

      setFoods(foodData.foods || foodData.data?.foods || []);
    } catch (err) {
      console.error("Manage menu error:", err);
      setError(err.message || "Could not load the menu.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // FORM INPUT CHANGE
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  // ADD OR UPDATE FOOD
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!restaurant?._id) {
      setError("Restaurant details are not available.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError("Enter a food name and a valid price.");
      return;
    }

    const payload = {
      restaurant: restaurant._id,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim(),
      isVeg: form.isVeg,
      isAvailable: true,
      preparationTime: Number(form.preparationTime) || 20,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiRequest(`/food/${editingId}`, token, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        setMessage("Food item updated successfully! ✅");
      } else {
        await apiRequest("/food", token, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setMessage("New food item added successfully! ✅");
      }

      resetForm();
      await loadMenu();
    } catch (err) {
      console.error("Save food error:", err);
      setError(err.message || "Could not save the food item.");
    } finally {
      setSaving(false);
    }
  };

  // EDIT FOOD
  const handleEdit = (food) => {
    setEditingId(food._id);

    setForm({
      name: food.name || "",
      description: food.description || "",
      price: String(food.price ?? ""),
      category: categories.includes(food.category)
        ? food.category
        : "Other",
      image: food.image || "",
      isVeg: Boolean(food.isVeg),
      preparationTime: food.preparationTime || 20,
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE FOOD
  const handleDelete = async (food) => {
    const confirmed = window.confirm(
      `Delete "${food.name}" from your menu?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`/food/${food._id}`, token, {
        method: "DELETE",
      });

      setMessage(`${food.name} deleted successfully.`);
      await loadMenu();

      if (editingId === food._id) {
        resetForm();
      }
    } catch (err) {
      console.error("Delete food error:", err);
      setError(err.message || "Could not delete this food item.");
    }
  };

  // CHANGE FOOD AVAILABILITY
  const handleAvailability = async (food) => {
    setError("");
    setMessage("");

    try {
      await apiRequest(`/food/${food._id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          isAvailable: !food.isAvailable,
        }),
      });

      setMessage(
        `${food.name} is now ${
          food.isAvailable ? "unavailable" : "available"
        }.`
      );

      await loadMenu();
    } catch (err) {
      console.error("Availability update error:", err);
      setError(err.message || "Could not update availability.");
    }
  };

  // SEARCH FOOD
  const filteredFoods = foods.filter((food) =>
    `${food.name} ${food.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>💚 ASUNAM FOOD</div>
          <small style={styles.headerSubtitle}>
            RESTAURANT PARTNER PORTAL
          </small>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => {
            window.location.href = "/restaurant/dashboard";
          }}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.container}>
        {/* PAGE HEADING */}
        <div style={styles.heading}>
          <div>
            <span style={styles.eyebrow}>YOUR RESTAURANT</span>

            <h1 style={styles.title}>Manage Menu 🍽️</h1>

            <p style={styles.subtitle}>
              {restaurant?.name ||
                user?.name ||
                "Restaurant Partner"}
              {" · "}
              Add, edit and manage your food items.
            </p>
          </div>

          <div style={styles.count}>
            {foods.length}
            <small>Menu items</small>
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div style={styles.error} role="alert">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={styles.success} role="status">
            ✅ {message}
          </div>
        )}

        {/* ADD / EDIT FORM */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            {editingId ? "Edit food item" : "Add a new food item"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Food name *
                <input
                  style={styles.input}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Masala Dosa"
                  required
                />
              </label>

              <label style={styles.label}>
                Price (₹) *
                <input
                  style={styles.input}
                  type="number"
                  name="price"
                  min="1"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 80"
                  required
                />
              </label>

              <label style={styles.label}>
                Category *
                <select
                  style={styles.input}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                Preparation time (minutes)
                <input
                  style={styles.input}
                  type="number"
                  name="preparationTime"
                  min="1"
                  value={form.preparationTime}
                  onChange={handleChange}
                />
              </label>

              <label style={styles.labelFull}>
                Food image URL (optional)
                <input
                  style={styles.input}
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/food.jpg"
                />
              </label>

              <label style={styles.labelFull}>
                Description
                <textarea
                  style={{
                    ...styles.input,
                    minHeight: 85,
                    resize: "vertical",
                  }}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this dish..."
                />
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={form.isVeg}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Vegetarian food
              </label>
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.primaryButton}
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "+ Add Food Item"}
              </button>

              {editingId && (
                <button
                  style={styles.secondaryButton}
                  type="button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* FOOD LIST */}
        <section style={styles.menuSection}>
          <div style={styles.listHeading}>
            <h2 style={styles.sectionTitle}>Your food items</h2>

            <input
              style={styles.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu..."
            />
          </div>

          {loading ? (
            <div style={styles.empty}>Loading menu...</div>
          ) : filteredFoods.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 38 }}>🍛</div>
              <h3>No food items found</h3>
              <p>Add your first food item using the form above.</p>
            </div>
          ) : (
            <div style={styles.foodGrid}>
              {filteredFoods.map((food) => (
                <article key={food._id} style={styles.foodCard}>
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      style={styles.foodImage}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div style={styles.imagePlaceholder}>🍽️</div>
                  )}

                  <div style={styles.foodBody}>
                    <div style={styles.foodTop}>
                      <span
                        style={{
                          ...styles.vegBadge,
                          background: food.isVeg
                            ? "#dcfce7"
                            : "#fff0ed",
                          color: food.isVeg
                            ? "#166534"
                            : "#c62828",
                        }}
                      >
                        {food.isVeg ? "🟢 Veg" : "🔴 Non-veg"}
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,
                          background: food.isAvailable
                            ? "#d1fae5"
                            : "#f1f5f9",
                          color: food.isAvailable
                            ? "#166534"
                            : "#64748b",
                        }}
                      >
                        {food.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <h3 style={styles.foodName}>{food.name}</h3>

                    <p style={styles.category}>{food.category}</p>

                    {food.description && (
                      <p style={styles.description}>
                        {food.description}
                      </p>
                    )}

                    <div style={styles.priceRow}>
                      <strong>₹{food.price}</strong>
                      <small>
                        ⏱️ {food.preparationTime || 20} min
                      </small>
                    </div>

                    <button
                      type="button"
                      style={styles.secondaryButtonFull}
                      onClick={() => handleEdit(food)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      style={styles.secondaryButtonFull}
                      onClick={() => handleAvailability(food)}
                    >
                      {food.isAvailable
                        ? "Mark Unavailable"
                        : "Mark Available"}
                    </button>

                    <button
                      type="button"
                      style={styles.deleteButton}
                      onClick={() => handleDelete(food)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// FOREST GREEN + WHITE THEME
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0fdf4",
    color: "#171717",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
    padding: "18px 5%",
    background: "#ffffff",
    borderBottom: "1px solid #dcfce7",
    boxShadow: "0 3px 12px rgba(22, 101, 52, 0.04)",
  },

  brand: {
    fontSize: 19,
    fontWeight: 800,
    color: "#166534",
  },

  headerSubtitle: {
    display: "block",
    marginTop: 5,
    color: "#166534",
    fontWeight: 800,
    fontSize: 9,
    letterSpacing: 2,
  },

  container: {
    width: "90%",
    maxWidth: 1150,
    margin: "0 auto",
    padding: "30px 0 60px",
  },

  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 25,
  },

  eyebrow: {
    color: "#166534",
    fontWeight: 800,
    letterSpacing: 1.5,
    fontSize: 11,
  },

  title: {
    fontSize: "clamp(27px, 4vw, 36px)",
    margin: "8px 0",
    color: "#171717",
  },

  subtitle: {
    color: "#647067",
    lineHeight: 1.6,
  },

  count: {
    minWidth: 80,
    background: "#ffffff",
    border: "1px solid #dcfce7",
    borderRadius: 15,
    padding: 18,
    fontSize: 25,
    fontWeight: 800,
    textAlign: "center",
    color: "#166534",
    boxShadow: "0 4px 14px rgba(22, 101, 52, 0.04)",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8e3",
    borderRadius: 18,
    padding: "clamp(18px, 3vw, 28px)",
    boxShadow: "0 5px 18px rgba(22, 101, 52, 0.04)",
  },

  sectionTitle: {
    fontSize: 21,
    margin: "0 0 20px",
    color: "#171717",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
    gap: 18,
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontWeight: 700,
    fontSize: 13,
    color: "#253b2b",
  },

  labelFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontWeight: 700,
    fontSize: 13,
    color: "#253b2b",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: 10,
    border: "1px solid #d1e7d8",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#171717",
    background: "#ffffff",
    outlineColor: "#166534",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: 13,
    fontWeight: 700,
    color: "#166534",
  },

  checkbox: {
    accentColor: "#166534",
    width: 16,
    height: 16,
  },

  formActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 24,
  },

  primaryButton: {
    padding: "12px 17px",
    border: "1px solid #166534",
    borderRadius: 10,
    background: "#166534",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 4px 10px rgba(22, 101, 52, 0.12)",
  },

  secondaryButton: {
    padding: "10px 13px",
    border: "1px solid #cfe3d4",
    borderRadius: 10,
    background: "#ffffff",
    color: "#166534",
    cursor: "pointer",
    fontWeight: 700,
  },

  secondaryButtonFull: {
    width: "100%",
    padding: "10px 13px",
    marginTop: 8,
    border: "1px solid #cfe3d4",
    borderRadius: 10,
    background: "#ffffff",
    color: "#166534",
    cursor: "pointer",
    fontWeight: 700,
  },

  deleteButton: {
    padding: "10px 13px",
    width: "100%",
    border: "1px solid #fecaca",
    borderRadius: 10,
    background: "#fff7f7",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: 8,
  },

  menuSection: {
    marginTop: 35,
  },

  listHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 17,
  },

  search: {
    padding: "11px 13px",
    border: "1px solid #d1e7d8",
    borderRadius: 10,
    minWidth: 220,
    maxWidth: "100%",
    boxSizing: "border-box",
    color: "#171717",
    background: "#ffffff",
    outlineColor: "#166534",
  },

  foodGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 245px), 1fr))",
    gap: 18,
  },

  foodCard: {
    background: "#ffffff",
    border: "1px solid #e2e8e3",
    borderRadius: 17,
    overflow: "hidden",
    boxShadow: "0 5px 16px rgba(22, 101, 52, 0.04)",
  },

  foodImage: {
    width: "100%",
    height: 165,
    objectFit: "cover",
    background: "#f0fdf4",
  },

  imagePlaceholder: {
    height: 120,
    display: "grid",
    placeItems: "center",
    background: "#d1fae5",
    fontSize: 38,
  },

  foodBody: {
    padding: 16,
  },

  foodTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },

  vegBadge: {
    padding: "5px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },

  statusBadge: {
    padding: "5px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },

  foodName: {
    margin: "13px 0 5px",
    fontSize: 19,
    color: "#171717",
  },

  category: {
    color: "#166534",
    fontSize: 12,
    fontWeight: 700,
    margin: "5px 0",
  },

  description: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "#647067",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    margin: "15px 0",
    color: "#166534",
  },

  empty: {
    padding: 35,
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e2e8e3",
    borderRadius: 16,
    color: "#647067",
  },

  error: {
    padding: 14,
    marginBottom: 18,
    background: "#fff0ed",
    color: "#bd321b",
    borderRadius: 11,
    border: "1px solid #fecaca",
  },

  success: {
    padding: 14,
    marginBottom: 18,
    background: "#ecfdf5",
    color: "#166534",
    borderRadius: 11,
    border: "1px solid #bbf7d0",
  },
};