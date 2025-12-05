import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, Shield } from "lucide-react";

interface DashboardIntroProps {
  displayName?: string;
  email?: string;
  role?: string;
  subtitle: string;
  features?: Array<{ icon: any; title: string; description: string }>;
}

export function DashboardIntro({
  displayName,
  email,
  role,
  subtitle,
  features,
}: DashboardIntroProps) {
  const defaultFeatures = [
    {
      icon: MapPin,
      title: "Easy Management",
      description: "Streamlined dashboard for all your operations",
    },
    {
      icon: Heart,
      title: "Real-time Updates",
      description: "Stay informed with live notifications and alerts",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data",
    },
  ];

  const displayFeatures = features || defaultFeatures;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
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

          {/* Subtitle */}
          <p className="text-lg md:text-xl opacity-90 font-medium">{subtitle}</p>

          {/* Personalized greeting */}
          {email && (
            <div className="space-y-1 pt-4 border-t border-white border-opacity-30">
              <p className="text-base md:text-lg font-medium">
                Hello, <span className="font-bold">{displayName || email.split("@")[0]}</span>!
              </p>
              <p className="text-sm md:text-base opacity-90">
                You're all set to continue your work
              </p>
            </div>
          )}

          {/* Quick features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {displayFeatures.slice(0, 3).map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm">{feature.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {displayFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Info Card */}
      {email && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Your Account</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-xs uppercase font-semibold">Email</p>
                <p className="text-gray-800 font-medium mt-1">{email}</p>
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
  );
}
