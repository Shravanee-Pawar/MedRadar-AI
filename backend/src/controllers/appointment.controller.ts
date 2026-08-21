import { Request, Response } from "express";
import { AppointmentRepository } from "../repositories/appointment.repository";

const appointmentRepository = new AppointmentRepository();

export const getAllAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const appointments = await appointmentRepository.findAll();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const appointment = await appointmentRepository.findById(
      req.params.appointmentId
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
};

export const getAppointmentsByUser = async (
  req: Request,
  res: Response
) => {
  try {
    const appointments = await appointmentRepository.findByUserId(
      req.params.userId
    );

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user appointments" });
  }
};

export const getAppointmentsByDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const appointments = await appointmentRepository.findByDoctorId(
      req.params.doctorId
    );

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctor appointments" });
  }
};

export const createAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const appointment = await appointmentRepository.create(req.body);

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create appointment" });
  }
};

export const updateAppointmentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const appointment = await appointmentRepository.updateStatus(
      req.params.appointmentId,
      req.body.status
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update appointment status" });
  }
};