// src/contexts/ProContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
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
      // apiClient automatically includes 'x-user-key' header for all requests
      // Do NOT send 'x-attempt-id' on billing/status (only STT uses it)
      const data = await apiClient(`/api/billing/status`);
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

