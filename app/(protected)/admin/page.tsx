"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

import { handleLogout } from "@/lib/auth/logout";
import Header from "@/components/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import ProfileCard from "@/components/admin/profile-card";
import SearchInput from "@/components/admin/search-input";

const DriverPage = () => {
  const { user, role } = useAuthContext();
  const [query, setQuery] = useState("");

  const sampleProfiles = [
    {
      id: 1,
      name: "Ricardo Lopez",
      title: "L07-3230239-904",
      image: "/diverse-profile-avatars.png",
    },
    {
      id: 2,
      name: "Joshua Landong ",
      title: "L07-3230239-905",
      image: "/diverse-profile-avatars.png",
    },
    {
      id: 3,
      name: "Lando Martinez",
      title: "L07-3230239-907",
      image: "/diverse-profile-avatars.png",
    },
  ];

  const filteredProfiles = sampleProfiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(query.toLowerCase()) ||
      profile.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Header />

      {/* Content */}

      <main className="min-h-screen bg-background max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col items-center justify-start py-8 px-4 sm:py-12">
          {/* Header */}
          <div className="w-full max-w-2xl mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-2">
              Find Drivers
            </h1>
            <p className="text-center text-muted-foreground text-sm sm:text-base">
              Search driver by name, address or license #
            </p>          
          </div>

          {/* Search Input */}
          <SearchInput value={query} onChange={setQuery} />

          {/* Results */}
          <div className="w-full max-w-2xl mt-8 sm:mt-12">
            {filteredProfiles.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredProfiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {query
                    ? "No profiles found matching your search"
                    : "Start typing to search"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default DriverPage;
