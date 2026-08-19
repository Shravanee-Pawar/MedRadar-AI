export interface RecommendationInput {
  emergencyType: string;
  lat: number;
  lng: number;
  requiredResources: string[];
}

export interface Recommendation {
  id: string;
  requestId: string;
  hospitalId: string;
  hospitalName: string;
  matchScore: number; // 0 - 100
  matchedResources: string[];
  distanceKm: number;
  estimatedTravelTimeMin: number;
  reason: string;
}

/**
 * RECOMMENDATION ENGINE INTEGRATION POINT
 * Teammate Owning Recommendation Engine: Replace the mock scoring implementation
 * inside this class with your ML/rule engine!
 */
export class RecommendationService {
  public static async getRecommendations(
    requestId: string,
    input: RecommendationInput,
    hospitals: any[]
  ): Promise<Recommendation[]> {
    return hospitals
      .filter((h) => h.verified)
      .map((h) => {
        // Calculate approximate Haversine distance in KM
        const R = 6371;
        const dLat = (h.lat - input.lat) * (Math.PI / 180);
        const dLng = (h.lng - input.lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(input.lat * (Math.PI / 180)) *
            Math.cos(h.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round(R * c * 10) / 10;
        const estimatedTravelTimeMin = Math.round((distanceKm / 35) * 60) + 3;

        // Calculate score based on readinessScore + proximity
        const proximityScore = Math.max(0, 100 - distanceKm * 4);
        const matchScore = Math.round((h.readinessScore || 75) * 0.6 + proximityScore * 0.4);

        return {
          id: `rec-${Date.now()}-${h.id}`,
          requestId,
          hospitalId: h.id,
          hospitalName: h.name,
          matchScore: Math.min(99, Math.max(50, matchScore)),
          matchedResources:
            input.requiredResources && input.requiredResources.length > 0
              ? input.requiredResources
              : ['ICU Bed', 'Emergency Specialist', 'Ventilator Ready'],
          distanceKm,
          estimatedTravelTimeMin,
          reason: `${h.name} has ${h.readinessScore || 75}% operational readiness and is ${distanceKm} km away (~${estimatedTravelTimeMin} min ETA).`,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
