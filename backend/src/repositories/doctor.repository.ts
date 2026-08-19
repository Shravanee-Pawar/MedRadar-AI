import { Doctor, DoctorRepository, DoctorStatus } from '../interfaces/doctor.interface.js';

class MockDoctorRepository implements DoctorRepository {
  private doctors: Doctor[] = [];

  constructor() {
    this.seedDoctors();
  }

  private seedDoctors(): void {
    const now = new Date().toISOString();
    this.doctors = [
      {
        id: 'doc-001',
        doctorId: 'DOC-RAT-001',
        hospitalId: 'hosp-001',
        name: 'Dr. Nitin Kulkarni',
        specialty: 'Cardiology',
        qualification: 'MD, DM (Cardiology)',
        experienceYears: 16,
        status: 'Available',
        emergencyDuty: true,
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
        contact: '9822011223',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc-002',
        doctorId: 'DOC-RAT-002',
        hospitalId: 'hosp-001',
        name: 'Dr. Sneha Joshi',
        specialty: 'Neurosurgery',
        qualification: 'MS, MCh (Neurosurgery)',
        experienceYears: 12,
        status: 'On Call',
        emergencyDuty: true,
        image: 'https://images.unsplash.com/photo-1594824813566-88855ce78c8c',
        contact: '9822011224',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc-003',
        doctorId: 'DOC-RAT-003',
        hospitalId: 'hosp-001',
        name: 'Dr. Rajesh Shinde',
        specialty: 'Critical Care / Emergency Medicine',
        qualification: 'MD (Anaesthesia), IDCCM',
        experienceYears: 10,
        status: 'Available',
        emergencyDuty: true,
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7',
        contact: '9822011225',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc-004',
        doctorId: 'DOC-RAT-004',
        hospitalId: 'hosp-002',
        name: 'Dr. Anand Parkar',
        specialty: 'General Surgery & Trauma',
        qualification: 'MS (General Surgery)',
        experienceYears: 20,
        status: 'Available',
        emergencyDuty: true,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
        contact: '9822011226',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  async findAll(filters?: { hospitalId?: string; specialty?: string; status?: DoctorStatus; emergencyDuty?: boolean }): Promise<Doctor[]> {
    let result = [...this.doctors];

    if (filters) {
      if (filters.hospitalId) {
        result = result.filter((d) => d.hospitalId === filters.hospitalId);
      }
      if (filters.specialty) {
        result = result.filter((d) => d.specialty.toLowerCase().includes(filters.specialty!.toLowerCase()));
      }
      if (filters.status) {
        result = result.filter((d) => d.status === filters.status);
      }
      if (filters.emergencyDuty !== undefined) {
        result = result.filter((d) => d.emergencyDuty === filters.emergencyDuty);
      }
    }

    return result;
  }

  async findById(id: string): Promise<Doctor | null> {
    const doctor = this.doctors.find((d) => d.id === id);
    return doctor || null;
  }

  async create(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
    const now = new Date().toISOString();
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.doctors.push(newDoctor);
    return newDoctor;
  }

  async updateRoster(id: string, status: DoctorStatus, emergencyDuty: boolean): Promise<Doctor | null> {
    const doctor = await this.findById(id);
    if (!doctor) return null;

    doctor.status = status;
    doctor.emergencyDuty = emergencyDuty;
    doctor.updatedAt = new Date().toISOString();
    return doctor;
  }
}

export const doctorRepository: DoctorRepository = new MockDoctorRepository();
