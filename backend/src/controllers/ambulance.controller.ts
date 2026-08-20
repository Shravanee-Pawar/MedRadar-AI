import { Request, Response, NextFunction } from 'express';
import { AmbulanceService } from '../services/ambulance.service.js';
import { AmbulanceStatus, AmbulanceType } from '../interfaces/ambulance.interface.js';

export class AmbulanceController {
  public static getAmbulances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, status } = req.query;
      const ambulances = await AmbulanceService.getAllAmbulances({
        hospitalId: hospitalId as string,
        status: status as AmbulanceStatus,
      });

      res.status(200).json({
        success: true,
        count: ambulances.length,
        data: ambulances,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getAmbulanceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const ambulance = await AmbulanceService.getAmbulanceById(id);

      res.status(200).json({
        success: true,
        data: ambulance,
      });
    } catch (error) {
      next(error);
    }
  };

  public static addAmbulance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, ambulanceNumber, type, status, equipment, lastLocation, lat, lng } = req.body;

      if (!hospitalId || !ambulanceNumber || !type) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Hospital ID, ambulance number, and type are required',
          },
        });
        return;
      }

      const ambulance = await AmbulanceService.addAmbulance({
        hospitalId,
        ambulanceNumber,
        type: type as AmbulanceType,
        status: status as AmbulanceStatus,
        equipment,
        lastLocation,
        lat,
        lng,
      });

      res.status(201).json({
        success: true,
        message: 'Ambulance added to fleet successfully',
        data: ambulance,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, equipment } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Ambulance status is required',
          },
        });
        return;
      }

      const ambulance = await AmbulanceService.updateStatus(id, status as AmbulanceStatus, equipment);

      res.status(200).json({
        success: true,
        message: 'Ambulance status updated successfully',
        data: ambulance,
      });
    } catch (error) {
      next(error);
    }
  };
}
