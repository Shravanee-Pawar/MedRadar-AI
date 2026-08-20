import { resourceRepository } from '../repositories/resource.repository.js';
import { hospitalRepository } from '../repositories/hospital.repository.js';
import { HospitalResource, ResourceType, ResourceStatus } from '../interfaces/resource.interface.js';
import { EmergencyStatus } from '../interfaces/hospital.interface.js';

export class ResourceService {
  public static async getHospitalResources(hospitalId: string): Promise<HospitalResource[]> {
    return resourceRepository.findByHospitalId(hospitalId);
  }

  public static async updateResourceCapacity(
    hospitalId: string,
    resourceType: ResourceType,
    data: {
      total?: number;
      occupied: number;
      reserved?: number;
      resourceName?: string;
      unit?: string;
      updatedBy: string;
    }
  ): Promise<{ resource: HospitalResource; readinessScore: number }> {
    const existing = await resourceRepository.findByHospitalAndType(hospitalId, resourceType);

    const total = data.total !== undefined ? data.total : (existing ? existing.total : 0);
    const reserved = data.reserved !== undefined ? data.reserved : (existing ? existing.reserved : 0);
    const occupied = data.occupied;

    if (occupied + reserved > total) {
      const error: any = new Error(
        `Invalid resource count: Occupied (${occupied}) + Reserved (${reserved}) exceeds Total (${total})`
      );
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const available = total - occupied - reserved;

    let status: ResourceStatus = 'Available';
    if (available === 0) {
      status = 'Critical';
    } else if (available / total < 0.2) {
      status = 'Limited';
    }

    const resourceName = data.resourceName || (existing ? existing.resourceName : resourceType.replace('_', ' ').toUpperCase());

    const updatedResource = await resourceRepository.upsertResource({
      hospitalId,
      resourceType,
      resourceName,
      total,
      available,
      occupied,
      reserved,
      unit: data.unit || (existing ? existing.unit : undefined),
      status,
      updatedBy: data.updatedBy,
    });

    // Recalculate hospital readiness score dynamically
    const allResources = await resourceRepository.findByHospitalId(hospitalId);
    let totalScore = 0;
    let counted = 0;

    for (const r of allResources) {
      if (r.total > 0) {
        totalScore += (r.available / r.total) * 100;
        counted++;
      }
    }

    const readinessScore = counted > 0 ? Math.round(totalScore / counted) : 50;
    let emergencyStatus: EmergencyStatus = 'Operational';
    if (readinessScore < 30) {
      emergencyStatus = 'Critical';
    } else if (readinessScore < 60) {
      emergencyStatus = 'Limited';
    }

    await hospitalRepository.updateReadinessScore(hospitalId, readinessScore, emergencyStatus);

    return {
      resource: updatedResource,
      readinessScore,
    };
  }
}
