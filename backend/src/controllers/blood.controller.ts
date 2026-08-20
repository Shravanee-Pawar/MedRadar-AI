import { Request, Response, NextFunction } from 'express';
import { BloodService } from '../services/blood.service.js';
import { BloodGroup, BloodRequestStatus } from '../interfaces/blood.interface.js';

export class BloodController {
  public static getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, bloodGroup } = req.query;
      const inventory = await BloodService.getInventory({
        hospitalId: hospitalId as string,
        bloodGroup: bloodGroup as BloodGroup,
      });

      res.status(200).json({
        success: true,
        count: inventory.length,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, bloodGroup } = req.params;
      const { unitsAvailable } = req.body;

      if (unitsAvailable === undefined || typeof unitsAvailable !== 'number') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'unitsAvailable (number) is required',
          },
        });
        return;
      }

      const result = await BloodService.updateStock(
        hospitalId,
        bloodGroup as BloodGroup,
        unitsAvailable
      );

      res.status(200).json({
        success: true,
        message: 'Blood inventory stock updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientName, patientPhone, bloodGroup, unitsRequired, hospitalId } = req.body;

      if (!patientName || !patientPhone || !bloodGroup || !unitsRequired || !hospitalId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Patient name, phone, blood group, units required, and hospital ID are required',
          },
        });
        return;
      }

      const bloodRequest = await BloodService.createRequest({
        patientName,
        patientPhone,
        bloodGroup: bloodGroup as BloodGroup,
        unitsRequired: Number(unitsRequired),
        hospitalId,
      });

      res.status(201).json({
        success: true,
        message: 'Emergency blood reservation request created',
        data: bloodRequest,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, status } = req.query;
      const requests = await BloodService.getRequests({
        hospitalId: hospitalId as string,
        status: status as BloodRequestStatus,
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
}
