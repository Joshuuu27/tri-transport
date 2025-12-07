import tariffData from "@/tariff.json";
import { db } from "@/lib/firebase.browser";
import { doc, getDoc } from "firebase/firestore";

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

interface Coordinates {
  lat: number;
  lng: number;
}

// Cache for location coordinates to avoid repeated geocoding
const locationCoordinatesCache = new Map<string, Coordinates | null>();

// Cache for gas price
let gasPriceCache: number | null = null;
let gasPriceCacheTime: number = 0;
const GAS_PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for tariff data
let tariffDataCache: FareMatrixItem[] | null = null;
let tariffDataCacheTime: number = 0;
const TARIFF_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const TARIFF_COLLECTION = "tariff";
const TARIFF_DOC_ID = "fare_matrix";

/**
 * Loads tariff data from Firestore, with caching and fallback to JSON
 */
async function getTariffData(): Promise<FareMatrixItem[]> {
  // Check cache first
  const now = Date.now();
  if (tariffDataCache && (now - tariffDataCacheTime) < TARIFF_CACHE_DURATION) {
    return tariffDataCache;
  }

  try {
    // Try to load from Firestore
    const tariffRef = doc(db, TARIFF_COLLECTION, TARIFF_DOC_ID);
    const tariffSnap = await getDoc(tariffRef);
    
    if (tariffSnap.exists()) {
      const data = tariffSnap.data();
      if (data.fare_matrix && Array.isArray(data.fare_matrix)) {
        tariffDataCache = data.fare_matrix as FareMatrixItem[];
        tariffDataCacheTime = now;
        return tariffDataCache;
      }
    }
  } catch (error) {
    console.error("Error loading tariff from Firestore:", error);
  }

  // Fallback to JSON data
  tariffDataCache = tariffData.fare_matrix;
  tariffDataCacheTime = now;
  return tariffDataCache;
}

/**
 * Normalizes a location string for comparison by:
 * - Converting to lowercase
 * - Removing extra whitespace
 * - Removing common punctuation
 */
function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a location string matches a target location (from tariff data).
 * Uses fuzzy matching to handle variations in location names.
 */
function locationMatches(location: string, target: string): boolean {
  const normalizedLocation = normalizeLocation(location);
  const normalizedTarget = normalizeLocation(target);

  // Exact match
  if (normalizedLocation === normalizedTarget) {
    return true;
  }

  // Check if location contains target or vice versa
  if (normalizedLocation.includes(normalizedTarget) || normalizedTarget.includes(normalizedLocation)) {
    return true;
  }

  // Check if any word in location matches any word in target
  const locationWords = normalizedLocation.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);
  
  // If at least 2 words match, consider it a match
  const matchingWords = locationWords.filter(word => 
    targetWords.some(targetWord => 
      word.length > 3 && targetWord.length > 3 && 
      (word.includes(targetWord) || targetWord.includes(word))
    )
  );
  
  return matchingWords.length >= 2;
}

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * Returns distance in meters.
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) *
    Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Gets coordinates for a location string using Google Maps Geocoding API.
 * Uses cache to avoid repeated API calls.
 */
async function getLocationCoordinates(location: string): Promise<Coordinates | null> {
  // Check cache first
  const cacheKey = location.toLowerCase().trim();
  if (locationCoordinatesCache.has(cacheKey)) {
    return locationCoordinatesCache.get(cacheKey) || null;
  }

  // If location is already coordinates, parse them
  const coordMatch = location.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const coords = {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
    locationCoordinatesCache.set(cacheKey, coords);
    return coords;
  }

  // Try to geocode if Google Maps is available
  if (typeof window !== "undefined" && (window as any).google && (window as any).google.maps) {
    return new Promise((resolve) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results: any, status: string) => {
        if (status === (window as any).google.maps.GeocoderStatus.OK && results && results[0]) {
          const loc = results[0].geometry.location;
          const coords = {
            lat: loc.lat(),
            lng: loc.lng()
          };
          locationCoordinatesCache.set(cacheKey, coords);
          resolve(coords);
        } else {
          locationCoordinatesCache.set(cacheKey, null);
          resolve(null);
        }
      });
    });
  }

  locationCoordinatesCache.set(cacheKey, null);
  return null;
}

/**
 * Fetches the current gas price from Firestore or localStorage.
 * Uses caching to avoid repeated reads.
 */
