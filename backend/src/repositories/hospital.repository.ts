import { Hospital, HospitalRepository, EmergencyStatus } from '../interfaces/hospital.interface.js';

class MockHospitalRepository implements HospitalRepository {
  private hospitals: Hospital[] = [];

  constructor() {
    this.seedHospitals();
  }

  private seedHospitals(): void {
    const now = new Date().toISOString();
    this.hospitals = [
      {
        id: 'hosp-001',
        name: 'District Civil Hospital Ratnagiri',
        registrationNumber: 'MAH-RAT-GOV-001',
        type: 'Government',
        address: 'Jail Road, Near Collector Office, Ratnagiri',
        city: 'Ratnagiri',
        state: 'Maharashtra',
        pinCode: '415612',
        lat: 16.988815341250817,
        lng: 73.29952265072917,
        phone: '02352-222301',
        emergencyContact: '02352-222302',
        verified: true,
        emergencyStatus: 'Operational',
        readinessScore: 92,
        updatedAt: now,
      },
      {
        id: 'hosp-002',
        name: 'Parkar Hospital & Research Centre',
        registrationNumber: 'MAH-RAT-PVT-002',
        type: 'Private',
        address: 'Salvi Stop, Maruti Mandir, Ratnagiri',
        city: 'Ratnagiri',
        state: 'Maharashtra',
        pinCode: '415639',
        lat: 16.99099918120001,
        lng: 73.31590084888047,
        phone: '02352-228400',
        emergencyContact: '02352-228401',
        verified: true,
        emergencyStatus: 'Operational',
        readinessScore: 88,
        updatedAt: now,
      },
      {
        id: 'hosp-003',
        name: 'Lifecare Super Speciality Hospital',
        registrationNumber: 'MAH-RAT-PVT-003',
        type: 'Private',
        address: 'Thiba Palace Road, Ratnagiri',
        city: 'Ratnagiri',
        state: 'Maharashtra',
        pinCode: '415612',
        lat: 17.532897563122496,
        lng: 73.50123879976523,
        phone: '02352-270100',
        emergencyContact: '02352-270101',
        verified: true,
        emergencyStatus: 'Operational',
        readinessScore: 85,
        updatedAt: now,
      },
      {
        id: 'hosp-004',
        name: 'Sub-District Hospital Chiplun',
        registrationNumber: 'MAH-RAT-GOV-004',
        type: 'Government',
        address: 'Mumbai-Goa Highway, Chiplun',
        city: 'Chiplun',
        state: 'Maharashtra',
        pinCode: '415605',
        lat: 17.49342908757692,
        lng: 73.50850249491809,
        phone: '02355-252100',
        emergencyContact: '02355-252101',
        verified: true,
        emergencyStatus: 'Limited',
        readinessScore: 74,
        updatedAt: now,
      },
      {
        id: 'hosp-005',
        name: 'B.K.L. Walawalkar Rural Medical College & Hospital',
        registrationNumber: 'MAH-RAT-CHR-005',
        type: 'Charitable',
        address: 'Kasarwadi, Dervan, Chiplun',
        city: 'Chiplun',
        state: 'Maharashtra',
        pinCode: '415606',
        lat: 17.3952995283262,
        lng: 73.54690935956242,
        phone: '02355-264100',
        emergencyContact: '02355-264101',
        verified: true,
        emergencyStatus: 'Operational',
        readinessScore: 95,
        updatedAt: now,
      },
    ];
  }

  async findAll(filters?: { verified?: boolean; city?: string; search?: string }): Promise<Hospital[]> {
    let result = [...this.hospitals];

    if (filters) {
      if (filters.verified !== undefined) {
        result = result.filter((h) => h.verified === filters.verified);
      }
      if (filters.city) {
        result = result.filter((h) => h.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (h) => h.name.toLowerCase().includes(query) || h.address.toLowerCase().includes(query)
        );
      }
    }

    return result;
  }

  async findById(id: string): Promise<Hospital | null> {
    const hospital = this.hospitals.find((h) => h.id === id);
    return hospital || null;
  }

  async create(hospitalData: Omit<Hospital, 'id' | 'updatedAt'>): Promise<Hospital> {
    const newHospital: Hospital = {
      ...hospitalData,
      id: `hosp-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.hospitals.push(newHospital);
    return newHospital;
  }

  async updateVerification(id: string, verified: boolean): Promise<Hospital | null> {
    const hospital = await this.findById(id);
    if (!hospital) return null;

    hospital.verified = verified;
    hospital.updatedAt = new Date().toISOString();
    return hospital;
  }

  async updateReadinessScore(id: string, readinessScore: number, emergencyStatus?: EmergencyStatus): Promise<Hospital | null> {
    const hospital = await this.findById(id);
    if (!hospital) return null;

    hospital.readinessScore = readinessScore;
    if (emergencyStatus) {
      hospital.emergencyStatus = emergencyStatus;
    }
    hospital.updatedAt = new Date().toISOString();
    return hospital;
  }
}

export const hospitalRepository: HospitalRepository = new MockHospitalRepository();
