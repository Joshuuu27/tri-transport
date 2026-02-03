"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Header from "@/components/police/police-header";
import { LoadingScreen } from "@/components/common/loading-component";
import { useRouter } from "next/navigation";

export default function AddOfficerPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPoliceHead, setIsPoliceHead] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if current user is police head
    fetch("/api/police/current-user")
      .then((res) => res.json())
      .then((data) => {
        if (data.isPoliceHead) {
          setIsPoliceHead(true);
        } else {
          toast.error("Only the police head can add new officers.");
          router.push("/police");
        }
        setIsCheckingRole(false);
      })
      .catch(() => {
        toast.error("Failed to verify permissions.");
        router.push("/police");
        setIsCheckingRole(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/police/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create police officer account");
      }

      toast.success("Police officer account created successfully!");
      
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error creating police officer:", error);
      toast.error(error.message || "Failed to create police officer account");
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingRole) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  if (!isPoliceHead) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700">
              Only the police head can add new police officers.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Add Police Officer</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Create a new police officer account. The officer will be able to log in and access the police dashboard.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter officer's full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="officer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Password must be at least 6 characters long.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Creating Account..." : "Create Police Officer Account"}
              </Button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The new officer will receive an account with police privileges. 
            They can log in using the email and password you provide. Make sure to share 
            these credentials securely.
          </p>
        </div>
      </div>
    </>
  );
}
