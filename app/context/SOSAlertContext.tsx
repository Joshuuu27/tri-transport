"use client";

import React, { useState, useContext, createContext, ReactNode } from "react";

// Define the context type
interface SOSAlertContextType {
  hasNewAlert: boolean;
  setHasNewAlert: (value: boolean) => void;
}

// Create SOSAlertContext
const SOSAlertContext = createContext<SOSAlertContextType | undefined>(undefined);

// Custom hook to use the SOSAlertContext
export const useSOSAlertContext = (): SOSAlertContextType => {
  const context = useContext(SOSAlertContext);
  if (!context) {
    throw new Error("useSOSAlertContext must be used within a SOSAlertContextProvider");
  }
  return context;
};

// Props type for provider
interface SOSAlertContextProviderProps {
  children: ReactNode;
}

// SOSAlertContextProvider component
export const SOSAlertContextProvider: React.FC<SOSAlertContextProviderProps> = ({ children }) => {
  const [hasNewAlert, setHasNewAlert] = useState(false);

  return (
    <SOSAlertContext.Provider value={{ hasNewAlert, setHasNewAlert }}>
      {children}
    </SOSAlertContext.Provider>
  );
};
