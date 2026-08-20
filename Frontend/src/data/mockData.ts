// MedRadar AI — Centralized Mock Data & Schema
// All data is simulated for demonstration purposes.

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'hospital_admin' | 'super_admin';
  hospitalId?: string; // Mapped for hospital_admin
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Charitable';
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  verified: boolean;
  emergencyStatus: 'Operational' | 'Limited' | 'Critical';
  distanceFromUserKm: number;
  updatedAt: string;
}

export interface HospitalResource {
  id: string;
  hospitalId: string;
  resourceType: 'icu_beds' | 'general_beds' | 'ventilators' | 'oxygen_kl' | 'operating_theatres' | 'emergency_capacity';
  resourceName: string;
  total: number;
  available: number;
  status: 'Available' | 'Limited' | 'Critical' | 'Stale';
  updatedAt: string;
  updatedBy: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Ambulance {
  id: string;
  hospitalId: string;
  licensePlate: string;
  type: 'Advanced Life Support' | 'Basic Life Support';
  status: 'Available' | 'Dispatched' | 'Maintenance';
  equipment: string[];
  lastLocation: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface BloodInventory {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  unitsAvailable: number;
  status: 'Available' | 'Limited' | 'Critical';
  updatedAt: string;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  emergencyType: 'Road Accident' | 'Chest Pain' | 'Stroke' | 'Breathing Emergency' | 'Burns' | 'Pregnancy Emergency' | 'Pediatric Emergency' | 'Other';
  location: string;
  lat: number;
  lng: number;
  requiredResources: ('icu_beds' | 'ventilators' | 'specialist' | 'oxygen_kl' | 'ambulance')[];
  status: 'Active' | 'Resolved' | 'Dispatched';
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  requestId: string;
  hospitalId: string;
  hospitalName: string;
  matchScore: number;
  matchedResources: { name: string; available: boolean }[];
  distanceKm: number;
  estimatedTravelTimeMin: number;
  updatedAt: string;
}

export interface BloodRequest {
  id: string;
  patientId: string;
  patientName: string;
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  unitsRequired: number;
  hospitalId: string;
  hospitalName: string;
  status: 'Pending' | 'Approved' | 'Collected';
  createdAt: string;
}

export interface ResourceUpdateLog {
  id: string;
  hospitalId: string;
  hospitalName: string;
  resourceName: string;
  previousValue: number;
  newValue: number;
  status: 'Available' | 'Limited' | 'Critical';
  reason?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'Emergency' | 'Blood' | 'Resource' | 'Hospital' | 'Ambulance' | 'Stale Data';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  isCritical: boolean;
}

// -------------------------------------------------------------
// SEED DATA SETS (Ratnagiri District Focus)
// -------------------------------------------------------------

export const mockUsers: User[] = [
  { id: 'usr-1', name: 'Shubham Parkar', email: 'shubham@medradar.ai', role: 'patient' },
  { id: 'usr-2', name: 'Amit Ghavre', email: 'amit@medradar.ai', role: 'patient' },
  { id: 'usr-3', name: 'Priya Joshi', email: 'priya@medradar.ai', role: 'patient' },
  { id: 'usr-4', name: 'Dr. Vivek Parkar', email: 'vivek@parkarhospital.org', role: 'hospital_admin', hospitalId: 'hosp-2' },
  { id: 'usr-5', name: 'Dr. S. K. Patil', email: 'skpatil@civilhosp.org', role: 'hospital_admin', hospitalId: 'hosp-1' },
  { id: 'usr-6', name: 'Aditi Surve', email: 'aditi@apex.org', role: 'hospital_admin', hospitalId: 'hosp-3' },
  { id: 'usr-7', name: 'Milind Sawant', email: 'milind@konkan.org', role: 'hospital_admin', hospitalId: 'hosp-4' },
  { id: 'usr-8', name: 'Super Admin Control', email: 'admin@medradar.ai', role: 'super_admin' },
  { id: 'usr-9', name: 'Rahul Rane', email: 'rahul@medradar.ai', role: 'patient' },
  { id: 'usr-10', name: 'Sneha Tambe', email: 'sneha@medradar.ai', role: 'patient' },
  { id: 'usr-11', name: 'Vikram Shirke', email: 'vikram@medradar.ai', role: 'patient' },
  { id: 'usr-12', name: 'Dr. Deepak Pawaskar', email: 'deepak@chirayuhosp.org', role: 'hospital_admin', hospitalId: 'hosp-5' }
];

export const mockHospitals: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Civil Hospital Ratnagiri',
    type: 'Government',
    address: 'Jail Road, Near District Court',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9944,
    lng: 73.3033,
    phone: '+91-2352-222031',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 1.2,
    updatedAt: '10 min ago'
  },
  {
    id: 'hosp-2',
    name: 'Parkar Hospital & Research Institute',
    type: 'Private',
    address: 'Khareghat Road, Near Shivaji Stadium',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9912,
    lng: 73.3001,
    phone: '+91-2352-223401',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 1.8,
    updatedAt: '6 min ago'
  },
  {
    id: 'hosp-3',
    name: 'Apex Hospital',
    type: 'Private',
    address: 'Maruti Mandir Road, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9982,
    lng: 73.3142,
    phone: '+91-2352-226789',
    verified: true,
    emergencyStatus: 'Limited',
    distanceFromUserKm: 2.1,
    updatedAt: '42 min ago'
  },
  {
    id: 'hosp-4',
    name: 'Shree Ramnath Hospital / Konkan Cardiac Centre',
    type: 'Private',
    address: 'Swaroopnagar, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9854,
    lng: 73.2982,
    phone: '+91-2352-221234',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 2.4,
    updatedAt: '12 min ago'
  },
  {
    id: 'hosp-5',
    name: 'Chirayu Hospital',
    type: 'Private',
    address: 'Salvi Stop, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 17.0012,
    lng: 73.3198,
    phone: '+91-2352-271500',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 3.2,
    updatedAt: '4 hours ago' // Stale resource check candidate!
  },
  {
    id: 'hosp-6',
    name: 'Chintamani Hospital',
    type: 'Private',
    address: 'Subhash Road, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9930,
    lng: 73.3055,
    phone: '+91-2352-224488',
    verified: false, // Pending verification
    emergencyStatus: 'Operational',
    distanceFromUserKm: 1.5,
    updatedAt: '1 hour ago'
  },
  {
    id: 'hosp-7',
    name: 'Aparant Hospital',
    type: 'Private',
    address: 'Near Bhatye Beach Road, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9744,
    lng: 73.2965,
    phone: '+91-2352-230111',
    verified: true,
    emergencyStatus: 'Critical',
    distanceFromUserKm: 4.1,
    updatedAt: '5 min ago'
  },
  {
    id: 'hosp-8',
    name: 'Nandadeep Eye Hospital',
    type: 'Private',
    address: 'Opp. Police Headquarters, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9950,
    lng: 73.3080,
    phone: '+91-2352-225888',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 1.9,
    updatedAt: '3 hours ago'
  },
  {
    id: 'hosp-9',
    name: 'Jyoti Eye Care & Research Foundation',
    type: 'Private',
    address: 'Radhakrishna Naka, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9961,
    lng: 73.3020,
    phone: '+91-2352-223120',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 1.4,
    updatedAt: '5 hours ago'
  },
  {
    id: 'hosp-10',
    name: 'Nirmal Balrugnalaya (Pediatric)',
    type: 'Private',
    address: 'Damle Chowk, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9902,
    lng: 73.2940,
    phone: '+91-2352-221100',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 2.2,
    updatedAt: '18 min ago'
  },
  {
    id: 'hosp-11',
    name: 'Soham Hospital',
    type: 'Private',
    address: 'Near Rahatghar Bus Stand, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 17.0090,
    lng: 73.3280,
    phone: '+91-2352-228800',
    verified: false, // Pending verification
    emergencyStatus: 'Limited',
    distanceFromUserKm: 4.8,
    updatedAt: '2 hours ago'
  },
  {
    id: 'hosp-12',
    name: 'Sanjeevani Hospital',
    type: 'Private',
    address: 'Nirwade, Sawantwadi Road, Ratnagiri District',
    city: 'Lanja',
    district: 'Ratnagiri',
    lat: 16.8520,
    lng: 73.5130,
    phone: '+91-2351-230045',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 32.5,
    updatedAt: '25 min ago'
  },
  {
    id: 'hosp-13',
    name: 'Regional Mental Hospital Ratnagiri',
    type: 'Government',
    address: 'Thiba Palace Road, Ratnagiri',
    city: 'Ratnagiri',
    district: 'Ratnagiri',
    lat: 16.9890,
    lng: 73.3110,
    phone: '+91-2352-222216',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 2.5,
    updatedAt: '1 day ago'
  },
  {
    id: 'hosp-14',
    name: 'Vivekanand Multispeciality Hospital',
    type: 'Private',
    address: 'Khed, Ratnagiri District',
    city: 'Khed',
    district: 'Ratnagiri',
    lat: 17.7180,
    lng: 73.3890,
    phone: '+91-2356-263300',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 98.4,
    updatedAt: '15 min ago'
  },
  {
    id: 'hosp-15',
    name: 'B.K.L. Walawalkar Hospital',
    type: 'Charitable',
    address: 'Dervan, Chiplun Taluka, Ratnagiri',
    city: 'Chiplun',
    district: 'Ratnagiri',
    lat: 17.4720,
    lng: 73.6190,
    phone: '+91-2355-264137',
    verified: true,
    emergencyStatus: 'Operational',
    distanceFromUserKm: 55.2,
    updatedAt: '8 min ago'
  }
];

