import { hospitalRepository } from '../repositories/hospital.repository.js';
import { Hospital } from '../interfaces/hospital.interface.js';

export class HospitalService {
  public static async getAllHospitals(filters?: { verified?: boolean; city?: string; search?: string }): Promise<Hospital[]> {
    return hospitalRepository.findAll(filters);
  }

  public static async getHospitalById(id: string): Promise<Hospital> {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      const error: any = new Error(`Hospital with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'HOSPITAL_NOT_FOUND';
      throw error;
    }
    return hospital;
  }

  public static async verifyHospital(id: string, action: 'approve' | 'reject'): Promise<Hospital> {
    const isApproved = action === 'approve';
    const updated = await hospitalRepository.updateVerification(id, isApproved);
    if (!updated) {
      const error: any = new Error(`Hospital with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'HOSPITAL_NOT_FOUND';
      throw error;
    }
    return updated;
  }
}
