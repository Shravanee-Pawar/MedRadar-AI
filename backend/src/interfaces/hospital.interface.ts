export type HospitalType = 'Government' | 'Private' | 'Charitable';
export type EmergencyStatus = 'Operational' | 'Limited' | 'Critical';

export interface Hospital {
  id: string;
  name: string;
  registrationNumber: string;
  type: HospitalType;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyContact: string;
  verified: boolean;
  emergencyStatus: EmergencyStatus;
  readinessScore: number;
  updatedAt: string;
}

export interface HospitalRepository {
  findAll(filters?: { verified?: boolean; city?: string; search?: string }): Promise<Hospital[]>;
  findById(id: string): Promise<Hospital | null>;
  create(hospital: Omit<Hospital, 'id' | 'updatedAt'>): Promise<Hospital>;
  updateVerification(id: string, verified: boolean): Promise<Hospital | null>;
  updateReadinessScore(id: string, readinessScore: number, emergencyStatus?: EmergencyStatus): Promise<Hospital | null>;
}
