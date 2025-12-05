"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw } from "lucide-react";

interface RenewalEntry {
  renewalDate: string;
  expirationDate: string;
  type: "initial_registration" | "renewal";
  remarks: string;
}

interface RenewalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiclePlateNumber: string;
  renewalHistory: RenewalEntry[];
}

export default function RenewalHistoryModal({
  isOpen,
  onClose,
  vehiclePlateNumber,
  renewalHistory,
}: RenewalHistoryModalProps) {
  const sortedHistory = [...(renewalHistory || [])].reverse(); // Show most recent first

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Renewal History - {vehiclePlateNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedHistory && sortedHistory.length > 0 ? (
            sortedHistory.map((entry, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {entry.type === "initial_registration" ? (
                      <>
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          Initial Registration
                        </Badge>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Renewal #{sortedHistory.length - index}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-600">Registered/Renewed:</p>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(entry.renewalDate)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Expires:</p>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(entry.expirationDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Remarks:</p>
                    <p className="text-gray-700 italic">{entry.remarks}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No renewal history available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
