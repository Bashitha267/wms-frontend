import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const WarehouseContext = createContext(null);

export const WarehouseProvider = ({ children }) => {
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshTotalValue = useCallback(async () => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const res = await axios.get(`${apiBaseUrl}/api/dashboard/stats`);
      if (res.data?.total_supply_cost !== undefined) {
        setTotalValue(res.data.total_supply_cost);
      }
    } catch (err) {
      console.warn("Could not refresh warehouse total value:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <WarehouseContext.Provider
      value={{
        totalValue,
        loading,
        refreshTotalValue,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    return {
      totalValue: 0,
      loading: false,
      refreshTotalValue: async () => {},
    };
  }
  return context;
};

export default WarehouseContext;
