import { Request, Response, NextFunction } from 'express';
import { notificationRepository } from '../repositories/notification.repository.js';

export class AdminController {
  public static getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = req.query;
      const seedUsers = [
        { id: 'usr-patient-001', name: 'Rahul Sharma', email: 'patient@medradar.ai', mobile: '9876543210', role: 'patient', createdAt: new Date().toISOString() },
        { id: 'usr-hosp-admin-001', name: 'Dr. Suresh Patil', email: 'admin@civilhospital.ai', mobile: '9876543211', role: 'hospital_admin', hospitalId: 'hosp-001', createdAt: new Date().toISOString() },
        { id: 'usr-super-admin-001', name: 'District Health Officer', email: 'superadmin@medradar.ai', mobile: '9876543212', role: 'super_admin', createdAt: new Date().toISOString() },
      ];

      let result = seedUsers;
      if (role) {
        result = result.filter((u) => u.role === role);
      }

      res.status(200).json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static sendStaleReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { resourceName } = req.body;

      await notificationRepository.create({
        recipientId: id,
        type: 'Stale Data',
        title: 'Telemetry Refresh Ping',
        description: `District Health Office requested telemetry refresh for ${resourceName || 'ICU Beds / Oxygen'}.`,
        isCritical: true,
      });

      res.status(200).json({
        success: true,
        message: `Stale data reminder sent to hospital ${id}`,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getRegionalAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceTrendData = [
        { time: '00:00', icuPressure: 45, emergencies: 2, bloodDemand: 5 },
        { time: '04:00', icuPressure: 40, emergencies: 1, bloodDemand: 3 },
        { time: '08:00', icuPressure: 65, emergencies: 8, bloodDemand: 12 },
        { time: '12:00', icuPressure: 82, emergencies: 15, bloodDemand: 22 },
        { time: '16:00', icuPressure: 88, emergencies: 18, bloodDemand: 19 },
        { time: '20:00', icuPressure: 76, emergencies: 11, bloodDemand: 14 },
      ];

      res.status(200).json({
        success: true,
        data: {
          resourceTrendData,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
