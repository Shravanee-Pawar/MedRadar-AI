import {
  EmergencyRequest,
  EmergencyRepository,
  EmergencyRequestStatus,
  EmergencyCoordinationStatus,
} from '../interfaces/emergency.interface.js';

class MockEmergencyRepository implements EmergencyRepository {
  private requests: EmergencyRequest[] = [];

  async findAll(filters?: { hospitalId?: string; status?: EmergencyRequestStatus; patientId?: string }): Promise<EmergencyRequest[]> {
    let result = [...this.requests];
    if (filters) {
      if (filters.hospitalId) {
        result = result.filter((r) => r.selectedHospitalId === filters.hospitalId);
      }
      if (filters.status) {
        result = result.filter((r) => r.status === filters.status);
      }
      if (filters.patientId) {
        result = result.filter((r) => r.patientId === filters.patientId);
      }
    }
    return result;
  }

  async findById(id: string): Promise<EmergencyRequest | null> {
    const req = this.requests.find((r) => r.id === id);
    return req || null;
  }

  async create(data: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<EmergencyRequest> {
    const now = new Date().toISOString();
    const newRequest: EmergencyRequest = {
      ...data,
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      timeline: [
        {
          title: 'Emergency SOS Broadcasted',
          timestamp: now,
          note: `SOS callout for ${data.emergencyType} initiated`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.requests.push(newRequest);
    return newRequest;
  }

  async updatePreAlert(
    id: string,
    hospitalId: string,
    hospitalName: string,
    patientPhone: string,
    etaMin: number
  ): Promise<EmergencyRequest | null> {
    const req = await this.findById(id);
    if (!req) return null;

    const now = new Date().toISOString();
    req.selectedHospitalId = hospitalId;
    req.selectedHospitalName = hospitalName;
    req.patientPhone = patientPhone;
    req.ambulanceEtaMin = etaMin;
    req.status = 'Dispatched';
    req.hospitalAlertStatus = 'pending';
    req.hospitalAlertTime = now;
    req.updatedAt = now;
    req.timeline.push({
      title: 'Pre-Alert Sent to Hospital',
      timestamp: now,
      note: `Pre-alert transmitted to ${hospitalName} (ETA ~${etaMin} mins)`,
    });

    return req;
  }

  async acknowledge(id: string, adminName: string): Promise<EmergencyRequest | null> {
    const req = await this.findById(id);
    if (!req) return null;

    const now = new Date().toISOString();
    req.status = 'Acknowledged';
    req.coordinationStatus = 'Acknowledged';
    req.hospitalAlertStatus = 'acknowledged';
    req.updatedAt = now;
    req.timeline.push({
      title: 'Hospital Acknowledged Pre-Alert',
      timestamp: now,
      note: `Triage team notified by ${adminName}`,
    });

    return req;
  }

  async coordinate(
    id: string,
    data: {
      assignedDoctorName?: string;
      assignedIcuBed?: string;
      assignedVentilator?: string;
      assignedEmergencyBed?: string;
      ambulanceNumber?: string;
      coordinationStatus: EmergencyCoordinationStatus;
    }
  ): Promise<EmergencyRequest | null> {
    const req = await this.findById(id);
    if (!req) return null;

    const now = new Date().toISOString();
    if (data.assignedDoctorName) req.assignedDoctorName = data.assignedDoctorName;
    if (data.assignedIcuBed) req.assignedIcuBed = data.assignedIcuBed;
    if (data.assignedVentilator) req.assignedVentilator = data.assignedVentilator;
    if (data.assignedEmergencyBed) req.assignedEmergencyBed = data.assignedEmergencyBed;
    if (data.ambulanceNumber) req.ambulanceNumber = data.ambulanceNumber;
    req.coordinationStatus = data.coordinationStatus;
    req.updatedAt = now;

    req.timeline.push({
      title: `Triage Coordination: ${data.coordinationStatus}`,
      timestamp: now,
      note: `Resources reserved by triage team`,
    });

    return req;
  }
}

export const emergencyRepository: EmergencyRepository = new MockEmergencyRepository();
