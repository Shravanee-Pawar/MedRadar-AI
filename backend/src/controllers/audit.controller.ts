import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';

export class AuditController {
  public static getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { actorRole, limit } = req.query;
      const logs = await AuditService.getLogs({
        actorRole: actorRole as string,
        limit: limit ? Number(limit) : undefined,
      });

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };
}
