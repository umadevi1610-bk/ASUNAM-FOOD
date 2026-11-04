
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  registerUser,
  registerRestaurantUser,
  registerDeliveryUser,
  loginUser,
  customerLogin,
  restaurantLogin,
  deliveryLogin,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("asunam_food_token")
  );

  const [loading, setLoading] = useState(true);

  // ======================================
  // LOAD CURRENT USER
  // ======================================
  useEffect(() => {
    let isActive = true;

    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await getCurrentUser(token);

        if (!isActive) return;

        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("asunam_food_token");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Load current user error:",
          error.message
        );

        if (!isActive) return;

        localStorage.removeItem("asunam_food_token");
        setToken(null);
        setUser(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isActive = false;
    };
  }, [token]);

  // ======================================
  // SAVE LOGIN / REGISTRATION SESSION
  // ======================================
  const saveSession = (data) => {
    if (data?.success && data.token && data.user) {
      localStorage.setItem(
        "asunam_food_token",
        data.token
      );

      setUser(data.user);
      setToken(data.token);
    }

    return data;
  };

  // ======================================
  // NORMAL EMAIL + PASSWORD LOGIN
  // ======================================
  const login = async (loginData) => {
    const data = await loginUser(loginData);
    return saveSession(data);
  };

  // ======================================
  // CUSTOMER LOGIN
  // TEMPORARY NAME + PHONE LOGIN
  // ======================================
  const loginAsCustomer = async (customerData) => {
    const data = await customerLogin(customerData);
    return saveSession(data);
  };

  // ======================================
  // CUSTOMER SIGN UP
  // ======================================
  const registerAsCustomer = async (customerData) => {
    const data = await registerUser(customerData);
    return saveSession(data);
  };

  // ======================================
  // RESTAURANT PARTNER LOGIN
  // ======================================
  const loginAsRestaurant = async (restaurantData) => {
    const data = await restaurantLogin(restaurantData);
    return saveSession(data);
  };

  // ======================================
  // RESTAURANT PARTNER SIGN UP
  // ======================================
  const registerAsRestaurant = async (restaurantData) => {
    const data = await registerRestaurantUser(restaurantData);
    return saveSession(data);
  };

  // ======================================
  // DELIVERY PARTNER LOGIN
  // ======================================
  const loginAsDelivery = async (deliveryData) => {
    const data = await deliveryLogin(deliveryData);
    return saveSession(data);
  };

  // ======================================
  // DELIVERY PARTNER SIGN UP
  // ======================================
  const registerAsDelivery = async (deliveryData) => {
    const data = await registerDeliveryUser(deliveryData);
    return saveSession(data);
  };

  // ======================================
  // LEGACY REGISTER FUNCTION
  // ======================================
  const register = registerAsCustomer;

  // ======================================
  // LOGOUT
  // ======================================
  const logout = () => {
    localStorage.removeItem("asunam_food_token");
    setToken(null);
    setUser(null);
  };

  // ======================================
  // AUTH STATUS
  // ======================================
  const isAuthenticated = !!token && !!user;

  // ======================================
  // PROVIDER
  // ======================================
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,

        login,
        loginAsCustomer,
        registerAsCustomer,

        loginAsRestaurant,
        registerAsRestaurant,

        loginAsDelivery,
        registerAsDelivery,

        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ======================================
// USE AUTH
// ======================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
