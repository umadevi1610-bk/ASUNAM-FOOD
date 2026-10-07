import { createContext, useContext, useEffect, useState } from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // LOAD CART
  // ===============================
  const loadCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);

      const data = await getCart(token);

      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Load cart error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOAD CART WHEN LOGIN
  // ===============================
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, token]);

  // ===============================
  // ADD TO CART
  // ===============================
  const addItem = async (foodId, quantity = 1) => {
    if (!token) {
      throw new Error("Please login to add items to cart");
    }

    const data = await addToCart(foodId, quantity, token);

    if (data.success) {
      setCart(data.cart);
    }

    return data;
  };

  // ===============================
  // UPDATE CART ITEM
  // ===============================
  const updateItem = async (foodId, quantity) => {
    if (!token) {
      throw new Error("Please login first");
    }

    const data = await updateCartItem(foodId, quantity, token);

    if (data.success) {
      setCart(data.cart);
    }

    return data;
  };

  // ===============================
  // REMOVE FROM CART
  // ===============================
  const removeItem = async (foodId) => {
    if (!token) {
      throw new Error("Please login first");
    }

    const data = await removeFromCart(foodId, token);

    if (data.success) {
      setCart(data.cart);
    }

    return data;
  };

  // ===============================
  // CLEAR CART
  // ===============================
  const clearAll = async () => {
    if (!token) {
      throw new Error("Please login first");
    }

    const data = await clearCart(token);

    if (data.success) {
      setCart(data.cart);
    }

    return data;
  };

  // ===============================
  // CART ITEM COUNT
  // ===============================
  const itemCount =
    cart?.items?.reduce(
      (total, item) => total + item.quantity,
      0
    ) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        loadCart,
        addItem,
        updateItem,
        removeItem,
        clearAll,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ===============================
// CUSTOM HOOK
// ===============================
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};