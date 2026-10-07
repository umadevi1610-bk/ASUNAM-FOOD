import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { loginAsCustomer } = useAuth();

  // null = first role selection page
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================================
  // ROLE CLICK
  // ======================================
  const handleRoleSelect = (role) => {
    setError("");

    if (role === "customer") {
      setSelectedRole("customer");
      return;
    }

    setSelectedRole(role);
  };

  // ======================================
  // INPUT CHANGE
  // ======================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  // ======================================
  // CUSTOMER LOGIN
  // ======================================
  const handleCustomerLogin = async (e) => {
    e.preventDefault();

    setError("");

    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginAsCustomer({
        name: cleanName,
        phone: cleanPhone,
      });

      if (data.success) {
        window.location.href = "/";
      } else {
        setError(
          data.message ||
            "Unable to continue. Please try again."
        );
      }
    } catch (err) {
      console.error("Customer login error:", err);

      setError(
        err.message ||
          "Unable to continue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // LOGO
  // ======================================
  const Logo = () => (
    <div style={styles.logo}>
      <div style={styles.logoMark}>A</div>

      <div>
        <h2 style={styles.logoTitle}>ASUNAM</h2>
        <span style={styles.logoSub}>FOOD</span>
      </div>
    </div>
  );

  // ======================================
  // COMING SOON
  // ======================================
  const renderComingSoon = (type) => {
    const isDelivery = type === "delivery";

    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <Logo />

          <div style={styles.comingSoonBox}>
            <div style={styles.comingSoonIcon}>
              {isDelivery ? "🛵" : "🏪"}
            </div>

            <span style={styles.eyebrow}>
              PARTNER PORTAL
            </span>

            <h1 style={styles.comingSoonTitle}>
              {isDelivery
                ? "Delivery Partner"
                : "Restaurant Partner"}
            </h1>

            <div style={styles.comingSoonBadge}>
              COMING SOON
            </div>

            <p style={styles.comingSoonText}>
              {isDelivery
                ? "We're getting the ASUNAM FOOD delivery partner experience ready. Partner registration will open soon."
                : "Restaurant partner onboarding is coming soon. Soon you'll be able to list your restaurant, manage your menu and receive customer orders."}
            </p>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                setSelectedRole(null);
                setError("");
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ======================================
  // CUSTOMER LOGIN PAGE
  // ======================================
  if (selectedRole === "customer") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <Logo />

          <button
            type="button"
            style={styles.backLink}
            onClick={() => {
              setSelectedRole(null);
              setError("");
            }}
          >
            ← Choose account type
          </button>

          <div style={styles.heading}>
            <span style={styles.eyebrow}>
              CUSTOMER LOGIN
            </span>

            <h1 style={styles.title}>
              Welcome to ASUNAM FOOD
            </h1>

            <p style={styles.subtitle}>
              Enter your name and phone number to
              continue.
            </p>
          </div>

          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleCustomerLogin}>
            <div style={styles.field}>
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div style={styles.field}>
              <label>Phone Number</label>

              <div style={styles.phoneInput}>
                <span style={styles.countryCode}>
                  +91
                </span>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div style={styles.infoBox}>
              <span>🔐</span>

              <p>
                Phone OTP verification will be added
                later. For now, you can continue with
                your name and phone number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Continuing..."
                : "Continue as Customer →"}
            </button>
          </form>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // ======================================
  // DELIVERY PARTNER
  // ======================================
  if (selectedRole === "delivery") {
    return renderComingSoon("delivery");
  }

  // ======================================
  // RESTAURANT PARTNER
  // ======================================
  if (selectedRole === "restaurant") {
    return renderComingSoon("restaurant");
  }

  // ======================================
  // FIRST PAGE — ROLE SELECTION
  // ======================================
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Logo />

        <div style={styles.heading}>
          <span style={styles.eyebrow}>
            WELCOME TO ASUNAM FOOD
          </span>

          <h1 style={styles.title}>
            How do you want to continue?
          </h1>

          <p style={styles.subtitle}>
            Choose your account type to continue.
          </p>
        </div>

        <div style={styles.roleList}>
          {/* CUSTOMER */}
          <button
            type="button"
            className="role-card"
            style={styles.roleCard}
            onClick={() =>
              handleRoleSelect("customer")
            }
          >
            <div style={styles.roleIcon}>🍔</div>

            <div style={styles.roleContent}>
              <strong>Customer</strong>

              <span>
                Order food and track your delivery
              </span>
            </div>

            <div style={styles.roleArrow}>→</div>
          </button>

          {/* DELIVERY */}
          <button
            type="button"
            className="role-card"
            style={styles.roleCard}
            onClick={() =>
              handleRoleSelect("delivery")
            }
          >
            <div style={styles.roleIcon}>🛵</div>

            <div style={styles.roleContent}>
              <strong>Delivery Partner</strong>

              <span>
                Deliver orders and earn with ASUNAM
              </span>
            </div>

            <div style={styles.roleArrow}>→</div>
          </button>

          {/* RESTAURANT */}
          <button
            type="button"
            className="role-card"
            style={styles.roleCard}
            onClick={() =>
              handleRoleSelect("restaurant")
            }
          >
            <div style={styles.roleIcon}>🏪</div>

            <div style={styles.roleContent}>
              <strong>Restaurant Partner</strong>

              <span>
                Manage your restaurant and orders
              </span>
            </div>

            <div style={styles.roleArrow}>→</div>
          </button>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    background:
      "linear-gradient(135deg, #fff8f5 0%, #fff 50%, #fff1eb 100%)",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "24px",
    padding: "34px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.10)",
    border: "1px solid #f2e6e1",
    boxSizing: "border-box",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "30px",
  },

  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ff5a36",
    color: "#fff",
    fontSize: "21px",
    fontWeight: "800",
  },

  logoTitle: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1,
    color: "#171717",
  },

  logoSub: {
    fontSize: "9px",
    letterSpacing: "3px",
    fontWeight: "700",
    color: "#ff5a36",
  },

  heading: {
    marginBottom: "25px",
  },

  eyebrow: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.8px",
    color: "#ff5a36",
  },

  title: {
    margin: "8px 0 7px",
    fontSize: "28px",
    lineHeight: 1.2,
    color: "#171717",
  },

  subtitle: {
    margin: 0,
    color: "#777",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  roleCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px",
    borderRadius: "15px",
    border: "1px solid #e8dfda",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },

  roleIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    background: "#fff0eb",
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
    gap: "4px",
  },

  roleArrow: {
    color: "#ff5a36",
    fontSize: "19px",
    fontWeight: "700",
  },

  field: {
    marginBottom: "18px",
  },

  phoneInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #e6ddd8",
    borderRadius: "12px",
    paddingLeft: "13px",
    background: "#fff",
  },

  countryCode: {
    fontWeight: "600",
    color: "#555",
    fontSize: "14px",
  },

  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginBottom: "18px",
    padding: "12px 13px",
    borderRadius: "12px",
    background: "#faf7f5",
    border: "1px solid #eee5e0",
  },

  error: {
    marginBottom: "18px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#fff0ed",
    color: "#d83b1f",
    fontSize: "13px",
    fontWeight: "600",
  },

  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "14px",
    padding: "14px",
    background: "#ff5a36",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  backLink: {
    border: "none",
    background: "transparent",
    color: "#777",
    padding: 0,
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "20px",
  },

  backButton: {
    display: "block",
    margin: "20px auto 0",
    border: "none",
    background: "transparent",
    color: "#777",
    cursor: "pointer",
    fontSize: "13px",
  },

  comingSoonBox: {
    textAlign: "center",
    padding: "10px 5px 5px",
  },

  comingSoonIcon: {
    fontSize: "62px",
    marginBottom: "12px",
  },

  comingSoonTitle: {
    margin: "8px 0 14px",
    fontSize: "27px",
    color: "#171717",
  },

  comingSoonBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#fff0eb",
    color: "#ff5a36",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  comingSoonText: {
    maxWidth: "380px",
    margin: "18px auto 22px",
    color: "#777",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  secondaryButton: {
    border: "1px solid #ddd",
    background: "#fff",
    color: "#222",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  form label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #333;
  }

  form input {
    width: 100%;
    padding: 13px 14px;
    border: 1px solid #e6ddd8;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
    background: #fff;
    color: #222;
    transition: 0.2s ease;
    box-sizing: border-box;
  }

  form input:focus {
    border-color: #ff5a36;
    box-shadow: 0 0 0 3px rgba(255,90,54,0.10);
  }

  .phoneInput input {
    border: none;
    padding-left: 2px;
  }

  .phoneInput input:focus {
    box-shadow: none;
  }

  .role-card:hover {
    border-color: #ff5a36;
    transform: translateY(-1px);
  }

  .roleContent strong {
    color: #222;
    font-size: 14px;
  }

  .roleContent span {
    color: #888;
    font-size: 12px;
    line-height: 1.4;
  }

  .infoBox p {
    margin: 0;
    color: #777;
    font-size: 12px;
    line-height: 1.5;
  }

  @media (max-width: 520px) {
    .role-card {
      padding: 13px;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default Login;