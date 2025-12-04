"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Store } from "lucide-react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/common/Toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldSet } from "@/components/ui/field";
import { createSession } from "@/actions/auth-actions";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      showToast({
        type: "error",
        message: "Please fill in all fields.",
        actionLabel: "Dismiss",
      });
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      showToast({
        type: "error",
        message: "Passwords do not match.",
        actionLabel: "Dismiss",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      showToast({
        type: "error",
        message: "Password must be at least 6 characters.",
        actionLabel: "Dismiss",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create user with Firebase
      const credential = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      const user = credential.user;
      const idToken = await user.getIdToken();

      // Update user profile with name and role in Firestore
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email,
            name,
            role,
          }),
        });
      } catch (error) {
        console.error("Error saving user profile:", error);
        // Continue anyway - session creation is more important
      }

      // Call the login API to create session
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid: user.uid,
          idToken,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("Failed to create session");
      }

      // Create session cookie
      await createSession(user.uid);

      showToast({
        type: "success",
        message: "User successfully registered.",
        actionLabel: "Dismiss",
      });

      router.refresh();
    } catch (error: any) {
      const message =
        error?.code === "auth/email-already-in-use"
          ? "Email already in use. Please try another."
          : error?.code === "auth/weak-password"
          ? "Password is too weak. Please use a stronger password."
          : error?.code === "auth/invalid-email"
          ? "Invalid email address."
          : error?.message || "Registration failed. Please try again.";

      showToast({
        type: "error",
        message,
        actionLabel: "Dismiss",
      });

      console.error("Registration error:", error);
      setIsLoading(false);
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
              className="flex flex-col gap-6"
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
                <RadioGroupItem value="franchising" id="r3" />
                <Label htmlFor="r3">Franchising</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="admin" id="r4" />
                <Label htmlFor="r3">Admin</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="police" id="r5" />
                <Label htmlFor="r3">Police</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="cttmo" id="r6" />
                <Label htmlFor="r3">CTTMO</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="operator" id="r7" />
                <Label htmlFor="r3">Operator</Label>
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
            onChange={(e) => setConfirmPassword(e.target.value)}
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
