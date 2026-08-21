import { doctorRepository } from '../repositories/doctor.repository.js';
import { resourceRepository } from '../repositories/resource.repository.js';
import { ResourceType } from '../interfaces/resource.interface.js';

export interface RecommendationInput {
  emergencyType: string;
  lat: number;
  lng: number;
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
  reasonTags?: string[];
  isClinicallyEligible?: boolean;
  availableRequiredResources?: string[];
  missingRequiredResources?: string[];
  specialistAvailable?: boolean;
  readinessScore?: number;
  distanceScore?: number;
  resourceScore?: number;
}

// Helpers for scoring calculations

function getSafeResourceAvailability(res?: any): { available: number; isAvailable: boolean } {
  if (!res) return { available: 0, isAvailable: false };
  const total = Math.max(0, res.total || 0);
  const occupied = Math.max(0, res.occupied || 0);
  const reserved = Math.max(0, res.reserved || 0);

  if (occupied + reserved > total) {
    console.warn(
      `[Invalid Resource Record] Hospital ${res.hospitalId} resource ${res.resourceType}: occupied (${occupied}) + reserved (${reserved}) > total (${total})`
    );
  }

  const calculatedAvailable = Math.max(0, total - occupied - reserved);
  const effectiveAvailable = res.available !== undefined ? Math.min(res.available, calculatedAvailable) : calculatedAvailable;
  const isAvailable = effectiveAvailable > 0 && res.status !== 'Critical';

  return { available: effectiveAvailable, isAvailable };
}

function calculateDistanceScore(distanceKm: number): number {
  const MAX_DISTANCE_KM = 100;
  const score = 100 * (1 - Math.min(distanceKm, MAX_DISTANCE_KM) / MAX_DISTANCE_KM);
  return Math.max(0, Math.round(score * 10) / 10);
}

function mapResourceAlias(alias: string): ResourceType | null {
  const norm = alias.trim().toLowerCase();

  if (norm === 'emergency department' || norm === 'emergency capacity' || norm === 'emergency dept') {
    return 'emergency_capacity';
  }
  if (norm.includes('icu') || norm.includes('ccu')) {
    return 'icu_beds';
  }
  if (norm.includes('ventilator')) {
    return 'ventilators';
  }
  if (norm.includes('operating') || norm.includes('cath lab') || norm.includes('theatre')) {
    return 'operating_theatres';
  }
  if (norm.includes('general bed') || norm.includes('general beds')) {
    return 'general_beds';
  }
  if (norm.includes('isolation bed')) {
    return 'isolation_beds';
  }
  if (norm.includes('pediatric bed') || norm.includes('picu') || norm.includes('nicu') || norm.includes('pediatric')) {
    return 'pediatric_beds';
  }
  if (norm.includes('oxygen')) {
    return 'oxygen_kl';
  }
  
  if (norm.includes('general')) return 'general_beds';
  if (norm.includes('emergency')) return 'emergency_capacity';

  return null;
}

export function normalizeEmergencyType(type: string): string {
  const norm = type.toLowerCase().trim();
  if (norm.includes('road accident') || (norm.includes('trauma') && norm.includes('poly'))) {
    return 'Road Accident / Poly-Trauma';
  }
  if (norm.includes('cardiac') || norm.includes('chest pain') || norm.includes('heart')) {
    return 'Cardiac Emergency';
  }
  if (norm.includes('stroke') || norm.includes('neurological')) {
    return 'Stroke / Neurological Trauma';
  }
  if (norm.includes('burn')) {
    return 'Severe Burns';
  }
  if (norm.includes('respiratory') || norm.includes('breathing')) {
    return 'Respiratory Emergency';
  }
  if (norm.includes('pediatric')) {
    return 'Pediatric Emergency';
  }
  if (norm.includes('pregnancy') || norm.includes('obstetric') || norm.includes('maternity')) {
    return 'Pregnancy / Obstetric Emergency';
  }
  if (norm.includes('bleeding')) {
    return 'Critical Bleeding';
  }
  return 'Other Emergency';
}

