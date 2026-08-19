// MedRadar AI — Persistent Client-Side Memory Database (13 Core Entities)
import {
  type User,
  type Hospital,
  type HospitalResource,
  type Doctor,
  type Department,
  type BloodInventory,
  type Ambulance,
  type EmergencyRequest,
  type Recommendation,
  type BloodRequest,
  type ResourceUpdate,
  type AuditLog,
  type Notification,
  type TransferRequest
} from '../types';

// Helper to load/save from localStorage to persist changes
const getStorage = <T>(key: string, defaultValue: T): T => {
  const val = localStorage.getItem(`medradar_${key}`);
  return val ? JSON.parse(val) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(`medradar_${key}`, JSON.stringify(value));
};

// -------------------------------------------------------------
// SEEDING DATA
// -------------------------------------------------------------

const seedUsers: User[] = [
  { id: 'usr-1', name: 'Shubham Parkar', email: 'shubham@medradar.ai', mobile: '9876543210', role: 'patient', location: 'Ratnagiri', createdAt: '2026-08-01T12:00:00Z' },
  { id: 'usr-2', name: 'Amit Ghavre', email: 'amit@medradar.ai', mobile: '9876543211', role: 'patient', location: 'Ratnagiri', createdAt: '2026-08-02T12:00:00Z' },
  { id: 'usr-3', name: 'Priya Joshi', email: 'priya@medradar.ai', mobile: '9876543212', role: 'patient', location: 'Ratnagiri', createdAt: '2026-08-03T12:00:00Z' },
  { id: 'usr-4', name: 'Dr. Vivek Parkar', email: 'vivek@parkarhospital.org', mobile: '9876543213', role: 'hospital_admin', hospitalId: 'hosp-2', createdAt: '2026-08-04T12:00:00Z' },
  { id: 'usr-4b', name: 'Parkar Hospital Admin', email: 'admin@parkarhospital.com', mobile: '9876543213', role: 'hospital_admin', hospitalId: 'hosp-2', createdAt: '2026-08-04T12:00:00Z' },
  { id: 'usr-5', name: 'Dr. S. K. Patil', email: 'skpatil@civilhosp.org', mobile: '9876543214', role: 'hospital_admin', hospitalId: 'hosp-1', createdAt: '2026-08-05T12:00:00Z' },
  { id: 'usr-6', name: 'Aditi Surve', email: 'aditi@apex.org', mobile: '9876543215', role: 'hospital_admin', hospitalId: 'hosp-3', createdAt: '2026-08-06T12:00:00Z' },
  { id: 'usr-7', name: 'Milind Sawant', email: 'milind@konkan.org', mobile: '9876543216', role: 'hospital_admin', hospitalId: 'hosp-4', createdAt: '2026-08-07T12:00:00Z' },
  { id: 'usr-p1', name: 'Shree Ramnath Admin', email: 'admin@shreeram.com', mobile: '9876543299', role: 'hospital_admin', hospitalId: 'hosp-6', createdAt: '2026-08-10T12:00:00Z' },
  { id: 'usr-8', name: 'Super Admin Control', email: 'admin@medradar.ai', mobile: '9876543217', role: 'super_admin', createdAt: '2026-08-08T12:00:00Z' },
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `usr-gen-${i}`,
    name: `User Demo ${i + 4}`,
    email: `user${i + 4}@medradar.ai`,
    mobile: `98765432${i + 20}`,
    role: (i % 2 === 0 ? 'patient' : 'hospital_admin') as any,
    hospitalId: i % 2 !== 0 ? `hosp-${(i % 10) + 5}` : undefined,
    createdAt: '2026-08-09T12:00:00Z'
  }))
];

const seedHospitals: Hospital[] = [
  { id: 'hosp-1', name: 'Civil Hospital Ratnagiri', registrationNumber: 'REG-10001', type: 'Government', address: 'Jail Road', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9944, lng: 73.3033, phone: '+91-2352-222031', emergencyContact: '102', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 1.2, readinessScore: 88, updatedAt: '2026-08-19T00:10:00Z' },
  { id: 'hosp-2', name: 'Parkar Hospital & Research Institute', registrationNumber: 'REG-10002', type: 'Private', address: 'Khareghat Road', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9912, lng: 73.3001, phone: '+91-2352-223401', emergencyContact: '+91-2352-223405', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 1.8, readinessScore: 92, updatedAt: '2026-08-19T00:15:00Z' },
  { id: 'hosp-3', name: 'Apex Hospital', registrationNumber: 'REG-10003', type: 'Private', address: 'Maruti Mandir Road', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9982, lng: 73.3142, phone: '+91-2352-226789', emergencyContact: '+91-2352-226785', verified: true, emergencyStatus: 'Limited', distanceFromUserKm: 2.1, readinessScore: 68, updatedAt: '2026-08-18T23:30:00Z' },
  { id: 'hosp-4', name: 'Shree Ramnath Hospital / Konkan Cardiac Centre', registrationNumber: 'REG-10004', type: 'Private', address: 'Swaroopnagar', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9854, lng: 73.2982, phone: '+91-2352-221234', emergencyContact: '+91-2352-221235', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 2.4, readinessScore: 84, updatedAt: '2026-08-19T00:08:00Z' },
  { id: 'hosp-5', name: 'Chirayu Hospital', registrationNumber: 'REG-10005', type: 'Private', address: 'Salvi Stop', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 17.0012, lng: 73.3198, phone: '+91-2352-271500', emergencyContact: '+91-2352-271501', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 3.2, readinessScore: 78, updatedAt: '2026-08-18T20:20:00Z' }, // candidate for stale data (>2 hours)
  { id: 'hosp-6', name: 'Chintamani Hospital', registrationNumber: 'REG-10006', type: 'Private', address: 'Subhash Road', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9930, lng: 73.3055, phone: '+91-2352-224488', emergencyContact: '+91-2352-224489', verified: false, emergencyStatus: 'Operational', distanceFromUserKm: 1.5, readinessScore: 50, updatedAt: '2026-08-18T23:00:00Z' },
  { id: 'hosp-7', name: 'Aparant Hospital', registrationNumber: 'REG-10007', type: 'Private', address: 'Bhatye Beach Road', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9744, lng: 73.2965, phone: '+91-2352-230111', emergencyContact: '+91-2352-230112', verified: true, emergencyStatus: 'Critical', distanceFromUserKm: 4.1, readinessScore: 35, updatedAt: '2026-08-19T00:18:00Z' },
  { id: 'hosp-8', name: 'Nandadeep Eye Hospital / DRPNN Institute', registrationNumber: 'REG-10008', type: 'Private', address: 'Opp. Police Headquarters', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9950, lng: 73.3080, phone: '+91-2352-225888', emergencyContact: '+91-2352-225889', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 1.9, readinessScore: 80, updatedAt: '2026-08-18T21:10:00Z' }, // Candidate for stale (>2 hours)
  { id: 'hosp-9', name: 'Jyoti Eye Care & Research Foundation', registrationNumber: 'REG-10009', type: 'Private', address: 'Radhakrishna Naka', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9961, lng: 73.3020, phone: '+91-2352-223120', emergencyContact: '+91-2352-223121', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 1.4, readinessScore: 75, updatedAt: '2026-08-18T19:00:00Z' }, // Candidate for stale (>2 hours)
  { id: 'hosp-10', name: 'Nirmal Balrugnalaya', registrationNumber: 'REG-10010', type: 'Private', address: 'Damle Chowk', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9902, lng: 73.2940, phone: '+91-2352-221100', emergencyContact: '+91-2352-221101', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 2.2, readinessScore: 82, updatedAt: '2026-08-18T23:55:00Z' },
  { id: 'hosp-11', name: 'Soham Hospital', registrationNumber: 'REG-10011', type: 'Private', address: 'Near Rahatghar Bus Stand', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 17.0090, lng: 73.3280, phone: '+91-2352-228800', emergencyContact: '+91-2352-228801', verified: false, emergencyStatus: 'Limited', distanceFromUserKm: 4.8, readinessScore: 40, updatedAt: '2026-08-18T22:00:00Z' },
  { id: 'hosp-12', name: 'Sanjeevani Hospital', registrationNumber: 'REG-10012', type: 'Private', address: 'Sawantwadi Road', city: 'Lanja', state: 'Maharashtra', pinCode: '416701', lat: 16.8520, lng: 73.5130, phone: '+91-2351-230045', emergencyContact: '+91-2351-230046', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 32.5, readinessScore: 85, updatedAt: '2026-08-18T23:45:00Z' },
  { id: 'hosp-13', name: 'Regional Mental Hospital', registrationNumber: 'REG-10013', type: 'Government', address: 'Thiba Palace Road', city: 'Ratnagiri', state: 'Maharashtra', pinCode: '415612', lat: 16.9890, lng: 73.3110, phone: '+91-2352-222216', emergencyContact: '102', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 2.5, readinessScore: 70, updatedAt: '2026-08-17T12:00:00Z' }, // candidate for stale data
  { id: 'hosp-14', name: 'Vivekanand Multispeciality Hospital', registrationNumber: 'REG-10014', type: 'Private', address: 'Khed Bypass Road', city: 'Khed', state: 'Maharashtra', pinCode: '415709', lat: 17.7180, lng: 73.3890, phone: '+91-2356-263300', emergencyContact: '+91-2356-263301', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 98.4, readinessScore: 89, updatedAt: '2026-08-19T00:05:00Z' },
  { id: 'hosp-15', name: 'B.K.L. Walawalkar Hospital, Diagnostic & Research Centre', registrationNumber: 'REG-10015', type: 'Charitable', address: 'Dervan', city: 'Chiplun', state: 'Maharashtra', pinCode: '415606', lat: 17.4720, lng: 73.6190, phone: '+91-2355-264137', emergencyContact: '+91-2355-264138', verified: true, emergencyStatus: 'Operational', distanceFromUserKm: 55.2, readinessScore: 94, updatedAt: '2026-08-19T00:12:00Z' }
];

