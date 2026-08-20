Use("medradar_ai");

//Create collections
db.createCollection("users");
db.createCollection("hospitals");
db.createCollection("hospitalResources");
db.createCollection("hospitalTransfers");
db.createCollection("doctors");
db.createCollection("appointments");
db.createCollection("emergencyRequests");
db.createCollection("ambulances");
db.createCollection("bloodInventory");
db.createCollection("notifications");
db.createCollection("auditlogs");

// =============================
//INDEXES
// =============================

//Users
db.users.createIndex({ email: 1 }, { unique: true });

//Hospitals
db.hospitals.createIndex({ hospitalId: 1 }, { unique: true });

//HospitalResources
db.hospitalResources.createIndex({ hospitalId: 1 });


//HospitalTransfers
db.hospitalTransfers.createIndex({ hospitalId: 1 });

//Doctors
db.doctors.createIndex({ hospitalId: 1 });

//Appointments
db.appointments.createIndex({ doctorId: 1 });
db.appointments.createIndex({ hospitalId: 1 });

//EmergencyRequests
db.emergencyRequests.createIndex({ hospitalId: 1 });
db.emergencyRequests.createIndex({ userId: 1 });

//Ambulances
db.ambulances.createIndex({ ambulanceId: 1 }, { unique: true});

//BloodInventory
db.bloodInventory.createIndex({ hospitalId: 1 });


//Notifications
db.notifications.createIndex({ userId: 1 });

//AuditLogs
db.auditlogs.createIndex({ userId: 1 });

print("MedRadar AI database initialization completed successfully.");