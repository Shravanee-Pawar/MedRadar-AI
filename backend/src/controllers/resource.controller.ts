import { Request, Response, NextFunction } from 'express';
import { ResourceService } from '../services/resource.service.js';
import { ResourceType } from '../interfaces/resource.interface.js';

export class ResourceController {
  public static getResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resources = await ResourceService.getHospitalResources(id);

      res.status(200).json({
        success: true,
        count: resources.length,
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, resourceType } = req.params;
      const { total, occupied, reserved, resourceName, unit } = req.body;

      if (occupied === undefined || typeof occupied !== 'number') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Occupied count (number) is required',
          },
        });
        return;
      }

      const updatedBy = req.user ? req.user.email : 'System Admin';

      const result = await ResourceService.updateResourceCapacity(
        id,
        resourceType as ResourceType,
        {
          total,
          occupied,
          reserved,
          resourceName,
          unit,
          updatedBy,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Resource telemetry updated successfully',
        data: result.resource,
        hospitalReadinessScore: result.readinessScore,
      });
    } catch (error) {
      next(error);
    }
  };
}