const seedDepartments: Department[] = [
  ...seedHospitals.flatMap((h) => [
    { id: `dept-${h.id}-1`, hospitalId: h.id, name: 'Emergency Medicine', headOfDepartment: 'Dr. Head Demo Emergency', status: 'Active' as const },
    { id: `dept-${h.id}-2`, hospitalId: h.id, name: 'Cardiology', headOfDepartment: 'Dr. Head Demo Cardiology', status: 'Active' as const },
    { id: `dept-${h.id}-3`, hospitalId: h.id, name: 'ICU / Critical Care', headOfDepartment: 'Dr. Head Demo ICU', status: 'Active' as const },
    { id: `dept-${h.id}-4`, hospitalId: h.id, name: 'Trauma & General Surgery', headOfDepartment: 'Dr. Head Demo Surgery', status: 'Active' as const }
  ])
];

// Generates Resource Records (8 per hospital * 15 hospitals = 120)
const seedResources: HospitalResource[] = seedHospitals.flatMap((h, idx) => {
  const isStale = h.updatedAt.includes('2026-08-18T20') || h.updatedAt.includes('2026-08-18T21') || h.updatedAt.includes('2026-08-18T19') || h.updatedAt.includes('2026-08-17');
  const status = (available: number, total: number) => {
    if (isStale) return 'Stale' as const;
    const ratio = available / Math.max(1, total);
    if (ratio === 0) return 'Critical' as const;
    if (ratio <= 0.3) return 'Limited' as const;
    return 'Available' as const;
  };

  const icuAvail = idx % 3 === 0 ? 1 : idx % 2 === 0 ? 4 : 8;
  const genAvail = idx % 3 === 0 ? 12 : 42;
  const erAvail = idx % 5 === 0 ? 1 : 5;
  const isoAvail = idx % 2 === 0 ? 2 : 4;
  const pedAvail = idx % 3 === 0 ? 3 : 7;
  const ventAvail = idx % 4 === 0 ? 1 : idx % 2 === 0 ? 2 : 4;
  const oxyAvail = idx % 3 === 0 ? 1 : 6;

  return [
    {
      id: `res-${h.id}-1`,
      hospitalId: h.id,
      resourceType: 'icu_beds',
      resourceName: 'ICU Beds',
      total: 20,
      available: icuAvail,
      occupied: 20 - icuAvail,
      reserved: 0,
      status: status(icuAvail, 20),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin',
      updateHistory: [
        { available: icuAvail, total: 20, timestamp: '2 min ago', updatedBy: 'Hospital Admin', reason: 'Routine bed status update' }
      ]
    },
    {
      id: `res-${h.id}-2`,
      hospitalId: h.id,
      resourceType: 'general_beds',
      resourceName: 'General Beds',
      total: 100,
      available: genAvail,
      occupied: 100 - genAvail,
      reserved: 0,
      status: status(genAvail, 100),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin',
      updateHistory: [
        { available: genAvail, total: 100, timestamp: '5 min ago', updatedBy: 'Hospital Admin' }
      ]
    },
    {
      id: `res-${h.id}-3`,
      hospitalId: h.id,
      resourceType: 'emergency_capacity',
      resourceName: 'Emergency / Resuscitation Beds',
      total: 15,
      available: erAvail,
      occupied: 15 - erAvail,
      reserved: 0,
      status: status(erAvail, 15),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin'
    },
    {
      id: `res-${h.id}-4`,
      hospitalId: h.id,
      resourceType: 'isolation_beds',
      resourceName: 'Isolation Beds',
      total: 10,
      available: isoAvail,
      occupied: 10 - isoAvail,
      reserved: 0,
      status: status(isoAvail, 10),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin'
    },
    {
      id: `res-${h.id}-5`,
      hospitalId: h.id,
      resourceType: 'pediatric_beds',
      resourceName: 'Pediatric Beds',
      total: 20,
      available: pedAvail,
      occupied: 20 - pedAvail,
      reserved: 0,
      status: status(pedAvail, 20),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin'
    },
    {
      id: `res-${h.id}-6`,
      hospitalId: h.id,
      resourceType: 'ventilators',
      resourceName: 'Ventilators',
      total: 8,
      available: ventAvail,
      occupied: 8 - ventAvail,
      maintenance: 0,
      status: status(ventAvail, 8),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin',
      updateHistory: [
        { available: ventAvail, total: 8, timestamp: '8 min ago', updatedBy: 'Hospital Admin' }
      ]
    },
    {
      id: `res-${h.id}-7`,
      hospitalId: h.id,
      resourceType: 'oxygen_kl',
      resourceName: 'Liquid Oxygen Capacity',
      total: 10,
      available: oxyAvail,
      occupied: 10 - oxyAvail,
      unit: 'KL',
      status: status(oxyAvail, 10),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin',
      updateHistory: [
        { available: oxyAvail, total: 10, timestamp: '10 min ago', updatedBy: 'Hospital Admin' }
      ]
    },
    {
      id: `res-${h.id}-8`,
      hospitalId: h.id,
      resourceType: 'operating_theatres',
      resourceName: 'Operating Theatres',
      total: 4,
      available: idx % 3 === 0 ? 0 : 2,
      occupied: idx % 3 === 0 ? 4 : 2,
      status: status(idx % 3 === 0 ? 0 : 2, 4),
      updatedAt: h.updatedAt,
      updatedBy: 'Hospital Admin'
    }
  ];
});

