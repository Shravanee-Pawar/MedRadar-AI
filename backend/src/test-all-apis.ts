const BASE_URL = 'http://localhost:5000';

async function runTestSuite() {
  console.log('🧪 Starting Unified Backend API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<boolean>) {
    try {
      const success = await fn();
      if (success) {
        console.log(`  ✅ [PASS] ${name}`);
        passed++;
      } else {
        console.log(`  ❌ [FAIL] ${name}`);
        failed++;
      }
    } catch (err: any) {
      console.log(`  ❌ [FAIL] ${name} - Exception: ${err.message}`);
      failed++;
    }
  }

  // 1. Health
  await assertTest('GET /health', async () => {
    const res = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    return res.success === true && res.message.includes('running');
  });

  // 2. Auth Login
  let patientToken = '';
  let hospAdminToken = '';
  let superAdminToken = '';

  await assertTest('POST /api/v1/auth/login (Patient)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@medradar.ai', password: 'password123' }),
    }).then((r) => r.json());
    patientToken = res.data?.token;
    return res.success === true && Boolean(patientToken);
  });

  await assertTest('POST /api/v1/auth/login (Hospital Admin)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@civilhospital.ai', password: 'password123' }),
    }).then((r) => r.json());
    hospAdminToken = res.data?.token;
    return res.success === true && Boolean(hospAdminToken);
  });

  await assertTest('POST /api/v1/auth/login (Super Admin)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@medradar.ai', password: 'password123' }),
    }).then((r) => r.json());
    superAdminToken = res.data?.token;
    return res.success === true && Boolean(superAdminToken);
  });

  // 3. Auth Me & Security Guard
  await assertTest('GET /api/v1/auth/me (Protected)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    }).then((r) => r.json());
    return res.success === true && res.data.user.email === 'patient@medradar.ai';
  });

  await assertTest('GET /api/v1/auth/me (Unauthorized Protection)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`).then((r) => r.json());
    return res.success === false && res.error.code === 'UNAUTHORIZED';
  });

  // 4. Hospitals
  await assertTest('GET /api/v1/hospitals', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/hospitals`).then((r) => r.json());
    return res.success === true && res.count >= 5;
  });

  await assertTest('PATCH /api/v1/hospitals/hosp-001/verify (Super Admin)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/hospitals/hosp-001/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superAdminToken}` },
      body: JSON.stringify({ action: 'approve' }),
    }).then((r) => r.json());
    return res.success === true && res.data.verified === true;
  });

  // 5. Hospital Resources Telemetry & Validation
  await assertTest('GET /api/v1/hospitals/hosp-001/resources', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/hospitals/hosp-001/resources`).then((r) => r.json());
    return res.success === true && res.count >= 3;
  });

  await assertTest('PUT /api/v1/hospitals/hosp-001/resources/icu_beds (Valid Update)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/hospitals/hosp-001/resources/icu_beds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospAdminToken}` },
      body: JSON.stringify({ total: 20, occupied: 15, reserved: 2 }),
    }).then((r) => r.json());
    return res.success === true && res.data.available === 3;
  });

  await assertTest('PUT /api/v1/hospitals/hosp-001/resources/icu_beds (Invalid Math Guard)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/hospitals/hosp-001/resources/icu_beds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospAdminToken}` },
      body: JSON.stringify({ total: 20, occupied: 25, reserved: 2 }),
    }).then((r) => r.json());
    return res.success === false && res.error.code === 'VALIDATION_ERROR';
  });

  // 6. Doctors Roster
  await assertTest('GET /api/v1/doctors', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/doctors`).then((r) => r.json());
    return res.success === true && res.count >= 3;
  });

  await assertTest('PATCH /api/v1/doctors/doc-001/roster', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/doctors/doc-001/roster`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospAdminToken}` },
      body: JSON.stringify({ status: 'Available', emergencyDuty: true }),
    }).then((r) => r.json());
    return res.success === true && res.data.status === 'Available';
  });

  // 7. Blood Inventory & Reservation
  await assertTest('GET /api/v1/blood/inventory', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/blood/inventory?bloodGroup=O%2B`).then((r) => r.json());
    return res.success === true && res.count >= 1;
  });

  await assertTest('POST /api/v1/blood/requests', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/blood/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName: 'Pooja Patil', patientPhone: '9876543210', bloodGroup: 'O+', unitsRequired: 2, hospitalId: 'hosp-001' }),
    }).then((r) => r.json());
    return res.success === true && res.data.status === 'Pending';
  });

  // 8. Ambulances Fleet
  await assertTest('GET /api/v1/ambulances', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ambulances`).then((r) => r.json());
    return res.success === true && res.count >= 2;
  });

  // 9. Emergency SOS & Recommendation Engine Workflow
  let emergencyId = '';
  await assertTest('POST /api/v1/emergency/sos (Recommendation Engine Trigger)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/emergency/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergencyType: 'Road Accident / Poly-Trauma', lat: 16.9902, lng: 73.3120, location: 'Jail Road Ratnagiri', requiredResources: ['ICU Bed', 'Ventilator'] }),
    }).then((r) => r.json());
    emergencyId = res.data?.emergencyRequest?.id;

      console.log('\n🔍 RECOMMENDATION ENGINE RESPONSE:');
      console.dir(res.data?.recommendations, { depth: null });

      return res.success === true && res.data.recommendations.length > 0;
  });

  await assertTest('POST /api/v1/emergency/requests/:id/pre-alert', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/emergency/requests/${emergencyId}/pre-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId: 'hosp-001', patientPhone: '9876543210', etaMin: 10 }),
    }).then((r) => r.json());
    return res.success === true && res.data.status === 'Dispatched';
  });

  await assertTest('PATCH /api/v1/emergency/requests/:id/acknowledge', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/emergency/requests/${emergencyId}/acknowledge`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${hospAdminToken}` },
    }).then((r) => r.json());
    return res.success === true && res.data.hospitalAlertStatus === 'acknowledged';
  });

  await assertTest('PATCH /api/v1/emergency/requests/:id/coordinate', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/emergency/requests/${emergencyId}/coordinate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospAdminToken}` },
      body: JSON.stringify({ assignedDoctorName: 'Dr. Nitin Kulkarni', assignedIcuBed: 'ICU-Bed-02', coordinationStatus: 'Ready' }),
    }).then((r) => r.json());
    return res.success === true && res.data.coordinationStatus === 'Ready';
  });

  // 10. Transfers
  await assertTest('GET /api/v1/transfers', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/transfers`, {
      headers: { Authorization: `Bearer ${hospAdminToken}` },
    }).then((r) => r.json());
    return res.success === true && res.count >= 1;
  });

  // 11. Notifications
  await assertTest('GET /api/v1/notifications', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${hospAdminToken}` },
    }).then((r) => r.json());
    return res.success === true && res.count >= 1;
  });

  // 12. Super Admin APIs & Analytics
  await assertTest('GET /api/v1/users (Super Admin Guard)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    }).then((r) => r.json());
    return res.success === true && res.count >= 3;
  });

  await assertTest('GET /api/v1/analytics/regional', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/analytics/regional`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    }).then((r) => r.json());
    return res.success === true && res.data.resourceTrendData.length > 0;
  });

  // 13. Audit Logs
  await assertTest('GET /api/v1/audit-logs', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    }).then((r) => r.json());
    return res.success === true && res.count >= 3;
  });

  console.log(`\n🎉 Test Suite Completed! Total Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
