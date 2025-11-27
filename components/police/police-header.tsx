"use client";

import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import authService from "@/lib/services/AuthService";
import { handleLogout } from "@/lib/auth/logout";
import { APP_NAME } from "@/constant";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "SOS", href: "/driver/trip-history" },
    { label: "Complaints", href: "/driver/commuter" },
    { label: "Profile", href: "/driver/profile" },
    { label: "Settings", href: "/driver/settings" },
  ];

  return (
    <header className="border-b border-border bg-card top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                F
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{APP_NAME}</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-muted"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {/* Logout Button */}
            <Button
              variant="destructive"
              className="ml-2 flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground hover:bg-muted"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 flex flex-col gap-2 pb-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground hover:bg-muted"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
                       {/* Mobile Logout */}
            <Button
              variant="destructive"
              className="w-full justify-start mt-2 flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
