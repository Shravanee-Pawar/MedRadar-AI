import { doctorRepository } from '../repositories/doctor.repository.js';
import { Doctor, DoctorStatus } from '../interfaces/doctor.interface.js';

export class DoctorService {
  public static async getAllDoctors(filters?: {
    hospitalId?: string;
    specialty?: string;
    status?: DoctorStatus;
    emergencyDuty?: boolean;
  }): Promise<Doctor[]> {
    return doctorRepository.findAll(filters);
  }

  public static async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) {
      const error: any = new Error(`Doctor with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'DOCTOR_NOT_FOUND';
      throw error;
    }
    return doctor;
  }

  public static async addDoctor(data: {
    doctorId?: string;
    hospitalId: string;
    name: string;
    specialty: string;
    qualification?: string;
    experienceYears: number;
    status?: DoctorStatus;
    emergencyDuty?: boolean;
    image?: string;
    contact?: string;
  }): Promise<Doctor> {
    return doctorRepository.create({
      doctorId: data.doctorId || `DOC-RAT-${Math.floor(100 + Math.random() * 900)}`,
      hospitalId: data.hospitalId,
      name: data.name,
      specialty: data.specialty,
      qualification: data.qualification,
      experienceYears: data.experienceYears,
      status: data.status || 'Available',
      emergencyDuty: data.emergencyDuty !== undefined ? data.emergencyDuty : true,
      image: data.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
      contact: data.contact,
    });
  }

  public static async updateRoster(id: string, status: DoctorStatus, emergencyDuty: boolean): Promise<Doctor> {
    const updated = await doctorRepository.updateRoster(id, status, emergencyDuty);
    if (!updated) {
      const error: any = new Error(`Doctor with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'DOCTOR_NOT_FOUND';
      throw error;
    }
    return updated;
  }
}
