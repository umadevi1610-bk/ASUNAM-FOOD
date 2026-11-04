
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyRestaurantProfile,
  updateMyRestaurantProfile,
} from "../../services/restaurantService";

const getFormData = (restaurant) => ({
  name: restaurant.name || "",
  description: restaurant.description || "",
  image: restaurant.image || "",
  phone: restaurant.phone || "",
  email: restaurant.email || "",
  cuisine: Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(", ")
    : restaurant.cuisine || "",
  street: restaurant.address?.street || "",
  city: restaurant.address?.city || "",
  state: restaurant.address?.state || "",
  pincode: restaurant.address?.pincode || "",
  openingTime: restaurant.openingTime || "",
  closingTime: restaurant.closingTime || "",
  deliveryFee: String(restaurant.deliveryFee ?? 0),
  minimumOrderAmount: String(restaurant.minimumOrderAmount ?? 0),
  isOpen: restaurant.isOpen === false ? "false" : "true",
});

const RestaurantProfile = () => {
  const { token, isAuthenticated } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyRestaurantProfile(token);

        if (!data?.restaurant) {
          throw new Error("Restaurant profile not found.");
        }

        if (!cancelled) {
          setRestaurant(data.restaurant);
          setFormData(getFormData(data.restaurant));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Load restaurant profile error:", err);
          setError(
            err.message || "Failed to load restaurant profile."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleCancel = () => {
    setFormData(getFormData(restaurant));
    setEditMode(false);
    setError("");
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Restaurant name is required.");
      return;
    }

    if (
      formData.deliveryFee.trim() === "" ||
      !Number.isFinite(Number(formData.deliveryFee)) ||
      Number(formData.deliveryFee) < 0
    ) {
      setError("Please enter a valid delivery fee.");
      return;
    }

    if (
      formData.minimumOrderAmount.trim() === "" ||
      !Number.isFinite(Number(formData.minimumOrderAmount)) ||
      Number(formData.minimumOrderAmount) < 0
    ) {
      setError("Please enter a valid minimum order amount.");
      return;
    }

    if (
      formData.phone.trim() &&
      !/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())
    ) {
      setError("Please enter a valid restaurant phone number.");
      return;
    }

    if (
      formData.image.trim() &&
      !/^https?:\/\/\S+$/i.test(formData.image.trim())
    ) {
      setError("Please enter a valid restaurant image URL.");
      return;
    }

    try {
      setSaving(true);

      const restaurantData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        cuisine: formData.cuisine
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        deliveryFee: Number(formData.deliveryFee),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        isOpen: formData.isOpen === "true",
      };

      const data = await updateMyRestaurantProfile(
        restaurantData,
        token
      );

      if (!data?.success || !data?.restaurant) {
        throw new Error(
          data?.message || "Could not update restaurant profile."
        );
      }

      setRestaurant(data.restaurant);
      setFormData(getFormData(data.restaurant));
      setEditMode(false);
      setMessage("Restaurant profile updated successfully!");
    } catch (err) {
      console.error("Save restaurant profile error:", err);
      setError(err.message || "Failed to save restaurant details.");
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F0FDF4",
      padding: "35px 20px",
      boxSizing: "border-box",
      color: "#14532D",
    },
    container: {
      maxWidth: "900px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "25px",
    },
    eyebrow: {
      display: "block",
      color: "#15803D",
      fontSize: "11px",
      fontWeight: "800",
      letterSpacing: "2px",
      marginBottom: "7px",
    },
    title: {
      color: "#14532D",
      fontSize: "32px",
      margin: "8px 0",
      overflowWrap: "anywhere",
    },
    subtitle: {
      color: "#64748B",
      fontSize: "14px",
      lineHeight: 1.6,
      margin: 0,
    },
    button: {
      border: "1px solid #BBF7D0",
      borderRadius: "10px",
      background: "#FFFFFF",
      color: "#166534",
      padding: "11px 16px",
      fontWeight: "700",
      cursor: "pointer",
    },
    primaryButton: {
      border: "none",
      borderRadius: "10px",
      background: "#166534",
      color: "#FFFFFF",
      padding: "12px 18px",
      fontWeight: "700",
      cursor: "pointer",
    },
    card: {
      background: "#FFFFFF",
      border: "1px solid #D1FAE5",
      borderRadius: "18px",
      padding: "25px",
      boxShadow: "0 8px 25px rgba(20, 83, 45, 0.06)",
      boxSizing: "border-box",
    },
    top: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
      flexWrap: "wrap",
      paddingBottom: "22px",
      borderBottom: "1px solid #D1FAE5",
      marginBottom: "22px",
    },
    image: {
      width: "100px",
      height: "100px",
      objectFit: "cover",
      borderRadius: "15px",
      background: "#DCFCE7",
    },
    fallback: {
      width: "100px",
      height: "100px",
      borderRadius: "15px",
      background: "#DCFCE7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "38px",
      flexShrink: 0,
    },
    name: {
      margin: "0 0 8px",
      fontSize: "23px",
      color: "#14532D",
      overflowWrap: "anywhere",
    },
    status: {
      display: "inline-block",
      padding: "6px 11px",
      borderRadius: "30px",
      fontSize: "11px",
      fontWeight: "800",
    },
    sectionTitle: {
      fontSize: "18px",
      color: "#14532D",
      margin: "0 0 16px",
    },
    details: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "14px",
    },
    detail: {
      minWidth: 0,
      padding: "14px",
      border: "1px solid #ECFDF5",
      borderRadius: "12px",
      background: "#FAFFFB",
      overflowWrap: "anywhere",
    },
    label: {
      display: "block",
      fontSize: "11px",
      fontWeight: "700",
      color: "#64748B",
      marginBottom: "7px",
    },
    value: {
      fontSize: "14px",
      color: "#14532D",
      fontWeight: "600",
      whiteSpace: "pre-wrap",
      overflowWrap: "anywhere",
      margin: 0,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      minWidth: 0,
      marginBottom: "17px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 13px",
      border: "1px solid #D1FAE5",
      borderRadius: "10px",
      background: "#FFFFFF",
      color: "#14532D",
      fontSize: "14px",
      outline: "none",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "0 16px",
    },
    help: {
      color: "#64748B",
      fontSize: "11px",
      margin: "0 0 16px",
      lineHeight: 1.5,
    },
    error: {
      padding: "12px 14px",
      borderRadius: "10px",
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#B91C1C",
      marginBottom: "18px",
      fontSize: "13px",
    },
    success: {
      padding: "12px 14px",
      borderRadius: "10px",
      background: "#DCFCE7",
      border: "1px solid #86EFAC",
      color: "#166534",
      marginBottom: "18px",
      fontSize: "13px",
      fontWeight: "600",
    },
    actions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "8px",
    },
  };

  const renderField = (
    label,
    name,
    options = {}
  ) => (
    <div style={styles.field} key={name}>
      <label htmlFor={name} style={styles.label}>
        {label}
      </label>
      <input
        id={name}
        style={styles.input}
        name={name}
        type={options.type || "text"}
        value={formData[name]}
        onChange={handleChange}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        required={options.required || false}
        min={options.min}
        step={options.step}
        maxLength={options.maxLength}
      />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            Please log in with your restaurant partner account.
            <p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                Go to Login
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>Loading restaurant details...</div>
        </div>
      </main>
    );
  }

  if (!restaurant || !formData) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Unable to load restaurant profile</h2>
            <p>{error || "Restaurant details are unavailable."}</p>
            <button
              type="button"
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const cuisine = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.filter(Boolean).join(", ")
    : restaurant.cuisine || "";

  const address = [
    restaurant.address?.street,
    restaurant.address?.city,
    restaurant.address?.state,
    restaurant.address?.pincode,
  ]
    .filter((part) => part && String(part).trim())
    .join(", ");

  const detailRows = [
    { label: "Description", value: restaurant.description },
    { label: "Phone Number", value: restaurant.phone },
    { label: "Email", value: restaurant.email },
    { label: "Cuisine", value: cuisine },
    { label: "Restaurant Address", value: address },
    { label: "Opening Time", value: restaurant.openingTime },
    { label: "Closing Time", value: restaurant.closingTime },
    {
      label: "Delivery Fee",
      value: `₹${restaurant.deliveryFee ?? 0}`,
    },
    {
      label: "Minimum Order Amount",
      value: `₹${restaurant.minimumOrderAmount ?? 0}`,
    },
  ].filter(
    (item) =>
      item.value !== undefined &&
      item.value !== null &&
      String(item.value).trim() !== ""
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <span style={styles.eyebrow}>ASUNAM FOOD · PARTNER</span>
            <h1 style={styles.title}>
              {editMode ? "Edit Restaurant Profile" : "Restaurant Profile"}
            </h1>
            <p style={styles.subtitle}>
              {editMode
                ? "Update your registered restaurant details."
                : "Your registered restaurant details."}
            </p>
          </div>

          <button
            type="button"
            style={styles.button}
            onClick={() => {
              window.location.href = "/restaurant/dashboard";
            }}
          >
            ← Dashboard
          </button>
        </header>

        {message && <div style={styles.success}>✅ {message}</div>}
        {error && <div style={styles.error}>⚠️ {error}</div>}

        <section style={styles.card}>
          <div style={styles.top}>
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name || "Restaurant"}
                style={styles.image}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div style={styles.fallback}>🍽️</div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={styles.name}>
                {restaurant.name || "Restaurant"}
              </h2>
              <span
                style={{
                  ...styles.status,
                  background: restaurant.isOpen ? "#DCFCE7" : "#F1F5F9",
                  color: restaurant.isOpen ? "#166534" : "#475569",
                }}
              >
                {restaurant.isOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>

          {!editMode ? (
            <>
              <h3 style={styles.sectionTitle}>Registered Details</h3>

              <div style={styles.details}>
                {detailRows.map((item) => (
                  <div key={item.label} style={styles.detail}>
                    <span style={styles.label}>{item.label}</span>
                    <p style={styles.value}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => {
                    setFormData(getFormData(restaurant));
                    setError("");
                    setMessage("");
                    setEditMode(true);
                  }}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave}>
              <h3 style={styles.sectionTitle}>Edit Restaurant Details</h3>

              <div style={styles.grid}>
                {renderField("Restaurant Name", "name", {
                  required: true,
                })}
                {renderField("Phone Number", "phone", {
                  type: "tel",
                  maxLength: 20,
                })}
                {renderField("Email Address", "email", {
                  type: "email",
                })}
                {renderField("Restaurant Image URL", "image", {
                  type: "url",
                })}
              </div>

              {renderField("Description", "description", {
                placeholder: "Describe your restaurant",
                maxLength: 500,
              })}

              {renderField("Cuisine", "cuisine", {
                placeholder: "Example: Indian, South Indian",
              })}
              <p style={styles.help}>
                Separate multiple cuisine types with commas.
              </p>

              <h3 style={styles.sectionTitle}>Restaurant Address</h3>

              {renderField("Street / Area", "street", {
                placeholder: "Street, area, building",
              })}

              <div style={styles.grid}>
                {renderField("City", "city")}
                {renderField("State", "state")}
                {renderField("Pincode", "pincode", {
                  maxLength: 6,
                })}
              </div>

              <h3 style={styles.sectionTitle}>Business Settings</h3>

              <div style={styles.grid}>
                {renderField("Opening Time", "openingTime", {
                  type: "time",
                })}
                {renderField("Closing Time", "closingTime", {
                  type: "time",
                })}
                {renderField("Delivery Fee (₹)", "deliveryFee", {
                  type: "number",
                  min: "0",
                  step: "1",
                  required: true,
                })}
                {renderField("Minimum Order Amount (₹)", "minimumOrderAmount", {
                  type: "number",
                  min: "0",
                  step: "1",
                  required: true,
                })}
              </div>

              <div style={styles.field}>
                <label htmlFor="isOpen" style={styles.label}>
                  Restaurant Availability
                </label>
                <select
                  id="isOpen"
                  name="isOpen"
                  value={formData.isOpen}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="true">Open for orders</option>
                  <option value="false">Closed for orders</option>
                </select>
              </div>

              <div style={styles.actions}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.primaryButton,
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "✓ Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  style={styles.button}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default RestaurantProfile;
