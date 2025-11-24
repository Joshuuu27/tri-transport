"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Store } from "lucide-react";
import authService from "@/lib/services/AuthService";
import { showToast } from "@/components/common/Toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldSet } from "@/components/ui/field";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("default");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await authService.register({
        name,
        email,
        password,
        role,
      });

      if (res?.success && res?.success === true) {
        // localStorage.setItem("token", res.token); // or set cookie
        window.location.href = "/login";
        showToast({
          type: "success",
          message: "User successfully registered.",
          actionLabel: "Dismiss",
        });
        return;
      } else {
        showToast({
          type: "error",
          message: res?.error || "Registration failed. Please try again.",
          actionLabel: "Dismiss",
        });
      }
    } catch (error) {
      // Axios error with server response
      const message =
        error.response?.data?.error || // your backend sends { error: "..." }
        error.response?.data?.message || // fallback if backend sends { message: "..." }
        error.message || // generic Axios error
        "Registration failed";

      // Show toast
      showToast({
        type: "error",
        message,
        actionLabel: "Dismiss",
      });

      console.error("Registration error:", error);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* Full Name Field */}
      <div className="space-y-2">
        <FieldSet>
          <Label
            htmlFor="companyName"
            className="text-sm font-medium text-card-foreground"
          >
            User Role
          </Label>
          <div className="relative">
            <RadioGroup
              defaultValue="default"
              className="flex gap-6"
              value={role}
              onValueChange={setRole}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="user" id="r1" />
                <Label htmlFor="r1">Default</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="driver" id="r2" />
                <Label htmlFor="r2">Driver</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="admin" id="r3" />
                <Label htmlFor="r3">Admin</Label>
              </div>
            </RadioGroup>
          </div>
        </FieldSet>
      </div>
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="fullName"
          className="text-sm font-medium text-card-foreground"
        >
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="fullName"
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="pl-10 bg-white border-border focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-card-foreground"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 border-border focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-card-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-10 pr-10 border-border focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-card-foreground"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="pl-10 pr-10 border-border focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <input
          id="terms"
          type="checkbox"
          className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-2 focus:ring-ring mt-0.5"
          required
        />
        <Label
          htmlFor="terms"
          className="text-sm text-muted-foreground leading-relaxed"
        >
          I agree to the{" "}
          <a
            href="/terms"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Privacy Policy
          </a>
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-colors"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
