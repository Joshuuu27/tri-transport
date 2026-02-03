"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/lib/auth/logout";
import Header from "@/components/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import SearchInput from "@/components/admin/search-input";
import { LoadingScreen } from "@/components/common/loading-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Shield, Users, Search } from "lucide-react";
import { toast } from "react-toastify";

interface Driver {
  id: string;
  name?: string;
  email?: string;
  licenseNumber?: string;
  address?: string;
  phone?: string;
  [key: string]: any;
}

interface PoliceOfficer {
  uid: string;
  email: string;
  name: string;
  role: string;
}

const AdminPage = () => {
  const { user, role } = useAuthContext();
  const [query, setQuery] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drivers");
  
  // User creation form state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    name: "",
    email: "",
    password: "",
    userRole: "franchising",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  // Police head management state
  const [policeOfficers, setPoliceOfficers] = useState<PoliceOfficer[]>([]);
  const [currentPoliceHead, setCurrentPoliceHead] = useState<PoliceOfficer | null>(null);
  const [isPoliceHeadDialogOpen, setIsPoliceHeadDialogOpen] = useState(false);
  const [selectedPoliceHeadUid, setSelectedPoliceHeadUid] = useState("");
  const [isUpdatingPoliceHead, setIsUpdatingPoliceHead] = useState(false);
  const [loadingPoliceData, setLoadingPoliceData] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("/api/drivers");
        if (!response.ok) throw new Error("Failed to fetch drivers");
        const data = await response.json();
        setDrivers(data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        toast.error("Failed to load drivers");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    if (activeTab === "police-head") {
      fetchPoliceData();
    }
  }, [activeTab]);

  const fetchPoliceData = async () => {
    setLoadingPoliceData(true);
    try {
      // Fetch current police head (using admin endpoint)
      const headResponse = await fetch("/api/admin/police-head");
      if (headResponse.ok) {
        const headData = await headResponse.json();
        setCurrentPoliceHead(headData.policeHead || null);
      } else {
        // If request fails, log for debugging
        const errorData = await headResponse.json().catch(() => ({}));
        console.error("Failed to fetch police head:", errorData);
      }

      // Fetch all police officers
      const usersResponse = await fetch("/api/admin/police-officers");
      if (usersResponse.ok) {
        const officersData = await usersResponse.json();
        setPoliceOfficers(officersData.officers || []);
      } else {
        const errorData = await usersResponse.json().catch(() => ({}));
        console.error("Failed to fetch police officers:", errorData);
      }
    } catch (error) {
      console.error("Error fetching police data:", error);
      toast.error("Failed to load police data");
    } finally {
      setLoadingPoliceData(false);
    }
  };

  const filteredDrivers = query.trim() === ""
    ? drivers
    : drivers.filter(
        (driver) =>
          driver.name?.toLowerCase().includes(query.toLowerCase()) ||
          driver.email?.toLowerCase().includes(query.toLowerCase()) ||
          driver.licenseNumber?.toLowerCase().includes(query.toLowerCase()) ||
          driver.address?.toLowerCase().includes(query.toLowerCase()) ||
          driver.phone?.toLowerCase().includes(query.toLowerCase())
      );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createUserData.name || !createUserData.email || !createUserData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createUserData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success("User created successfully!");
      setIsCreateUserOpen(false);
      setCreateUserData({ name: "", email: "", password: "", userRole: "franchising" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUpdatePoliceHead = async () => {
    if (!selectedPoliceHeadUid) {
      toast.error("Please select a police officer");
      return;
    }

    setIsUpdatingPoliceHead(true);
    try {
      const response = await fetch("/api/admin/police-head", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPoliceHeadUid: selectedPoliceHeadUid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update police head");
      }

      toast.success("Police head updated successfully!");
      setIsPoliceHeadDialogOpen(false);
      setSelectedPoliceHeadUid("");
      fetchPoliceData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update police head");
    } finally {
      setIsUpdatingPoliceHead(false);
    }
  };

  if (loading && activeTab === "drivers") {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-background max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drivers">
              <Search className="w-4 h-4 mr-2" />
              Find Drivers
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserPlus className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="police-head">
              <Shield className="w-4 h-4 mr-2" />
              Police Head
            </TabsTrigger>
          </TabsList>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="mt-6">
            <div className="flex flex-col items-center justify-start py-8 px-4 sm:py-12">
              <div className="w-full max-w-2xl mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-2">
                  Find Drivers
                </h1>
                <p className="text-center text-muted-foreground text-sm sm:text-base">
                  Search driver by name, address or license #
                </p>
              </div>

              <SearchInput value={query} onChange={setQuery} />

              <div className="w-full max-w-2xl mt-8 sm:mt-12">
                {filteredDrivers.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredDrivers.map((driver) => (
                      <Card key={driver.id} className="p-4">
                        <CardContent className="p-0">
                          <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-lg">{driver.name || "Unknown"}</h3>
                            {driver.email && <p className="text-sm text-muted-foreground">Email: {driver.email}</p>}
                            {driver.phone && <p className="text-sm text-muted-foreground">Phone: {driver.phone}</p>}
                            {driver.licenseNumber && <p className="text-sm text-muted-foreground">License: {driver.licenseNumber}</p>}
                            {driver.address && <p className="text-sm text-muted-foreground">Address: {driver.address}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {query
                        ? "No drivers found matching your search"
                        : drivers.length === 0
                        ? "No drivers found"
                        : "Start typing to search"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <p className="text-muted-foreground">Create new users with franchise or CTTMO roles</p>
                </div>
                <Button onClick={() => setIsCreateUserOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Use the "Create User" button to add new users with franchise or CTTMO roles.
                    These users will be able to access their respective dashboards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Police Head Management Tab */}
          <TabsContent value="police-head" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Police Head Management</h2>
                  <p className="text-muted-foreground">Assign or reassign the police head</p>
                </div>
                <Button onClick={() => setIsPoliceHeadDialogOpen(true)} disabled={loadingPoliceData}>
                  <Shield className="w-4 h-4 mr-2" />
                  {currentPoliceHead ? "Reassign Police Head" : "Assign Police Head"}
                </Button>
              </div>

              {loadingPoliceData ? (
                <LoadingScreen />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    {currentPoliceHead ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Current Police Head</h3>
                        <div className="p-4 bg-muted rounded-lg">
                          <p><strong>Name:</strong> {currentPoliceHead.name}</p>
                          <p><strong>Email:</strong> {currentPoliceHead.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No police head assigned yet.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={createUserData.name}
                onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createUserData.email}
                onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={createUserData.password}
                onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <Select
                value={createUserData.userRole}
                onValueChange={(value) => setCreateUserData({ ...createUserData, userRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="franchising">Franchising</SelectItem>
                  <SelectItem value="cttmo">CTTMO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingUser}>
                {isCreatingUser ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Police Head Assignment Dialog */}
      <Dialog open={isPoliceHeadDialogOpen} onOpenChange={setIsPoliceHeadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPoliceHead ? "Reassign Police Head" : "Assign Police Head"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policeOfficer">Select Police Officer</Label>
              <Select value={selectedPoliceHeadUid} onValueChange={setSelectedPoliceHeadUid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a police officer" />
                </SelectTrigger>
                <SelectContent>
                  {policeOfficers.map((officer) => (
                    <SelectItem key={officer.uid} value={officer.uid}>
                      {officer.name} ({officer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {policeOfficers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No police officers found. Please create police officers first.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPoliceHeadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePoliceHead}
                disabled={isUpdatingPoliceHead || !selectedPoliceHeadUid}
              >
                {isUpdatingPoliceHead ? "Updating..." : "Assign"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPage;