// Seed 36 Unique, Realistic Ratnagiri District Doctors
const seedDoctors: Doctor[] = [
  {
    id: 'doc-1',
    doctorId: 'DOC-RAT-001',
    hospitalId: 'hosp-1',
    hospitalName: 'Civil Hospital Ratnagiri',
    departmentId: 'dept-hosp-1-1',
    name: 'Dr. Rajesh Sawant',
    specialization: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    qualification: 'MBBS, MD (Emergency Medicine)',
    experience: '12 years',
    experienceYears: 12,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 12341',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-19T00:10:00Z'
  },
  {
    id: 'doc-2',
    doctorId: 'DOC-RAT-002',
    hospitalId: 'hosp-1',
    hospitalName: 'Civil Hospital Ratnagiri',
    departmentId: 'dept-hosp-1-1',
    name: 'Dr. Sunita Kulkarni',
    specialization: 'Pediatrics',
    specialty: 'Pediatrics',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    experience: '15 years',
    experienceYears: 15,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 12342',
    profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-19T00:10:00Z'
  },
  {
    id: 'doc-3',
    doctorId: 'DOC-RAT-003',
    hospitalId: 'hosp-1',
    hospitalName: 'Civil Hospital Ratnagiri',
    departmentId: 'dept-hosp-1-4',
    name: 'Dr. Anil Gokhale',
    specialization: 'General Surgery',
    specialty: 'General Surgery',
    qualification: 'MBBS, MS (General Surgery)',
    experience: '20 years',
    experienceYears: 20,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 12343',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-19T00:10:00Z'
  },
  {
    id: 'doc-4',
    doctorId: 'DOC-RAT-004',
    hospitalId: 'hosp-2',
    hospitalName: 'Parkar Hospital & Research Institute',
    departmentId: 'dept-hosp-2-3',
    name: 'Dr. Vivek Parkar',
    specialization: 'Critical Care',
    specialty: 'Critical Care',
    qualification: 'MBBS, DNB (Critical Care & Trauma)',
    experience: '18 years',
    experienceYears: 18,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 22341',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-19T00:15:00Z'
  },
  {
    id: 'doc-5',
    doctorId: 'DOC-RAT-005',
    hospitalId: 'hosp-2',
    hospitalName: 'Parkar Hospital & Research Institute',
    departmentId: 'dept-hosp-2-2',
    name: 'Dr. Manisha Shirke',
    specialization: 'Cardiology',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: '10 years',
    experienceYears: 10,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 22342',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-19T00:15:00Z'
  },
  {
    id: 'doc-6',
    doctorId: 'DOC-RAT-006',
    hospitalId: 'hosp-2',
    hospitalName: 'Parkar Hospital & Research Institute',
    departmentId: 'dept-hosp-2-4',
    name: 'Dr. Sanjay Kelkar',
    specialization: 'Orthopedics',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: '14 years',
    experienceYears: 14,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 22343',
    profileImage: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-19T00:15:00Z'
  },
  {
    id: 'doc-7',
    doctorId: 'DOC-RAT-007',
    hospitalId: 'hosp-3',
    hospitalName: 'Apex Hospital',
    departmentId: 'dept-hosp-3-1',
    name: 'Dr. Neha Patil',
    specialization: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    qualification: 'MBBS, MEM (Emergency Medicine)',
    experience: '8 years',
    experienceYears: 8,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 33451',
    profileImage: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-18T23:30:00Z'
  },
  {
    id: 'doc-8',
    doctorId: 'DOC-RAT-008',
    hospitalId: 'hosp-3',
    hospitalName: 'Apex Hospital',
    departmentId: 'dept-hosp-3-2',
    name: 'Dr. Amit Jadhav',
    specialization: 'Neurology',
    specialty: 'Neurology',
    qualification: 'MBBS, MD, DM (Neurology)',
    experience: '16 years',
    experienceYears: 16,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 33452',
    profileImage: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-18T23:30:00Z'
  },
  {
    id: 'doc-9',
    doctorId: 'DOC-RAT-009',
    hospitalId: 'hosp-3',
    hospitalName: 'Apex Hospital',
    departmentId: 'dept-hosp-3-4',
    name: 'Dr. Priya Deshmukh',
    specialization: 'Gynecology',
    specialty: 'Gynecology',
    qualification: 'MBBS, MS (OBGYN)',
    experience: '11 years',
    experienceYears: 11,
    availabilityStatus: 'Unavailable',
    status: 'Off Duty',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 33453',
    profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-18T23:30:00Z'
  },
  {
    id: 'doc-10',
    doctorId: 'DOC-RAT-010',
    hospitalId: 'hosp-4',
    hospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre',
    departmentId: 'dept-hosp-4-2',
    name: 'Dr. Sagar Kadam',
    specialization: 'Cardiology',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DNB (Cardiology)',
    experience: '13 years',
    experienceYears: 13,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 44561',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-04T10:00:00Z',
    updatedAt: '2026-08-19T00:08:00Z'
  },
  {
    id: 'doc-11',
    doctorId: 'DOC-RAT-011',
    hospitalId: 'hosp-4',
    hospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre',
    departmentId: 'dept-hosp-4-3',
    name: 'Dr. Sneha Joshi',
    specialization: 'Critical Care',
    specialty: 'Critical Care',
    qualification: 'MBBS, MD (Anesthesiology & Critical Care)',
    experience: '9 years',
    experienceYears: 9,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 44562',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-04T10:00:00Z',
    updatedAt: '2026-08-19T00:08:00Z'
  },
  {
    id: 'doc-12',
    doctorId: 'DOC-RAT-012',
    hospitalId: 'hosp-4',
    hospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre',
    departmentId: 'dept-hosp-4-4',
    name: 'Dr. Rohit Bapat',
    specialization: 'General Surgery',
    specialty: 'General Surgery',
    qualification: 'MBBS, MS, FMAS',
    experience: '17 years',
    experienceYears: 17,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 44563',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-04T10:00:00Z',
    updatedAt: '2026-08-19T00:08:00Z'
  },
  {
    id: 'doc-13',
    doctorId: 'DOC-RAT-013',
    hospitalId: 'hosp-5',
    hospitalName: 'Chirayu Hospital',
    departmentId: 'dept-hosp-5-1',
    name: 'Dr. Meenal Kamat',
    specialization: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    qualification: 'MBBS, MD',
    experience: '7 years',
    experienceYears: 7,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 55671',
    profileImage: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-18T20:20:00Z'
  },
  {
    id: 'doc-14',
    doctorId: 'DOC-RAT-014',
    hospitalId: 'hosp-5',
    hospitalName: 'Chirayu Hospital',
    departmentId: 'dept-hosp-5-3',
    name: 'Dr. Akshay Naik',
    specialization: 'Pulmonology',
    specialty: 'Pulmonology',
    qualification: 'MBBS, DTCD, MD (Chest Medicine)',
    experience: '12 years',
    experienceYears: 12,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 55672',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-18T20:20:00Z'
  },
  {
    id: 'doc-15',
    doctorId: 'DOC-RAT-015',
    hospitalId: 'hosp-6',
    hospitalName: 'Chintamani Hospital',
    departmentId: 'dept-hosp-6-1',
    name: 'Dr. Rutuja Shinde',
    specialization: 'General Medicine',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: '10 years',
    experienceYears: 10,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 66781',
    profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-06T10:00:00Z',
    updatedAt: '2026-08-18T23:00:00Z'
  },
  {
    id: 'doc-16',
    doctorId: 'DOC-RAT-016',
    hospitalId: 'hosp-6',
    hospitalName: 'Chintamani Hospital',
    departmentId: 'dept-hosp-6-4',
    name: 'Dr. Nikhil Pawar',
    specialization: 'General Surgery',
    specialty: 'General Surgery',
    qualification: 'MBBS, MS',
    experience: '14 years',
    experienceYears: 14,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 66782',
    profileImage: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-06T10:00:00Z',
    updatedAt: '2026-08-18T23:00:00Z'
  },
  {
    id: 'doc-17',
    doctorId: 'DOC-RAT-017',
    hospitalId: 'hosp-7',
    hospitalName: 'Aparant Hospital',
    departmentId: 'dept-hosp-7-1',
    name: 'Dr. Pooja More',
    specialization: 'Critical Care',
    specialty: 'Critical Care',
    qualification: 'MBBS, DA, IDCCM',
    experience: '9 years',
    experienceYears: 9,
    availabilityStatus: 'Unavailable',
    status: 'Off Duty',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 77891',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-07T10:00:00Z',
    updatedAt: '2026-08-19T00:18:00Z'
  },
  {
    id: 'doc-18',
    doctorId: 'DOC-RAT-018',
    hospitalId: 'hosp-7',
    hospitalName: 'Aparant Hospital',
    departmentId: 'dept-hosp-7-4',
    name: 'Dr. Mahesh Chavan',
    specialization: 'Orthopedics',
    specialty: 'Orthopedics',
    qualification: 'MBBS, D.Ortho, MS',
    experience: '15 years',
    experienceYears: 15,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 77892',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-07T10:00:00Z',
    updatedAt: '2026-08-19T00:18:00Z'
  },
  {
    id: 'doc-19',
    doctorId: 'DOC-RAT-019',
    hospitalId: 'hosp-8',
    hospitalName: 'Nandadeep Eye Hospital / DRPNN Institute',
    departmentId: 'dept-hosp-8-4',
    name: 'Dr. Shekhar Tambe',
    specialization: 'Ophthalmology',
    specialty: 'Ophthalmology',
    qualification: 'MBBS, MS (Ophthalmology), DO',
    experience: '18 years',
    experienceYears: 18,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 88901',
    profileImage: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-08T10:00:00Z',
    updatedAt: '2026-08-18T21:10:00Z'
  },
  {
    id: 'doc-20',
    doctorId: 'DOC-RAT-020',
    hospitalId: 'hosp-9',
    hospitalName: 'Jyoti Eye Care & Research Foundation',
    departmentId: 'dept-hosp-9-4',
    name: 'Dr. Rashmi Karandikar',
    specialization: 'Ophthalmology',
    specialty: 'Ophthalmology',
    qualification: 'MBBS, DOMS, DNB (Ophthalmology)',
    experience: '13 years',
    experienceYears: 13,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 99011',
    profileImage: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-09T10:00:00Z',
    updatedAt: '2026-08-18T19:00:00Z'
  },
  {
    id: 'doc-21',
    doctorId: 'DOC-RAT-021',
    hospitalId: 'hosp-10',
    hospitalName: 'Nirmal Balrugnalaya',
    departmentId: 'dept-hosp-10-1',
    name: 'Dr. Amol Rane',
    specialization: 'Pediatrics',
    specialty: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '14 years',
    experienceYears: 14,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 11121',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-18T23:55:00Z'
  },
  {
    id: 'doc-22',
    doctorId: 'DOC-RAT-022',
    hospitalId: 'hosp-10',
    hospitalName: 'Nirmal Balrugnalaya',
    departmentId: 'dept-hosp-10-3',
    name: 'Dr. Varsha Mane',
    specialization: 'Neonatology',
    specialty: 'Neonatology',
    qualification: 'MBBS, DCH, Fellowship in Neonatology',
    experience: '11 years',
    experienceYears: 11,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 11122',
    profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-18T23:55:00Z'
  },
  {
    id: 'doc-23',
    doctorId: 'DOC-RAT-023',
    hospitalId: 'hosp-11',
    hospitalName: 'Soham Hospital',
    departmentId: 'dept-hosp-11-1',
    name: 'Dr. Suhas Bhat',
    specialization: 'General Medicine',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD',
    experience: '8 years',
    experienceYears: 8,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 22231',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-11T10:00:00Z',
    updatedAt: '2026-08-18T22:00:00Z'
  },
  {
    id: 'doc-24',
    doctorId: 'DOC-RAT-024',
    hospitalId: 'hosp-11',
    hospitalName: 'Soham Hospital',
    departmentId: 'dept-hosp-11-4',
    name: 'Dr. Neela Patwardhan',
    specialization: 'General Surgery',
    specialty: 'General Surgery',
    qualification: 'MBBS, MS',
    experience: '12 years',
    experienceYears: 12,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 22232',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-11T10:00:00Z',
    updatedAt: '2026-08-18T22:00:00Z'
  },
  {
    id: 'doc-25',
    doctorId: 'DOC-RAT-025',
    hospitalId: 'hosp-12',
    hospitalName: 'Sanjeevani Hospital',
    departmentId: 'dept-hosp-12-1',
    name: 'Dr. Sandeep Kulkarni',
    specialization: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    qualification: 'MBBS, MEM',
    experience: '10 years',
    experienceYears: 10,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 33341',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-12T10:00:00Z',
    updatedAt: '2026-08-18T23:45:00Z'
  },
  {
    id: 'doc-26',
    doctorId: 'DOC-RAT-026',
    hospitalId: 'hosp-12',
    hospitalName: 'Sanjeevani Hospital',
    departmentId: 'dept-hosp-12-4',
    name: 'Dr. Archana Surve',
    specialization: 'Gynecology',
    specialty: 'Gynecology',
    qualification: 'MBBS, DGO, MD',
    experience: '15 years',
    experienceYears: 15,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 33342',
    profileImage: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-12T10:00:00Z',
    updatedAt: '2026-08-18T23:45:00Z'
  },
  {
    id: 'doc-27',
    doctorId: 'DOC-RAT-027',
    hospitalId: 'hosp-13',
    hospitalName: 'Regional Mental Hospital',
    departmentId: 'dept-hosp-13-1',
    name: 'Dr. Abhay Joshi',
    specialization: 'Psychiatry',
    specialty: 'Psychiatry',
    qualification: 'MBBS, MD (Psychiatry), DPM',
    experience: '22 years',
    experienceYears: 22,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 44451',
    profileImage: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622908007234-a16ecb1d8f52?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-13T10:00:00Z',
    updatedAt: '2026-08-17T12:00:00Z'
  },
  {
    id: 'doc-28',
    doctorId: 'DOC-RAT-028',
    hospitalId: 'hosp-13',
    hospitalName: 'Regional Mental Hospital',
    departmentId: 'dept-hosp-13-3',
    name: 'Dr. Tanvi Sardesai',
    specialization: 'Psychiatry',
    specialty: 'Psychiatry',
    qualification: 'MBBS, DPM',
    experience: '9 years',
    experienceYears: 9,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 44452',
    profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-13T10:00:00Z',
    updatedAt: '2026-08-17T12:00:00Z'
  },
  {
    id: 'doc-29',
    doctorId: 'DOC-RAT-029',
    hospitalId: 'hosp-14',
    hospitalName: 'Vivekanand Multispeciality Hospital',
    departmentId: 'dept-hosp-14-2',
    name: 'Dr. Milind Gokhale',
    specialization: 'Cardiology',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: '17 years',
    experienceYears: 17,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 55561',
    profileImage: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-14T10:00:00Z',
    updatedAt: '2026-08-19T00:05:00Z'
  },
  {
    id: 'doc-30',
    doctorId: 'DOC-RAT-030',
    hospitalId: 'hosp-14',
    hospitalName: 'Vivekanand Multispeciality Hospital',
    departmentId: 'dept-hosp-14-1',
    name: 'Dr. Deepa Pawaskar',
    specialization: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    qualification: 'MBBS, MD',
    experience: '11 years',
    experienceYears: 11,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 55562',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-14T10:00:00Z',
    updatedAt: '2026-08-19T00:05:00Z'
  },
  {
    id: 'doc-31',
    doctorId: 'DOC-RAT-031',
    hospitalId: 'hosp-14',
    hospitalName: 'Vivekanand Multispeciality Hospital',
    departmentId: 'dept-hosp-14-4',
    name: 'Dr. Prasad Kadrekar',
    specialization: 'Orthopedics',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: '14 years',
    experienceYears: 14,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: false,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 55563',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-14T10:00:00Z',
    updatedAt: '2026-08-19T00:05:00Z'
  },
  {
    id: 'doc-32',
    doctorId: 'DOC-RAT-032',
    hospitalId: 'hosp-15',
    hospitalName: 'B.K.L. Walawalkar Hospital',
    departmentId: 'dept-hosp-15-1',
    name: 'Dr. Shruti Sawant',
    specialization: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    qualification: 'MBBS, MD, MEM',
    experience: '13 years',
    experienceYears: 13,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 66671',
    profileImage: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-19T00:12:00Z'
  },
  {
    id: 'doc-33',
    doctorId: 'DOC-RAT-033',
    hospitalId: 'hosp-15',
    hospitalName: 'B.K.L. Walawalkar Hospital',
    departmentId: 'dept-hosp-15-2',
    name: 'Dr. Arvind Phadke',
    specialization: 'Cardiology',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: '19 years',
    experienceYears: 19,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 66672',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-19T00:12:00Z'
  },
  {
    id: 'doc-34',
    doctorId: 'DOC-RAT-034',
    hospitalId: 'hosp-15',
    hospitalName: 'B.K.L. Walawalkar Hospital',
    departmentId: 'dept-hosp-15-3',
    name: 'Dr. Kavita Bhosale',
    specialization: 'Oncology',
    specialty: 'Oncology',
    qualification: 'MBBS, MD, DM (Medical Oncology)',
    experience: '15 years',
    experienceYears: 15,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 66673',
    profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-19T00:12:00Z'
  },
  {
    id: 'doc-35',
    doctorId: 'DOC-RAT-035',
    hospitalId: 'hosp-15',
    hospitalName: 'B.K.L. Walawalkar Hospital',
    departmentId: 'dept-hosp-15-4',
    name: 'Dr. Hrishikesh Natekar',
    specialization: 'Neurosurgery',
    specialty: 'Neurosurgery',
    qualification: 'MBBS, MS, MCh (Neurosurgery)',
    experience: '16 years',
    experienceYears: 16,
    availabilityStatus: 'Available',
    status: 'Available',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 66674',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-19T00:12:00Z'
  },
  {
    id: 'doc-36',
    doctorId: 'DOC-RAT-036',
    hospitalId: 'hosp-1',
    hospitalName: 'Civil Hospital Ratnagiri',
    departmentId: 'dept-hosp-1-2',
    name: 'Dr. Rituja Dabholkar',
    specialization: 'Cardiology',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DNB (Cardiology)',
    experience: '10 years',
    experienceYears: 10,
    availabilityStatus: 'On Call',
    status: 'On Call',
    emergencyDuty: true,
    consultationType: 'Hospital Visit',
    contact: '+91 98220 12344',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-19T00:10:00Z'
  }
];

