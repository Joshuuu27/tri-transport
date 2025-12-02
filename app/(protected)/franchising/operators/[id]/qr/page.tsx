// app/drivers/[id]/qr/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/franchising/franchising-header";

export default function DriverQRPage() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    const png = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = png;
    link.download = `${id}-qr.png`;
    link.click();
  };

  useEffect(() => {
    if (!id) return;

    const fetchDriver = async () => {
      const res = await fetch(`/api/drivers?id=${id}`);
      const data = await res.json();
      setDriver(data);      
    };

    fetchDriver();
  }, [id]);

  return (
    <>
    <Header/>
     <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <Card className="w-full max-w-md p-4 mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Driver QR Code</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold">Name: { driver && ( driver.name) }</p>
          <p className="text-sm text-muted-foreground">{ driver && ( driver.id) }</p>

          {/* QR Code */}
          <QRCodeCanvas
            value={JSON.stringify({
              id: id,
            })}
            size={220}
            bgColor="#ffffff"
          />

          <Button className="w-full" onClick={downloadQR}>
            Download QR Code
          </Button>
        </CardContent>
      </Card>
    </main>
    </>
  );
}
