export type TransferStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'In Transit'
  | 'Received'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface TransferRequest {
  id: string;
  patientReference: string;
  sendingHospitalId: string;
  sendingHospitalName: string;
  receivingHospitalId: string;
  receivingHospitalName: string;
  priority: 'Critical' | 'Urgent' | 'Routine';
  requiredDepartment: string;
  requiredSpecialist?: string;
  requiredResources: string[];
  bloodRequirement?: {
    bloodGroup: string;
    units: number;
  };
  assignedAmbulanceId?: string;
  assignedAmbulanceNumber?: string;
  status: TransferStatus;
  rejectionReason?: string;
  timeline: Array<{ title: string; timestamp: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRepository {
  findAll(filters?: { hospitalId?: string; status?: TransferStatus }): Promise<TransferRequest[]>;
  findById(id: string): Promise<TransferRequest | null>;
  create(data: Omit<TransferRequest, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>): Promise<TransferRequest>;
  updateStatus(id: string, status: TransferStatus, rejectionReason?: string, assignedAmbulanceId?: string): Promise<TransferRequest | null>;
}
