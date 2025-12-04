"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/operator/operator-header";
import { Card, CardContent } from "@/components/ui/card";

const OperatorFranchisePage = () => {
  const { user, role } = useAuthContext();

  return (
    <>
      <Header />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Franchise Management</h2>
              {user && (
                <>
                  <p className="text-sm text-muted-foreground mt-2">
                    Logged in as <strong>{user.email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">Role: {role}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default OperatorFranchisePage;
