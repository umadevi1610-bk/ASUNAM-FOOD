
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyDeliveryProfile,
  saveMyDeliveryProfile,
  getMyDeliveries,
} from "../services/deliveryService";

const GREEN = "#166534";
const DARK_GREEN = "#14532D";
const PALE_GREEN = "#F0FDF4";
const LIGHT_GREEN = "#DCFCE7";
const BORDER_GREEN = "#BBF7D0";
const MUTED = "#64748B";

const emptyForm = {
  drivingLicenseNumber: "",
  vehicleType: "bike",
  vehicleModel: "",
  vehicleRegistrationNumber: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  startTime: "09:00",
  endTime: "18:00",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: PALE_GREEN,
    padding: "32px 20px 50px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    color: DARK_GREEN,
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "25px",
  },
  eyebrow: {
    color: GREEN,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.8px",
  },
  title: {
    fontSize: "clamp(26px, 4vw, 34px)",
    margin: "9px 0",
    color: DARK_GREEN,
  },
  subtitle: {
    color: MUTED,
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
  },
  button: {
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "10px",
    background: "#FFFFFF",
    color: DARK_GREEN,
    padding: "11px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  card: {
    background: "#FFFFFF",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "22px",
    boxShadow: "0 7px 24px rgba(22,101,52,0.05)",
    boxSizing: "border-box",
    minWidth: 0,
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "19px",
    color: DARK_GREEN,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },
  summaryItem: {
    padding: "15px",
    background: "#FAFFFB",
    border: "1px solid #ECFDF5",
    borderRadius: "12px",
    minWidth: 0,
  },
  label: {
    display: "block",
    color: MUTED,
    fontWeight: 700,
    fontSize: "11px",
    marginBottom: "8px",
  },
  value: {
    margin: 0,
    color: DARK_GREEN,
    fontSize: "14px",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },
  stat: {
    background: "#FFFFFF",
    border: `1px solid ${BORDER_GREEN}`,
    borderRadius: "15px",
    padding: "19px",
  },
  statNumber: {
    color: GREEN,
    fontWeight: 800,
    fontSize: "27px",
    margin: "10px 0 5px",
    overflowWrap: "anywhere",
  },
  statLabel: {
    color: MUTED,
    fontSize: "12px",
    lineHeight: 1.5,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0 16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "17px",
    minWidth: 0,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #D1FAE5",
    borderRadius: "10px",
    padding: "12px 13px",
    fontSize: "14px",
    color: DARK_GREEN,
    background: "#FFFFFF",
    outline: "none",
  },
  primaryButton: {
    border: "none",
    borderRadius: "10px",
    background: GREEN,
    color: "#FFFFFF",
    padding: "13px 18px",
    fontWeight: 800,
    cursor: "pointer",
  },
  message: {
    padding: "13px 15px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  hint: {
    fontSize: "12px",
    lineHeight: 1.6,
    color: MUTED,
    marginTop: 0,
    marginBottom: "18px",
  },
};