// Seed Blood Inventory Records (All 8 groups per hospital)
const seedBloodInventory: BloodInventory[] = seedHospitals.flatMap((h) => {
  const groups: Array<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'> = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const getPredefinedUnits = (groupIdx: number) => {
    if (h.id === 'hosp-1') {
      const counts = [12, 4, 10, 3, 6, 2, 14, 5];
      return counts[groupIdx];
    }
    if (h.id === 'hosp-2') {
      const counts = [8, 2, 11, 3, 5, 1, 10, 4];
      return counts[groupIdx];
    }
    if (h.id === 'hosp-3') {
      const counts = [6, 2, 7, 1, 3, 1, 9, 2];
      return counts[groupIdx];
    }
    // Dynamic fallbacks for other hospitals
    return groupIdx % 4 === 0 ? 0 : groupIdx % 3 === 0 ? 3 : groupIdx % 2 === 0 ? 8 : 12;
  };

  return groups.map((grp, idx) => {
    const units = getPredefinedUnits(idx);
    const status = (units === 0 ? 'Critical' : units <= 4 ? 'Limited' : 'Available') as any;
    const reserved = units > 0 ? (idx % 3 === 0 ? 1 : 0) : 0;
    return {
      id: `blood-${h.id}-${grp}`,
      hospitalId: h.id,
      hospitalName: h.name,
      bloodGroup: grp,
      unitsAvailable: units,
      unitsReserved: reserved,
      status: status,
      updatedAt: h.updatedAt,
      source: 'Hospital Admin'
    };
  });
});

