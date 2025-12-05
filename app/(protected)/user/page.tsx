"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/commuter/trip-history-header";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();

  return (
    <>
      <Header />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-12 text-white overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-20 -mb-20"></div>

              <div className="relative z-10 space-y-6">
                {/* Tagalog Greeting */}
                <div className="space-y-2">
                  <p className="text-lg md:text-xl font-light tracking-wider opacity-90">
                    Mabuhay ug Madayaw
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold">
                    Welcome to City of Mati
                  </h1>
                </div>

                {/* Personalized greeting */}
                {user && (
                  <div className="space-y-1 pt-4 border-t border-white border-opacity-30">
                    <p className="text-base md:text-lg font-medium">
                      Hello, <span className="font-bold">{user.displayName || user.email?.split("@")[0] || "Traveler"}</span>!
                    </p>
                    <p className="text-sm md:text-base opacity-90">
                      Your safe and convenient transport journey starts here
                    </p>
                    <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => router.push("/user/commuter")}
                  >
                    Start Your Ride
                </Button>
                  </div>
                )}

                {/* Quick features */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Driver Ratings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Safe & Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Easy Booking</h3>
                <p className="text-sm text-gray-600">
                  Book your ride in seconds with our intuitive and user-friendly interface.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Rate & Review</h3>
                <p className="text-sm text-gray-600">
                  Share your experience and help us maintain excellent service quality.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold">Safety First</h3>
                <p className="text-sm text-gray-600">
                  Your safety is our priority with verified drivers and real-time support.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Info Card */}
          {user && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Your Account</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-xs uppercase font-semibold">Email</p>
                    <p className="text-gray-800 font-medium mt-1">{user.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-xs uppercase font-semibold">Account Type</p>
                    <p className="text-gray-800 font-medium mt-1 capitalize">{role || "User"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default UserDashboard;
