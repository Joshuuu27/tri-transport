"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  onClick: () => void;
  isLoading?: boolean;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  icon: Icon,
  onClick,
  isLoading = false,
  description,
}) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border-gray-200"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? "..." : count}
            </p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className="ml-4 p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
