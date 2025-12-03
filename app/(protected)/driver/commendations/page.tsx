"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/driver/driver-header";
import { useAuthContext } from "@/app/context/AuthContext";
import { getDriverCommendations, Commendation } from "@/lib/services/CommendationService";
import { Star, ThumbsUp } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-component";

export default function DriverCommendationsPage() {
  const { user } = useAuthContext();
  const [commendations, setCommendations] = useState<Commendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(5);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user?.uid) return;

    const fetchCommendations = async () => {
      try {
        // Fetch commendations for this driver
        const data = await getDriverCommendations(user.uid);
        setCommendations(data);

        // Calculate average rating
        if (data.length > 0) {
          const validRatings = data
            .map(c => Number(c.rating))
            .filter(r => !isNaN(r) && r > 0);

          if (validRatings.length > 0) {
            const totalRating = validRatings.reduce((sum, r) => sum + r, 0);
            const avgRating = totalRating / validRatings.length;
            setAverageRating(Math.round(avgRating * 10) / 10);
          }
        }
      } catch (error) {
        console.error("Error fetching commendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommendations();
  }, [user?.uid]);

  if (loading) return <LoadingScreen />;

  const displayedCommendations = commendations.slice(0, displayedCount);
  const hasMore = displayedCount < commendations.length;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">My Commendations</h1>

            {/* Average Rating */}
            {commendations.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-3xl font-bold text-yellow-600">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>
                      Based on {commendations.length}{" "}
                      {commendations.length === 1 ? "commendation" : "commendations"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {commendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No commendations yet. Great drivers will earn commendations from commuters!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedCommendations.map((commendation) => (
                  <Card key={commendation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700">Commendation</span>
                            <span className="text-sm text-gray-500">
                              • {commendation.commuterName}
                            </span>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Number(commendation.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{commendation.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(commendation.createdAt).toLocaleDateString()} at{" "}
                            {new Date(commendation.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {hasMore && (
                  <Button
                    onClick={() => setDisplayedCount(displayedCount + itemsPerPage)}
                    variant="outline"
                    className="w-full"
                  >
                    Load More Commendations
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
