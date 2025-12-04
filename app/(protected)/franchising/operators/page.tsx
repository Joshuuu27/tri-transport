"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/franchising/franchising-header";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { OperatorsTable, Operator } from "./operators-table";

const OperatorsPage = () => {
  const { user, role } = useAuthContext();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/operators");
      const data = await res.json();
      setOperators(data || []);
    } catch (error) {
      console.error("Error fetching operators:", error);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  return (
    <>
      <Header />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-4 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-2">
            <div>
              <div>
                <h2 className="text-2xl font-semibold mb-6">Operators</h2>
              </div>
              {/* Operators table */}
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  Loading operators...
                </div>
              ) : (
                <OperatorsTable data={operators} onOperatorUpdated={loadOperators} />
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default OperatorsPage;