function DeliveryProfile() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (authLoading) return;

      if (!isAuthenticated || !token || user?.role !== "delivery") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const [profileResult, deliveriesResult] = await Promise.allSettled([
        getMyDeliveryProfile(token),
        getMyDeliveries(token),
      ]);

      if (cancelled) return;

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value;
        const savedProfile = data.profile || null;

        setProfile(savedProfile);
        setProfileCompleted(Boolean(data.completed || savedProfile));

        if (savedProfile) {
          setForm({
            // The backend intentionally hides the saved licence number.
            // Leave this empty when editing an existing profile.
            drivingLicenseNumber: "",
            vehicleType: savedProfile.vehicleType || "bike",
            vehicleModel: savedProfile.vehicleModel || "",
            vehicleRegistrationNumber:
              savedProfile.vehicleRegistrationNumber || "",
            street: savedProfile.address?.street || "",
            city: savedProfile.address?.city || "",
            state: savedProfile.address?.state || "",
            pincode: savedProfile.address?.pincode || "",
            startTime: savedProfile.availability?.startTime || "09:00",
            endTime: savedProfile.availability?.endTime || "18:00",
          });
        } else {
          setForm(emptyForm);
        }
      } else {
        console.error("Load delivery profile error:", profileResult.reason);
        setError(
          profileResult.reason?.message ||
            "Unable to load your delivery profile."
        );
      }

      if (deliveriesResult.status === "fulfilled") {
        setDeliveries(deliveriesResult.value.deliveries || []);
      } else {
        console.error("Load deliveries error:", deliveriesResult.reason);
        setError((current) =>
          current
            ? `${current} Delivery income could not be loaded.`
            : "Delivery income could not be loaded."
        );
      }

      setLoading(false);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, token, user?.role]);

  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  );

  const totalIncome = completedDeliveries.reduce(
    (sum, delivery) => sum + Number(delivery.deliveryFee || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleEdit = () => {
    setError("");
    setMessage("");
    setEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        drivingLicenseNumber: "",
        vehicleType: profile.vehicleType || "bike",
        vehicleModel: profile.vehicleModel || "",
        vehicleRegistrationNumber: profile.vehicleRegistrationNumber || "",
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        pincode: profile.address?.pincode || "",
        startTime: profile.availability?.startTime || "09:00",
        endTime: profile.availability?.endTime || "18:00",
      });
    } else {
      setForm(emptyForm);
    }

    setEditing(false);
    setError("");
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!profileCompleted && !form.drivingLicenseNumber.trim()) {
      setError("Please enter your driving licence number.");
      return;
    }

    if (!form.vehicleModel.trim() ||
        !form.vehicleRegistrationNumber.trim() ||
        !form.street.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !/^[0-9]{6}$/.test(form.pincode.trim()) ||
        !form.startTime ||
        !form.endTime) {
      setError("Please complete all required fields and enter a valid 6-digit pincode.");
      return;
    }

    if (form.startTime === form.endTime) {
      setError("Availability start and end times cannot be the same.");
      return;
    }

    const payload = {
      vehicleType: form.vehicleType,
      vehicleModel: form.vehicleModel.trim(),
      vehicleRegistrationNumber: form.vehicleRegistrationNumber.trim(),
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      },
      availability: {
        startTime: form.startTime,
        endTime: form.endTime,
      },
    };

    // Send licence number only if supplied.
    if (form.drivingLicenseNumber.trim()) {
      payload.drivingLicenseNumber = form.drivingLicenseNumber.trim();
    }

    try {
      setSaving(true);

      const data = await saveMyDeliveryProfile(payload, token);

      if (!data?.success || !data.profile) {
        throw new Error(
          data?.message || "Unable to save delivery profile."
        );
      }

      setProfile(data.profile);
      setProfileCompleted(true);
      setForm((current) => ({
        ...current,
        drivingLicenseNumber: "",
      }));
      setEditing(false);
      setMessage(
        data.message ||
          "Profile saved. Verification may be required before you become available."
      );
    } catch (err) {
      console.error("Save delivery profile error:", err);
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, name, options = {}) => (
    <div style={styles.field} key={name}>
      <label htmlFor={name} style={styles.label}>
        {label}{options.required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={options.type || "text"}
        value={form[name]}
        onChange={handleChange}
        style={styles.input}
        required={options.required || false}
        maxLength={options.maxLength}
        min={options.min}
        step={options.step}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        autoComplete="off"
      />
    </div>
  );

  if (authLoading || loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>Loading your delivery profile...</div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || user?.role !== "delivery") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Delivery Partner Login Required</h2>
            <p style={styles.subtitle}>
              Please log in with your delivery partner account.
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
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <span style={styles.eyebrow}>ASUNAM FOOD · DELIVERY PARTNER</span>
            <h1 style={styles.title}>My Delivery Profile</h1>
            <p style={styles.subtitle}>
              Manage your account, vehicle and working availability.
            </p>
          </div>

          <button
            type="button"
            style={styles.button}
            onClick={() => {
              window.location.href = "/delivery/dashboard";
            }}
          >
            ← Dashboard
          </button>
        </header>

        {message && (
          <div
            style={{
              ...styles.message,
              background: LIGHT_GREEN,
              border: `1px solid ${BORDER_GREEN}`,
              color: GREEN,
            }}
          >
            ✅ {message}
          </div>
        )}

        {error && (
          <div
            style={{
              ...styles.message,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <section style={styles.stats}>
          <div style={styles.stat}>
            <span>✅</span>
            <div style={styles.statNumber}>
              {completedDeliveries.length}
            </div>
            <div style={styles.statLabel}>Completed deliveries</div>
          </div>

          <div style={styles.stat}>
            <span>💰</span>
            <div style={styles.statNumber}>
              ₹{totalIncome.toLocaleString("en-IN")}
            </div>
            <div style={styles.statLabel}>
              Completed delivery fees total
            </div>
          </div>

          <div style={styles.stat}>
            <span>🛵</span>
            <div style={styles.statNumber}>
              {profile?.isAvailable ? "Available" : "Not available"}
            </div>
            <div style={styles.statLabel}>Partner availability</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Account Details</h2>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={styles.label}>Full name</span>
              <p style={styles.value}>{user?.name || "Not provided"}</p>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.label}>Email address</span>
              <p style={styles.value}>{user?.email || "Not provided"}</p>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.label}>Phone number</span>
              <p style={styles.value}>{user?.phone || "Not provided"}</p>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.label}>Verification status</span>
              <p style={styles.value}>
                {profile?.verificationStatus
                  ? profile.verificationStatus.toUpperCase()
                  : "PROFILE NOT SUBMITTED"}
              </p>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.label}>Identity verification</span>
              <p style={styles.value}>
                {profile?.identityVerificationStatus
                  ? profile.identityVerificationStatus.toUpperCase()
                  : "NOT SUBMITTED"}
              </p>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          {!editing ? (
            <>
              <div style={styles.header}>
                <div>
                  <h2 style={styles.sectionTitle}>Vehicle & Work Details</h2>
                  <p style={styles.subtitle}>
                    {profileCompleted
                      ? "Your saved delivery partner details."
                      : "Complete your profile to submit your delivery partner details."}
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={handleEdit}
                >
                  ✏️ {profileCompleted ? "Edit Profile" : "Complete Profile"}
                </button>
              </div>

              {profile ? (
                <div style={styles.summaryGrid}>
                  {[
                    ["Vehicle type", profile.vehicleType],
                    ["Vehicle model", profile.vehicleModel],
                    ["Registration number", profile.vehicleRegistrationNumber],
                    [
                      "Driving licence",
                      "Saved securely · Number hidden",
                    ],
                    [
                      "Address",
                      [
                        profile.address?.street,
                        profile.address?.city,
                        profile.address?.state,
                        profile.address?.pincode,
                      ].filter(Boolean).join(", "),
                    ],
                    [
                      "Working hours",
                      `${profile.availability?.startTime || "—"} – ${
                        profile.availability?.endTime || "—"
                      }`,
                    ],
                  ].map(([label, value]) => (
                    <div style={styles.summaryItem} key={label}>
                      <span style={styles.label}>{label}</span>
                      <p style={styles.value}>{value || "Not provided"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.subtitle}>
                  Your delivery profile has not been completed yet. Select
                  “Complete Profile” to enter your vehicle and address details.
                </p>
              )}
            </>
          ) : (
            <>
              <h2 style={styles.sectionTitle}>
                {profileCompleted ? "Edit Profile" : "Complete Your Profile"}
              </h2>

              <p style={styles.hint}>
                Fields marked * are required. The saved driving licence
                number is hidden by the server. For an existing profile,
                leave it blank to keep the saved value; enter it only if
                you need to supply or replace it.
              </p>

              <form onSubmit={handleSave}>
                <div style={styles.formGrid}>
                  {renderField(
                    "Driving licence number",
                    "drivingLicenseNumber",
                    {
                      required: !profileCompleted,
                      maxLength: 30,
                      placeholder: profileCompleted
                        ? "Leave blank to keep saved licence"
                        : "Enter licence number",
                    }
                  )}

                  <div style={styles.field}>
                    <label style={styles.label} htmlFor="vehicleType">
                      Vehicle type *
                    </label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={form.vehicleType}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {renderField("Vehicle model", "vehicleModel", {
                    required: true,
                    maxLength: 100,
                  })}

                  {renderField(
                    "Vehicle registration number",
                    "vehicleRegistrationNumber",
                    { required: true, maxLength: 20 }
                  )}

                  {renderField("Street / Area", "street", {
                    required: true,
                  })}

                  {renderField("City", "city", { required: true })}

                  {renderField("State", "state", { required: true })}

                  {renderField("Pincode", "pincode", {
                    required: true,
                    maxLength: 6,
                    placeholder: "6-digit pincode",
                  })}

                  {renderField("Availability start time", "startTime", {
                    type: "time",
                    required: true,
                  })}

                  {renderField("Availability end time", "endTime", {
                    type: "time",
                    required: true,
                  })}
                </div>

                <p style={styles.hint}>
                  Saving a new profile or changing details sends the profile
                  for verification again. Your availability may remain
                  disabled until the profile is approved.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...styles.primaryButton,
                      opacity: saving ? 0.7 : 1,
                      cursor: saving ? "wait" : "pointer",
                    }}
                  >
                    {saving ? "Saving..." : "✓ Save Profile"}
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
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default DeliveryProfile;
