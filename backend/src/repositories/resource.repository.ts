import { HospitalResource, ResourceRepository, ResourceType } from '../interfaces/resource.interface.js';

class MockResourceRepository implements ResourceRepository {
  private resources: HospitalResource[] = [];

  constructor() {
    this.seedResources();
  }

  private seedResources(): void {
    const now = new Date().toISOString();
    this.resources = [
      {
        id: 'res-001-icu',
        hospitalId: 'hosp-001',
        resourceType: 'icu_beds',
        resourceName: 'ICU Beds',
        total: 20,
        available: 4,
        occupied: 14,
        reserved: 2,
        status: 'Available',
        updatedAt: now,
        updatedBy: 'Dr. Suresh Patil',
      },
      {
        id: 'res-001-gen',
        hospitalId: 'hosp-001',
        resourceType: 'general_beds',
        resourceName: 'General Ward Beds',
        total: 150,
        available: 35,
        occupied: 110,
        reserved: 5,
        status: 'Available',
        updatedAt: now,
        updatedBy: 'Dr. Suresh Patil',
      },
      {
        id: 'res-001-vent',
        hospitalId: 'hosp-001',
        resourceType: 'ventilators',
        resourceName: 'Mechanical Ventilators',
        total: 12,
        available: 3,
        occupied: 8,
        reserved: 1,
        status: 'Available',
        updatedAt: now,
        updatedBy: 'Dr. Suresh Patil',
      },
      {
        id: 'res-001-oxy',
        hospitalId: 'hosp-001',
        resourceType: 'oxygen_kl',
        resourceName: 'Liquid Medical Oxygen',
        total: 50,
        available: 38,
        occupied: 12,
        reserved: 0,
        unit: 'KL',
        status: 'Available',
        updatedAt: now,
        updatedBy: 'Dr. Suresh Patil',
      },
    ];
  }

  async findByHospitalId(hospitalId: string): Promise<HospitalResource[]> {
    return this.resources.filter((r) => r.hospitalId === hospitalId);
  }

  async findByHospitalAndType(hospitalId: string, resourceType: ResourceType): Promise<HospitalResource | null> {
    const resource = this.resources.find(
      (r) => r.hospitalId === hospitalId && r.resourceType === resourceType
    );
    return resource || null;
  }

  async upsertResource(resourceData: Omit<HospitalResource, 'id' | 'updatedAt'>): Promise<HospitalResource> {
    const existingIndex = this.resources.findIndex(
      (r) => r.hospitalId === resourceData.hospitalId && r.resourceType === resourceData.resourceType
    );

    const updatedRecord: HospitalResource = {
      ...resourceData,
      id: existingIndex >= 0 ? this.resources[existingIndex].id : `res-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.resources[existingIndex] = updatedRecord;
    } else {
      this.resources.push(updatedRecord);
    }

    return updatedRecord;
  }
}

export const resourceRepository: ResourceRepository = new MockResourceRepository();
