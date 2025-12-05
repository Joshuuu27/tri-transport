"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Edit, Users, ArrowLeft, Trash2, MoreHorizontal, RotateCcw, History } from "lucide-react";
import { toast } from "react-toastify";
import Header from "@/components/franchising/franchising-header";
import { LoadingScreen } from "@/components/common/loading-component";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import EditVehicleModal from "./edit-vehicle-modal";
import AssignDriverModal from "./assign-driver-modal";
import AddVehicleModal from "./add-vehicle-modal";
import RenewFranchiseModal from "./renew-franchise-modal";
import RenewalHistoryModal from "./renewal-history-modal";

interface Operator {
  id: string;
  name: string;
  email: string;
  franchiseNumber?: string;
  role: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  bodyNumber?: string;
  vehicleType?: string;
  color?: string;
  franchiseNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  operatorId: string;
  createdAt?: any;
  dateAdded?: any;
  franchiseExpirationDate?: any;
  renewalHistory?: any[];
}

export default function OperatorDetailsPage() {
  const params = useParams();
  const operatorId = params.id as string;

  const [operator, setOperator] = useState<Operator | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (operatorId) {
      loadOperator();
      loadVehicles();
    }
  }, [operatorId]);

  const loadOperator = async () => {
    try {
      const res = await fetch(`/api/operators/${operatorId}`);
      if (!res.ok) throw new Error("Failed to fetch operator");
      const data = await res.json();
      setOperator(data);
    } catch (error) {
      console.error("Error loading operator:", error);
      toast.error("Failed to load operator details");
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch(`/api/operators/${operatorId}/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      toast.error("Failed to load vehicles");
    }
  };

  const vehicleColumns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">{row.getValue("plateNumber")}</span>
      ),
    },
    {
      accessorKey: "bodyNumber",
      header: "Body Number",
      cell: ({ row }) => (
        <span>{String(row.getValue("bodyNumber")) || "N/A"}</span>
      ),
    },
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
      cell: ({ row }) => (
        <span className="capitalize">{String(row.getValue("vehicleType")) || "N/A"}</span>
      ),
    },
    {
      accessorKey: "franchiseNumber",
      header: "Franchise Number",
      cell: ({ row }) => {
        const franchiseNumber = row.getValue("franchiseNumber");
        return franchiseNumber ? (
          <span className="font-semibold text-purple-600">{String(franchiseNumber)}</span>
        ) : (
          <span className="text-gray-400 text-sm">Not Set</span>
        );
      },
    },
    {
      accessorKey: "assignedDriverName",
      header: "Assigned Driver",
      cell: ({ row }) => {
        const driverName = row.getValue("assignedDriverName");
        return driverName ? (
          <span className="font-semibold text-green-600">{String(driverName)}</span>
        ) : (
          <span className="text-gray-400 text-sm">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "dateAdded",
      header: "Date Added",
      enableHiding: false,
      cell: ({ row }) => {
        const dateString = row.getValue("dateAdded");
        if (!dateString) return "N/A";
        try {
          const dateObj = new Date(String(dateString));
          if (isNaN(dateObj.getTime())) return "N/A";
          return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch {
          return "N/A";
        }
      },
    },
    {
      accessorKey: "franchiseExpirationDate",
      header: "Franchise Expiration",
      enableHiding: false,
      cell: ({ row }) => {
        const dateString = row.getValue("franchiseExpirationDate");
        if (!dateString) return "Not Set";
        try {
          const dateObj = new Date(String(dateString));
          if (isNaN(dateObj.getTime())) return "Not Set";
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dateObj.setHours(0, 0, 0, 0);
          const isExpired = dateObj < today;
          return (
            <span className={isExpired ? "text-red-600 font-semibold" : "text-green-600"}>
              {dateObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {isExpired && <span className="text-red-600"> (Expired)</span>}
            </span>
          );
        } catch {
          return "Not Set";
        }
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const vehicle = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Vehicle Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsAssignDriverOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Assign Driver
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsRenewOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Renew Franchise
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsHistoryOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                View History
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => {
                  if (!confirm("Delete this vehicle?")) return;
                  try {
                    const res = await fetch(`/api/vehicles/${vehicle.id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) throw new Error("Failed to delete");
                    toast.success("Vehicle deleted successfully");
                    loadVehicles();
                  } catch (error) {
                    console.error("Delete error:", error);
                    toast.error("Failed to delete vehicle");
                  }
                }}
                className="text-red-600 focus:text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  if (!operator) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-red-600 text-lg">Operator not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Back Button */}
        <Link href="/franchising/operators">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Operators
          </Button>
        </Link>

        {/* Operator Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Operator Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold">{operator.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold">{operator.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold capitalize">{operator.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vehicles ({vehicles.length})</CardTitle>
            <Button
              onClick={() => setIsAddVehicleOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </CardHeader>
          <CardContent>
            {vehicles.length > 0 ? (
              <DataTable
                data={vehicles}
                columns={vehicleColumns}
                showOrderNumbers={false}
                showColumnFilter={true}
                showColumnToggle={true}
                emptyMessage="No vehicles found"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No vehicles assigned to this operator yet.</p>
                <Button
                  onClick={() => setIsAddVehicleOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Vehicle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Vehicle Modal */}
        {selectedVehicle && (
          <EditVehicleModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            onSuccess={() => {
              setIsEditOpen(false);
              setSelectedVehicle(null);
              loadVehicles();
            }}
          />
        )}

        {/* Assign Driver Modal */}
        {selectedVehicle && (
          <AssignDriverModal
            isOpen={isAssignDriverOpen}
            onClose={() => {
              setIsAssignDriverOpen(false);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            operatorId={operatorId}
            onSuccess={() => {
              setIsAssignDriverOpen(false);
              setSelectedVehicle(null);
              loadVehicles();
            }}
          />
        )}

        {/* Add Vehicle Modal */}
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          operatorId={operatorId}
          onSuccess={() => {
            setIsAddVehicleOpen(false);
            loadVehicles();
          }}
        />

        {/* Renew Franchise Modal */}
        {selectedVehicle && (
          <RenewFranchiseModal
            isOpen={isRenewOpen}
            onClose={() => {
              setIsRenewOpen(false);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            onSuccess={() => {
              setIsRenewOpen(false);
              setSelectedVehicle(null);
              loadVehicles();
            }}
          />
        )}

        {/* Renewal History Modal */}
        {selectedVehicle && (
          <RenewalHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => {
              setIsHistoryOpen(false);
              setSelectedVehicle(null);
            }}
            vehiclePlateNumber={selectedVehicle.plateNumber}
            renewalHistory={selectedVehicle.renewalHistory || []}
          />
        )}
      </div>
    </>
  );
}