export function getPriorityResources(emergencyType: string): ResourceType[] {
  const normalized = normalizeEmergencyType(emergencyType);
  switch (normalized) {
    case 'Road Accident / Poly-Trauma':
      return ['icu_beds', 'ventilators'];
    case 'Cardiac Emergency':
      return ['icu_beds', 'oxygen_kl'];
    case 'Stroke / Neurological Trauma':
      return ['icu_beds', 'ventilators'];
    case 'Severe Burns':
      return ['icu_beds', 'oxygen_kl'];
    case 'Respiratory Emergency':
      return ['ventilators', 'oxygen_kl', 'icu_beds'];
    case 'Pregnancy / Obstetric Emergency':
      return ['icu_beds'];
    case 'Pediatric Emergency':
      return ['icu_beds'];
    case 'Critical Bleeding':
      return ['icu_beds'];
    default:
      return [];
  }
}

export function getRequiredResourcesForEmergency(emergencyType: string): ResourceType[] {
  return getPriorityResources(emergencyType);
}

function getRequiredDoctorSpecialties(emergencyType: string): string[] {
  const normalized = normalizeEmergencyType(emergencyType);
  switch (normalized) {
    case 'Cardiac Emergency':
      return ['cardiologist', 'cardiology'];
    case 'Stroke / Neurological Trauma':
      return ['neurologist', 'neurosurgeon', 'neurosurgery', 'neurology'];
    case 'Road Accident / Poly-Trauma':
      return ['trauma surgeon', 'orthopedic surgeon', 'emergency medicine', 'general surgery & trauma', 'trauma'];
    case 'Severe Burns':
      return ['plastic/burns surgeon', 'burns/plastic specialist', 'plastic surgeon', 'burn care', 'trauma specialist'];
    case 'Respiratory Emergency':
      return ['pulmonologist', 'critical care specialist', 'critical care / emergency medicine', 'pulmonology'];
    case 'Pediatric Emergency':
      return ['pediatrician', 'pediatric specialist', 'pediatrics'];
    case 'Pregnancy / Obstetric Emergency':
      return ['obstetrician', 'gynecologist', 'obstetrician / gynecologist', 'gynaecology', 'obstetrics'];
    case 'Critical Bleeding':
      return ['emergency medicine', 'trauma surgeon', 'vascular / trauma surgeon', 'critical care / emergency medicine', 'general surgery & trauma'];
    default:
      return ['emergency medicine', 'critical care / emergency medicine', 'general medicine'];
  }
}

function isSpecialistMatch(doctorSpecialty: string, requiredSpecs: string[]): boolean {
  const ds = doctorSpecialty.toLowerCase();
  return requiredSpecs.some(spec => ds.includes(spec) || spec.includes(ds));
}

