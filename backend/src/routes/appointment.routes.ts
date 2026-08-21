import { Router } from "express";

import {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUser,
  getAppointmentsByDoctor,
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/appointment.controller";

const router = Router();

router.get("/", getAllAppointments);

router.get("/:appointmentId", getAppointmentById);

router.get("/user/:userId", getAppointmentsByUser);

router.get("/doctor/:doctorId", getAppointmentsByDoctor);

router.post("/", createAppointment);

router.patch("/:appointmentId/status", updateAppointmentStatus);

export default router;