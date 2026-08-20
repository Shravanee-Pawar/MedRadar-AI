import { Request, Response, NextFunction } from 'express';
import { EmergencyService } from '../services/emergency.service.js';
import { EmergencyRequestStatus, EmergencyCoordinationStatus } from '../interfaces/emergency.interface.js';

export class EmergencyController {
  public static triggerSos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { emergencyType, location, locationAddress, lat, lng, locationType } = req.body;

      if (!emergencyType || lat === undefined || lng === undefined) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'emergencyType, lat, and lng are required',
          },
        });
        return;
      }

      const patientId = req.user ? req.user.id : undefined;

      const result = await EmergencyService.triggerSos({
        patientId,
        emergencyType,
        location,
        locationAddress,
        lat: Number(lat),
        lng: Number(lng),
        locationType,
      });

      res.status(201).json({
        success: true,
        message: 'Emergency SOS request broadcasted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, status, patientId } = req.query;
      const requests = await EmergencyService.getRequests({
        hospitalId: hospitalId as string,
        status: status as EmergencyRequestStatus,
        patientId: patientId as string,
      });

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await EmergencyService.getRequestById(id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  public static sendPreAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { hospitalId, patientPhone, etaMin } = req.body;

      if (!hospitalId || !patientPhone) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'hospitalId and patientPhone are required',
          },
        });
        return;
      }

      const request = await EmergencyService.sendPreAlert({
        requestId: id,
        hospitalId,
        patientPhone,
        etaMin: etaMin ? Number(etaMin) : 15,
      });

      res.status(200).json({
        success: true,
        message: 'Pre-alert transmitted to hospital triage team',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  public static acknowledgePreAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adminName = req.user ? req.user.email : 'Hospital Triage Team';

      const request = await EmergencyService.acknowledgePreAlert(id, adminName);
      res.status(200).json({
        success: true,
        message: 'Emergency pre-alert acknowledged by hospital',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  public static coordinateTriage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { assignedDoctorName, assignedIcuBed, assignedVentilator, assignedEmergencyBed, ambulanceNumber, coordinationStatus } = req.body;

      if (!coordinationStatus) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'coordinationStatus is required',
          },
        });
        return;
      }

      const request = await EmergencyService.coordinateTriage(id, {
        assignedDoctorName,
        assignedIcuBed,
        assignedVentilator,
        assignedEmergencyBed,
        ambulanceNumber,
        coordinationStatus: coordinationStatus as EmergencyCoordinationStatus,
      });

      res.status(200).json({
        success: true,
        message: 'Emergency triage resources assigned successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };
}
