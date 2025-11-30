// ClientLayout.tsx
"use client";

import { AuthContextProvider } from "@/app/context/AuthContext";
import { SOSAlertContextProvider } from "@/app/context/SOSAlertContext";
import { ToastContainer, Slide } from "react-toastify";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContextProvider>
      <SOSAlertContextProvider>
        {children}
        <ToastContainer transition={Slide} />
      </SOSAlertContextProvider>
    </AuthContextProvider>
  );
};
