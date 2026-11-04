import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
} from "../services/profileService";

const Profile = () => {
  const { token, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================
  // LOAD PROFILE
  // ======================================
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getProfile(token);

        if (!data?.user) {
          throw new Error("Profile not found");
        }

        const user = data.user;

        setProfile(user);

        setFormData({
          name: user.name || "",
          phone: user.phone || "",
          profileImage: user.profileImage || "",
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          pincode: user.address?.pincode || "",
        });
      } catch (err) {
        console.error("Load profile error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, token]);

  // ======================================
  // HANDLE INPUT
  // ======================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================
  // UPDATE PROFILE
  // ======================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const profileData = {
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      };

      const data = await updateProfile(profileData, token);

      if (!data?.user) {
        throw new Error("Profile update failed.");
      }

      setProfile(data.user);

      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        profileImage: data.user.profileImage || "",
        street: data.user.address?.street || "",
        city: data.user.address?.city || "",
        state: data.user.address?.state || "",
        pincode: data.user.address?.pincode || "",
      });

      setMessage("Profile updated successfully ✅");
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // LOGIN CHECK
  // ======================================
  if (!isAuthenticated) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>🔐</div>

          <h2>Please login first</h2>

          <p style={styles.messageText}>
            Login to view and edit your profile.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ======================================
  // LOADING
  // ======================================
  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>👤</div>
          <h2>Loading profile...</h2>
          <p style={styles.messageText}>
            Please wait daa ❤️
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // ERROR
  // ======================================
  if (error && !profile) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.bigIcon}>😕</div>

          <h2>Unable to load profile</h2>

          <p style={styles.messageText}>{error}</p>

          <button
            style={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const firstLetter =
    formData.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>ASUNAM FOOD</span>
            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>
              Manage your personal details and delivery address.
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Home
          </button>
        </div>

        {/* SUCCESS / ERROR */}
        {message && (
          <div style={styles.successBox}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.grid}>
          {/* PROFILE CARD */}
          <section style={styles.profileCard}>
            <div style={styles.avatarWrap}>
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  style={styles.avatar}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div style={styles.avatarFallback}>
                  {firstLetter}
                </div>
              )}
            </div>

            <h2 style={styles.profileName}>
              {profile?.name || "User"}
            </h2>

            <p style={styles.profileEmail}>
              {profile?.email || ""}
            </p>

            <span style={styles.roleBadge}>
              {profile?.role || "customer"}
            </span>

            <div style={styles.profileInfo}>
              <div style={styles.infoRow}>
                <span>📧 Email</span>
                <strong>{profile?.email || "-"}</strong>
              </div>

              <div style={styles.infoRow}>
                <span>📱 Phone</span>
                <strong>{profile?.phone || "Not added"}</strong>
              </div>

              <div style={styles.infoRow}>
                <span>🟢 Account</span>
                <strong>
                  {profile?.isActive ? "Active" : "Inactive"}
                </strong>
              </div>
            </div>
          </section>

          {/* EDIT FORM */}
          <section style={styles.formCard}>
            <div style={styles.sectionHeader}>
              <div>
                <span style={styles.eyebrow}>PERSONAL DETAILS</span>
                <h2 style={styles.sectionTitle}>
                  Edit Profile
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* NAME */}
              <div style={styles.field}>
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              {/* EMAIL - READ ONLY */}
              <div style={styles.field}>
                <label>Email</label>

                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                />

                <small style={styles.helpText}>
                  Email cannot be changed here.
                </small>
              </div>

              {/* PHONE */}
              <div style={styles.field}>
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              {/* PROFILE IMAGE */}
              <div style={styles.field}>
                <label>Profile Image URL</label>

                <input
                  type="url"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              {/* ADDRESS */}
              <div style={styles.addressHeading}>
                <span>📍</span>

                <div>
                  <h3>Delivery Address</h3>
                  <p>
                    This address can be used during checkout.
                  </p>
                </div>
              </div>

              <div style={styles.field}>
                <label>Street / Address</label>

                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="House no, street, area"
                />
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.field}>
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div style={styles.field}>
                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label>Pincode</label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.saveButton,
                  opacity: saving ? 0.7 : 1,
                }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0fdf4",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  eyebrow: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.8px",
    color: "#166534",
    marginBottom: "6px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    color: "#222",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#777",
  },

  backButton: {
    border: "1px solid #d1fae5",
    background: "#fff",
    color: "#166534",
    padding: "11px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "300px minmax(0, 1fr)",
    gap: "24px",
    alignItems: "start",
  },

  profileCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "28px 22px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "20px",
  },

  avatarWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
  },

  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #dcfce7",
  },

  avatarFallback: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "38px",
    fontWeight: "800",
    border: "4px solid #bbf7d0",
  },

  profileName: {
    margin: "0",
    fontSize: "22px",
    color: "#14532d",
  },

  profileEmail: {
    margin: "6px 0 12px",
    color: "#888",
    fontSize: "13px",
    wordBreak: "break-word",
  },

  roleBadge: {
    display: "inline-block",
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "capitalize",
  },

  profileInfo: {
    borderTop: "1px solid #eee",
    marginTop: "24px",
    paddingTop: "10px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
    textAlign: "left",
    fontSize: "12px",
  },

  formCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  sectionHeader: {
    marginBottom: "24px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#222",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "16px",
  },

  fieldLabel: {
    fontWeight: "600",
  },

  helpText: {
    fontSize: "11px",
    color: "#999",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  addressHeading: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    background: "#f0fdf4",
    borderRadius: "12px",
    margin: "10px 0 18px",
  },

  addressHeadingH3: {
    margin: 0,
  },

  addressHeadingP: {
    margin: "3px 0 0",
    color: "#888",
    fontSize: "12px",
  },

  saveButton: {
    width: "100%",
    border: "none",
    background: "#166534",
    color: "#fff",
    padding: "14px",
    borderRadius: "11px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "8px",
  },

  successBox: {
    background: "#edf9f1",
    border: "1px solid #c7ecd3",
    color: "#20733d",
    padding: "13px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
  },

  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffd0d0",
    color: "#bd2c2c",
    padding: "13px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
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
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
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
    background: "#166534",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "10px",
  },
};

export default Profile;