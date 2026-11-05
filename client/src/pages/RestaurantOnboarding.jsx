import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiRequest from "../services/api";
const initialForm = {
  name: "",
  description: "",
  phone: "",
  cuisine: "",
  street: "",
  city: "",
  state: "Tamil Nadu",
  pincode: "",
  openingTime: "09:00",
  closingTime: "22:00",
  deliveryFee: "30",
  minimumOrderAmount: "100",
};

export default function RestaurantOnboarding() {
  const { token } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdRestaurant, setCreatedRestaurant] = useState(null);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Please sign in to your Restaurant Partner account.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.cuisine.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.pincode.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    if (
      Number(form.deliveryFee) < 0 ||
      Number(form.minimumOrderAmount) < 0
    ) {
      setError("Delivery fee and minimum order cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/restaurants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          phone: form.phone.trim(),
          cuisine: form.cuisine.trim(),
          address: {
            street: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          deliveryFee: Number(form.deliveryFee),
          minimumOrderAmount: Number(form.minimumOrderAmount),
        }),
      });

      if (data.success === false) {
        throw new Error(
          data.message || "Unable to create your restaurant."
        );
      }

      const restaurant =
        data.restaurant || data.data?.restaurant || data.data || null;

      setCreatedRestaurant(restaurant || {});
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #dedee7",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#222238",
    fontSize: "14px",
    outlineColor: "#f97316",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "7px",
    color: "#38384c",
  };

  const Field = ({ label, name, type = "text", required = false }) => (
    <div>
      <label htmlFor={name} style={labelStyle}>
        {label}{required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        required={required}
        style={fieldStyle}
      />
    </div>
  );

  if (createdRestaurant) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.logo}>AF</div>

          <div style={{ fontSize: 42, marginBottom: 10 }}>🎉</div>

          <h1 style={styles.title}>Restaurant profile submitted!</h1>

          <p style={styles.subtitle}>
            Great start! Your restaurant details have been saved.
          </p>

          {createdRestaurant._id && (
            <div style={styles.idBox}>
              <span style={{ color: "#66667a", fontSize: 13 }}>
                Your Restaurant ID
              </span>
              <strong style={{ display: "block", marginTop: 8 }}>
                {createdRestaurant._id}
              </strong>
            </div>
          )}

          <button
            style={styles.button}
            onClick={() => {
              window.location.href = "/restaurant/dashboard";
            }}
          >
            Continue to Dashboard →
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logo}>AF</div>

        <p style={styles.eyebrow}>ASUNAM FOOD · PARTNER SETUP</p>

        <h1 style={styles.title}>Set up your restaurant</h1>

        <p style={styles.subtitle}>
          Add your restaurant details so customers can discover your food.
        </p>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={styles.sectionTitle}>Restaurant details</h3>

          <div style={styles.grid}>
            <div style={styles.full}>
              <Field
                label="Restaurant name"
                name="name"
                required
              />
            </div>

            <div style={styles.full}>
              <label htmlFor="description" style={labelStyle}>
                Short description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Tell customers about your restaurant..."
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>

            <Field
              label="Restaurant contact number"
              name="phone"
              type="tel"
              required
            />

            <Field
              label="Cuisine type"
              name="cuisine"
              required
            />
          </div>

          <h3 style={styles.sectionTitle}>Restaurant address</h3>

          <div style={styles.grid}>
            <div style={styles.full}>
              <Field
                label="Street / Door number"
                name="street"
                required
              />
            </div>

            <Field label="City / Town" name="city" required />

            <Field label="State" name="state" required />

            <Field label="Pincode" name="pincode" required />
          </div>

          <h3 style={styles.sectionTitle}>Business settings</h3>

          <div style={styles.grid}>
            <Field
              label="Opening time"
              name="openingTime"
              type="time"
              required
            />

            <Field
              label="Closing time"
              name="closingTime"
              type="time"
              required
            />

            <Field
              label="Delivery fee (₹)"
              name="deliveryFee"
              type="number"
              required
            />

            <Field
              label="Minimum order amount (₹)"
              name="minimumOrderAmount"
              type="number"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Saving restaurant..." : "Save Restaurant Details →"}
          </button>

          <p style={styles.note}>
            * Required fields. Your restaurant record will receive a unique
            database ID when it is created.
          </p>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fff7ed, #f7f7ff 55%, #eff6ff)",
    padding: "32px 16px",
    boxSizing: "border-box",
    fontFamily: "Inter, system-ui, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    boxSizing: "border-box",
    margin: "0 auto",
    padding: "clamp(20px, 5vw, 42px)",
    borderRadius: 22,
    background: "#ffffff",
    border: "1px solid #eeeaf3",
    boxShadow: "0 18px 55px rgba(35, 25, 70, 0.08)",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    background: "#f97316",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 18,
    marginBottom: 22,
  },
  eyebrow: {
    color: "#ea580c",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.6,
  },
  title: {
    color: "#202034",
    fontSize: "clamp(25px, 4vw, 34px)",
    lineHeight: 1.2,
    margin: "10px 0",
  },
  subtitle: {
    color: "#717184",
    lineHeight: 1.7,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#292940",
    margin: "28px 0 16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
    gap: 16,
  },
  full: {
    gridColumn: "1 / -1",
  },
  button: {
    width: "100%",
    marginTop: 26,
    padding: "14px 18px",
    background: "#f97316",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
  },
  error: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 10,
    background: "#fff1f2",
    color: "#be123c",
    fontSize: 14,
  },
  note: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#818196",
    textAlign: "center",
    marginTop: 14,
  },
  idBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: 16,
    borderRadius: 12,
    margin: "22px 0",
    overflowWrap: "anywhere",
  },
};