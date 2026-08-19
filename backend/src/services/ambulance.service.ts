import { ambulanceRepository } from '../repositories/ambulance.repository.js';
import { Ambulance, AmbulanceStatus, AmbulanceType } from '../interfaces/ambulance.interface.js';

export class AmbulanceService {
  public static async getAllAmbulances(filters?: { hospitalId?: string; status?: AmbulanceStatus }): Promise<Ambulance[]> {
    return ambulanceRepository.findAll(filters);
  }

  public static async getAmbulanceById(id: string): Promise<Ambulance> {
    const ambulance = await ambulanceRepository.findById(id);
    if (!ambulance) {
      const error: any = new Error(`Ambulance with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'AMBULANCE_NOT_FOUND';
      throw error;
    }
    return ambulance;
  }

  public static async addAmbulance(data: {
    hospitalId: string;
    ambulanceNumber: string;
    type: AmbulanceType;
    status?: AmbulanceStatus;
    equipment?: string[];
    lastLocation?: string;
    lat?: number;
    lng?: number;
  }): Promise<Ambulance> {
    return ambulanceRepository.create({
      hospitalId: data.hospitalId,
      ambulanceNumber: data.ambulanceNumber,
      type: data.type,
      status: data.status || 'Available',
      equipment: data.equipment || ['Oxygen Cylinder', 'First Aid Kit'],
      lastLocation: data.lastLocation || 'Hospital Station',
      lat: data.lat || 16.9902,
      lng: data.lng || 73.3120,
    });
  }

  public static async updateStatus(id: string, status: AmbulanceStatus, equipment?: string[]): Promise<Ambulance> {
    const updated = await ambulanceRepository.updateStatus(id, status, equipment);
    if (!updated) {
      const error: any = new Error(`Ambulance with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'AMBULANCE_NOT_FOUND';
      throw error;
    }
    return updated;
  }
}
