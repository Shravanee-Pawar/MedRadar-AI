import Appointment, { IAppointment } from "../models/appointments.models";

export class AppointmentRepository {
  async findAll(): Promise<IAppointment[]> {
    return Appointment.find();
  }

  async findById(appointmentId: string): Promise<IAppointment | null> {
    return Appointment.findOne({ appointmentId });
  }

  async findByUserId(userId: string): Promise<IAppointment[]> {
    return Appointment.find({ userId });
  }

  async findByDoctorId(doctorId: string): Promise<IAppointment[]> {
    return Appointment.find({ doctorId });
  }

  async create(
    appointmentData: Partial<IAppointment>
  ): Promise<IAppointment> {
    const appointment = new Appointment(appointmentData);
    return appointment.save();
  }

  async updateStatus(
    appointmentId: string,
    status: string
  ): Promise<IAppointment | null> {
    return Appointment.findOneAndUpdate(
      { appointmentId },
      { status },
      { new: true }
    );
  }

  async delete(appointmentId: string): Promise<IAppointment | null> {
    return Appointment.findOneAndDelete({ appointmentId });
  }
}

export const appointmentRepository = new AppointmentRepository();