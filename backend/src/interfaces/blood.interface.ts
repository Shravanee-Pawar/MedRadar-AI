export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type BloodRequestStatus = 'Pending' | 'Approved' | 'Collected' | 'Rejected';

export interface BloodInventory {
  id: string;
  hospitalId: string;
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  unitsReserved: number;
  updatedAt: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  patientPhone: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalId: string;
  hospitalName: string;
  status: BloodRequestStatus;
  createdAt: string;
}

export interface BloodRepository {
  findInventory(filters?: { hospitalId?: string; bloodGroup?: BloodGroup }): Promise<BloodInventory[]>;
  updateInventory(hospitalId: string, bloodGroup: BloodGroup, unitsAvailable: number): Promise<BloodInventory>;
  createRequest(data: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>): Promise<BloodRequest>;
  findRequests(filters?: { hospitalId?: string; status?: BloodRequestStatus }): Promise<BloodRequest[]>;
}
