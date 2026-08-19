export type DoctorStatus = 'Available' | 'On Call' | 'Off Duty' | 'Unavailable';

export interface Doctor {
  id: string;
  doctorId: string;
  hospitalId: string;
  name: string;
  specialty: string;
  qualification?: string;
  experienceYears: number;
  status: DoctorStatus;
  emergencyDuty: boolean;
  image: string;
  contact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorRepository {
  findAll(filters?: { hospitalId?: string; specialty?: string; status?: DoctorStatus; emergencyDuty?: boolean }): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
  create(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor>;
  updateRoster(id: string, status: DoctorStatus, emergencyDuty: boolean): Promise<Doctor | null>;
}
