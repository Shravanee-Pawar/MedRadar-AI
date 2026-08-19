import { db } from './db';
import { type Doctor } from '../types';

export const validateDoctorData = (doctors: Doctor[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  doctors.forEach((d, idx) => {
    // Unique ID check
    const id = d.doctorId || d.id;
    if (!id) {
      errors.push(`Doctor at index ${idx} is missing an ID.`);
    } else if (ids.has(id)) {
      errors.push(`Duplicate Doctor ID found: ${id}`);
    } else {
      ids.add(id);
    }

    // Unique Name check
    if (!d.name || d.name.trim() === '') {
      errors.push(`Doctor at index ${idx} has an empty name.`);
    } else if (names.has(d.name)) {
      errors.push(`Duplicate Doctor name found: "${d.name}"`);
    } else {
      names.add(d.name);
    }

    // Hospital ID check
    if (!d.hospitalId) {
      errors.push(`Doctor "${d.name}" is missing hospitalId.`);
    }

    // Department ID check
    if (!d.departmentId) {
      errors.push(`Doctor "${d.name}" is missing departmentId.`);
    }

    // Specialization check
    const spec = d.specialization || d.specialty;
    if (!spec) {
      errors.push(`Doctor "${d.name}" is missing specialization.`);
    }

    // Availability status check
    const status = d.availabilityStatus || d.status;
    if (!['Available', 'On Call', 'Unavailable', 'Off Duty'].includes(status)) {
      errors.push(`Doctor "${d.name}" has invalid status: ${status}`);
    }

    // Emergency duty check
    if (typeof d.emergencyDuty !== 'boolean') {
      errors.push(`Doctor "${d.name}" has invalid emergencyDuty value.`);
    }
  });

  if (errors.length > 0) {
    console.warn('[MedRadar AI — Doctor Data Validation Warnings]', errors);
  }

  return { valid: errors.length === 0, errors };
};

export const doctorService = {
  getDoctors: async (): Promise<Doctor[]> => {
    const list = db.getDoctors();
    validateDoctorData(list);
    return list;
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<Doctor[]> => {
    const list = db.getDoctors();
    return list.filter(d => d.hospitalId === hospitalId);
  },

  addDoctor: async (docData: Partial<Doctor> & Omit<Doctor, 'id' | 'image'>): Promise<Doctor> => {
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

    // Audit log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'hosp-admin',
      actorName: 'Hospital Admin',
      actorRole: 'hospital_admin',
      action: 'Add Doctor',
      entityType: 'Doctor',
      entityId: newDoc.id,
      details: `Added new doctor ${newDoc.name} to Roster`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);

    return newDoc;
  },

  updateDoctorRoster: async (
    doctorId: string,
    status: 'Available' | 'On Call' | 'Off Duty' | 'Unavailable',
    emergencyDuty: boolean
  ): Promise<void> => {
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

    const targetDoc = list.find(d => d.id === doctorId || d.doctorId === doctorId);

    // Audit log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'hosp-admin',
      actorName: 'Hospital Admin',
      actorRole: 'hospital_admin',
      action: 'Update Doctor Status',
      entityType: 'Doctor',
      entityId: doctorId,
      details: `Modified ${targetDoc?.name} status to ${status} (Emergency Duty: ${emergencyDuty ? 'ON' : 'OFF'})`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);
  }
};