export const mockHospitalResources: HospitalResource[] = [
  // Civil Hospital Ratnagiri (hosp-1)
  { id: 'res-1', hospitalId: 'hosp-1', resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 30, available: 8, status: 'Available', updatedAt: '10 min ago', updatedBy: 'Dr. S. K. Patil' },
  { id: 'res-2', hospitalId: 'hosp-1', resourceType: 'general_beds', resourceName: 'General Beds', total: 250, available: 82, status: 'Available', updatedAt: '10 min ago', updatedBy: 'Dr. S. K. Patil' },
  { id: 'res-3', hospitalId: 'hosp-1', resourceType: 'ventilators', resourceName: 'Ventilators', total: 12, available: 4, status: 'Available', updatedAt: '10 min ago', updatedBy: 'Dr. S. K. Patil' },
  { id: 'res-4', hospitalId: 'hosp-1', resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 10, available: 6, status: 'Available', updatedAt: '10 min ago', updatedBy: 'Dr. S. K. Patil' },
  { id: 'res-5', hospitalId: 'hosp-1', resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 4, available: 1, status: 'Limited', updatedAt: '10 min ago', updatedBy: 'Dr. S. K. Patil' },
  { id: 'res-6', hospitalId: 'hosp-1', resourceType: 'emergency_capacity', resourceName: 'Emergency Resuscitation Beds', total: 10, available: 3, status: 'Available', updatedAt: '10 min ago', updatedBy: 'Dr. S. K. Patil' },

  // Parkar Hospital & Research Institute (hosp-2)
  { id: 'res-7', hospitalId: 'hosp-2', resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 20, available: 4, status: 'Available', updatedAt: '6 min ago', updatedBy: 'Dr. Vivek Parkar' },
  { id: 'res-8', hospitalId: 'hosp-2', resourceType: 'general_beds', resourceName: 'General Beds', total: 120, available: 42, status: 'Available', updatedAt: '6 min ago', updatedBy: 'Dr. Vivek Parkar' },
  { id: 'res-9', hospitalId: 'hosp-2', resourceType: 'ventilators', resourceName: 'Ventilators', total: 8, available: 2, status: 'Available', updatedAt: '6 min ago', updatedBy: 'Dr. Vivek Parkar' },
  { id: 'res-10', hospitalId: 'hosp-2', resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 5, available: 4, status: 'Available', updatedAt: '6 min ago', updatedBy: 'Dr. Vivek Parkar' },
  { id: 'res-11', hospitalId: 'hosp-2', resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 3, available: 2, status: 'Available', updatedAt: '6 min ago', updatedBy: 'Dr. Vivek Parkar' },
  { id: 'res-12', hospitalId: 'hosp-2', resourceType: 'emergency_capacity', resourceName: 'Emergency Resuscitation Beds', total: 6, available: 2, status: 'Available', updatedAt: '6 min ago', updatedBy: 'Dr. Vivek Parkar' },

  // Apex Hospital (hosp-3)
  { id: 'res-13', hospitalId: 'hosp-3', resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 10, available: 1, status: 'Critical', updatedAt: '42 min ago', updatedBy: 'Aditi Surve' },
  { id: 'res-14', hospitalId: 'hosp-3', resourceType: 'general_beds', resourceName: 'General Beds', total: 50, available: 12, status: 'Available', updatedAt: '42 min ago', updatedBy: 'Aditi Surve' },
  { id: 'res-15', hospitalId: 'hosp-3', resourceType: 'ventilators', resourceName: 'Ventilators', total: 4, available: 0, status: 'Critical', updatedAt: '42 min ago', updatedBy: 'Aditi Surve' },
  { id: 'res-16', hospitalId: 'hosp-3', resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 3, available: 1, status: 'Limited', updatedAt: '42 min ago', updatedBy: 'Aditi Surve' },
  { id: 'res-17', hospitalId: 'hosp-3', resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 2, available: 0, status: 'Critical', updatedAt: '42 min ago', updatedBy: 'Aditi Surve' },
  { id: 'res-18', hospitalId: 'hosp-3', resourceType: 'emergency_capacity', resourceName: 'Emergency Resuscitation Beds', total: 4, available: 1, status: 'Limited', updatedAt: '42 min ago', updatedBy: 'Aditi Surve' },

  // Shree Ramnath Hospital (hosp-4)
  { id: 'res-19', hospitalId: 'hosp-4', resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 15, available: 5, status: 'Available', updatedAt: '12 min ago', updatedBy: 'Milind Sawant' },
  { id: 'res-20', hospitalId: 'hosp-4', resourceType: 'general_beds', resourceName: 'General Beds', total: 80, available: 25, status: 'Available', updatedAt: '12 min ago', updatedBy: 'Milind Sawant' },
  { id: 'res-21', hospitalId: 'hosp-4', resourceType: 'ventilators', resourceName: 'Ventilators', total: 6, available: 3, status: 'Available', updatedAt: '12 min ago', updatedBy: 'Milind Sawant' },
  { id: 'res-22', hospitalId: 'hosp-4', resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 4, available: 3, status: 'Available', updatedAt: '12 min ago', updatedBy: 'Milind Sawant' },
  { id: 'res-23', hospitalId: 'hosp-4', resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 2, available: 1, status: 'Available', updatedAt: '12 min ago', updatedBy: 'Milind Sawant' },
  { id: 'res-24', hospitalId: 'hosp-4', resourceType: 'emergency_capacity', resourceName: 'Emergency Resuscitation Beds', total: 5, available: 2, status: 'Available', updatedAt: '12 min ago', updatedBy: 'Milind Sawant' },

  // Chirayu Hospital (hosp-5) - Stale Data
  { id: 'res-25', hospitalId: 'hosp-5', resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 8, available: 2, status: 'Stale', updatedAt: '4 hours ago', updatedBy: 'Dr. Deepak Pawaskar' },
  { id: 'res-26', hospitalId: 'hosp-5', resourceType: 'general_beds', resourceName: 'General Beds', total: 40, available: 10, status: 'Stale', updatedAt: '4 hours ago', updatedBy: 'Dr. Deepak Pawaskar' },
  { id: 'res-27', hospitalId: 'hosp-5', resourceType: 'ventilators', resourceName: 'Ventilators', total: 3, available: 1, status: 'Stale', updatedAt: '4 hours ago', updatedBy: 'Dr. Deepak Pawaskar' },
  { id: 'res-28', hospitalId: 'hosp-5', resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 2, available: 1, status: 'Stale', updatedAt: '4 hours ago', updatedBy: 'Dr. Deepak Pawaskar' },
  { id: 'res-29', hospitalId: 'hosp-5', resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 1, available: 0, status: 'Stale', updatedAt: '4 hours ago', updatedBy: 'Dr. Deepak Pawaskar' },
  { id: 'res-30', hospitalId: 'hosp-5', resourceType: 'emergency_capacity', resourceName: 'Emergency Resuscitation Beds', total: 3, available: 1, status: 'Stale', updatedAt: '4 hours ago', updatedBy: 'Dr. Deepak Pawaskar' },

  // BKL Walawalkar Hospital (hosp-15)
  { id: 'res-31', hospitalId: 'hosp-15', resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 45, available: 15, status: 'Available', updatedAt: '8 min ago', updatedBy: 'Admin Walawalkar' },
  { id: 'res-32', hospitalId: 'hosp-15', resourceType: 'general_beds', resourceName: 'General Beds', total: 400, available: 185, status: 'Available', updatedAt: '8 min ago', updatedBy: 'Admin Walawalkar' },
  { id: 'res-33', hospitalId: 'hosp-15', resourceType: 'ventilators', resourceName: 'Ventilators', total: 20, available: 8, status: 'Available', updatedAt: '8 min ago', updatedBy: 'Admin Walawalkar' },
  { id: 'res-34', hospitalId: 'hosp-15', resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 20, available: 14, status: 'Available', updatedAt: '8 min ago', updatedBy: 'Admin Walawalkar' },
  { id: 'res-35', hospitalId: 'hosp-15', resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 8, available: 4, status: 'Available', updatedAt: '8 min ago', updatedBy: 'Admin Walawalkar' },
  { id: 'res-36', hospitalId: 'hosp-15', resourceType: 'emergency_capacity', resourceName: 'Emergency Resuscitation Beds', total: 15, available: 6, status: 'Available', updatedAt: '8 min ago', updatedBy: 'Admin Walawalkar' },

  // Populating other hospitals with basic records so 90+ records total
  ...[6, 7, 8, 9, 10, 11, 12, 13, 14].flatMap((num) => {
    const hospId = `hosp-${num}`;
    const updater = 'System Auto Update';
    return [
      { id: `res-ext-${num}-1`, hospitalId: hospId, resourceType: 'icu_beds' as any, resourceName: 'ICU Beds', total: 10, available: num % 3 === 0 ? 0 : num % 4, status: (num % 3 === 0 ? 'Critical' : 'Available') as any, updatedAt: '30 min ago', updatedBy: updater },
      { id: `res-ext-${num}-2`, hospitalId: hospId, resourceType: 'general_beds' as any, resourceName: 'General Beds', total: 60, available: Math.floor(Math.random() * 20) + 1, status: 'Available' as any, updatedAt: '30 min ago', updatedBy: updater },
      { id: `res-ext-${num}-3`, hospitalId: hospId, resourceType: 'ventilators' as any, resourceName: 'Ventilators', total: 4, available: num % 2 === 0 ? 1 : 0, status: (num % 2 === 0 ? 'Available' : 'Critical') as any, updatedAt: '30 min ago', updatedBy: updater },
      { id: `res-ext-${num}-4`, hospitalId: hospId, resourceType: 'oxygen_kl' as any, resourceName: 'Liquid Oxygen (KL)', total: 3, available: 1, status: 'Available' as any, updatedAt: '30 min ago', updatedBy: updater },
      { id: `res-ext-${num}-5`, hospitalId: hospId, resourceType: 'operating_theatres' as any, resourceName: 'Operating Theatres', total: 2, available: 1, status: 'Available' as any, updatedAt: '30 min ago', updatedBy: updater },
      { id: `res-ext-${num}-6`, hospitalId: hospId, resourceType: 'emergency_capacity' as any, resourceName: 'Emergency Resuscitation Beds', total: 5, available: 2, status: 'Available' as any, updatedAt: '30 min ago', updatedBy: updater }
    ];
  })
];

