
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px 16px",
    background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 50%, #DCFCE7 100%)",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "490px",
    background: "#FFFFFF",
    borderRadius: "22px",
    padding: "30px",
    border: "1px solid #D1FAE5",
    boxShadow: "0 15px 45px rgba(22,101,52,0.09)",
    boxSizing: "border-box",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    marginBottom: "22px",
  },
  logoMark: {
    width: "43px",
    height: "43px",
    background: "#166534",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    fontSize: "23px",
    fontWeight: 800,
  },
  logoName: {
    margin: 0,
    color: "#14532D",
    fontSize: "20px",
  },
  logoSub: {
    color: "#166534",
    letterSpacing: "3px",
    fontSize: "10px",
    fontWeight: 800,
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px",
    background: "#F0FDF4",
    padding: "5px",
    borderRadius: "12px",
    marginBottom: "25px",
  },
  tab: {
    border: "none",
    padding: "12px",
    borderRadius: "9px",
    background: "transparent",
    color: "#64748B",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  activeTab: {
    background: "#166534",
    color: "#FFFFFF",
    boxShadow: "0 3px 8px rgba(22,101,52,0.15)",
  },
  eyebrow: {
    display: "block",
    color: "#166534",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.8px",
    marginBottom: "9px",
  },
  title: {
    margin: "0 0 9px",
    color: "#14532D",
    fontSize: "27px",
    lineHeight: 1.3,
  },
  subtitle: {
    margin: "0 0 23px",
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },
  roleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px",
    background: "#FFFFFF",
    border: "1px solid #D1FAE5",
    borderRadius: "13px",
    color: "#14532D",
    textAlign: "left",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  roleIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#DCFCE7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  roleContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: 0,
  },
  roleName: {
    fontSize: "14px",
    fontWeight: 800,
  },
  roleDescription: {
    color: "#64748B",
    fontSize: "11px",
    lineHeight: 1.5,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "16px",
  },
  label: {
    color: "#14532D",
    fontSize: "12px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "12px 13px",
    border: "1px solid #D1FAE5",
    borderRadius: "10px",
    outlineColor: "#166534",
    fontSize: "14px",
    background: "#FFFFFF",
    color: "#14532D",
    boxSizing: "border-box",
  },
  info: {
    background: "#F0FDF4",
    border: "1px solid #D1FAE5",
    padding: "12px",
    borderRadius: "10px",
    color: "#166534",
    fontSize: "12px",
    lineHeight: 1.6,
    marginBottom: "17px",
  },
  error: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#B91C1C",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
  primaryButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "11px",
    background: "#166534",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  backButton: {
    display: "block",
    margin: "19px auto 0",
    border: "none",
    background: "transparent",
    color: "#166534",
    fontSize: "13px",
    cursor: "pointer",
  },
};

const roles = [
  {
    id: "customer",
    name: "Customer",
    icon: "🍔",
    description: "Order your favourite food and track deliveries.",
  },
  {
    id: "restaurant",
    name: "Restaurant Partner",
    icon: "🏪",
    description: "Manage your restaurant, menu and customer orders.",
  },
  {
    id: "delivery",
    name: "Delivery Partner",
    icon: "🛵",
    description: "Accept orders and manage your deliveries.",
  },
];

const roleInfo = {
  customer: {
    loginLabel: "CUSTOMER LOGIN",
    signupLabel: "CUSTOMER REGISTRATION",
    loginText: "Enter your name and phone number to continue.",
    signupText: "Create your customer account with your details.",
    signupInfo: "You can save your delivery address after registration.",
  },
  restaurant: {
    loginLabel: "RESTAURANT PARTNER LOGIN",
    signupLabel: "RESTAURANT PARTNER REGISTRATION",
    loginText: "Manage your restaurant and customer orders.",
    signupText: "Create your restaurant partner account.",
    signupInfo: "After registration, you can set up your restaurant details.",
  },
  delivery: {
    loginLabel: "DELIVERY PARTNER LOGIN",
    signupLabel: "DELIVERY PARTNER REGISTRATION",
    loginText: "Login to accept and manage deliveries.",
    signupText: "Create your delivery partner account.",
    signupInfo: "After registration, complete your vehicle and delivery profile.",
  },
};

