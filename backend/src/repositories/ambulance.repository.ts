import { Ambulance, AmbulanceRepository, AmbulanceStatus } from '../interfaces/ambulance.interface.js';

class MockAmbulanceRepository implements AmbulanceRepository {
  private ambulances: Ambulance[] = [];

  constructor() {
    this.seedAmbulances();
  }

  private seedAmbulances(): void {
    const now = new Date().toISOString();
    this.ambulances = [
      {
        id: 'amb-001',
        hospitalId: 'hosp-001',
        ambulanceNumber: 'MH-08-AX-1081',
        type: 'Advanced Life Support',
        status: 'Available',
        equipment: ['Ventilator', 'Defibrillator', 'Liquid Oxygen', 'ECG Monitor', 'Suction Machine'],
        lastLocation: 'Civil Hospital Bay 1',
        lat: 16.9902,
        lng: 73.3120,
        updatedAt: now,
      },
      {
        id: 'amb-002',
        hospitalId: 'hosp-001',
        ambulanceNumber: 'MH-08-AX-1082',
        type: 'Basic Life Support',
        status: 'Available',
        equipment: ['Oxygen Cylinder', 'First Aid Kit', 'Stretcher'],
        lastLocation: 'Civil Hospital Main Gate',
        lat: 16.9905,
        lng: 73.3122,
        updatedAt: now,
      },
      {
        id: 'amb-003',
        hospitalId: 'hosp-002',
        ambulanceNumber: 'MH-08-BY-2044',
        type: 'Advanced Life Support',
        status: 'On Trip',
        equipment: ['Ventilator', 'Defibrillator', 'Oxygen'],
        lastLocation: 'Salvi Stop Junction',
        lat: 16.9970,
        lng: 73.3060,
        updatedAt: now,
      },
    ];
  }

  async findAll(filters?: { hospitalId?: string; status?: AmbulanceStatus }): Promise<Ambulance[]> {
    let result = [...this.ambulances];
    if (filters) {
      if (filters.hospitalId) {
        result = result.filter((a) => a.hospitalId === filters.hospitalId);
      }
      if (filters.status) {
        result = result.filter((a) => a.status === filters.status);
      }
    }
    return result;
  }

  async findById(id: string): Promise<Ambulance | null> {
    const ambulance = this.ambulances.find((a) => a.id === id);
    return ambulance || null;
  }

  async create(ambulanceData: Omit<Ambulance, 'id' | 'updatedAt'>): Promise<Ambulance> {
    const now = new Date().toISOString();
    const newAmbulance: Ambulance = {
      ...ambulanceData,
      id: `amb-${Date.now()}`,
      updatedAt: now,
    };
    this.ambulances.push(newAmbulance);
    return newAmbulance;
  }

  async updateStatus(id: string, status: AmbulanceStatus, equipment?: string[]): Promise<Ambulance | null> {
    const ambulance = await this.findById(id);
    if (!ambulance) return null;

    ambulance.status = status;
    if (equipment) {
      ambulance.equipment = equipment;
    }
    ambulance.updatedAt = new Date().toISOString();
    return ambulance;
  }
}

export const ambulanceRepository: AmbulanceRepository = new MockAmbulanceRepository();
