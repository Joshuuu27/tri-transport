"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/franchising/franchising-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import OperatorVehiclesTable from "./operator-vehicles-table.tsx";

interface Operator {
  id: string;
  name: string;
  email: string;
  role: string;
  franchiseNumber?: string;
  createdAt?: any;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType?: string;
  franchiseNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  operatorId: string;
  createdAt?: any;
}

export default function OperatorVehiclesPage() {
  const params = useParams();
  const operatorId = params.id as string;
  
  const [operator, setOperator] = useState<Operator | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  useEffect(() => {
    if (!operatorId) return;
    loadOperator();
    loadVehicles();
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
      setVehiclesLoading(true);
      const res = await fetch(`/api/operators/${operatorId}/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setVehiclesLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-4 space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </main>
      </>
    );
  }

  if (!operator) {
    return (
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-4 space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Operator not found</p>
            <Link href="/franchising/operators">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Operators
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/franchising/operators">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold">{operator.name}</h1>
            <p className="text-gray-600 mt-1">{operator.email}</p>
          </div>
        </div>

        {/* Operator Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Operator Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{operator.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{operator.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Franchise Number</p>
                <p className="font-semibold">
                  {operator.franchiseNumber || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold capitalize">{operator.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vehicles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : vehicles.length > 0 ? (
              <OperatorVehiclesTable 
                vehicles={vehicles} 
                operatorId={operatorId} 
                onVehiclesUpdated={loadVehicles} 
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No vehicles assigned to this operator yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
