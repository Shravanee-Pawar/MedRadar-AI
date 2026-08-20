import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service.js';
import { DoctorStatus } from '../interfaces/doctor.interface.js';

export class DoctorController {
  public static getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, specialty, status, emergencyDuty } = req.query;
      const isEmergency = emergencyDuty !== undefined ? emergencyDuty === 'true' : undefined;

      const doctors = await DoctorService.getAllDoctors({
        hospitalId: hospitalId as string,
        specialty: specialty as string,
        status: status as DoctorStatus,
        emergencyDuty: isEmergency,
      });

      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.getDoctorById(id);

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  };

  public static addDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, name, specialty, qualification, experienceYears, status, emergencyDuty, image, contact } = req.body;

      if (!hospitalId || !name || !specialty || experienceYears === undefined) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Hospital ID, name, specialty, and experience years are required',
          },
        });
        return;
      }

      const doctor = await DoctorService.addDoctor({
        hospitalId,
        name,
        specialty,
        qualification,
        experienceYears,
        status,
        emergencyDuty,
        image,
        contact,
      });

      res.status(201).json({
        success: true,
        message: 'Doctor added to roster successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateRoster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, emergencyDuty } = req.body;

      if (!status || emergencyDuty === undefined) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status and emergencyDuty (boolean) are required',
          },
        });
        return;
      }

      const doctor = await DoctorService.updateRoster(id, status as DoctorStatus, Boolean(emergencyDuty));

      res.status(200).json({
        success: true,
        message: 'Doctor shift roster updated successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  };
}
