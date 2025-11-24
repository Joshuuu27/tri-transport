"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/40">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Access Denied
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            You do not have permission to view this page.
          </p>

          <Link href="/">
            <Button className="w-full">Go Back Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
