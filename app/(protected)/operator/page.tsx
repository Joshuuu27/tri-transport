"use client";

import { useAuthContext } from "@/app/context/AuthContext";

import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/operator/operator-header";

const OperatorPage = () => {
  const { user, role } = useAuthContext();

  return (
    <>
      <Header />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              {/* user info example */}
              {user && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Logged in as <strong>{user.email}</strong>
                  </p>
                  <p>Role: {role}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default OperatorPage;