// Seed 15 Ambulances
const seedAmbulances: Ambulance[] = [
  { id: 'amb-1', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', ambulanceNumber: 'MH-08-AG-1001', type: 'Advanced Life Support', status: 'Available', equipment: ['Ventilator', 'Oxygen', 'Defibrillator', 'Cardiac Monitor'], lastLocation: 'Civil Hospital Base', lat: 16.9944, lng: 73.3033, updatedAt: '2026-08-19T00:10:00Z' },
  { id: 'amb-2', hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', ambulanceNumber: 'MH-08-AG-1002', type: 'Basic Life Support', status: 'Available', equipment: ['Oxygen', 'First Aid Kit'], lastLocation: 'Civil Hospital Base', lat: 16.9945, lng: 73.3034, updatedAt: '2026-08-19T00:08:00Z' },
  { id: 'amb-3', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', ambulanceNumber: 'MH-08-BG-2001', type: 'Advanced Life Support', status: 'Available', equipment: ['Ventilator', 'Oxygen', 'Cardiac Monitor', 'Intubation Kit'], lastLocation: 'Stadium Road', lat: 16.9912, lng: 73.3001, updatedAt: '2026-08-19T00:12:00Z' },
  { id: 'amb-4', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', ambulanceNumber: 'MH-08-BG-2002', type: 'On Trip', status: 'On Trip', equipment: ['Oxygen', 'AED', 'Stretcher'], lastLocation: 'Maruti Mandir', lat: 16.9982, lng: 73.3142, updatedAt: '2026-08-19T00:14:00Z' },
  ...Array.from({ length: 11 }).map((_, i) => {
    const hosp = seedHospitals[(i % 13) + 2];
    const types = ['Advanced Life Support', 'Basic Life Support', 'Neonatal Ambulance', 'Patient Transport'];
    return {
      id: `amb-gen-${i}`,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      ambulanceNumber: `MH-08-XG-${3000 + i}`,
      type: types[i % types.length] as any,
      status: (i % 3 === 0 ? 'On Trip' : i % 4 === 0 ? 'Maintenance' : 'Available') as any,
      equipment: ['Oxygen', 'Stretcher', 'Defibrillator'],
      lastLocation: `${hosp.name} Base Area`,
      lat: hosp.lat + 0.005,
      lng: hosp.lng - 0.005,
      updatedAt: hosp.updatedAt
    };
  })
];

// Seed 5 Emergency Requests with Rich Ratnagiri Telemetry
const seedEmergencyRequests: EmergencyRequest[] = [
  {
    id: 'SOS-1042',
    patientId: 'usr-1',
    patientName: 'Shubham Parkar',
    patientReference: 'P-4821',
    emergencyType: 'Road Accident / Poly-Trauma',
    priority: 'Critical',
    location: 'Ratnagiri Highway Sector 2',
    locationAddress: 'NH-66 Bypass Junction, Ratnagiri',
    lat: 16.9982,
    lng: 73.3142,
    requiredResources: ['ICU Bed', 'Ventilator', 'Trauma Specialist', 'Emergency Department', 'ALS Ambulance'],
    requiredSpecialist: 'Trauma Specialist',
    status: 'Active',
    coordinationStatus: 'New',
    selectedHospitalId: 'hosp-2',
    selectedHospitalName: 'Parkar Hospital & Research Institute',
    assignedDoctorId: 'doc-4',
    assignedDoctorName: 'Dr. Vivek Parkar (Critical Care)',
    ambulanceId: 'amb-3',
    ambulanceNumber: 'MH-08-BG-2001 (ALS)',
    ambulanceEtaMin: 8,
    hospitalAlertStatus: 'pending',
    hospitalAlertTime: '2 min ago',
    timeline: [
      { title: 'SOS alert received from GPS mobile', timestamp: '09:42 AM', note: 'Location: Ratnagiri Highway Sector 2' },
      { title: 'MedRadar AI matched Parkar Hospital', timestamp: '09:43 AM', note: 'Readiness score 94%' },
      { title: 'Pre-alert dispatched to hospital command', timestamp: '09:44 AM' }
    ],
    createdAt: '2026-08-19T09:42:00Z',
    updatedAt: '2026-08-19T09:44:00Z'
  },
  {
    id: 'SOS-1045',
    patientId: 'usr-2',
    patientName: 'Amit Ghavre',
    patientReference: 'P-5120',
    emergencyType: 'Cardiac Emergency / Acute Chest Pain',
    priority: 'Critical',
    location: 'Maruti Mandir Naka',
    locationAddress: 'Opp. Bus Station Road, Ratnagiri',
    lat: 16.9912,
    lng: 73.3001,
    requiredResources: ['ICU Bed', 'Cardiac Monitor', 'Cardiologist', 'Oxygen'],
    requiredSpecialist: 'Cardiologist',
    status: 'Dispatched',
    coordinationStatus: 'Preparing',
    selectedHospitalId: 'hosp-2',
    selectedHospitalName: 'Parkar Hospital & Research Institute',
    assignedDoctorId: 'doc-5',
    assignedDoctorName: 'Dr. Manisha Shirke (Cardiology)',
    assignedIcuBed: 'Bed #4',
    assignedVentilator: 'Ventilator #2',
    ambulanceId: 'amb-4',
    ambulanceNumber: 'MH-08-BG-2002 (ALS)',
    ambulanceEtaMin: 5,
    hospitalAlertStatus: 'acknowledged',
    hospitalAlertTime: '5 min ago',
    timeline: [
      { title: 'SOS alert received', timestamp: '09:30 AM' },
      { title: 'Parkar Hospital acknowledged SOS', timestamp: '09:32 AM' },
      { title: 'Dr. Manisha Shirke assigned', timestamp: '09:34 AM' },
      { title: 'ICU Bed #4 and Ventilator #2 reserved', timestamp: '09:35 AM' }
    ],
    createdAt: '2026-08-19T09:30:00Z',
    updatedAt: '2026-08-19T09:35:00Z'
  },
  {
    id: 'SOS-1049',
    patientId: 'usr-3',
    patientName: 'Priya Joshi',
    patientReference: 'P-6091',
    emergencyType: 'Stroke / Neurological Trauma',
    priority: 'Critical',
    location: 'Bhatye Beach Road',
    locationAddress: 'Near Bhatye Bridge, Ratnagiri',
    lat: 16.9744,
    lng: 73.2965,
    requiredResources: ['ICU Bed', 'Neurologist', 'Ventilator'],
    requiredSpecialist: 'Neurologist',
    status: 'Active',
    coordinationStatus: 'Acknowledged',
    selectedHospitalId: 'hosp-2',
    selectedHospitalName: 'Parkar Hospital & Research Institute',
    ambulanceEtaMin: 12,
    hospitalAlertStatus: 'acknowledged',
    hospitalAlertTime: '8 min ago',
    timeline: [
      { title: 'SOS alert received', timestamp: '09:15 AM' },
      { title: 'Hospital pre-alert acknowledged', timestamp: '09:18 AM' }
    ],
    createdAt: '2026-08-19T09:15:00Z',
    updatedAt: '2026-08-19T09:18:00Z'
  },
  {
    id: 'SOS-1038',
    patientId: 'usr-gen-1',
    patientName: 'Karan Surve',
    patientReference: 'P-3912',
    emergencyType: 'Breathing Emergency / Asthma Attack',
    priority: 'Urgent',
    location: 'Salvi Stop',
    locationAddress: 'Salvi Stop Chowk, Ratnagiri',
    lat: 17.0012,
    lng: 73.3198,
    requiredResources: ['Emergency Bed', 'Pulmonologist', 'Oxygen'],
    requiredSpecialist: 'Pulmonologist',
    status: 'En Route',
    coordinationStatus: 'Ready',
    selectedHospitalId: 'hosp-2',
    selectedHospitalName: 'Parkar Hospital & Research Institute',
    assignedDoctorId: 'doc-4',
    assignedDoctorName: 'Dr. Vivek Parkar',
    assignedEmergencyBed: 'Emergency Bay #2',
    ambulanceId: 'amb-1',
    ambulanceNumber: 'MH-08-AG-1001',
    ambulanceEtaMin: 3,
    hospitalAlertStatus: 'acknowledged',
    timeline: [
      { title: 'SOS received', timestamp: '08:50 AM' },
      { title: 'Emergency Bay #2 prepared', timestamp: '08:55 AM' },
      { title: 'Hospital marked Ready for arrival', timestamp: '09:00 AM' }
    ],
    createdAt: '2026-08-19T08:50:00Z',
    updatedAt: '2026-08-19T09:00:00Z'
  },
  {
    id: 'SOS-1030',
    patientId: 'usr-gen-2',
    patientName: 'Ramesh Kadam',
    patientReference: 'P-2894',
    emergencyType: 'Pediatric Emergency / Severe Fever',
    priority: 'Urgent',
    location: 'Damle Chowk',
    locationAddress: 'Damle Chowk Road, Ratnagiri',
    lat: 16.9902,
    lng: 73.2940,
    requiredResources: ['Pediatric Bed', 'Pediatrician'],
    requiredSpecialist: 'Pediatrician',
    status: 'Resolved',
    coordinationStatus: 'Closed',
    selectedHospitalId: 'hosp-2',
    selectedHospitalName: 'Parkar Hospital & Research Institute',
    createdAt: '2026-08-19T07:30:00Z',
    updatedAt: '2026-08-19T08:15:00Z'
  }
];

// Seed 15-30 Recommendations
const seedRecommendations: Recommendation[] = [
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
    reason: 'Recommended because the hospital currently reports an available ICU bed, ventilator, trauma specialist and required blood resource, with an estimated short travel time.',
    updatedAt: '2026-08-19T00:08:00Z'
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
    reason: 'Recommended based on reported open ICU beds and direct emergency medicine staff on premises within 4 minutes drive.',
    updatedAt: '2026-08-19T00:15:00Z'
  },
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `rec-gen-${i}`,
    requestId: `req-gen-${i}`,
    hospitalId: seedHospitals[i % 5].id,
    hospitalName: seedHospitals[i % 5].name,
    matchScore: 70 + (i % 25),
    matchedResources: [
      { name: 'ICU Beds', available: true },
      { name: 'Ambulance Support', available: true }
    ],
    distanceKm: 2.5 + i,
    estimatedTravelTimeMin: 10 + i * 2,
    reason: 'Alternate match with operational beds and baseline emergency support.',
    updatedAt: '2026-08-18T18:00:00Z'
  }))
];

