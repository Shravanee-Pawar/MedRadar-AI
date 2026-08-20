import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../interfaces/user.interface.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied: role '${req.user.role}' is not authorized to perform this action`,
        },
      });
      return;
    }

    next();
  };
};

export const requireHospitalAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required',
      },
    });
    return;
  }

  // Super admins can access any hospital
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  if (req.user.role === 'hospital_admin') {
    const targetHospitalId = req.params.hospitalId || req.params.id || req.body.hospitalId;
    if (req.user.hospitalId && req.user.hospitalId === targetHospitalId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied: hospital admins can only access their assigned hospital',
      },
    });
    return;
  }

  res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Access denied: insufficient permissions',
    },
  });
};
