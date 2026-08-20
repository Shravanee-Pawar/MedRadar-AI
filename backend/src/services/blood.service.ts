import { bloodRepository } from '../repositories/blood.repository.js';
import { hospitalRepository } from '../repositories/hospital.repository.js';
import { BloodInventory, BloodRequest, BloodGroup, BloodRequestStatus } from '../interfaces/blood.interface.js';

export class BloodService {
  public static async getInventory(filters?: { hospitalId?: string; bloodGroup?: BloodGroup }): Promise<BloodInventory[]> {
    return bloodRepository.findInventory(filters);
  }

  public static async updateStock(
    hospitalId: string,
    bloodGroup: BloodGroup,
    unitsAvailable: number
  ): Promise<BloodInventory> {
    if (unitsAvailable < 0) {
      const error: any = new Error('Units available cannot be negative');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    return bloodRepository.updateInventory(hospitalId, bloodGroup, unitsAvailable);
  }

  public static async createRequest(data: {
    patientName: string;
    patientPhone: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    hospitalId: string;
  }): Promise<BloodRequest> {
    const hospital = await hospitalRepository.findById(data.hospitalId);
    if (!hospital) {
      const error: any = new Error(`Hospital with ID '${data.hospitalId}' not found`);
      error.statusCode = 404;
      error.code = 'HOSPITAL_NOT_FOUND';
      throw error;
    }

    return bloodRepository.createRequest({
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      bloodGroup: data.bloodGroup,
      unitsRequired: data.unitsRequired,
      hospitalId: data.hospitalId,
      hospitalName: hospital.name,
    });
  }

  public static async getRequests(filters?: { hospitalId?: string; status?: BloodRequestStatus }): Promise<BloodRequest[]> {
    return bloodRepository.findRequests(filters);
  }
}