export async function getCurrentGasPrice(): Promise<number | null> {
  // Check cache first
  const now = Date.now();
  if (gasPriceCache !== null && (now - gasPriceCacheTime) < GAS_PRICE_CACHE_DURATION) {
    return gasPriceCache;
  }

  // Try Firestore first (if available)
  try {
    if (typeof window !== "undefined" && db) {
      const SETTINGS_DOC_ID = "app_settings";
      const GAS_PRICE_FIELD = "currentGasPrice";
      const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const gasPrice = settingsSnap.data()[GAS_PRICE_FIELD];
        if (gasPrice !== undefined && gasPrice !== null) {
          const price = typeof gasPrice === "number" ? gasPrice : parseFloat(gasPrice);
          if (!isNaN(price)) {
            gasPriceCache = price;
            gasPriceCacheTime = now;
            return price;
          }
        }
      }
    }
  } catch (error) {
    console.warn("Error loading gas price from Firestore:", error);
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const savedGasPrice = localStorage.getItem("current_gas_price");
      if (savedGasPrice) {
        const price = parseFloat(savedGasPrice);
        if (!isNaN(price)) {
          gasPriceCache = price;
          gasPriceCacheTime = now;
          return price;
        }
      }
    } catch (error) {
      console.warn("Error loading gas price from localStorage:", error);
    }
  }

  gasPriceCache = null;
  return null;
}

/**
 * Gets the current gas price range based on current gas price.
 * If gas price is not provided, defaults to "50.00-69.99" range.
 */
export function getGasPriceRange(currentGasPrice?: number): keyof FareRate {
  if (!currentGasPrice) {
    // Default to middle range
    return "50.00-69.99";
  }

  if (currentGasPrice >= 40 && currentGasPrice < 50) {
    return "40.00-49.99";
  } else if (currentGasPrice >= 50 && currentGasPrice < 70) {
    return "50.00-69.99";
  } else if (currentGasPrice >= 70 && currentGasPrice < 90) {
    return "70.00-89.99";
  } else if (currentGasPrice >= 90 && currentGasPrice < 100) {
    return "90.00-99.99";
  }

  // Default to middle range if out of bounds
  return "50.00-69.99";
}

/**
 * Checks if coordinates are within 100 meters of each other.
 */
function coordinatesWithinRadius(
  coord1: Coordinates | null,
  coord2: Coordinates | null,
  radiusMeters: number = 100
): boolean {
  if (!coord1 || !coord2) {
    return false;
  }
  const distance = calculateDistance(coord1, coord2);
  return distance <= radiusMeters;
}

/**
 * Calculates a match score for a route based on text and geographic similarity.
 * Higher score = better match.
 */
function calculateMatchScore(
  fromText: string,
  toText: string,
  matrixFrom: string,
  matrixTo: string,
  fromCoords: Coordinates | null,
  toCoords: Coordinates | null,
  matrixFromCoords: Coordinates | null,
  matrixToCoords: Coordinates | null
): number {
  let score = 0;

  // Text matching scores
  if (locationMatches(fromText, matrixFrom)) {
    score += 10; // Exact or fuzzy text match for "from"
  }
  if (locationMatches(toText, matrixTo)) {
    score += 10; // Exact or fuzzy text match for "to"
  }

  // Geographic matching scores (closer = higher score)
  if (fromCoords && matrixFromCoords) {
    const fromDistance = calculateDistance(fromCoords, matrixFromCoords);
    if (fromDistance <= 100) {
      score += 20; // Very close (within 100m)
    } else if (fromDistance <= 500) {
      score += 15; // Close (within 500m)
    } else if (fromDistance <= 1000) {
      score += 10; // Fairly close (within 1km)
    } else if (fromDistance <= 2000) {
      score += 5; // Somewhat close (within 2km)
    }
  }

  if (toCoords && matrixToCoords) {
    const toDistance = calculateDistance(toCoords, matrixToCoords);
    if (toDistance <= 100) {
      score += 20; // Very close (within 100m)
    } else if (toDistance <= 500) {
      score += 15; // Close (within 500m)
    } else if (toDistance <= 1000) {
      score += 10; // Fairly close (within 1km)
    } else if (toDistance <= 2000) {
      score += 5; // Somewhat close (within 2km)
    }
  }

  return score;
}

/**
 * Looks up tariff fare for a given route (from -> to).
 * Uses both text matching and geographic coordinate matching with fallback to closest match.
 * Returns the fare if found (exact or close match), null if no reasonable match found.
 * 
 * @param from - Starting location (string or coordinates)
 * @param to - Destination location (string or coordinates)
 * @param fromCoords - Optional coordinates for starting location
 * @param toCoords - Optional coordinates for destination location
 * @param currentGasPrice - Optional current gas price to determine which rate range to use
 * @returns Fare amount or null if not found
 */
