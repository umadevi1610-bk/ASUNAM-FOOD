
import { useState } from "react";
import { useAuth } from "../context/AuthContext";



const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 50%, #DCFCE7 100%)",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    boxSizing: "border-box",
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 12px 40px rgba(22, 101, 52, 0.10)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
  },

  logoMark: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "#166534",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },

  logoName: {
    margin: 0,
    color: "#14532D",
    fontSize: "21px",
    fontWeight: "800",
  },

  logoSub: {
    color: "#166534",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "3px",
  },

  eyebrow: {
    display: "block",
    color: "#166534",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  title: {
    color: "#14532D",
    fontSize: "28px",
    lineHeight: 1.25,
    margin: "0 0 12px",
  },

  subtitle: {
    color: "#64748B",
    fontSize: "14px",
    lineHeight: 1.7,
    margin: "0 0 24px",
  },

  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },

  roleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "14px",
    color: "#14532D",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
  },

  roleIcon: {
    width: "44px",
    height: "44px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#DCFCE7",
    borderRadius: "12px",
    fontSize: "23px",
  },

  roleText: {
    flex: 1,
    lineHeight: 1.7,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },

  label: {
    color: "#14532D",
    fontSize: "13px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "10px",
    color: "#14532D",
    fontSize: "14px",
    outlineColor: "#166534",
  },

  primaryButton: {
    width: "100%",
    padding: "14px 16px",
    background: "#166534",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  secondaryButton: {
    width: "100%",
    marginTop: "16px",
    padding: "12px",
    background: "transparent",
    color: "#166534",
    border: "1px solid #D1FAE5",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  link: {
    color: "#166534",
  },

  info: {
    padding: "12px",
    marginBottom: "18px",
    background: "#F0FDF4",
    border: "1px solid #D1FAE5",
    borderRadius: "10px",
    color: "#166534",
    fontSize: "12px",
    lineHeight: 1.7,
  },

  error: {
    padding: "12px",
    marginBottom: "16px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "10px",
    color: "#B91C1C",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  successMessage: {
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #BBF7D0",
  },

  errorMessage: {
    background: "#FEF2F2",
    color: "#B91C1C",
    border: "1px solid #FECACA",
  },
};


const roleDetails = {
  customer: {
    label: "CUSTOMER ACCOUNT",
    title: "Create your account",
    subtitle: "Sign up to order your favourite food and track deliveries.",
    button: "Create Customer Account",
    info: "You can add and manage your delivery address after signup.",
  },
  restaurant: {
    label: "RESTAURANT PARTNER",
    title: "Join ASUNAM FOOD",
    subtitle: "Create your owner account to start setting up your restaurant.",
    button: "Continue to Restaurant Setup",
    info: "After account creation, you will enter your restaurant name, address, cuisine and opening hours.",
  },
  delivery: {
    label: "DELIVERY PARTNER",
    title: "Join our delivery team",
    subtitle: "Create your account to continue to delivery partner setup.",
    button: "Continue to Delivery Setup",
    info: "After account creation, you will enter your address, vehicle and availability details.",
  },
};

function Signup() {
  const {
    registerAsCustomer,
    registerAsRestaurant,
    registerAsDelivery,
  } = useAuth();

  const initialRole = new URLSearchParams(
    window.location.search
  ).get("role");

  const validRoles = ["customer", "restaurant", "delivery"];

  const [role, setRole] = useState(
    validRoles.includes(initialRole) ? initialRole : ""
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateRole = (nextRole) => {
    setRole(nextRole);
    setError("");

    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

    window.history.replaceState(
      {},
      "",
      `/signup?role=${nextRole}`
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;

    if (name.length < 2 || name.length > 50) {
      setError("Name must contain 2 to 50 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!role) {
      setError("Please choose an account type.");
      return;
    }

    const registrationData = {
      name,
      email,
      phone,
      password,
    };

    try {
      setLoading(true);

      let data;

      if (role === "customer") {
        data = await registerAsCustomer(registrationData);
      } else if (role === "restaurant") {
        data = await registerAsRestaurant(registrationData);
      } else {
        data = await registerAsDelivery(registrationData);
      }

      if (!data?.success) {
        setError(data?.message || "Registration failed. Please try again.");
        return;
      }

      if (role === "customer") {
        window.location.href = "/";
      } else if (role === "restaurant") {
        window.location.href = "/restaurant/onboarding";
      } else {
        window.location.href = "/delivery/onboarding";
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>A</div>

          <div>
            <h2 style={styles.logoName}>ASUNAM</h2>
            <span style={styles.logoSub}>FOOD</span>
          </div>
        </div>

        {!role ? (
          <>
            <span style={styles.eyebrow}>CREATE AN ACCOUNT</span>

            <h1 style={styles.title}>Join ASUNAM FOOD</h1>

            <p style={styles.subtitle}>
              Choose your account type to get started.
            </p>

            <div style={styles.roleList}>
              <button
                type="button"
                style={styles.roleButton}
                onClick={() => updateRole("customer")}
              >
                <span style={styles.roleIcon}>🍔</span>
                <span style={styles.roleText}>
                  <strong>Customer</strong>
                  <br />
                  <small>Order food and track delivery</small>
                </span>
                <strong>→</strong>
              </button>

              <button
                type="button"
                style={styles.roleButton}
                onClick={() => updateRole("restaurant")}
              >
                <span style={styles.roleIcon}>🏪</span>
                <span style={styles.roleText}>
                  <strong>Restaurant Partner</strong>
                  <br />
                  <small>Set up your restaurant and menu</small>
                </span>
                <strong>→</strong>
              </button>

              <button
                type="button"
                style={styles.roleButton}
                onClick={() => updateRole("delivery")}
              >
                <span style={styles.roleIcon}>🛵</span>
                <span style={styles.roleText}>
                  <strong>Delivery Partner</strong>
                  <br />
                  <small>Set up your delivery profile</small>
                </span>
                <strong>→</strong>
              </button>
            </div>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Already have an account? Sign In
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                color: "#777",
                cursor: "pointer",
                padding: "0",
                marginBottom: "20px",
                fontSize: "13px",
              }}
              onClick={() => {
                setRole("");
                setError("");
                window.history.replaceState({}, "", "/signup");
              }}
            >
              ← Change account type
            </button>

            <span style={styles.eyebrow}>
              {roleDetails[role].label}
            </span>

            <h1 style={styles.title}>
              {roleDetails[role].title}
            </h1>

            <p style={styles.subtitle}>
              {roleDetails[role].subtitle}
            </p>

            {error && (
              <div style={styles.error}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>

                <input
                  style={styles.input}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={50}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>

                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>

                <input
                  style={styles.input}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password</label>

                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>

                <input
                  style={styles.input}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div style={styles.info}>
                🔒 {roleDetails[role].info}
              </div>

              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "wait" : "pointer",
                }}
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : `${roleDetails[role].button} →`}
              </button>
            </form>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                window.location.href = `/login?role=${role}`;
              }}
            >
              Already have an account? Sign In
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default Signup;
