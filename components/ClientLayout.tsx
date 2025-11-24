// ClientLayout.tsx
"use client";

import { AuthContextProvider } from "@/app/context/AuthContext";
import { ToastContainer, Slide } from "react-toastify";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContextProvider>
      {children}
      <ToastContainer transition={Slide} />
    </AuthContextProvider>
  );
};
