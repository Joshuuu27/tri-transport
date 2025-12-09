"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  FileEdit,
  MapPin,
  MoreHorizontal,
  Plus,
  Route,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import tariffData from "@/tariff.json";
import Header from "@/components/franchising/franchising-header";
import { toast } from "react-toastify";
import { getGasPriceRange } from "@/lib/tariff-utils";
import { Fuel } from "lucide-react";
import { db } from "@/lib/firebase.browser";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface FareRate {
  "40.00-49.99": number;
  "50.00-69.99": number;
  "70.00-89.99": number;
  "90.00-99.99": number;
}

interface Route {
  to: string;
  rates: FareRate;
}

interface FareMatrixItem {
  from: string;
  routes: Route[];
}

interface TariffRoute {
  id: string;
  from: string;
  to: string;
  rate_40_50: number;
  rate_50_70: number;
  rate_70_90: number;
  rate_90_100: number;
}

const SETTINGS_DOC_ID = "app_settings";
const GAS_PRICE_FIELD = "currentGasPrice";
const TARIFF_COLLECTION = "tariff";
const TARIFF_DOC_ID = "fare_matrix";

// Helper function to convert flat TariffRoute[] back to fare_matrix structure
function convertToFareMatrix(data: TariffRoute[]): FareMatrixItem[] {
  const matrixMap = new Map<string, FareMatrixItem>();
  
  data.forEach((route) => {
    if (!matrixMap.has(route.from)) {
      matrixMap.set(route.from, {
        from: route.from,
        routes: [],
      });
    }
    
    const matrixItem = matrixMap.get(route.from)!;
    matrixItem.routes.push({
      to: route.to,
      rates: {
        "40.00-49.99": route.rate_40_50,
        "50.00-69.99": route.rate_50_70,
        "70.00-89.99": route.rate_70_90,
        "90.00-99.99": route.rate_90_100,
      },
    });
  });
  
  return Array.from(matrixMap.values());
}

