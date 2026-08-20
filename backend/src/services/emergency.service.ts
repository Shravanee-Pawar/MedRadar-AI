import { emergencyRepository } from '../repositories/emergency.repository.js';
import { hospitalRepository } from '../repositories/hospital.repository.js';
import { RecommendationService, Recommendation } from './recommendation.service.js';
import {
  EmergencyRequest,
  EmergencyRequestStatus,
  EmergencyCoordinationStatus,
  EmergencyPriority,
} from '../interfaces/emergency.interface.js';

export class EmergencyService {
  public static async triggerSos(data: {
    patientId?: string;
    patientName?: string;
    emergencyType: string;
    location: string;
    locationAddress?: string;
    lat: number;
    lng: number;
    locationType?: 'current_gps' | 'manual';
    requiredResources?: string[];
  }): Promise<{ emergencyRequest: EmergencyRequest; recommendations: Recommendation[] }> {
    if (!data.lat || !data.lng || !data.emergencyType) {
      const error: any = new Error('Latitude, longitude, and emergencyType are required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    let priority: EmergencyPriority = 'Urgent';
    if (['Road Accident / Poly-Trauma', 'Cardiac Emergency', 'Stroke / Neurological Trauma', 'Critical Bleeding'].includes(data.emergencyType)) {
      priority = 'Critical';
    }

    const emergencyRequest = await emergencyRepository.create({
      patientId: data.patientId || 'guest-patient',
      patientName: data.patientName || 'Emergency Patient',
      emergencyType: data.emergencyType,
      priority,
      location: data.location || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
      locationAddress: data.locationAddress || data.location,
      lat: data.lat,
      lng: data.lng,
      locationType: data.locationType || 'current_gps',
      requiredResources: data.requiredResources || ['ICU Bed', 'Ventilator'],
      status: 'Active',
      coordinationStatus: 'New',
    });

    // Call Recommendation Engine (Pluggable Interface)
    const hospitals = await hospitalRepository.findAll({ verified: true });
    const recommendations = await RecommendationService.getRecommendations(
      emergencyRequest.id,
      {
        emergencyType: data.emergencyType,
        lat: data.lat,
        lng: data.lng,
        requiredResources: data.requiredResources || [],
      },
      hospitals
    );

    return {
      emergencyRequest,
      recommendations,
    };
  }

  public static async getRequests(filters?: { hospitalId?: string; status?: EmergencyRequestStatus; patientId?: string }): Promise<EmergencyRequest[]> {
    return emergencyRepository.findAll(filters);
  }

  public static async getRequestById(id: string): Promise<EmergencyRequest> {
    const request = await emergencyRepository.findById(id);
    if (!request) {
      const error: any = new Error(`Emergency request '${id}' not found`);
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }
    return request;
  }

  public static async sendPreAlert(data: {
    requestId: string;
    hospitalId: string;
    patientPhone: string;
    etaMin?: number;
  }): Promise<EmergencyRequest> {
    const hospital = await hospitalRepository.findById(data.hospitalId);
    if (!hospital) {
      const error: any = new Error(`Hospital '${data.hospitalId}' not found`);
      error.statusCode = 404;
      error.code = 'HOSPITAL_NOT_FOUND';
      throw error;
    }

    const updated = await emergencyRepository.updatePreAlert(
      data.requestId,
      data.hospitalId,
      hospital.name,
      data.patientPhone,
      data.etaMin || 15
    );

    if (!updated) {
      const error: any = new Error(`Emergency request '${data.requestId}' not found`);
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    return updated;
  }

  public static async acknowledgePreAlert(id: string, adminName: string): Promise<EmergencyRequest> {
    const updated = await emergencyRepository.acknowledge(id, adminName);
    if (!updated) {
      const error: any = new Error(`Emergency request '${id}' not found`);
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }
    return updated;
  }

  public static async coordinateTriage(
    id: string,
    data: {
      assignedDoctorName?: string;
      assignedIcuBed?: string;
      assignedVentilator?: string;
      assignedEmergencyBed?: string;
      ambulanceNumber?: string;
      coordinationStatus: EmergencyCoordinationStatus;
    }
  ): Promise<EmergencyRequest> {
    const updated = await emergencyRepository.coordinate(id, data);
    if (!updated) {
      const error: any = new Error(`Emergency request '${id}' not found`);
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }
    return updated;
  }
}
