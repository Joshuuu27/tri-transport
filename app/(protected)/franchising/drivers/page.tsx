"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

import Header from "@/components/franchising/franchising-header";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { columns } from "./columns";

const FranchisingPage = () => {
  const { user, role } = useAuthContext();
   const [drivers, setDrivers] = useState<Drivers[]>([]);

    useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/drivers");
      const data = await res.json();
      setDrivers(data);
    };

    load();
  }, []);

  return (
    <>
      <Header />      

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
                {/* user info example */}  
                <DataTable columns={columns} data={drivers} />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default FranchisingPage;
