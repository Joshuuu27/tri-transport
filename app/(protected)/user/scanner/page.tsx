"use client";

import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import Header from "@/components/commuter/trip-history-header";
import { Card, CardContent } from "@/components/ui/card";

export default function QrScannerPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleScan = async (result: any | null) => {
    if (!result || result.length === 0) return;

    const raw = result[0].rawValue;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed.id) {
        setError("QR code missing driver ID");
        return;
      }

      // Redirect to result page
      router.push(`/user/scanner/result?driverId=${parsed.id}`);
    } catch (err) {
      setError("Invalid QR code format.");
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold">Scan Driver QR Code</h2>
            <div className="w-full max-w-md mx-auto">
              <Scanner
                onScan={handleScan}
                components={{
                  onOff: true,
                  torch: true,
                  zoom: true,
                  finder: true,
                }}
              />

              {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
