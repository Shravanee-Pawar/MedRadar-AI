import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { apiFetch } from '../services/apiClient';
import { hospitalService } from '../services/hospitalService';
import { resourceService } from '../services/resourceService';
import { doctorService } from '../services/doctorService';
import { bloodService } from '../services/bloodService';
import { emergencyService } from '../services/emergencyService';
import { notificationService } from '../services/notificationService';
import {
  type User,
  type Hospital,
  type HospitalResource,
  type Doctor,
  type Ambulance,
  type BloodInventory,
  type EmergencyRequest,
  type Recommendation,
  type BloodRequest,
  type ResourceUpdate,
  type AuditLog,
  type Notification
} from '../types';

interface AppContextType {
  currentUser: User | null;
  hospitals: Hospital[];
  resources: HospitalResource[];
  doctors: Doctor[];
  ambulances: Ambulance[];
  bloodInventory: BloodInventory[];
  emergencyRequests: EmergencyRequest[];
  aiRecommendations: Recommendation[];
  bloodRequests: BloodRequest[];
  updateLogs: ResourceUpdate[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  login: (email: string, role: 'patient' | 'hospital_admin' | 'super_admin', password?: string) => Promise<boolean>;
  logout: () => void;
  registerPatient: (name: string, email: string, mobile: string, password?: string) => Promise<boolean>;
  registerHospital: (hospData: Omit<Hospital, 'id' | 'verified' | 'distanceFromUserKm' | 'readinessScore' | 'updatedAt'>) => Promise<void>;
  triggerSOS: (emergencyType: any, location: string, requiredResources: any[]) => Promise<void>;
  updateResource: (hospitalId: string, resourceType: string, newValue: number, reason?: string) => Promise<void>;
  updateDoctorStatus: (doctorId: string, status: 'Available' | 'On Call' | 'Off Duty', emergencyDuty: boolean) => Promise<void>;
  updateAmbulanceStatus: (ambulanceId: string, status: any, equipment: string[]) => Promise<void>;
  verifyHospital: (hospitalId: string, action: 'approve' | 'reject') => Promise<void>;
  sendStaleReminder: (hospitalId: string, resourceName: string) => Promise<void>;
  requestBlood: (bloodGroup: any, units: number, hospitalId: string) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<HospitalResource[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [bloodInventory, setBloodInventory] = useState<BloodInventory[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [updateLogs, setUpdateLogs] = useState<ResourceUpdate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshState = async () => {
    try {
      const [hospData, docData, bldData, notifData] = await Promise.all([
        hospitalService.getHospitals(),
        doctorService.getDoctors(),
        bloodService.getBloodInventory(),
        notificationService.getNotifications()
      ]);
      setHospitals(hospData);
      setDoctors(docData);
      setBloodInventory(bldData);
      setNotifications(notifData);
    } catch (_) {
      setHospitals(db.getHospitals());
      setDoctors(db.getDoctors());
      setBloodInventory(db.getBloodInventory());
      setNotifications(db.getNotifications());
    }

    setResources(db.getResources());
    setAmbulances(db.getAmbulances());
    setEmergencyRequests(db.getEmergencyRequests());
    setAiRecommendations(db.getRecommendations());
    setBloodRequests(db.getBloodRequests());
    setUpdateLogs(db.getResourceUpdates());
    setAuditLogs(db.getAuditLogs());
  };

  useEffect(() => {
    // Attempt auto-login if token is saved in localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      apiFetch<{ user: User }>('/auth/me').then(res => {
        if (res && res.user) {
          setCurrentUser(res.user);
        }
      });
    }
    refreshState();

    // 🔄 Real-time background sync polling every 3 seconds
    const syncInterval = setInterval(() => {
      refreshState();
    }, 3000);

    return () => clearInterval(syncInterval);
  }, []);

  const login = async (email: string, role: 'patient' | 'hospital_admin' | 'super_admin', password: string = 'password123'): Promise<boolean> => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (res && res.token && res.user) {
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
      await refreshState();
      return true;
    }

    // Local fallback if server offline
    const list = db.getUsers();
    const user = list.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (user) {
      setCurrentUser(user);
      await refreshState();
      return true;
    }
    return false;
  };

  const logout = () => {
    apiFetch('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    setCurrentUser(null);
    refreshState();
  };

  const registerPatient = async (name: string, email: string, mobile: string, password: string = 'password123'): Promise<boolean> => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify({ name, email, mobile, password }),
    });

    if (res && res.token && res.user) {
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
      await refreshState();
      return true;
    }

    const list = db.getUsers();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      mobile,
      role: 'patient',
      createdAt: new Date().toISOString()
    };
    list.push(newUser);
    db.saveUsers(list);
    setCurrentUser(newUser);
    await refreshState();
    return true;
  };

  const registerHospital = async (hospData: Omit<Hospital, 'id' | 'verified' | 'distanceFromUserKm' | 'readinessScore' | 'updatedAt'>) => {
    await hospitalService.registerHospital(hospData);
    await refreshState();
  };

  const triggerSOS = async (emergencyType: any, location: string, requiredResources: any[]) => {
    await emergencyService.triggerSOS(
      emergencyType,
      location,
      requiredResources,
      currentUser?.id || 'guest',
      currentUser?.name || 'Emergency Guest'
    );
    await refreshState();
  };

  const updateResource = async (hospitalId: string, resourceType: string, newValue: number, reason?: string) => {
    await resourceService.updateResource(
      hospitalId,
      resourceType,
      newValue,
      reason || '',
      currentUser?.name || 'Hospital Admin'
    );
    await refreshState();
  };

  const updateDoctorStatus = async (doctorId: string, status: 'Available' | 'On Call' | 'Off Duty', emergencyDuty: boolean) => {
    await doctorService.updateDoctorRoster(doctorId, status, emergencyDuty);
    await refreshState();
  };

  const updateAmbulanceStatus = async (ambulanceId: string, status: any, equipment: string[]) => {
    await emergencyService.updateAmbulanceStatus(ambulanceId, status, equipment);
    await refreshState();
  };

  const verifyHospital = async (hospitalId: string, action: 'approve' | 'reject') => {
    await hospitalService.verifyHospital(hospitalId, action);
    await refreshState();
  };

  const sendStaleReminder = async (hospitalId: string, resourceName: string) => {
    await resourceService.sendStaleReminder(hospitalId, resourceName);
    await refreshState();
  };

  const requestBlood = async (bloodGroup: any, units: number, hospitalId: string) => {
    await bloodService.requestBlood(
      bloodGroup,
      units,
      hospitalId,
      currentUser?.name || 'Patient Guest',
      currentUser?.id || 'guest'
    );
    await refreshState();
  };

  const markNotificationRead = async (notifId: string) => {
    await notificationService.markRead(notifId);
    await refreshState();
  };

  const clearAllNotifications = async () => {
    await notificationService.clearAll();
    await refreshState();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        hospitals,
        resources,
        doctors,
        ambulances,
        bloodInventory,
        emergencyRequests,
        aiRecommendations,
        bloodRequests,
        updateLogs,
        auditLogs,
        notifications,
        login,
        logout,
        registerPatient,
        registerHospital,
        triggerSOS,
        updateResource,
        updateDoctorStatus,
        updateAmbulanceStatus,
        verifyHospital,
        sendStaleReminder,
        requestBlood,
        markNotificationRead,
        clearAllNotifications,
        refreshState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
