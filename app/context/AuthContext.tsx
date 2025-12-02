"use client";

import React, { useState, useEffect, useContext, createContext, ReactNode } from "react";
import { onAuthStateChanged, getAuth, User, IdTokenResult } from "firebase/auth";
import {app} from "@/lib/firebase.browser";
import { LoadingScreen } from "@/components/common/loading-component";

// Initialize Firebase Auth
const auth = getAuth(app);

// Define the context type
interface AuthContextType {
  user: User | null;
  role:
    | "user"
    | "driver"
    | "admin"
    | "franchising"
    | "police"
    | "cttmo"
    | null;
}

// Create AuthContext with proper type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContextProvider");
  }
  return context;
};

// Props type for provider
interface AuthContextProviderProps {
  children: ReactNode;
}

// AuthContextProvider component
export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<
    "user" | "driver" | "admin" | "franchising" | "police" | "cttmo" | null
  >(null);

  // Listen for changes in the user's sign-in state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const tokenResult: IdTokenResult =
          await currentUser.getIdTokenResult(true);

        const userRole = tokenResult.claims
          .role as
          | "admin"
          | "driver"
          | "user"
          | "franchising"
          | "police"
          | "cttmo"
          | undefined;
        console.log("User role from token claims:", userRole);
        setRole(userRole ?? "user");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {loading ? (
        <div className="flex flex-col items-center py-10 font-bold text-5xl">
          <LoadingScreen />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
