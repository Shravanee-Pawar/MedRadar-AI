// MedRadar AI — Master TypeScript Types (13 Core Relational Entities)

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'patient' | 'hospital_admin' | 'super_admin';
  hospitalId?: string; // Mapped for hospital_admin
  location?: string;
  preferredLanguage?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  registrationNumber: string;
  type: 'Government' | 'Private' | 'Charitable';
  address: string;
  city: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyContact: string;
  verified: boolean;
  emergencyStatus: 'Operational' | 'Limited' | 'Critical';
  distanceFromUserKm: number;
  readinessScore: number; // Calculated Readiness Score (0-100)
  updatedAt: string;
}

export interface HospitalResource {
  id: string;
  hospitalId: string;
  resourceType: 'icu_beds' | 'general_beds' | 'emergency_capacity' | 'isolation_beds' | 'pediatric_beds' | 'ventilators' | 'oxygen_kl' | 'operating_theatres';
  resourceName: string;
  total: number;
  available: number;
  occupied?: number;
  reserved?: number;
  maintenance?: number;
  unit?: string;
  status: 'Available' | 'Limited' | 'Critical' | 'Stale' | 'Unknown';
  updatedAt: string;
  updatedBy: string;
  updateHistory?: Array<{
    available: number;
    total: number;
    timestamp: string;
    updatedBy: string;
    reason?: string;
  }>;
}

export interface Doctor {
  id: string;
  doctorId?: string;
  hospitalId: string;
  hospitalName: string;
  departmentId?: string;
  name: string;
  specialization?: string;
  specialty: string;
  experience?: string;
  experienceYears: number;
  qualification?: string;
  availabilityStatus?: 'Available' | 'On Call' | 'Unavailable' | 'Off Duty';
  status: 'Available' | 'On Call' | 'Off Duty' | 'Unavailable';
  emergencyDuty: boolean;
  profileImage?: string;
  image: string;
  consultationType?: string;
  contact?: string;
  consultationInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  hospitalId: string;
  name: string; // e.g., Cardiology, Neurology
  headOfDepartment: string;
  status: 'Active' | 'Inactive';
}

export interface BloodInventory {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  unitsAvailable: number;
  unitsReserved: number;
  status: 'Available' | 'Limited' | 'Critical';
  updatedAt: string;
  source: string;
}

export interface Ambulance {
  id: string; // e.g., AMB-RAT-001
  hospitalId: string;
  hospitalName: string;
  ambulanceNumber: string; // e.g., MH-08-AG-1001
  type: 'Basic Life Support' | 'Advanced Life Support' | 'Patient Transport' | 'Neonatal Ambulance';
  status: 'Available' | 'On Trip' | 'At Hospital' | 'Maintenance' | 'Offline';
  equipment: string[];
  lastLocation: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientReference?: string;
  emergencyType: string;
  emergencyCategory?: string;
  priority?: 'Critical' | 'Urgent' | 'Routine';
  location: string;
  locationAddress?: string;
  lat: number;
  lng: number;
  locationType?: 'current_gps' | 'manual';
  requiredResources: string[];
  potentialResources?: string[];
  requiredSpecialist?: string;
  status: 'Active' | 'Resolved' | 'Dispatched' | 'Acknowledged' | 'En Route' | 'Arrived';
  coordinationStatus?: 'New' | 'Acknowledged' | 'Preparing' | 'Ready' | 'Closed';
  selectedHospitalId?: string;
  selectedHospitalName?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedIcuBed?: string;
  assignedVentilator?: string;
  assignedEmergencyBed?: string;
  ambulanceId?: string;
  ambulanceNumber?: string;
  ambulanceType?: string;
  ambulanceEtaMin?: number;
  hospitalAlertStatus?: 'pending' | 'acknowledged';
  hospitalAlertTime?: string;
  patientPhone?: string;
  stepIndex?: number;
  timeline?: Array<{
    title: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface Recommendation {
  id: string;
  requestId: string;
  hospitalId: string;
  hospitalName: string;
  matchScore: number; // e.g., 94%
  matchedResources: { name: string; available: boolean }[];
  distanceKm: number;
  estimatedTravelTimeMin: number;
  reason: string; // Explainable AI matching explanation
  updatedAt: string;
  reasonTags?: string[];
}

export interface BloodRequest {
  id: string;
  patientId: string;
  patientName: string;
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  unitsRequired: number;
  hospitalId: string;
  hospitalName: string;
  status: 'Pending' | 'Approved' | 'Collected' | 'Rejected';
  createdAt: string;
}

export interface ResourceUpdate {
  id: string;
  hospitalId: string;
  hospitalName: string;
  resourceName: string;
  previousValue: number;
  newValue: number;
  status: 'Available' | 'Limited' | 'Critical';
  reason?: string;
  updatedBy: string; // Admin Name
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface TransferRequest {
  id: string;
  patientReference: string;
  sendingHospitalId: string;
  sendingHospitalName: string;
  receivingHospitalId: string;
  receivingHospitalName: string;
  priority: 'Critical' | 'Urgent' | 'Routine';
  requiredDepartment: string;
  requiredSpecialist: string;
  requiredResources: string[];
  bloodRequirement?: {
    bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
    units: number;
  };
  assignedAmbulanceId?: string;
  assignedAmbulanceNumber?: string;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'In Transit' | 'Received' | 'Completed' | 'Rejected' | 'Cancelled';
  rejectionReason?: string;
  infoRequested?: string;
  timeline: Array<{
    title: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string; // References User ID or 'all_admins'
  type: 'Emergency' | 'Blood' | 'Hospital' | 'Resource' | 'Ambulance' | 'Stale Data' | 'Verification' | 'Transfer';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  isCritical: boolean;
}