// Seed 15 Blood Requests
const seedBloodRequests: BloodRequest[] = [
  { id: 'breq-1', patientId: 'usr-1', patientName: 'Shubham Parkar', bloodGroup: 'O-', unitsRequired: 2, hospitalId: 'hosp-1', hospitalName: 'Civil Hospital Ratnagiri', status: 'Pending', createdAt: '2026-08-19T00:02:00Z' },
  { id: 'breq-2', patientId: 'usr-2', patientName: 'Amit Ghavre', bloodGroup: 'B-', unitsRequired: 1, hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', status: 'Approved', createdAt: '2026-08-18T23:40:00Z' },
  ...Array.from({ length: 13 }).map((_, i) => ({
    id: `breq-gen-${i}`,
    patientId: `usr-gen-${i}`,
    patientName: `User Demo ${i}`,
    bloodGroup: (['O+', 'A+', 'B+', 'AB-', 'O-'][i % 5]) as any,
    unitsRequired: (i % 3) + 1,
    hospitalId: seedHospitals[i % 10].id,
    hospitalName: seedHospitals[i % 10].name,
    status: (i % 3 === 0 ? 'Pending' : i % 3 === 1 ? 'Approved' : 'Collected') as any,
    createdAt: `2026-08-18T${12 + i}:10:00Z`
  }))
];

// Seed 30-50 Resource Updates
const seedResourceUpdates: ResourceUpdate[] = [
  { id: 'u-log-1', hospitalId: 'hosp-2', hospitalName: 'Parkar Hospital & Research Institute', resourceName: 'ICU Beds', previousValue: 3, newValue: 4, status: 'Available', reason: 'Discharged ICU patients', updatedBy: 'Dr. Vivek Parkar', updatedAt: '2026-08-19T00:15:00Z' },
  ...Array.from({ length: 39 }).map((_, i) => {
    const hosp = seedHospitals[i % 15];
    return {
      id: `u-log-gen-${i}`,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      resourceName: (['ICU Beds', 'Ventilators', 'Oxygen Supply', 'General Beds'][i % 4]),
      previousValue: 5 + (i % 5),
      newValue: 6 + (i % 4),
      status: (i % 3 === 0 ? 'Critical' : i % 3 === 1 ? 'Limited' : 'Available') as any,
      reason: 'Routine stock count adjustment',
      updatedBy: `Staff Admin ${i + 1}`,
      updatedAt: `2026-08-18T${10 + (i % 10)}:15:00Z`
    };
  })
];

// Seed 20+ Audit Logs
const seedAuditLogs: AuditLog[] = [
  { id: 'aud-1', actorId: 'usr-8', actorName: 'Super Admin Control', actorRole: 'super_admin', action: 'Approved Verification', entityType: 'Hospital', entityId: 'hosp-2', details: 'Approved Parkar Hospital credentials after validation', timestamp: '2026-08-19T00:01:00Z' },
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `aud-gen-${i}`,
    actorId: `usr-${i % 8}`,
    actorName: i % 8 === 7 ? 'Super Admin' : `Staff Admin ${i}`,
    actorRole: i % 8 === 7 ? 'super_admin' : 'hospital_admin',
    action: (i % 3 === 0 ? 'Login' : i % 3 === 1 ? 'Update Resources' : 'Roster Modification'),
    entityType: (i % 2 === 0 ? 'HospitalResource' : 'Doctor'),
    entityId: `res-gen-${i}`,
    details: `Administrative action performed on grid sector ${i + 1}`,
    timestamp: `2026-08-18T${10 + (i % 10)}:00:00Z`
  }))
];

