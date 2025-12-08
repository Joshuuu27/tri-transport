// ClientLayout.tsx
"use client";

import { AuthContextProvider } from "@/app/context/AuthContext";
import { SOSAlertContextProvider } from "@/app/context/SOSAlertContext";
import { ToastContainer, Slide } from "react-toastify";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <AuthContextProvider>
        <SOSAlertContextProvider>
          {children}
          <ToastContainer transition={Slide} />
        </SOSAlertContextProvider>
      </AuthContextProvider>
    </NuqsAdapter>
  );
};
