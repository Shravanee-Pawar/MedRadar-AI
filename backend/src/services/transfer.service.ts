import { transferRepository } from '../repositories/transfer.repository.js';
import { hospitalRepository } from '../repositories/hospital.repository.js';
import { TransferRequest, TransferStatus } from '../interfaces/transfer.interface.js';

export class TransferService {
  public static async getTransfers(filters?: { hospitalId?: string; status?: TransferStatus }): Promise<TransferRequest[]> {
    return transferRepository.findAll(filters);
  }

  public static async getTransferById(id: string): Promise<TransferRequest> {
    const transfer = await transferRepository.findById(id);
    if (!transfer) {
      const error: any = new Error(`Transfer request '${id}' not found`);
      error.statusCode = 404;
      error.code = 'TRANSFER_NOT_FOUND';
      throw error;
    }
    return transfer;
  }

  public static async createTransfer(data: {
    patientReference: string;
    sendingHospitalId: string;
    receivingHospitalId: string;
    priority?: 'Critical' | 'Urgent' | 'Routine';
    requiredDepartment: string;
    requiredSpecialist?: string;
    requiredResources?: string[];
    bloodRequirement?: {
      bloodGroup: string;
      units: number;
    };
    assignedAmbulanceId?: string;
    assignedAmbulanceNumber?: string;
  }): Promise<TransferRequest> {
    const sendingHospital = await hospitalRepository.findById(data.sendingHospitalId);
    const receivingHospital = await hospitalRepository.findById(data.receivingHospitalId);

    if (!sendingHospital || !receivingHospital) {
      const error: any = new Error('Sending or receiving hospital ID is invalid');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return transferRepository.create({
      patientReference: data.patientReference,
      sendingHospitalId: data.sendingHospitalId,
      sendingHospitalName: sendingHospital.name,
      receivingHospitalId: data.receivingHospitalId,
      receivingHospitalName: receivingHospital.name,
      priority: data.priority || 'Urgent',
      requiredDepartment: data.requiredDepartment,
      requiredSpecialist: data.requiredSpecialist,
      requiredResources: data.requiredResources || ['ICU Bed'],
      bloodRequirement: data.bloodRequirement,
      assignedAmbulanceId: data.assignedAmbulanceId,
      assignedAmbulanceNumber: data.assignedAmbulanceNumber,
    });
  }

  public static async updateStatus(
    id: string,
    status: TransferStatus,
    rejectionReason?: string,
    assignedAmbulanceId?: string
  ): Promise<TransferRequest> {
    const updated = await transferRepository.updateStatus(id, status, rejectionReason, assignedAmbulanceId);
    if (!updated) {
      const error: any = new Error(`Transfer request '${id}' not found`);
      error.statusCode = 404;
      error.code = 'TRANSFER_NOT_FOUND';
      throw error;
    }
    return updated;
  }
}
