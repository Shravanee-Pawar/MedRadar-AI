import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { AuthGateway } from './pages/AuthGateway';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AppShell } from './layouts/AppShell';
import { InteractiveMap } from './components/InteractiveMap';

// Page Imports from Modular files
import {
  UserDashboardPage,
  UserEmergencyPage,
  UserHospitalsPage,
  UserComparePage,
  UserBloodPage,
  UserSpecialistsPage,
  UserProfilePage,
  UserNotificationsPage,
  UserSavedResourcesPage,
  UserSettingsPage
} from './pages/UserPages';

import {
  HospitalDashboardPage,
  HospitalProfilePage,
  HospitalResourcesPage,
  HospitalDoctorsPage,
  HospitalBloodPage,
  HospitalAmbulancesPage,
  HospitalEmergencyPage,
  HospitalTransfersPage,
  HospitalMapPage,
  HospitalNotificationsPage,
  HospitalDepartmentsPage
} from './pages/HospitalPages';

import {
  AdminDashboardPage,
  AdminHospitalsPage,
  AdminResourcesPage,
  AdminEmergencyPage,
  AdminBloodPage,
  AdminRegionalIntelligencePage,
  AdminUsersPage,
  AdminAuditLogsPage
} from './pages/AdminPages';

// Dynamic User Map Page Scaffolding
const UserMapPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="font-heading font-black text-lg text-primary-text">Resource Map</h3>
        <p className="text-xs text-muted-text mt-0.5">MEDRADAR AI RESOURCE INTELLIGENCE</p>
      </div>
      <InteractiveMap />
    </div>
  );
};

const AppRoutes = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 1. Landing Page */}
      <Route
        path="/"
        element={
          <LandingPage
            onGetStarted={() => navigate('/auth')}
          />
        }
      />

      {/* 2. Authentication Portal Selection */}
      <Route path="/auth" element={<AuthGateway />} />
      <Route path="/portal" element={<AuthGateway />} />

      {/* 3. User Authentication Routes */}
      <Route path="/login/user" element={<Login role="patient" onSuccess={() => navigate('/user/dashboard')} />} />
      <Route path="/auth/user/login" element={<Login role="patient" onSuccess={() => navigate('/user/dashboard')} />} />
      <Route path="/register/user" element={<Register role="patient" onSuccess={() => navigate('/user/dashboard')} />} />
      <Route path="/auth/user/signup" element={<Register role="patient" onSuccess={() => navigate('/user/dashboard')} />} />

      {/* 4. Hospital Authentication Routes */}
      <Route path="/login/hospital" element={<Login role="hospital_admin" onSuccess={() => navigate('/hospital/dashboard')} />} />
      <Route path="/auth/hospital/login" element={<Login role="hospital_admin" onSuccess={() => navigate('/hospital/dashboard')} />} />
      <Route path="/register/hospital" element={<Register role="hospital_admin" onSuccess={() => navigate('/auth')} />} />
      <Route path="/auth/hospital/register" element={<Register role="hospital_admin" onSuccess={() => navigate('/auth')} />} />

      {/* 5. Super Admin Authentication Routes (NO REGISTER ROUTE) */}
      <Route path="/login/admin" element={<Login role="super_admin" onSuccess={() => navigate('/admin/dashboard')} />} />
      <Route path="/auth/admin/login" element={<Login role="super_admin" onSuccess={() => navigate('/admin/dashboard')} />} />

      {/* 6. Patient / User Portal Grid */}
      <Route
        path="/user"
        element={currentUser?.role === 'patient' ? <AppShell /> : <Navigate to="/login/user" replace />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="emergency" element={<UserEmergencyPage />} />
        <Route path="hospitals" element={<UserHospitalsPage />} />
        <Route path="hospitals/compare" element={<UserComparePage />} />
        <Route path="blood" element={<UserBloodPage />} />
        <Route path="specialists" element={<UserSpecialistsPage />} />
        <Route path="map" element={<UserMapPage />} />
        <Route path="notifications" element={<UserNotificationsPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="saved-resources" element={<UserSavedResourcesPage />} />
        <Route path="settings" element={<UserSettingsPage />} />
      </Route>

      {/* 7. Hospital Admin Portal Grid */}
      <Route
        path="/hospital"
        element={currentUser?.role === 'hospital_admin' ? <AppShell /> : <Navigate to="/login/hospital" replace />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboardPage />} />
        <Route path="profile" element={<HospitalProfilePage />} />
        <Route path="departments" element={<HospitalDepartmentsPage />} />
        <Route path="resources" element={<HospitalResourcesPage />} />
        <Route path="resources/beds" element={<HospitalResourcesPage />} />
        <Route path="resources/respiratory" element={<HospitalResourcesPage />} />
        <Route path="doctors" element={<HospitalDoctorsPage />} />
        <Route path="blood" element={<HospitalBloodPage />} />
        <Route path="ambulances" element={<HospitalAmbulancesPage />} />
        <Route path="emergency" element={<HospitalEmergencyPage />} />
        <Route path="emergency/sos" element={<HospitalEmergencyPage />} />
        <Route path="emergency/coordination" element={<HospitalEmergencyPage />} />
        <Route path="transfers" element={<HospitalTransfersPage />} />
        <Route path="map" element={<HospitalMapPage />} />
        <Route path="notifications" element={<HospitalNotificationsPage />} />
      </Route>

      {/* 8. Super Admin Control Grid */}
      <Route
        path="/admin"
        element={currentUser?.role === 'super_admin' ? <AppShell /> : <Navigate to="/login/admin" replace />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="hospitals" element={<AdminHospitalsPage />} />
        <Route path="resources" element={<AdminResourcesPage />} />
        <Route path="emergency" element={<AdminEmergencyPage />} />
        <Route path="blood" element={<AdminBloodPage />} />
        <Route path="regional-intelligence" element={<AdminRegionalIntelligencePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* 9. Fallback wildcards */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
