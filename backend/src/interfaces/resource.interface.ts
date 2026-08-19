export type ResourceType =
  | 'icu_beds'
  | 'general_beds'
  | 'emergency_capacity'
  | 'isolation_beds'
  | 'pediatric_beds'
  | 'ventilators'
  | 'oxygen_kl'
  | 'operating_theatres';

export type ResourceStatus = 'Available' | 'Limited' | 'Critical' | 'Stale';

export interface HospitalResource {
  id: string;
  hospitalId: string;
  resourceType: ResourceType;
  resourceName: string;
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  unit?: string;
  status: ResourceStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface ResourceRepository {
  findByHospitalId(hospitalId: string): Promise<HospitalResource[]>;
  findByHospitalAndType(hospitalId: string, resourceType: ResourceType): Promise<HospitalResource | null>;
  upsertResource(resourceData: Omit<HospitalResource, 'id' | 'updatedAt'>): Promise<HospitalResource>;
}
