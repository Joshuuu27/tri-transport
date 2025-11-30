"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

import Header from "@/components/commuter/trip-history-header";
import SOSButton from "@/components/commuter/SOS-button";
import { Card, CardContent } from "@/components/ui/card";

const DriverPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();

  return (
    <>
      <Header />      

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* SOS Alert Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200 p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-red-700">Emergency SOS</h2>
            <p className="text-sm text-red-600 mt-1">
              Click the button below to send an immediate SOS alert to nearby police with your location and details.
            </p>
          </div>
          <SOSButton className="h-12 text-base" />
        </div>

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

export default DriverPage;
