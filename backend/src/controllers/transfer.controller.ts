import { Request, Response, NextFunction } from 'express';
import { TransferService } from '../services/transfer.service.js';
import { TransferStatus } from '../interfaces/transfer.interface.js';

export class TransferController {
  public static getTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hospitalId, status } = req.query;
      const transfers = await TransferService.getTransfers({
        hospitalId: hospitalId as string,
        status: status as TransferStatus,
      });

      res.status(200).json({
        success: true,
        count: transfers.length,
        data: transfers,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getTransferById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transfer = await TransferService.getTransferById(id);

      res.status(200).json({
        success: true,
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  };

  public static createTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        patientReference,
        sendingHospitalId,
        receivingHospitalId,
        priority,
        requiredDepartment,
        requiredSpecialist,
        requiredResources,
        bloodRequirement,
        assignedAmbulanceId,
        assignedAmbulanceNumber,
      } = req.body;

      if (!patientReference || !sendingHospitalId || !receivingHospitalId || !requiredDepartment) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'patientReference, sendingHospitalId, receivingHospitalId, and requiredDepartment are required',
          },
        });
        return;
      }

      const transfer = await TransferService.createTransfer({
        patientReference,
        sendingHospitalId,
        receivingHospitalId,
        priority,
        requiredDepartment,
        requiredSpecialist,
        requiredResources,
        bloodRequirement,
        assignedAmbulanceId,
        assignedAmbulanceNumber,
      });

      res.status(201).json({
        success: true,
        message: 'Patient transfer request initiated',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, rejectionReason, assignedAmbulanceId } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Transfer status is required',
          },
        });
        return;
      }

      const transfer = await TransferService.updateStatus(
        id,
        status as TransferStatus,
        rejectionReason,
        assignedAmbulanceId
      );

      res.status(200).json({
        success: true,
        message: 'Transfer status updated successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  };
}