// Seed 15-20 Notifications
const seedNotifications: Notification[] = [
  { id: 'not-1', recipientId: 'all_admins', type: 'Emergency', title: 'Critical SOS Dispatched', description: 'Road Accident at Maruti Mandir. Trauma Specialist required.', timestamp: '12 min ago', isRead: false, isCritical: true },
  { id: 'not-2', recipientId: 'all_admins', type: 'Blood', title: 'Emergency Blood Request', description: 'Patient requests 2 units of O- at Civil Hospital Ratnagiri.', timestamp: '30 min ago', isRead: false, isCritical: true },
  { id: 'not-3', recipientId: 'all_admins', type: 'Stale Data', title: 'Resource Staleness Alert', description: 'Chirayu Hospital ICU beds data has not been updated in 4 hours.', timestamp: '2 hours ago', isRead: false, isCritical: false },
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `not-gen-${i}`,
    recipientId: i % 3 === 0 ? 'usr-1' : 'all_admins',
    type: (['Emergency', 'Blood', 'Resource', 'Hospital', 'Verification'][i % 5]) as any,
    title: `Regional Alert Grid Sector ${i + 1}`,
    description: `Auto-generated platform message for notification feed sector ${i + 1}`,
    timestamp: `${(i + 1) * 3} hours ago`,
    isRead: i % 2 !== 0,
    isCritical: i % 4 === 0
  }))
];

