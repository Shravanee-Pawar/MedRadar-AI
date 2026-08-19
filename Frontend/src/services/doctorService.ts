import { db } from './db';
import { apiFetch } from './apiClient';
import { type Doctor } from '../types';

export const doctorService = {
  getDoctors: async (): Promise<Doctor[]> => {
    const remote = await apiFetch<Doctor[]>('/doctors');
    if (remote && Array.isArray(remote) && remote.length > 0) return remote;
    return db.getDoctors();
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<Doctor[]> => {
    const remote = await apiFetch<Doctor[]>(`/doctors?hospitalId=${hospitalId}`);
    if (remote && Array.isArray(remote) && remote.length > 0) return remote;
    const list = db.getDoctors();
    return list.filter(d => d.hospitalId === hospitalId);
  },

  addDoctor: async (docData: Partial<Doctor> & Omit<Doctor, 'id' | 'image'>): Promise<Doctor> => {
    const remote = await apiFetch<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(docData),
    });
    if (remote) return remote;

    const list = db.getDoctors();
    const ts = Date.now();
    const avatar = docData.profileImage || docData.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face';
    const spec = docData.specialization || docData.specialty || 'Emergency Medicine';
    const statusVal = docData.availabilityStatus || docData.status || 'Available';
    const expY = docData.experienceYears || parseInt(docData.experience || '5') || 5;

    const newDoc: Doctor = {
      ...docData,
      id: `doc-${ts}`,
      doctorId: docData.doctorId || `DOC-RAT-${ts}`,
      hospitalId: docData.hospitalId,
      hospitalName: docData.hospitalName || 'Hospital Partner',
      departmentId: docData.departmentId || `dept-${docData.hospitalId}-1`,
      name: docData.name,
      specialization: spec,
      specialty: spec,
      qualification: docData.qualification || 'MBBS, MD',
      experience: docData.experience || `${expY} years`,
      experienceYears: expY,
      availabilityStatus: statusVal as any,
      status: statusVal as any,
      emergencyDuty: docData.emergencyDuty ?? true,
      profileImage: avatar,
      image: avatar,
      consultationType: docData.consultationType || 'Hospital Visit',
      contact: docData.contact || 'Demo Contact',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newDoc);
    db.saveDoctors(list);
    return newDoc;
  },

  updateDoctorRoster: async (
    doctorId: string,
    status: 'Available' | 'On Call' | 'Off Duty' | 'Unavailable',
    emergencyDuty: boolean
  ): Promise<void> => {
    await apiFetch(`/doctors/${doctorId}/roster`, {
      method: 'PATCH',
      body: JSON.stringify({ status, emergencyDuty }),
    });

    const list = db.getDoctors();
    const updated = list.map(d => {
      if (d.id === doctorId || d.doctorId === doctorId) {
        return {
          ...d,
          status,
          availabilityStatus: status as any,
          emergencyDuty,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    db.saveDoctors(updated);
  }
};
