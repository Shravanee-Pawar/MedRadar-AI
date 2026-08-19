export type AmbulanceType = 'Basic Life Support' | 'Advanced Life Support' | 'Patient Transport' | 'Neonatal Ambulance';
export type AmbulanceStatus = 'Available' | 'On Trip' | 'At Hospital' | 'Maintenance' | 'Offline';

export interface Ambulance {
  id: string;
  hospitalId: string;
  ambulanceNumber: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  equipment: string[];
  lastLocation: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface AmbulanceRepository {
  findAll(filters?: { hospitalId?: string; status?: AmbulanceStatus }): Promise<Ambulance[]>;
  findById(id: string): Promise<Ambulance | null>;
  create(ambulanceData: Omit<Ambulance, 'id' | 'updatedAt'>): Promise<Ambulance>;
  updateStatus(id: string, status: AmbulanceStatus, equipment?: string[]): Promise<Ambulance | null>;
}
