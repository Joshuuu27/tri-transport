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

export default function AddComplaintModal({ open, onClose, driverId }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const submit = async () => {
    setLoading(true);
    await fetch("/api/reports", {
      method: "POST",
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
      message: "Complaint sent.",
      actionLabel: "Dismiss",
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Complaint</DialogTitle>
        </DialogHeader>

        <Textarea
          className="mt-4"
          placeholder="Describe your complaint..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          className="mt-4 w-full"
          variant="destructive"
          onClick={submit}
          disabled={loading}
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
