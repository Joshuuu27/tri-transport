"use client";

import { Clock, Shield, Star, Menu, X, PhilippinePeso } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./context/AuthContext";
import { handleLogout } from "@/lib/auth/logout";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, role } = useAuthContext();

  console.log("Home user:", user);

  return (
    <main className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">T</span>
              </div>
              <span className="font-bold text-lg">Tri-Fare</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm hover:text-primary transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm hover:text-primary transition"
              >
                How it works
              </a>
              {user ? (
                  // ✔ User Logged In → Show Sign Out button
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleLogout} // or your global logout function
                  >
                    Sign out
                  </Button>
                ) : (
                  // ❌ User not logged in → Show Sign In + Get Started
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push("/login")}
                    >
                      Sign in
                    </Button>
                    
                  </>
                )}
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  router.push("/login");
                }}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <a
                href="#features"
                className="block py-2 text-sm hover:text-primary"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block py-2 text-sm hover:text-primary"
              >
                How it works
              </a>

              <div className="flex gap-2 mt-4">
                {user ? (
                  // ✔ User Logged In → Show Sign Out button
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleLogout} // or your global logout function
                  >
                    Sign out
                  </Button>
                ) : (
                  // ❌ User not logged in → Show Sign In + Get Started
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push("/login")}
                    >
                      Sign in
                    </Button>

                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => router.push("/register")}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
                Your reliable ride,{" "}
                <span className="text-primary">anytime, anywhere</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Fast, safe, and affordable tricycle rides at your fingertips.
                Get anywhere in your city with trusted drivers and transparent
                pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Your Ride
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
              <div className="mt-12 flex gap-8 text-sm">
                <div>
                  <p className="font-bold text-2xl text-primary">50K+</p>
                  <p className="text-muted-foreground">Active Riders</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-primary">4.9★</p>
                  <p className="text-muted-foreground">Average Rating</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-primary">24/7</p>
                  <p className="text-muted-foreground">Availability</p>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative h-96 md:h-[500px]">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl overflow-hidden">
                <img
                  src="../man-using-tricycle-app-on-phone-modern-design.jpg"
                  alt="Tri-Fare app interface"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why choose Tri-Fare?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the best tricycle hailing service with features
              designed for your comfort and safety.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Quick Pickup</h3>
              <p className="text-sm text-muted-foreground">
                Average pickup time of just 2 minutes. Get moving fast.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <PhilippinePeso className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Fair Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Fare price is based on distance and time. No surge pricing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Your Safety</h3>
              <p className="text-sm text-muted-foreground">
                Verified drivers and real-time tracking for peace of mind.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Star className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Rated Drivers</h3>
              <p className="text-sm text-muted-foreground">
                Ride with our best-rated, most experienced drivers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting a ride is simple. Just three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Open the App</h3>
              <p className="text-muted-foreground">
                Launch Tri-Fare and enter your pickup location. It is faster
                than a phone call.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Confirm Your Ride</h3>
              <p className="text-muted-foreground">
                See your drivers details, vehicle info, and ETA before you book.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Enjoy Your Ride</h3>
              <p className="text-muted-foreground">
                Sit back, relax, and track your journey in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to ride?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of commuters who trust Tri-Fare for safe, affordable,
            and reliable transportation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Download Tri-Fare Now
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    T
                  </span>
                </div>
                <span className="font-bold">Tri-Fare</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted tricycle hailing service.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Safety
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Tri-Fare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
