"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import Header from "@/components/commuter/trip-history-header";

export default function SettingsPage() {
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Notifications */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </h2>

            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </div>

            <div className="flex items-center justify-between">
              <span>SMS Alerts</span>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Moon className="h-5 w-5 text-primary" /> Appearance
            </h2>

            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5 text-primary" /> Privacy & Security
            </h2>

            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition">
              Manage Blocked Contacts
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition">
              Delete Account
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-5 w-5" /> Logout
        </Button>
      </main>
    </div>
  );
}