// Seed 5 Transfer Requests
const seedTransfers: TransferRequest[] = [
  {
    id: 'TR-1042',
    patientReference: 'P-4821',
    sendingHospitalId: 'hosp-6',
    sendingHospitalName: 'Chintamani Hospital',
    receivingHospitalId: 'hosp-2',
    receivingHospitalName: 'Parkar Hospital & Research Institute',
    priority: 'Critical',
    requiredDepartment: 'ICU / Critical Care',
    requiredSpecialist: 'Neurology',
    requiredResources: ['ICU Bed', 'Ventilator', 'Neurologist'],
    bloodRequirement: {
      bloodGroup: 'O-',
      units: 2
    },
    status: 'Accepted',
    timeline: [
      { title: 'Transfer request created', timestamp: '10:42 AM', note: 'Initiated by Chintamani Hospital' },
      { title: 'Hospital recommendation generated', timestamp: '10:44 AM', note: 'Parkar Hospital ranked #1 (92% readiness)' },
      { title: 'Transfer request sent', timestamp: '10:46 AM', note: 'Sent to Parkar Hospital Command' },
      { title: 'Receiving hospital accepted', timestamp: '10:48 AM', note: 'Accepted by Dr. Vivek Parkar' },
      { title: 'Transfer preparation started', timestamp: '10:50 AM', note: 'ICU Bed #4 reserved' }
    ],
    createdAt: '2026-08-19T10:42:00Z',
    updatedAt: '2026-08-19T10:50:00Z'
  },
  {
    id: 'TR-1045',
    patientReference: 'P-5120',
    sendingHospitalId: 'hosp-1',
    sendingHospitalName: 'Civil Hospital Ratnagiri',
    receivingHospitalId: 'hosp-3',
    receivingHospitalName: 'Apex Hospital',
    priority: 'Critical',
    requiredDepartment: 'Cardiology',
    requiredSpecialist: 'Cardiology',
    requiredResources: ['ICU Bed', 'Cardiac Monitor', 'Cardiologist'],
    assignedAmbulanceId: 'amb-3',
    assignedAmbulanceNumber: 'MH-08-BG-2001 (ALS)',
    status: 'In Transit',
    timeline: [
      { title: 'Transfer request created', timestamp: '11:10 AM' },
      { title: 'Accepted by Apex Hospital', timestamp: '11:15 AM' },
      { title: 'Ambulance assigned', timestamp: '11:25 AM', note: 'MH-08-BG-2001 dispatched' },
      { title: 'Patient In Transit', timestamp: '11:32 AM', note: 'En route via Stadium Road' }
    ],
    createdAt: '2026-08-19T11:10:00Z',
    updatedAt: '2026-08-19T11:32:00Z'
  },
  {
    id: 'TR-1048',
    patientReference: 'P-6091',
    sendingHospitalId: 'hosp-5',
    sendingHospitalName: 'Chirayu Hospital',
    receivingHospitalId: 'hosp-2',
    receivingHospitalName: 'Parkar Hospital & Research Institute',
    priority: 'Urgent',
    requiredDepartment: 'ICU / Critical Care',
    requiredSpecialist: 'Pulmonology',
    requiredResources: ['ICU Bed', 'Pulmonologist'],
    status: 'Pending',
    timeline: [
      { title: 'Transfer request created', timestamp: '12:05 PM', note: 'Awaiting receiving hospital response' }
    ],
    createdAt: '2026-08-19T12:05:00Z',
    updatedAt: '2026-08-19T12:05:00Z'
  },
  {
    id: 'TR-1039',
    patientReference: 'P-3912',
    sendingHospitalId: 'hosp-4',
    sendingHospitalName: 'Shree Ramnath Hospital / Konkan Cardiac Centre',
    receivingHospitalId: 'hosp-1',
    receivingHospitalName: 'Civil Hospital Ratnagiri',
    priority: 'Routine',
    requiredDepartment: 'Trauma & General Surgery',
    requiredSpecialist: 'General Surgery',
    requiredResources: ['General Bed', 'Surgeon'],
    status: 'Completed',
    timeline: [
      { title: 'Request created', timestamp: '08:30 AM' },
      { title: 'Accepted', timestamp: '08:45 AM' },
      { title: 'In Transit', timestamp: '09:00 AM' },
      { title: 'Patient Received & Transfer Completed', timestamp: '09:20 AM' }
    ],
    createdAt: '2026-08-19T08:30:00Z',
    updatedAt: '2026-08-19T09:20:00Z'
  },
  {
    id: 'TR-1031',
    patientReference: 'P-2894',
    sendingHospitalId: 'hosp-7',
    sendingHospitalName: 'Aparant Hospital',
    receivingHospitalId: 'hosp-2',
    receivingHospitalName: 'Parkar Hospital & Research Institute',
    priority: 'Critical',
    requiredDepartment: 'ICU / Critical Care',
    requiredSpecialist: 'Critical Care',
    requiredResources: ['ICU Bed', 'Ventilator'],
    status: 'Rejected',
    rejectionReason: 'Emergency department overloaded',
    timeline: [
      { title: 'Request created', timestamp: '07:12 AM' },
      { title: 'Request Rejected', timestamp: '07:20 AM', note: 'Reason: Emergency department overloaded' }
    ],
    createdAt: '2026-08-19T07:12:00Z',
    updatedAt: '2026-08-19T07:20:00Z'
  }
];

// -------------------------------------------------------------
// PERSISTENT DB OBJECT
// -------------------------------------------------------------

export const db = {
  getUsers: () => getStorage<User[]>('users', seedUsers),
  saveUsers: (data: User[]) => setStorage('users', data),

  getHospitals: () => getStorage<Hospital[]>('hospitals', seedHospitals),
  saveHospitals: (data: Hospital[]) => setStorage('hospitals', data),

  getResources: () => getStorage<HospitalResource[]>('resources', seedResources),
  saveResources: (data: HospitalResource[]) => setStorage('resources', data),

  getDoctors: () => {
    const data = getStorage<Doctor[]>('doctors', seedDoctors);
    const names = data.map(d => d.name);
    const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
    const hasFictional = data.some(d => d.name.includes('Fictional Specialist') || d.name.includes('Demo Specialist'));
    if (hasDuplicates || hasFictional || data.length < 30) {
      console.warn('[MedRadar AI] Migrating doctors dataset to clean 36-doctor Ratnagiri directory.');
      setStorage('doctors', seedDoctors);
      return seedDoctors;
    }
    return data;
  },
  saveDoctors: (data: Doctor[]) => setStorage('doctors', data),

  getDepartments: () => getStorage<Department[]>('departments', seedDepartments),
  saveDepartments: (data: Department[]) => setStorage('departments', data),

  getBloodInventory: () => {
    const data = getStorage<BloodInventory[]>('blood_inventory', seedBloodInventory);
    if (data.length < 120) {
      setStorage('blood_inventory', seedBloodInventory);
      return seedBloodInventory;
    }
    return data;
  },
  saveBloodInventory: (data: BloodInventory[]) => setStorage('blood_inventory', data),

  getAmbulances: () => getStorage<Ambulance[]>('ambulances', seedAmbulances),
  saveAmbulances: (data: Ambulance[]) => setStorage('ambulances', data),

  getEmergencyRequests: () => getStorage<EmergencyRequest[]>('emergency_requests', seedEmergencyRequests),
  saveEmergencyRequests: (data: EmergencyRequest[]) => setStorage('emergency_requests', data),

  getRecommendations: () => getStorage<Recommendation[]>('recommendations', seedRecommendations),
  saveRecommendations: (data: Recommendation[]) => setStorage('recommendations', data),

  getBloodRequests: () => getStorage<BloodRequest[]>('blood_requests', seedBloodRequests),
  saveBloodRequests: (data: BloodRequest[]) => setStorage('blood_requests', data),

  getTransfers: () => getStorage<TransferRequest[]>('transfers', seedTransfers),
  saveTransfers: (data: TransferRequest[]) => setStorage('transfers', data),

  getResourceUpdates: () => getStorage<ResourceUpdate[]>('resource_updates', seedResourceUpdates),
  saveResourceUpdates: (data: ResourceUpdate[]) => setStorage('resource_updates', data),

  getAuditLogs: () => getStorage<AuditLog[]>('audit_logs', seedAuditLogs),
  saveAuditLogs: (data: AuditLog[]) => setStorage('audit_logs', data),

  getNotifications: () => getStorage<Notification[]>('notifications', seedNotifications),
  saveNotifications: (data: Notification[]) => setStorage('notifications', data),

  // Reset database helper
  resetDB: () => {
    localStorage.clear();
    window.location.reload();
  }
};
