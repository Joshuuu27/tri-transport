"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

import { handleLogout } from "@/lib/auth/logout";

const DriverPage = () => {

      const { user, role } = useAuthContext();
      const router = useRouter();

  return (
    <div>
      <p>Driver area.</p>

      {/* user info example */}
      {user && (
        <>
          <p className="text-sm text-muted-foreground">
            Logged in as <strong>{user.email}</strong>
          </p>
          <p>Role: {role}</p>
          <div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverPage;
