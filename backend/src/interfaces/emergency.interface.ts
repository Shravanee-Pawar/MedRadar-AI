export type EmergencyPriority = 'Critical' | 'Urgent' | 'Routine';
export type EmergencyRequestStatus = 'Active' | 'Dispatched' | 'Acknowledged' | 'En Route' | 'Arrived' | 'Resolved';
export type EmergencyCoordinationStatus = 'New' | 'Acknowledged' | 'Preparing' | 'Ready' | 'Closed';

export interface EmergencyTimelineEvent {
  title: string;
  timestamp: string;
  note?: string;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  emergencyType: string;
  priority: EmergencyPriority;
  location: string;
  locationAddress?: string;
  lat: number;
  lng: number;
  locationType: 'current_gps' | 'manual';
  requiredResources: string[];
  status: EmergencyRequestStatus;
  coordinationStatus: EmergencyCoordinationStatus;
  selectedHospitalId?: string;
  selectedHospitalName?: string;
  assignedDoctorName?: string;
  assignedIcuBed?: string;
  assignedVentilator?: string;
  assignedEmergencyBed?: string;
  ambulanceId?: string;
  ambulanceNumber?: string;
  ambulanceEtaMin?: number;
  hospitalAlertStatus?: 'pending' | 'acknowledged';
  hospitalAlertTime?: string;
  patientPhone?: string;
  timeline: EmergencyTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyRepository {
  findAll(filters?: { hospitalId?: string; status?: EmergencyRequestStatus; patientId?: string }): Promise<EmergencyRequest[]>;
  findById(id: string): Promise<EmergencyRequest | null>;
  create(data: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<EmergencyRequest>;
  updatePreAlert(
    id: string,
    hospitalId: string,
    hospitalName: string,
    patientPhone: string,
    etaMin: number
  ): Promise<EmergencyRequest | null>;
  acknowledge(id: string, adminName: string): Promise<EmergencyRequest | null>;
  coordinate(
    id: string,
    data: {
      assignedDoctorName?: string;
      assignedIcuBed?: string;
      assignedVentilator?: string;
      assignedEmergencyBed?: string;
      ambulanceNumber?: string;
      coordinationStatus: EmergencyCoordinationStatus;
    }
  ): Promise<EmergencyRequest | null>;
}
