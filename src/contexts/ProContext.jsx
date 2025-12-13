// src/contexts/ProContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserKey } from "../utils/userKey.js";
import { apiClient } from "../utils/apiClient.js";

const ProContext = createContext({
  isPro: false,
  loading: true,
  refreshProStatus: () => {},
});

export function ProProvider({ children }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkBillingStatus = async () => {
    try {
      const userKey = getUserKey();
      const data = await apiClient(`/api/billing/status?userKey=${encodeURIComponent(userKey)}`);
      setIsPro(data.isPro || false);
    } catch (err) {
      console.error("Error checking billing status:", err);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  // Check billing status on app load
  useEffect(() => {
    checkBillingStatus();
  }, []);

  const refreshProStatus = () => {
    setLoading(true);
    checkBillingStatus();
  };

  return (
    <ProContext.Provider value={{ isPro, loading, refreshProStatus }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error("usePro must be used within a ProProvider");
  }
  return context;
}