export const mockDoctors: Doctor[] = [
  { id: 'doc-1', doctorId: 'DOC-RAT-001', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', departmentId: 'dept-hosp-1-1', name: 'Dr. Rajesh Sawant', specialization: 'Emergency Medicine', specialty: 'Emergency Medicine', qualification: 'MBBS, MD (Emergency Medicine)', experience: '12 years', experienceYears: 12, availabilityStatus: 'Available', status: 'Available', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-2', doctorId: 'DOC-RAT-002', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', departmentId: 'dept-hosp-1-1', name: 'Dr. Sunita Kulkarni', specialization: 'Pediatrics', specialty: 'Pediatrics', qualification: 'MBBS, DCH, MD (Pediatrics)', experience: '15 years', experienceYears: 15, availabilityStatus: 'On Call', status: 'On Call', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-3', doctorId: 'DOC-RAT-003', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', departmentId: 'dept-hosp-1-4', name: 'Dr. Anil Gokhale', specialization: 'General Surgery', specialty: 'General Surgery', qualification: 'MBBS, MS (General Surgery)', experience: '20 years', experienceYears: 20, availabilityStatus: 'Available', status: 'Available', emergencyDuty: false, profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-4', doctorId: 'DOC-RAT-004', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', departmentId: 'dept-hosp-2-3', name: 'Dr. Vivek Parkar', specialization: 'Critical Care', specialty: 'Critical Care', qualification: 'MBBS, DNB (Critical Care)', experience: '18 years', experienceYears: 18, availabilityStatus: 'Available', status: 'Available', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-5', doctorId: 'DOC-RAT-005', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', departmentId: 'dept-hosp-2-2', name: 'Dr. Manisha Shirke', specialization: 'Cardiology', specialty: 'Cardiology', qualification: 'MBBS, MD, DM (Cardiology)', experience: '10 years', experienceYears: 10, availabilityStatus: 'Available', status: 'Available', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-6', doctorId: 'DOC-RAT-006', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', departmentId: 'dept-hosp-2-4', name: 'Dr. Sanjay Kelkar', specialization: 'Orthopedics', specialty: 'Orthopedics', qualification: 'MBBS, MS (Orthopedics)', experience: '14 years', experienceYears: 14, availabilityStatus: 'On Call', status: 'On Call', emergencyDuty: false, profileImage: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-7', doctorId: 'DOC-RAT-007', hospitalId: 'hosp-3', hospitalName: 'Apex Hospital', departmentId: 'dept-hosp-3-1', name: 'Dr. Neha Patil', specialization: 'Emergency Medicine', specialty: 'Emergency Medicine', qualification: 'MBBS, MEM', experience: '8 years', experienceYears: 8, availabilityStatus: 'Available', status: 'Available', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-8', doctorId: 'DOC-RAT-008', hospitalId: 'hosp-3', hospitalName: 'Apex Hospital', departmentId: 'dept-hosp-3-2', name: 'Dr. Amit Jadhav', specialization: 'Neurology', specialty: 'Neurology', qualification: 'MBBS, MD, DM (Neurology)', experience: '16 years', experienceYears: 16, availabilityStatus: 'On Call', status: 'On Call', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-9', doctorId: 'DOC-RAT-009', hospitalId: 'hosp-3', hospitalName: 'Apex Hospital', departmentId: 'dept-hosp-3-4', name: 'Dr. Priya Deshmukh', specialization: 'Gynecology', specialty: 'Gynecology', qualification: 'MBBS, MS (OBGYN)', experience: '11 years', experienceYears: 11, availabilityStatus: 'Unavailable', status: 'Off Duty', emergencyDuty: false, profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-10', doctorId: 'DOC-RAT-010', hospitalId: 'hosp-4', hospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre', departmentId: 'dept-hosp-4-2', name: 'Dr. Sagar Kadam', specialization: 'Cardiology', specialty: 'Cardiology', qualification: 'MBBS, MD, DNB', experience: '13 years', experienceYears: 13, availabilityStatus: 'Available', status: 'Available', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-11', doctorId: 'DOC-RAT-011', hospitalId: 'hosp-4', hospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre', departmentId: 'dept-hosp-4-3', name: 'Dr. Sneha Joshi', specialization: 'Critical Care', specialty: 'Critical Care', qualification: 'MBBS, MD (Anesthesiology)', experience: '9 years', experienceYears: 9, availabilityStatus: 'Available', status: 'Available', emergencyDuty: true, profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face' },
  { id: 'doc-12', doctorId: 'DOC-RAT-012', hospitalId: 'hosp-4', hospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre', departmentId: 'dept-hosp-4-4', name: 'Dr. Rohit Bapat', specialization: 'General Surgery', specialty: 'General Surgery', qualification: 'MBBS, MS, FMAS', experience: '17 years', experienceYears: 17, availabilityStatus: 'On Call', status: 'On Call', emergencyDuty: false, profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face' }
];

export const mockAmbulances: Ambulance[] = [
  { id: 'amb-1', hospitalId: 'hosp-1', licensePlate: 'MH-08-AG-1001', type: 'Advanced Life Support', status: 'Available', equipment: ['Ventilator', 'Oxygen', 'Defibrillator', 'Cardiac Monitor'], lastLocation: 'Civil Hospital Compound, Ratnagiri', lat: 16.9945, lng: 73.3034, updatedAt: '10 min ago' },
  { id: 'amb-2', hospitalId: 'hosp-1', licensePlate: 'MH-08-AG-1002', type: 'Basic Life Support', status: 'Available', equipment: ['Oxygen', 'First Aid Kit'], lastLocation: 'Civil Hospital Compound, Ratnagiri', lat: 16.9944, lng: 73.3032, updatedAt: '15 min ago' },
  { id: 'amb-3', hospitalId: 'hosp-2', licensePlate: 'MH-08-BG-2022', type: 'Advanced Life Support', status: 'Available', equipment: ['Ventilator', 'Oxygen', 'Cardiac Monitor', 'Intubation Kit'], lastLocation: 'Shivaji Stadium Area, Ratnagiri', lat: 16.9915, lng: 73.3005, updatedAt: '4 min ago' },
  { id: 'amb-4', hospitalId: 'hosp-2', licensePlate: 'MH-08-BG-2023', type: 'Dispatched', status: 'Dispatched', equipment: ['Oxygen', 'Suction Machine', 'Stretcher'], lastLocation: 'Salvi Stop, Ratnagiri', lat: 17.0010, lng: 73.3190, updatedAt: '2 min ago' },
  { id: 'amb-5', hospitalId: 'hosp-3', licensePlate: 'MH-08-CG-3030', type: 'Basic Life Support', status: 'Available', equipment: ['Oxygen', 'Stretcher'], lastLocation: 'Maruti Mandir, Ratnagiri', lat: 16.9980, lng: 73.3140, updatedAt: '45 min ago' },
  { id: 'amb-6', hospitalId: 'hosp-4', licensePlate: 'MH-08-DG-4040', type: 'Advanced Life Support', status: 'Available', equipment: ['Ventilator', 'Oxygen', 'AED'], lastLocation: 'Swaroopnagar, Ratnagiri', lat: 16.9850, lng: 73.2980, updatedAt: '12 min ago' },
  ...Array.from({ length: 9 }).map((_, i) => {
    const hospId = `hosp-${(i % 10) + 5}`;
    const hosp = mockHospitals.find(h => h.id === hospId) || mockHospitals[0];
    return {
      id: `amb-ext-${i + 7}`,
      hospitalId: hosp.id,
      licensePlate: `MH-08-${String.fromCharCode(65 + i)}G-${5000 + i}`,
      type: i % 2 === 0 ? 'Advanced Life Support' : 'Basic Life Support' as any,
      status: (i % 3 === 0 ? 'Dispatched' : 'Available') as any,
      equipment: i % 2 === 0 ? ['Oxygen', 'Ventilator'] : ['Oxygen', 'Stretcher'],
      lastLocation: `${hosp.name} Zone`,
      lat: hosp.lat + 0.002 * (i - 4),
      lng: hosp.lng + 0.002 * (i - 4),
      updatedAt: '30 min ago'
    };
  })
];

export const mockBloodInventory: BloodInventory[] = [
  // Civil Hospital Ratnagiri Blood Bank
  { id: 'blood-1', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'O-', unitsAvailable: 6, status: 'Available', updatedAt: '10 min ago' },
  { id: 'blood-2', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'O+', unitsAvailable: 24, status: 'Available', updatedAt: '10 min ago' },
  { id: 'blood-3', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'A-', unitsAvailable: 2, status: 'Critical', updatedAt: '10 min ago' },
  { id: 'blood-4', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'A+', unitsAvailable: 15, status: 'Available', updatedAt: '10 min ago' },
  { id: 'blood-5', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'B-', unitsAvailable: 1, status: 'Critical', updatedAt: '10 min ago' },
  { id: 'blood-6', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'B+', unitsAvailable: 18, status: 'Available', updatedAt: '10 min ago' },
  { id: 'blood-7', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'AB-', unitsAvailable: 0, status: 'Critical', updatedAt: '10 min ago' },
  { id: 'blood-8', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', bloodGroup: 'AB+', unitsAvailable: 8, status: 'Available', updatedAt: '10 min ago' },

  // Parkar Hospital Blood Bank
  { id: 'blood-9', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', bloodGroup: 'O-', unitsAvailable: 4, status: 'Available', updatedAt: '6 min ago' },
  { id: 'blood-10', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', bloodGroup: 'O+', unitsAvailable: 12, status: 'Available', updatedAt: '6 min ago' },
  { id: 'blood-11', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', bloodGroup: 'A+', unitsAvailable: 8, status: 'Available', updatedAt: '6 min ago' },
  { id: 'blood-12', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', bloodGroup: 'B+', unitsAvailable: 10, status: 'Available', updatedAt: '6 min ago' },
  { id: 'blood-13', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', bloodGroup: 'B-', unitsAvailable: 0, status: 'Critical', updatedAt: '6 min ago' },

  // BKL Walawalkar Hospital Blood Bank
  { id: 'blood-14', hospitalId: 'hosp-15', hospitalName: 'B.K.L. Walawalkar Hospital', bloodGroup: 'O-', unitsAvailable: 8, status: 'Available', updatedAt: '8 min ago' },
  { id: 'blood-15', hospitalId: 'hosp-15', hospitalName: 'B.K.L. Walawalkar Hospital', bloodGroup: 'O+', unitsAvailable: 32, status: 'Available', updatedAt: '8 min ago' },
  { id: 'blood-16', hospitalId: 'hosp-15', hospitalName: 'B.K.L. Walawalkar Hospital', bloodGroup: 'AB-', unitsAvailable: 2, status: 'Limited', updatedAt: '8 min ago' },

  // Generating remaining items to hit 30+ records
  ...[3, 4, 5, 7, 12, 14].flatMap((num, idx) => {
    const groups: Array<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'> = ['O-', 'O+', 'B+', 'B-', 'AB+', 'A-'];
    const hosp = mockHospitals.find(h => h.id === `hosp-${num}`) || mockHospitals[0];
    const grp = groups[idx % groups.length];
    return [
      {
        id: `blood-ext-${num}-${idx}`,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        bloodGroup: grp,
        unitsAvailable: idx % 2 === 0 ? 0 : 3,
        status: (idx % 2 === 0 ? 'Critical' : 'Available') as any,
        updatedAt: '25 min ago'
      }
    ];
  })
];

export const mockNotifications: Notification[] = [
  { id: 'not-1', type: 'Emergency', title: 'Critical SOS Dispatched', description: 'Road Accident at Maruti Mandir. Trauma Specialist required.', timestamp: '2 min ago', isRead: false, isCritical: true },
  { id: 'not-2', type: 'Blood', title: 'Emergency Blood Request', description: 'Patient requests 2 units of O- at Civil Hospital Ratnagiri.', timestamp: '8 min ago', isRead: false, isCritical: true },
  { id: 'not-3', type: 'Stale Data', title: 'Resource Staleness Alert', description: 'Chirayu Hospital ICU beds data has not been updated in 4 hours.', timestamp: '12 min ago', isRead: false, isCritical: false },
  { id: 'not-4', type: 'Resource', title: 'ICU Capacity Alert', description: 'Apex Hospital reported ICU availability is now critical (1 bed left).', timestamp: '30 min ago', isRead: true, isCritical: true },
  { id: 'not-5', type: 'Ambulance', title: 'ALS Ambulance Dispatched', description: 'AMB-RAT-004 dispatched to highway milestone 42.', timestamp: '45 min ago', isRead: true, isCritical: false },
  { id: 'not-6', type: 'Hospital', title: 'Verification Request', description: 'Chintamani Hospital submitted verification credentials.', timestamp: '1 hour ago', isRead: true, isCritical: false },
  { id: 'not-7', type: 'Hospital', title: 'Verification Request', description: 'Soham Hospital submitted verification credentials.', timestamp: '2 hours ago', isRead: true, isCritical: false },
  { id: 'not-8', type: 'Emergency', title: 'Emergency SOS Resolved', description: 'Cardiac Emergency SOS at Zadgaon resolved successfully.', timestamp: '3 hours ago', isRead: true, isCritical: false },
  { id: 'not-9', type: 'Blood', title: 'Blood Level Alert', description: 'Civil Hospital Ratnagiri reports AB- blood inventory is depleted.', timestamp: '4 hours ago', isRead: true, isCritical: true },
  { id: 'not-10', type: 'Resource', title: 'Oxygen Level Normal', description: 'Parkar Hospital replenished liquid oxygen capacity (4 KL available).', timestamp: '5 hours ago', isRead: true, isCritical: false }
];

export const mockEmergencyRequests: EmergencyRequest[] = [
  { id: 'req-1', patientId: 'usr-1', patientName: 'Shubham Parkar', emergencyType: 'Road Accident', location: 'Maruti Mandir Chowk, Ratnagiri', lat: 16.9982, lng: 73.3142, requiredResources: ['icu_beds', 'ventilators', 'specialist', 'ambulance'], status: 'Dispatched', createdAt: '10 min ago' },
  { id: 'req-2', patientId: 'usr-2', patientName: 'Amit Ghavre', emergencyType: 'Chest Pain', location: 'Bhatye, Ratnagiri', lat: 16.9744, lng: 73.2965, requiredResources: ['icu_beds', 'specialist', 'ambulance'], status: 'Active', createdAt: '2 min ago' },
  { id: 'req-3', patientId: 'usr-3', patientName: 'Priya Joshi', emergencyType: 'Breathing Emergency', location: 'Jail Road, Ratnagiri', lat: 16.9944, lng: 73.3033, requiredResources: ['ventilators', 'oxygen_kl', 'ambulance'], status: 'Resolved', createdAt: '1 hour ago' },
  { id: 'req-4', patientId: 'usr-9', patientName: 'Rahul Rane', emergencyType: 'Stroke', location: 'Lanja Bazaar, Lanja', lat: 16.8520, lng: 73.5130, requiredResources: ['icu_beds', 'specialist', 'ambulance'], status: 'Resolved', createdAt: '3 hours ago' },
  { id: 'req-5', patientId: 'usr-10', patientName: 'Sneha Tambe', emergencyType: 'Pregnancy Emergency', location: 'Zadgaon, Ratnagiri', lat: 17.0050, lng: 73.3250, requiredResources: ['specialist', 'ambulance'], status: 'Resolved', createdAt: '5 hours ago' }
];

export const mockAIRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    requestId: 'req-1',
    hospitalId: 'hosp-2',
    hospitalName: 'Parkar Hospital & Research Institute',
    matchScore: 94,
    matchedResources: [
      { name: 'ICU Beds', available: true },
      { name: 'Ventilator', available: true },
      { name: 'Trauma Specialist (Dr. Vivek Parkar)', available: true },
      { name: 'ALS Ambulance (AMB-3)', available: true }
    ],
    distanceKm: 1.8,
    estimatedTravelTimeMin: 6,
    updatedAt: '6 min ago'
  },
  {
    id: 'rec-2',
    requestId: 'req-2',
    hospitalId: 'hosp-1',
    hospitalName: 'Civil Hospital Ratnagiri',
    matchScore: 89,
    matchedResources: [
      { name: 'ICU Beds', available: true },
      { name: 'Cardiology Consultant (Dr. Rajesh Sawant)', available: true },
      { name: 'ALS Ambulance (AMB-1)', available: true }
    ],
    distanceKm: 1.2,
    estimatedTravelTimeMin: 4,
    updatedAt: '10 min ago'
  }
];

export const mockBloodRequests: BloodRequest[] = [
  { id: 'breq-1', patientId: 'usr-1', patientName: 'Shubham Parkar', bloodGroup: 'O-', unitsRequired: 2, hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', status: 'Pending', createdAt: '8 min ago' },
  { id: 'breq-2', patientId: 'usr-2', patientName: 'Amit Ghavre', bloodGroup: 'B-', unitsRequired: 1, hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', status: 'Approved', createdAt: '20 min ago' },
  { id: 'breq-3', patientId: 'usr-3', patientName: 'Priya Joshi', bloodGroup: 'AB-', unitsRequired: 2, hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', status: 'Collected', createdAt: '4 hours ago' }
];

export const mockResourceUpdateLogs: ResourceUpdateLog[] = [
  { id: 'log-u1', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', resourceName: 'ICU Beds', previousValue: 3, newValue: 4, status: 'Available', reason: 'Patient discharged from ICU', updatedAt: '6 min ago' },
  { id: 'log-u2', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', resourceName: 'Ventilators', previousValue: 3, newValue: 2, status: 'Available', reason: 'Assigned to emergency stroke patient', updatedAt: '15 min ago' },
  { id: 'log-u3', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', resourceName: 'ICU Beds', previousValue: 9, newValue: 8, status: 'Available', reason: 'Routine intake', updatedAt: '10 min ago' },
  { id: 'log-u4', hospitalId: 'hosp-3', hospitalName: 'Apex Hospital', resourceName: 'Ventilators', previousValue: 1, newValue: 0, status: 'Critical', reason: 'Equipment out of service/maintenance', updatedAt: '42 min ago' }
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'aud-1', userId: 'usr-8', userName: 'Super Admin Control', userRole: 'super_admin', action: 'Verified Hospital', details: 'Approved Parkar Hospital credentials after validation', timestamp: '1 day ago' },
  { id: 'aud-2', userId: 'usr-4', userName: 'Dr. Vivek Parkar', userRole: 'hospital_admin', action: 'Updated Resources', details: 'Updated ICU Beds from 3 to 4', timestamp: '6 min ago' },
  { id: 'aud-3', userId: 'usr-5', userName: 'Dr. S. K. Patil', userRole: 'hospital_admin', action: 'Ambulance Check', details: 'Dispatched MH-08-AG-1001 for Chest Pain response', timestamp: '10 min ago' }
];
