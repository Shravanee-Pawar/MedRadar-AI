import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
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
  login: (email: string, role: 'patient' | 'hospital_admin' | 'super_admin') => boolean;
  logout: () => void;
  registerPatient: (name: string, email: string, mobile: string) => boolean;
  registerHospital: (hospData: Omit<Hospital, 'id' | 'verified' | 'distanceFromUserKm' | 'readinessScore' | 'updatedAt'>) => void;
  triggerSOS: (emergencyType: any, location: string, requiredResources: any[]) => void;
  updateResource: (hospitalId: string, resourceType: string, newValue: number, reason?: string) => void;
  updateDoctorStatus: (doctorId: string, status: 'Available' | 'On Call' | 'Off Duty', emergencyDuty: boolean) => void;
  updateAmbulanceStatus: (ambulanceId: string, status: any, equipment: string[]) => void;
  verifyHospital: (hospitalId: string, action: 'approve' | 'reject') => void;
  sendStaleReminder: (hospitalId: string, resourceName: string) => void;
  requestBlood: (bloodGroup: any, units: number, hospitalId: string) => void;
  markNotificationRead: (notifId: string) => void;
  clearAllNotifications: () => void;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Dynamic State collections synced with database services
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

  const refreshState = () => {
    setHospitals(db.getHospitals());
    setResources(db.getResources());
    setDoctors(db.getDoctors());
    setAmbulances(db.getAmbulances());
    setBloodInventory(db.getBloodInventory());
    setEmergencyRequests(db.getEmergencyRequests());
    setAiRecommendations(db.getRecommendations());
    setBloodRequests(db.getBloodRequests());
    setUpdateLogs(db.getResourceUpdates());
    setAuditLogs(db.getAuditLogs());
    setNotifications(db.getNotifications());
  };

  // Sync once at mount
  useEffect(() => {
    refreshState();
  }, []);

  const login = (email: string, role: 'patient' | 'hospital_admin' | 'super_admin'): boolean => {
    const list = db.getUsers();
    const user = list.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (user) {
      setCurrentUser(user);
      
      // Log login event
      const audits = db.getAuditLogs();
      audits.unshift({
        id: `aud-${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'Login',
        entityType: 'User',
        entityId: user.id,
        details: `${user.name} logged into the system portal successfully.`,
        timestamp: new Date().toISOString()
      });
      db.saveAuditLogs(audits);
      refreshState();
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      const audits = db.getAuditLogs();
      audits.unshift({
        id: `aud-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'Logout',
        entityType: 'User',
        entityId: currentUser.id,
        details: `${currentUser.name} signed out of the session.`,
        timestamp: new Date().toISOString()
      });
      db.saveAuditLogs(audits);
    }
    setCurrentUser(null);
    refreshState();
  };

  const registerPatient = (name: string, email: string, mobile: string): boolean => {
    const list = db.getUsers();
    const exists = list.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

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
    refreshState();
    return true;
  };

  const registerHospital = async (hospData: Omit<Hospital, 'id' | 'verified' | 'distanceFromUserKm' | 'readinessScore' | 'updatedAt'>) => {
    await hospitalService.registerHospital(hospData);
    refreshState();
  };

  const triggerSOS = async (emergencyType: any, location: string, requiredResources: any[]) => {
    await emergencyService.triggerSOS(
      emergencyType,
      location,
      requiredResources,
      currentUser?.id || 'guest',
      currentUser?.name || 'Emergency Guest'
    );
    refreshState();
  };

  const updateResource = async (hospitalId: string, resourceType: string, newValue: number, reason?: string) => {
    await resourceService.updateResource(
      hospitalId,
      resourceType,
      newValue,
      reason || '',
      currentUser?.name || 'Hospital Admin'
    );
    refreshState();
  };

  const updateDoctorStatus = async (doctorId: string, status: 'Available' | 'On Call' | 'Off Duty', emergencyDuty: boolean) => {
    await doctorService.updateDoctorRoster(doctorId, status, emergencyDuty);
    refreshState();
  };

  const updateAmbulanceStatus = async (ambulanceId: string, status: any, equipment: string[]) => {
    await emergencyService.updateAmbulanceStatus(ambulanceId, status, equipment);
    refreshState();
  };

  const verifyHospital = async (hospitalId: string, action: 'approve' | 'reject') => {
    await hospitalService.verifyHospital(hospitalId, action);
    refreshState();
  };

  const sendStaleReminder = async (hospitalId: string, resourceName: string) => {
    await resourceService.sendStaleReminder(hospitalId, resourceName);
    refreshState();
  };

  const requestBlood = async (bloodGroup: any, units: number, hospitalId: string) => {
    await bloodService.requestBlood(
      bloodGroup,
      units,
      hospitalId,
      currentUser?.name || 'Patient Guest',
      currentUser?.id || 'guest'
    );
    refreshState();
  };

  const markNotificationRead = async (notifId: string) => {
    await notificationService.markRead(notifId);
    refreshState();
  };

  const clearAllNotifications = async () => {
    await notificationService.clearAll();
    refreshState();
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
