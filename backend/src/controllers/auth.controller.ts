import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  public static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
        return;
      }

      const result = await AuthService.login(email, password, role);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static registerPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, mobile, password, location } = req.body;
      if (!name || !email || !mobile || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name, email, mobile, and password are required',
          },
        });
        return;
      }

      const result = await AuthService.registerPatient({ name, email, mobile, password, location });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static registerHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminName, email, mobile, password, hospitalName } = req.body;
      if (!adminName || !email || !mobile || !password || !hospitalName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Admin name, email, mobile, password, and hospital name are required',
          },
        });
        return;
      }

      const result = await AuthService.registerHospital({ adminName, email, mobile, password, hospitalName });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public static logout = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  };
}
