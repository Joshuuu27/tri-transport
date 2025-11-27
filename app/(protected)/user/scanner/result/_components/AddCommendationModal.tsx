"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/app/context/AuthContext";
import { showToast } from "@/components/common/Toast";
export default function AddCommendationModal({ open, onClose, driverId }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const submit = async () => {
    setLoading(true);
    await fetch("/api/commendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverId: driverId,
        userId: user?.uid,
        message: message,
      }),
    });
    setLoading(false);
    setMessage("");

    showToast({
      type: "success",
      message: "Driver commendation has been saved.",
      actionLabel: "Dismiss",
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Commendation</DialogTitle>
        </DialogHeader>

        <Textarea
          className="mt-4"
          placeholder="Write your commendation..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button className="mt-4 w-full" onClick={submit} disabled={loading}>
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