// Helper function to save fare_matrix to Firestore
async function saveTariffToFirestore(fareMatrix: FareMatrixItem[]): Promise<void> {
  try {
    const tariffRef = doc(db, TARIFF_COLLECTION, TARIFF_DOC_ID);
    await setDoc(tariffRef, {
      fare_matrix: fareMatrix,
      note: tariffData.note || "Tariff rates based on gasoline price ranges",
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving tariff to Firestore:", error);
    throw error;
  }
}

// Helper function to load fare_matrix from Firestore
async function loadTariffFromFirestore(): Promise<FareMatrixItem[] | null> {
  try {
    const tariffRef = doc(db, TARIFF_COLLECTION, TARIFF_DOC_ID);
    const tariffSnap = await getDoc(tariffRef);
    
    if (tariffSnap.exists()) {
      const data = tariffSnap.data();
      return data.fare_matrix as FareMatrixItem[];
    }
    return null;
  } catch (error) {
    console.error("Error loading tariff from Firestore:", error);
    return null;
  }
}

export default function TariffsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<TariffRoute[]>([]);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<TariffRoute | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    rate_40_50: 0,
    rate_50_70: 0,
    rate_70_90: 0,
    rate_90_100: 0,
  });
  const [currentGasPrice, setCurrentGasPrice] = React.useState<number | null>(null);
  const [gasPriceDialogOpen, setGasPriceDialogOpen] = React.useState(false);
  const [gasPriceInput, setGasPriceInput] = React.useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [addFormData, setAddFormData] = React.useState({
    from: "",
    to: "",
    rate_40_50: 0,
    rate_50_70: 0,
    rate_70_90: 0,
    rate_90_100: 0,
  });

  React.useEffect(() => {
    // Load current gas price from Firestore
    const loadGasPrice = async () => {
      try {
        const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const gasPrice = settingsSnap.data()[GAS_PRICE_FIELD];
          if (gasPrice !== undefined && gasPrice !== null) {
            const price = typeof gasPrice === "number" ? gasPrice : parseFloat(gasPrice);
            if (!isNaN(price)) {
              setCurrentGasPrice(price);
              setGasPriceInput(price.toString());
            }
          }
        }
      } catch (error) {
        console.error("Error loading gas price:", error);
        // Fallback to localStorage if Firestore fails
        const savedGasPrice = localStorage.getItem("current_gas_price");
        if (savedGasPrice) {
          const price = parseFloat(savedGasPrice);
          if (!isNaN(price)) {
            setCurrentGasPrice(price);
            setGasPriceInput(price.toString());
          }
        }
      }
    };

    loadGasPrice();

    // Load tariff data from Firestore, fallback to JSON
    const loadTariffData = async () => {
      let fareMatrix: FareMatrixItem[] = tariffData.fare_matrix;
      
      // Try to load from Firestore first
      const firestoreData = await loadTariffFromFirestore();
      if (firestoreData && firestoreData.length > 0) {
        fareMatrix = firestoreData;
      }

      // Transform tariff data into flat structure for table
      const transformedData: TariffRoute[] = [];
      fareMatrix.forEach((matrix: FareMatrixItem) => {
        matrix.routes.forEach((route: Route, index: number) => {
          transformedData.push({
            id: `${matrix.from}-${index}`,
            from: matrix.from,
            to: route.to,
            rate_40_50: route.rates["40.00-49.99"],
            rate_50_70: route.rates["50.00-69.99"],
            rate_70_90: route.rates["70.00-89.99"],
            rate_90_100: route.rates["90.00-99.99"],
          });
        });
      });
      setData(transformedData);
    };

    loadTariffData();
  }, []);

  // Get active rate column based on current gas price
  const activeRateColumn = React.useMemo(() => {
    if (!currentGasPrice) return null;
    return getGasPriceRange(currentGasPrice);
  }, [currentGasPrice]);

  const handleSetGasPrice = async () => {
    const price = parseFloat(gasPriceInput);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid gas price");
      return;
    }

    try {
      // Save to Firestore
      const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
      await setDoc(settingsRef, {
        [GAS_PRICE_FIELD]: price,
        updatedAt: serverTimestamp(),
        updatedBy: "admin", // You can get the current user ID here if needed
      }, { merge: true });

      setCurrentGasPrice(price);
      // Also save to localStorage as backup
      localStorage.setItem("current_gas_price", price.toString());
      toast.success(`Gas price set to ₱${price.toFixed(2)} per liter`);
      setGasPriceDialogOpen(false);
    } catch (error) {
      console.error("Error saving gas price:", error);
      toast.error("Failed to save gas price. Please try again.");
    }
  };

  const handleEdit = React.useCallback((route: TariffRoute) => {
    setEditingRoute(route);
    setEditFormData({
      rate_40_50: route.rate_40_50,
      rate_50_70: route.rate_50_70,
      rate_70_90: route.rate_70_90,
      rate_90_100: route.rate_90_100,
    });
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = React.useCallback(async () => {
    if (!editingRoute) {
      toast.error("No route selected for editing");
      return;
    }

    // Validate form data
    if (
      editFormData.rate_40_50 < 0 ||
      editFormData.rate_50_70 < 0 ||
      editFormData.rate_70_90 < 0 ||
      editFormData.rate_90_100 < 0
    ) {
      toast.error("Fare rates cannot be negative");
      return;
    }

    try {
      // Update the data using functional update
      let updatedData: TariffRoute[] = [];
      setData((prevData) => {
        updatedData = prevData.map((item) => {
          if (item.id === editingRoute.id) {
            return {
              ...item,
              rate_40_50: Number(editFormData.rate_40_50),
              rate_50_70: Number(editFormData.rate_50_70),
              rate_70_90: Number(editFormData.rate_70_90),
              rate_90_100: Number(editFormData.rate_90_100),
            };
          }
          return item;
        });
        return updatedData;
      });

      // Convert to fare_matrix structure and save to Firestore
      const fareMatrix = convertToFareMatrix(updatedData);
      await saveTariffToFirestore(fareMatrix);

      toast.success("Tariff route updated successfully");
      setEditDialogOpen(false);
      setEditingRoute(null);
    } catch (error) {
      console.error("Error saving tariff:", error);
      toast.error("Failed to save changes. Please try again.");
    }
  }, [editingRoute, editFormData]);

  const handleDelete = React.useCallback(async (route: TariffRoute) => {
    if (confirm(`Are you sure you want to delete this route from "${route.from}" to "${route.to}"?`)) {
      try {
        let updatedData: TariffRoute[] = [];
        setData((prevData) => {
          updatedData = prevData.filter((item) => item.id !== route.id);
          return updatedData;
        });

        // Convert to fare_matrix structure and save to Firestore
        const fareMatrix = convertToFareMatrix(updatedData);
        await saveTariffToFirestore(fareMatrix);

        toast.success("Tariff route deleted successfully");
      } catch (error) {
        console.error("Error deleting tariff:", error);
        toast.error("Failed to delete route. Please try again.");
      }
    }
  }, []);

  const handleAddRoute = React.useCallback(async () => {
    // Validate form data
    if (!addFormData.from.trim() || !addFormData.to.trim()) {
      toast.error("Please enter both origin and destination");
      return;
    }

    if (
      addFormData.rate_40_50 < 0 ||
      addFormData.rate_50_70 < 0 ||
      addFormData.rate_70_90 < 0 ||
      addFormData.rate_90_100 < 0
    ) {
      toast.error("Fare rates cannot be negative");
      return;
    }

    // Check if route already exists
    const routeExists = data.some(
      (item) => 
        item.from.toLowerCase() === addFormData.from.trim().toLowerCase() &&
        item.to.toLowerCase() === addFormData.to.trim().toLowerCase()
    );

    if (routeExists) {
      toast.error("A route with this origin and destination already exists");
      return;
    }

    try {
      // Create new route
      const newRoute: TariffRoute = {
        id: `${addFormData.from}-${Date.now()}`,
        from: addFormData.from.trim(),
        to: addFormData.to.trim(),
        rate_40_50: Number(addFormData.rate_40_50),
        rate_50_70: Number(addFormData.rate_50_70),
        rate_70_90: Number(addFormData.rate_70_90),
        rate_90_100: Number(addFormData.rate_90_100),
      };

      // Update the data
      let updatedData: TariffRoute[] = [];
      setData((prevData) => {
        updatedData = [...prevData, newRoute];
        return updatedData;
      });

      // Convert to fare_matrix structure and save to Firestore
      const fareMatrix = convertToFareMatrix(updatedData);
      await saveTariffToFirestore(fareMatrix);

      toast.success("New route added successfully");
      setAddDialogOpen(false);
      
      // Reset form
      setAddFormData({
        from: "",
        to: "",
        rate_40_50: 0,
        rate_50_70: 0,
        rate_70_90: 0,
        rate_90_100: 0,
      });
    } catch (error) {
      console.error("Error adding route:", error);
      toast.error("Failed to add route. Please try again.");
    }
  }, [addFormData, data]);

  const columns = React.useMemo<ColumnDef<TariffRoute>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "from",
        accessorKey: "from",
        header: ({ column }: { column: Column<TariffRoute, unknown> }) => (
          <DataTableColumnHeader column={column} title="From" />
        ),
        cell: ({ cell }) => (
          <div className="flex items-center gap-1 sm:gap-2 max-w-[120px] sm:max-w-xs">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm font-medium">
              {cell.getValue<TariffRoute["from"]>()}
            </span>
          </div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "to",
        accessorKey: "to",
        header: ({ column }: { column: Column<TariffRoute, unknown> }) => (
          <DataTableColumnHeader column={column} title="To" />
        ),
        cell: ({ cell }) => (
          <div className="flex items-center gap-1 sm:gap-2 max-w-[120px] sm:max-w-xs">
            <Route className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">
              {cell.getValue<TariffRoute["to"]>()}
            </span>
          </div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "rate_40_50",
        accessorKey: "rate_40_50",
        header: ({ column }: { column: Column<TariffRoute, unknown> }) => {
          const isActive = activeRateColumn === "40.00-49.99";
          return (
            <div className={`flex items-center gap-1 sm:gap-2 flex-wrap ${isActive ? "bg-green-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded" : ""}`}>
              <DataTableColumnHeader 
                column={column} 
                title="Gas ₱40-49.99"
              />
              {isActive && (
                <Badge variant="default" className="bg-green-600 text-[10px] sm:text-xs">
                  Active
                </Badge>
              )}
            </div>
          );
        },
        cell: ({ cell }) => {
          const isActive = activeRateColumn === "40.00-49.99";
          return (
            <Badge 
              variant={isActive ? "default" : "outline"} 
              className={`font-mono text-xs sm:text-sm ${isActive ? "bg-green-600" : ""}`}
            >
              ₱{cell.getValue<number>().toFixed(2)}
            </Badge>
          );
        },
      },
      {
        id: "rate_50_70",
        accessorKey: "rate_50_70",
        header: ({ column }: { column: Column<TariffRoute, unknown> }) => {
          const isActive = activeRateColumn === "50.00-69.99";
          return (
            <div className={`flex items-center gap-1 sm:gap-2 flex-wrap ${isActive ? "bg-green-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded" : ""}`}>
              <DataTableColumnHeader column={column} title="Gas ₱50-69.99" />
              {isActive && (
                <Badge variant="default" className="bg-green-600 text-[10px] sm:text-xs">
                  Active
                </Badge>
              )}
            </div>
          );
        },
        cell: ({ cell }) => {
          const isActive = activeRateColumn === "50.00-69.99";
          return (
            <Badge 
              variant={isActive ? "default" : "outline"} 
              className={`font-mono text-xs sm:text-sm ${isActive ? "bg-green-600" : ""}`}
            >
              ₱{cell.getValue<number>().toFixed(2)}
            </Badge>
          );
        },
      },
      {
        id: "rate_70_90",
        accessorKey: "rate_70_90",
        header: ({ column }: { column: Column<TariffRoute, unknown> }) => {
          const isActive = activeRateColumn === "70.00-89.99";
          return (
            <div className={`flex items-center gap-1 sm:gap-2 flex-wrap ${isActive ? "bg-green-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded" : ""}`}>
              <DataTableColumnHeader column={column} title="Gas ₱70-89.99" />
              {isActive && (
                <Badge variant="default" className="bg-green-600 text-[10px] sm:text-xs">
                  Active
                </Badge>
              )}
            </div>
          );
        },
        cell: ({ cell }) => {
          const isActive = activeRateColumn === "70.00-89.99";
          return (
            <Badge 
              variant={isActive ? "default" : "outline"} 
              className={`font-mono text-xs sm:text-sm ${isActive ? "bg-green-600" : ""}`}
            >
              ₱{cell.getValue<number>().toFixed(2)}
            </Badge>
          );
        },
      },
      {
        id: "rate_90_100",
        accessorKey: "rate_90_100",
        header: ({ column }: { column: Column<TariffRoute, unknown> }) => {
          const isActive = activeRateColumn === "90.00-99.99";
          return (
            <div className={`flex items-center gap-1 sm:gap-2 flex-wrap ${isActive ? "bg-green-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded" : ""}`}>
              <DataTableColumnHeader column={column} title="Gas ₱90-99.99" />
              {isActive && (
                <Badge variant="default" className="bg-green-600 text-[10px] sm:text-xs">
                  Active
                </Badge>
              )}
            </div>
          );
        },
        cell: ({ cell }) => {
          const isActive = activeRateColumn === "90.00-99.99";
          return (
            <Badge 
              variant={isActive ? "default" : "outline"} 
              className={`font-mono text-xs sm:text-sm ${isActive ? "bg-green-600" : ""}`}
            >
              ₱{cell.getValue<number>().toFixed(2)}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: function Cell({ row }) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  variant="destructive"
                  onClick={() => handleDelete(row.original)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    [handleEdit, handleDelete, activeRateColumn]
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tariff Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage transportation fares and routes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {currentGasPrice && (
              <div className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <Fuel className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-900">
                  Gas: ₱{currentGasPrice.toFixed(2)}/L
                </span>
                <Badge variant="secondary" className="text-xs">
                  {activeRateColumn?.replace(".00", "")}
                </Badge>
              </div>
            )}
            <Button 
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={() => {
                setGasPriceInput(currentGasPrice?.toString() || "");
                setGasPriceDialogOpen(true);
              }}
            >
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">{currentGasPrice ? "Update Gas Price" : "Set Gas Price"}</span>
              <span className="sm:hidden">Gas Price</span>
            </Button>
            <Button 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New Route</span>
              <span className="sm:hidden">Add Route</span>
            </Button>
          </div>
        </div>

      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Fare Information</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <Badge variant="secondary" className="text-xs">{tariffData.note}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="rounded-md border overflow-x-auto">
            <DataTable 
              data={data} 
              columns={columns}
              showColumnFilter={true}
              showColumnToggle={true}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Summary Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 border">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Routes</p>
              <p className="text-xl sm:text-2xl font-bold">{data.length}</p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border">
              <p className="text-xs sm:text-sm text-muted-foreground">Origin Points</p>
              <p className="text-xl sm:text-2xl font-bold">
                {new Set(data.map(d => d.from)).size}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border">
              <p className="text-xs sm:text-sm text-muted-foreground">Destinations</p>
              <p className="text-xl sm:text-2xl font-bold">
                {new Set(data.map(d => d.to)).size}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border">
              <p className="text-xs sm:text-sm text-muted-foreground">Avg Base Fare</p>
              <p className="text-xl sm:text-2xl font-bold">
                ₱{(data.reduce((sum, d) => sum + d.rate_40_50, 0) / data.length).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setEditingRoute(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Tariff Route</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update fare rates for route from "{editingRoute?.from}" to "{editingRoute?.to}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="rate_40_50" className="text-sm">Gas ₱40-49.99 Fare Rate</Label>
              <Input
                id="rate_40_50"
                type="number"
                step="0.01"
                min="0"
                className="text-sm sm:text-base"
                value={editFormData.rate_40_50 || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setEditFormData({
                    ...editFormData,
                    rate_40_50: isNaN(val) ? 0 : val,
                  });
                }}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="rate_50_70" className="text-sm">Gas ₱50-69.99 Fare Rate</Label>
              <Input
                id="rate_50_70"
                type="number"
                step="0.01"
                min="0"
                className="text-sm sm:text-base"
                value={editFormData.rate_50_70 || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setEditFormData({
                    ...editFormData,
                    rate_50_70: isNaN(val) ? 0 : val,
                  });
                }}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="rate_70_90" className="text-sm">Gas ₱70-89.99 Fare Rate</Label>
              <Input
                id="rate_70_90"
                type="number"
                step="0.01"
                min="0"
                className="text-sm sm:text-base"
                value={editFormData.rate_70_90 || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setEditFormData({
                    ...editFormData,
                    rate_70_90: isNaN(val) ? 0 : val,
                  });
                }}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="rate_90_100" className="text-sm">Gas ₱90-99.99 Fare Rate</Label>
              <Input
                id="rate_90_100"
                type="number"
                step="0.01"
                min="0"
                className="text-sm sm:text-base"
                value={editFormData.rate_90_100 || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setEditFormData({
                    ...editFormData,
                    rate_90_100: isNaN(val) ? 0 : val,
                  });
                }}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Route Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setAddFormData({
              from: "",
              to: "",
              rate_40_50: 0,
              rate_50_70: 0,
              rate_70_90: 0,
              rate_90_100: 0,
            });
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Route</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a new tariff route with fare rates for different gas price ranges
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="from" className="text-sm">Origin Location</Label>
              <Input
                id="from"
                type="text"
                placeholder="e.g., Barangay Hall"
                className="text-sm sm:text-base"
                value={addFormData.from}
                onChange={(e) => {
                  setAddFormData({
                    ...addFormData,
                    from: e.target.value,
                  });
                }}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="to" className="text-sm">Destination Location</Label>
              <Input
                id="to"
                type="text"
                placeholder="e.g., City Market"
                className="text-sm sm:text-base"
                value={addFormData.to}
                onChange={(e) => {
                  setAddFormData({
                    ...addFormData,
                    to: e.target.value,
                  });
                }}
              />
            </div>

            <div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Fare Rates by Gas Price Range</p>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="add_rate_40_50" className="text-sm">Gas ₱40-49.99 Fare Rate</Label>
                <Input
                  id="add_rate_40_50"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-sm sm:text-base"
                  value={addFormData.rate_40_50 || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setAddFormData({
                      ...addFormData,
                      rate_40_50: isNaN(val) ? 0 : val,
                    });
                  }}
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="add_rate_50_70" className="text-sm">Gas ₱50-69.99 Fare Rate</Label>
                <Input
                  id="add_rate_50_70"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-sm sm:text-base"
                  value={addFormData.rate_50_70 || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setAddFormData({
                      ...addFormData,
                      rate_50_70: isNaN(val) ? 0 : val,
                    });
                  }}
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="add_rate_70_90" className="text-sm">Gas ₱70-89.99 Fare Rate</Label>
                <Input
                  id="add_rate_70_90"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-sm sm:text-base"
                  value={addFormData.rate_70_90 || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setAddFormData({
                      ...addFormData,
                      rate_70_90: isNaN(val) ? 0 : val,
                    });
                  }}
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="add_rate_90_100" className="text-sm">Gas ₱90-99.99 Fare Rate</Label>
                <Input
                  id="add_rate_90_100"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-sm sm:text-base"
                  value={addFormData.rate_90_100 || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setAddFormData({
                      ...addFormData,
                      rate_90_100: isNaN(val) ? 0 : val,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRoute} className="w-full sm:w-auto">
              Add Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gas Price Dialog */}
      <Dialog open={gasPriceDialogOpen} onOpenChange={setGasPriceDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Fuel className="h-4 w-4 sm:h-5 sm:w-5" />
              Set Current Gas Price
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Set the current gasoline price per liter. This will determine which fare rate column is active.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="gasPrice" className="text-sm">Gas Price per Liter (₱)</Label>
              <Input
                id="gasPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 65.50"
                className="text-sm sm:text-base"
                value={gasPriceInput}
                onChange={(e) => setGasPriceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSetGasPrice();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Based on this price, the following rate range will be active:
                {gasPriceInput && !isNaN(parseFloat(gasPriceInput)) && (
                  <span className="font-semibold ml-1">
                    {getGasPriceRange(parseFloat(gasPriceInput)).replace(".00", "")}
                  </span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setGasPriceDialogOpen(false);
                if (currentGasPrice) {
                  setGasPriceInput(currentGasPrice.toString());
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSetGasPrice} className="w-full sm:w-auto">
              Save Gas Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </>
  );
}
