// src/components/common/data-table/DataTableToolbar.tsx
"use client";

import * as React from "react";

interface DataTableToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({ children, className = "" }: DataTableToolbarProps) {
  return <div className={`flex flex-wrap items-center justify-between p-2 ${className}`}>{children}</div>;
}