function Login({ initialView }) {
  const {
    loginAsCustomer,
    loginAsRestaurant,
    loginAsDelivery,
    registerAsCustomer,
    registerAsRestaurant,
    registerAsDelivery,
  } = useAuth();

  const validRoles = ["customer", "restaurant", "delivery"];

  const requestedRole = new URLSearchParams(
    window.location.search
  ).get("role");

  const [activeTab, setActiveTab] = useState(
    initialView ||
      (window.location.pathname === "/signup" ? "signup" : "login")
  );

  const [selectedRole, setSelectedRole] = useState(
    validRoles.includes(requestedRole) ? requestedRole : ""
  );

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSelectedRole("");
    resetForm();

    window.history.replaceState(
      {},
      "",
      tab === "signup" ? "/signup" : "/login"
    );
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    resetForm();

    window.history.replaceState(
      {},
      "",
      `/${activeTab}?role=${role}`
    );
  };

  const changeRole = () => {
    setSelectedRole("");
    resetForm();

    window.history.replaceState(
      {},
      "",
      `/${activeTab}`
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

  // ================================
  // LOGIN
  // ================================
  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please choose your account type.");
      return;
    }

    try {
      setLoading(true);

      let data;

      if (selectedRole === "customer") {
        const name = formData.name.trim();
        const phone = formData.phone.trim();

        if (name.length < 2) {
          setError("Please enter a valid name.");
          return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
          setError("Please enter a valid 10-digit phone number.");
          return;
        }

        data = await loginAsCustomer({ name, phone });
      } else {
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError("Please enter a valid email address.");
          return;
        }

        if (!password) {
          setError("Please enter your password.");
          return;
        }

        const loginFunction =
          selectedRole === "restaurant"
            ? loginAsRestaurant
            : loginAsDelivery;

        data = await loginFunction({ email, password });
      }

      if (!data?.success) {
        setError(data?.message || "Login failed. Please try again.");
        return;
      }

      if (selectedRole === "restaurant") {
        window.location.href = "/restaurant/dashboard";
      } else if (selectedRole === "delivery") {
        window.location.href = "/delivery/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // SIGN UP
  // ================================
  const handleSignup = async (event) => {
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
      setError("Please enter a valid 10-digit phone number.");
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

    if (!selectedRole) {
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

      if (selectedRole === "customer") {
        data = await registerAsCustomer(registrationData);
      } else if (selectedRole === "restaurant") {
        data = await registerAsRestaurant(registrationData);
      } else {
        data = await registerAsDelivery(registrationData);
      }

      if (!data?.success) {
        setError(
          data?.message || "Registration failed. Please try again."
        );
        return;
      }

      if (selectedRole === "restaurant") {
        window.location.href = "/restaurant/onboarding";
      } else if (selectedRole === "delivery") {
        window.location.href = "/delivery/onboarding";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  const currentRole = selectedRole ? roleInfo[selectedRole] : null;

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        {/* LOGO */}
        <div style={styles.logo}>
          <div style={styles.logoMark}>A</div>
          <div>
            <h2 style={styles.logoName}>ASUNAM</h2>
            <span style={styles.logoSub}>FOOD</span>
          </div>
        </div>

        {/* LOGIN / SIGNUP TABS */}
        <div style={styles.tabs}>
          <button
            type="button"
            style={{
              ...styles.tab,
              ...(activeTab === "login" ? styles.activeTab : {}),
            }}
            onClick={() => switchTab("login")}
          >
            Sign In
          </button>

          <button
            type="button"
            style={{
              ...styles.tab,
              ...(activeTab === "signup" ? styles.activeTab : {}),
            }}
            onClick={() => switchTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* ROLE SELECTION */}
        {!selectedRole ? (
          <>
            <span style={styles.eyebrow}>
              {activeTab === "login"
                ? "WELCOME BACK"
                : "CREATE YOUR ACCOUNT"}
            </span>

            <h1 style={styles.title}>
              {activeTab === "login"
                ? "Welcome to ASUNAM FOOD"
                : "Join ASUNAM FOOD"}
            </h1>

            <p style={styles.subtitle}>
              {activeTab === "login"
                ? "Choose your account type to sign in."
                : "Choose your account type to get started."}
            </p>

            <div style={styles.roleList}>
              {roles.map((role) => (
                <button
                  type="button"
                  key={role.id}
                  style={styles.roleButton}
                  onClick={() => selectRole(role.id)}
                >
                  <span style={styles.roleIcon}>{role.icon}</span>

                  <span style={styles.roleContent}>
                    <strong style={styles.roleName}>
                      {role.name}
                    </strong>
                    <span style={styles.roleDescription}>
                      {role.description}
                    </span>
                  </span>

                  <strong style={{ color: "#166534", fontSize: "18px" }}>
                    →
                  </strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              style={{
                ...styles.backButton,
                margin: "0 0 20px",
              }}
              onClick={changeRole}
            >
              ← Change account type
            </button>

            <span style={styles.eyebrow}>
              {activeTab === "login"
                ? currentRole.loginLabel
                : currentRole.signupLabel}
            </span>

            <h1 style={styles.title}>
              {activeTab === "login"
                ? "Welcome back!"
                : "Create your account"}
            </h1>

            <p style={styles.subtitle}>
              {activeTab === "login"
                ? currentRole.loginText
                : currentRole.signupText}
            </p>

            {error && (
              <div style={styles.error}>⚠️ {error}</div>
            )}

            <form
              onSubmit={
                activeTab === "login"
                  ? handleLogin
                  : handleSignup
              }
            >
              {/* CUSTOMER NAME */}
              {(activeTab === "signup" ||
                (activeTab === "login" &&
                  selectedRole === "customer")) && (
                <div style={styles.field}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    type="text"
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
              )}

              {/* EMAIL */}
              {(activeTab === "signup" ||
                selectedRole !== "customer") && (
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
              )}

              {/* PHONE */}
              {(activeTab === "signup" ||
                selectedRole === "customer") && (
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
              )}

              {/* PASSWORD */}
              {(activeTab === "signup" ||
                selectedRole !== "customer") && (
                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete={
                      activeTab === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                    minLength={6}
                    required
                  />
                </div>
              )}

              {/* CONFIRM PASSWORD */}
              {activeTab === "signup" && (
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
              )}

              {activeTab === "signup" ? (
                <div style={styles.info}>
                  🔒 {currentRole.signupInfo}
                </div>
              ) : selectedRole === "customer" ? (
                <div style={styles.info}>
                  🔐 Customer login currently uses name and phone number.
                  Phone OTP verification can be added later.
                </div>
              ) : (
                <div style={styles.info}>
                  🔐 Use your registered partner email and password.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.primaryButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading
                  ? activeTab === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : activeTab === "login"
                  ? "Sign In →"
                  : "Create Account →"}
              </button>
            </form>
          </>
        )}

        <button
          type="button"
          style={styles.backButton}
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Back to Home
        </button>
      </main>
    </div>
  );
}

export default Login;