export async function lookupTariffFare(
  from: string,
  to: string,
  fromCoords?: Coordinates | null,
  toCoords?: Coordinates | null,
  currentGasPrice?: number
): Promise<number | null> {
  if (!from || !to) {
    return null;
  }

  // Fetch current gas price if not provided
  let gasPrice = currentGasPrice;
  if (gasPrice === undefined) {
    gasPrice = await getCurrentGasPrice() || undefined;
  }
  const gasPriceRange = getGasPriceRange(gasPrice);

  // Get coordinates for from and to locations if not provided
  let fromCoordinates = fromCoords;
  let toCoordinates = toCoords;

  if (!fromCoordinates) {
    fromCoordinates = await getLocationCoordinates(from);
  }
  if (!toCoordinates) {
    toCoordinates = await getLocationCoordinates(to);
  }

  // Load tariff data (from Firestore or JSON)
  const fareMatrix = await getTariffData();

  let bestMatch: { fare: number; score: number } | null = null;
  const MIN_MATCH_SCORE = 10; // Minimum score to consider a match

  // Search through fare matrix
  for (const matrixItem of fareMatrix) {
    // Get coordinates for matrix "from" location
    const matrixFromCoords = fromCoordinates 
      ? await getLocationCoordinates(matrixItem.from)
      : null;

    // Check if "from" location matches (text or geographic)
    const fromMatchesText = locationMatches(from, matrixItem.from);
    let fromMatchesGeo = false;
    
    if (fromCoordinates && matrixFromCoords) {
      // Use larger radius for "close" matching (500m instead of 100m)
      fromMatchesGeo = coordinatesWithinRadius(fromCoordinates, matrixFromCoords, 500);
    }

    if (fromMatchesText || fromMatchesGeo) {
      // Search routes for matching "to" location
      for (const route of matrixItem.routes) {
        // Check if "to" location matches any part of the route's "to" string
        // The "to" field can contain multiple locations separated by commas
        const routeDestinations = route.to.split(",").map(dest => dest.trim());
        
        for (const routeDest of routeDestinations) {
          const toMatchesText = locationMatches(to, routeDest);
          let toMatchesGeo = false;
          let routeDestCoords: Coordinates | null = null;
          
          if (toCoordinates) {
            routeDestCoords = await getLocationCoordinates(routeDest);
            // Use larger radius for "close" matching (500m instead of 100m)
            toMatchesGeo = routeDestCoords 
              ? coordinatesWithinRadius(toCoordinates, routeDestCoords, 500)
              : false;
          }

          // Exact match - return immediately
          if (toMatchesText || toMatchesGeo) {
            return route.rates[gasPriceRange];
          }

          // Calculate match score for potential close match
          const matchScore = calculateMatchScore(
            from,
            to,
            matrixItem.from,
            routeDest,
            fromCoordinates,
            toCoordinates,
            matrixFromCoords,
            routeDestCoords
          );

          // Track the best match
          if (matchScore >= MIN_MATCH_SCORE) {
            if (!bestMatch || matchScore > bestMatch.score) {
              bestMatch = {
                fare: route.rates[gasPriceRange],
                score: matchScore,
              };
            }
          }
        }
      }
    } else {
      // Even if "from" doesn't match exactly, check if it's close
      if (fromCoordinates && matrixFromCoords) {
        const fromDistance = calculateDistance(fromCoordinates, matrixFromCoords);
        
        // If "from" is within 2km, check all routes for this origin
        if (fromDistance <= 2000) {
          for (const route of matrixItem.routes) {
            const routeDestinations = route.to.split(",").map(dest => dest.trim());
            
            for (const routeDest of routeDestinations) {
              const routeDestCoords = toCoordinates 
                ? await getLocationCoordinates(routeDest)
                : null;
              
              const matchScore = calculateMatchScore(
                from,
                to,
                matrixItem.from,
                routeDest,
                fromCoordinates,
                toCoordinates,
                matrixFromCoords,
                routeDestCoords
              );

              if (matchScore >= MIN_MATCH_SCORE) {
                if (!bestMatch || matchScore > bestMatch.score) {
                  bestMatch = {
                    fare: route.rates[gasPriceRange],
                    score: matchScore,
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  // Return the best match if we found one with a reasonable score
  if (bestMatch && bestMatch.score >= MIN_MATCH_SCORE) {
    return bestMatch.fare;
  }

  return null;
}

/**
 * Gets the default fare calculation using base fare and per km rate.
 * 
 * @param distanceKm - Distance in kilometers
 * @returns Calculated fare
 */
export function getDefaultFare(distanceKm: number): number {
  const baseFare = parseFloat(process.env.NEXT_PUBLIC_BASEFARE || "15");
  const perKm = parseFloat(process.env.NEXT_PUBLIC_PERKM || "10");
  return baseFare + distanceKm * perKm;
}