export class RecommendationService {
  public static async getRecommendations(
    requestId: string,
    input: RecommendationInput,
    hospitals: any[]
  ): Promise<Recommendation[]> {
    const allDoctors = await doctorRepository.findAll();

    const recommendationPromises = hospitals
      .filter((h) => h.verified && h.emergencyStatus !== 'Critical')
      .map(async (h) => {
        // 1. DISTANCE SCORING (lat = latitude, lng = longitude)
        let distanceKm = 0;
        if (
          h.lat !== undefined &&
          h.lng !== undefined &&
          input.lat !== undefined &&
          input.lng !== undefined &&
          !isNaN(h.lat) &&
          !isNaN(h.lng) &&
          !isNaN(input.lat) &&
          !isNaN(input.lng)
        ) {
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
          distanceKm = Math.round(R * c * 10) / 10;
        }

        const distanceScore = calculateDistanceScore(distanceKm);

        let estimatedTravelTimeMin = Math.round((distanceKm / 35) * 60) + 3;
        if (isNaN(estimatedTravelTimeMin)) {
          estimatedTravelTimeMin = 3;
        }

        // 2. RESOURCE MATCHING & VALIDATION
        const hospResources = await resourceRepository.findByHospitalId(h.id);
        const priorityResources = getPriorityResources(input.emergencyType);
        const requiredResources = getRequiredResourcesForEmergency(input.emergencyType);
        
        let resourceScore = 100;
        const matchedResources: string[] = [];
        let totalWeightSum = 0;
        let satisfiedWeightSum = 0;

        const requestedPriorityResources: ResourceType[] = [];
        let missingPriorityCount = 0;

        if (requiredResources.length > 0) {
          for (const rType of requiredResources) {
            if (priorityResources.includes(rType)) {
              requestedPriorityResources.push(rType);
            }
          }

          for (const rType of requiredResources) {
            const isPriority = priorityResources.includes(rType);
            const weight = isPriority ? 2.0 : 1.0;
            totalWeightSum += weight;

            const res = hospResources.find((r) => r.resourceType === rType);
            const { isAvailable } = getSafeResourceAvailability(res);

            if (isAvailable && res) {
              let multiplier = 0.0;
              if (res.status === 'Available') {
                multiplier = 1.0;
              } else if (res.status === 'Limited') {
                multiplier = 0.5;
              } else if (res.status === 'Stale') {
                multiplier = 0.1;
              }

              satisfiedWeightSum += multiplier * weight;
              matchedResources.push(res.resourceName);
            }
          }

          if (totalWeightSum > 0) {
            resourceScore = (satisfiedWeightSum / totalWeightSum) * 100;
          }

          for (const pType of requestedPriorityResources) {
            const res = hospResources.find((r) => r.resourceType === pType);
            const { isAvailable } = getSafeResourceAvailability(res);
            if (!isAvailable) {
              missingPriorityCount++;
            }
          }

          if (requestedPriorityResources.length > 0 && missingPriorityCount > 0) {
            const cap = (missingPriorityCount === requestedPriorityResources.length) ? 20 : 40;
            if (resourceScore > cap) {
              resourceScore = cap;
            }
          }
        }

        // 3. DOCTOR / SPECIALIST MATCHING
        const hospDoctors = allDoctors.filter((d) => d.hospitalId === h.id);
        const requiredSpecs = getRequiredDoctorSpecialties(input.emergencyType);

        let doctorScore = 0;
        let matchedDoctor = null;

        const specOnEmergencyDuty = hospDoctors.find(
          (d) =>
            isSpecialistMatch(d.specialty, requiredSpecs) &&
            (d.status === 'Available' || d.status === 'On Call') &&
            d.emergencyDuty
        );

        if (specOnEmergencyDuty) {
          doctorScore = 100;
          matchedDoctor = specOnEmergencyDuty;
        } else {
          const specAvailable = hospDoctors.find(
            (d) =>
              isSpecialistMatch(d.specialty, requiredSpecs) &&
              (d.status === 'Available' || d.status === 'On Call')
          );
          if (specAvailable) {
            doctorScore = 75;
            matchedDoctor = specAvailable;
          } else {
            const relatedSpecAvailable = hospDoctors.find(
              (d) =>
                (d.status === 'Available' || d.status === 'On Call') &&
                (d.specialty.toLowerCase().includes('emergency') ||
                  d.specialty.toLowerCase().includes('trauma') ||
                  d.specialty.toLowerCase().includes('critical care') ||
                  d.specialty.toLowerCase().includes('surgery') ||
                  d.specialty.toLowerCase().includes('medicine') ||
                  d.emergencyDuty)
            );
            if (relatedSpecAvailable) {
              doctorScore = 40;
              matchedDoctor = relatedSpecAvailable;
            } else {
              doctorScore = 0;
              matchedDoctor = hospDoctors.find((d) => d.status === 'Available') || hospDoctors[0] || null;
            }
          }
        }

        // 4. HOSPITAL READINESS
        let readinessScore = h.readinessScore || 75;
        readinessScore = Math.max(0, Math.min(100, readinessScore));
        let readinessMultiplier = 1.0;
        if (h.emergencyStatus === 'Operational') {
          readinessMultiplier = 1.0;
        } else if (h.emergencyStatus === 'Limited') {
          readinessMultiplier = 0.3;
        }
        const readinessScoreScaled = readinessScore * readinessMultiplier;

        // COMBINED SCORE CALCULATION
        // Weights: Distance (20%), Resources (40%), Doctor (25%), Readiness (15%)
        let combinedScore = 
          distanceScore * 0.20 +
          resourceScore * 0.40 +
          doctorScore * 0.25 +
          readinessScoreScaled * 0.15;

        // Apply penalty if ALL priority resources requested are missing/unavailable
        if (requestedPriorityResources.length > 0 && missingPriorityCount === requestedPriorityResources.length) {
          combinedScore -= 30;
        }

        // Clamp combinedScore to be non-negative (0 - 100)
        combinedScore = Math.max(0, Math.min(100, combinedScore));

        const isClinicallyEligible = !(requestedPriorityResources.length > 0 && missingPriorityCount === requestedPriorityResources.length);

        console.log('📊 RECOMMENDATION SCORE DEBUG', {
          hospital: h.name,
          emergencyType: input.emergencyType,
          userLocation: { lat: input.lat, lng: input.lng },
          hospitalLocation: { lat: h.lat, lng: h.lng },
          distanceKm,
          distanceScore,
          resourceScore,
          doctorScore,
          readinessScore,
          readinessScoreScaled,
          combinedScore,
          eligible: isClinicallyEligible,
          matchedResources,
          missingPriorityCount,
        });

        // Round and clamp to 0-100
        const matchScore = Math.max(0, Math.min(100, Math.round(combinedScore)));

        // REASONS GENERATION
        const reasonParts: string[] = [];
        const reasonTags: string[] = [];

        if (matchedDoctor && doctorScore > 0) {
          if (doctorScore === 100) {
            reasonParts.push(`Specialist ${matchedDoctor.name} (${matchedDoctor.specialty}) is on emergency duty`);
            reasonTags.push("Emergency Specialist On Duty");
          } else if (doctorScore === 75) {
            reasonParts.push(`Specialist ${matchedDoctor.name} (${matchedDoctor.specialty}) is available`);
          } else if (doctorScore === 40) {
            reasonParts.push(`Related specialist ${matchedDoctor.name} (${matchedDoctor.specialty}) is available`);
          }
        } else {
          reasonParts.push("No specialist available");
        }

        if (requiredResources.length > 0) {
          const reqCount = requiredResources.length;
          const matchedCount = matchedResources.length;
          if (matchedCount === reqCount && reqCount > 0) {
            reasonParts.push("all required resources are available");
            reasonTags.push("Required Resources Available");
          } else if (matchedCount > 0) {
            reasonParts.push(`${matchedCount} of ${reqCount} required resources available`);
          } else {
            reasonParts.push("no required resources available");
          }
        }

        reasonParts.push(`${distanceKm} km away`);
        reasonParts.push(`estimated travel time is ${estimatedTravelTimeMin} mins`);
        if (estimatedTravelTimeMin <= 15) {
          reasonTags.push("Fast Estimated Travel");
        }

        reasonParts.push(`hospital readiness is ${h.readinessScore || 75}%`);
        if (h.emergencyStatus === 'Operational') {
          reasonTags.push("Operational Hospital");
        }

        const reason = reasonParts.map((p, idx) => idx === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join(', ') + '.';

        const missingRequiredResources = requestedPriorityResources.filter(
          (p) => !getSafeResourceAvailability(hospResources.find((r) => r.resourceType === p)).isAvailable
        );

        return {
          id: `rec-${Date.now()}-${h.id}`,
          requestId,
          hospitalId: h.id,
          hospitalName: h.name,
          matchScore,
          matchedResources,
          distanceKm,
          estimatedTravelTimeMin,
          reason,
          reasonTags,
          isClinicallyEligible,
          availableRequiredResources: matchedResources,
          missingRequiredResources,
          specialistAvailable: doctorScore > 0,
          readinessScore: h.readinessScore || 0,
          distanceScore,
          resourceScore: Math.round(resourceScore),
          hospitalReadiness: h.readinessScore || 0,
        };
      });

    const recommendations = await Promise.all(recommendationPromises);

    // SORT RECOMMENDATIONS
    recommendations.sort((a, b) => {
      if (a.isClinicallyEligible !== b.isClinicallyEligible) {
        return a.isClinicallyEligible ? -1 : 1;
      }
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      return (b as any).hospitalReadiness - (a as any).hospitalReadiness;
    });

    if (recommendations.length > 0) {
      const top = recommendations[0];
      if (!top.reasonTags) {
        top.reasonTags = [];
      }
      top.reasonTags.unshift('Closest Suitable Hospital');

      if (!top.isClinicallyEligible) {
        top.reason = 'No nearby hospital has all required emergency resources; this is the best available option. ' + top.reason;
      }
    }

    return recommendations.map(({ hospitalReadiness, ...rest }: any) => rest);
  }
}
