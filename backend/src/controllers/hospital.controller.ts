import { Request, Response, NextFunction } from 'express';
import { HospitalService } from '../services/hospital.service.js';

export class HospitalController {
  public static getHospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { verified, city, search } = req.query;
      const isVerified = verified !== undefined ? verified === 'true' : undefined;

      const hospitals = await HospitalService.getAllHospitals({
        verified: isVerified,
        city: city as string,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        count: hospitals.length,
        data: hospitals,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getHospitalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const hospital = await HospitalService.getHospitalById(id);

      res.status(200).json({
        success: true,
        data: hospital,
      });
    } catch (error) {
      next(error);
    }
  };

  public static verifyHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: "Action must be either 'approve' or 'reject'",
          },
        });
        return;
      }

      const hospital = await HospitalService.verifyHospital(id, action);
      res.status(200).json({
        success: true,
        message: `Hospital ${action}d successfully`,
        data: hospital,
      });
    } catch (error) {
      next(error);
    }
  };
}
