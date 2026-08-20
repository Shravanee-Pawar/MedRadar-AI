import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  role: 'patient' | 'hospital_admin';
  onBack?: () => void;
  onSuccess?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ role, onBack, onSuccess }) => {
  const navigate = useNavigate();
  const { registerPatient, registerHospital } = useApp();

  // Step state for Hospital registration (1 to 4)
  const [hospStep, setHospStep] = useState<number>(1);

  // Patient Registration States
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [patientConfirmPassword, setPatientConfirmPassword] = useState('');
  const [patientLocation, setPatientLocation] = useState('');

  // Hospital Step 1 — Admin Info
  const [adminName, setAdminName] = useState('');
  const [adminDesignation, setAdminDesignation] = useState('Medical Superintendent');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Hospital Step 2 — Hospital Info
  const [hospName, setHospName] = useState('');
  const [hospRegNo, setHospRegNo] = useState('');
  const [hospType, setHospType] = useState<'Government' | 'Private' | 'Charitable'>('Private');
  const [hospAddress, setHospAddress] = useState('');
  const [hospCity, setHospCity] = useState('Ratnagiri');
  const [hospState, setHospState] = useState('Maharashtra');
  const [hospPinCode, setHospPinCode] = useState('415612');
  const [hospLat] = useState('16.9944');
  const [hospLng] = useState('73.3033');
  const [hospPhone, setHospPhone] = useState('');
  const [hospEmergencyPhone, setHospEmergencyPhone] = useState('');

  // Hospital Step 3 — Facilities
  const [hospDepts, setHospDepts] = useState('Emergency Medicine, Cardiology, Orthopedics');
  const [totalBedCap, setTotalBedCap] = useState('50');
  const [icuCap, setIcuCap] = useState('12');
  const [emergencyServices, setEmergencyServices] = useState('24x7 Level 1 Trauma Care');
  const [ambulanceAvailable, setAmbulanceAvailable] = useState('Yes (2 ALS Units)');
  const [bloodServices, setBloodServices] = useState('In-house Blood Storage Unit');

  // Hospital Step 4 — Verification
  const [docCertNo, setDocCertNo] = useState('REG-MH-2026-99081');
  const [termsConsented, setTermsConsented] = useState(false);

  // Shared Form States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHospSubmitted, setIsHospSubmitted] = useState(false);

  const handleBackToPortal = () => {
    if (onBack) onBack();
    else navigate('/auth');
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientName || !patientEmail || !patientMobile || !patientPassword || !patientConfirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }
    if (patientPassword !== patientConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const isOk = await registerPatient(patientName, patientEmail, patientMobile, patientPassword);
    setIsLoading(false);
    if (isOk) {
      if (onSuccess) onSuccess();
      else navigate('/user/dashboard');
    } else {
      setError('Email address is already registered.');
    }
  };

  const handleHospNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (hospStep === 1) {
      if (!adminName || !adminEmail || !adminMobile || !adminPassword || !adminConfirmPassword) {
        setError('Please fill in all Admin Information fields.');
        return;
      }
      if (adminPassword !== adminConfirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setHospStep(2);
    } else if (hospStep === 2) {
      if (!hospName || !hospRegNo || !hospAddress || !hospCity || !hospPhone) {
        setError('Please fill in all required Hospital Information parameters.');
        return;
      }
      setHospStep(3);
    } else if (hospStep === 3) {
      if (!totalBedCap || !icuCap || !emergencyServices) {
        setError('Please specify bed capacity and emergency services.');
        return;
      }
      setHospStep(4);
    } else if (hospStep === 4) {
      if (!termsConsented) {
        setError('You must accept the Terms & Privacy Consent.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        registerHospital({
          name: hospName,
          registrationNumber: hospRegNo,
          type: hospType,
          address: hospAddress,
          city: hospCity,
          state: hospState,
          pinCode: hospPinCode,
          lat: parseFloat(hospLat) || 16.9944,
          lng: parseFloat(hospLng) || 73.3033,
          phone: hospPhone,
          emergencyContact: hospEmergencyPhone || hospPhone,
          emergencyStatus: 'Operational'
        });
        setIsLoading(false);
        setIsHospSubmitted(true);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden text-left">
      {/* Background Glow */}
      <div className="absolute top-[20%] w-[350px] h-[350px] bg-medical-teal/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-xl w-full z-10 space-y-6">
        <button
          onClick={handleBackToPortal}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft size={14} /> ← Back to Portal
        </button>

        {/* HOSPITAL REGISTRATION SUBMITTED CONFIRMATION VIEW */}
        {role === 'hospital_admin' && isHospSubmitted ? (
          <Card className="p-8 border border-warning/30 bg-warning/5 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto text-3xl font-bold">
              🟡
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-warning tracking-widest bg-warning/15 px-3 py-1 rounded-md border border-warning/30">
                🟡 Pending Verification
              </span>
              <h3 className="text-2xl font-heading font-black text-primary-text pt-2">Registration Submitted</h3>
              <p className="text-xs text-secondary-text max-w-md mx-auto leading-relaxed pt-1">
                Your hospital registration for <strong>{hospName}</strong> has been submitted successfully. A MedRadar AI administrator will verify your information before the hospital becomes a trusted provider.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span>Facility Name:</span>
                <strong className="text-primary-text">{hospName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Registration No:</span>
                <strong className="text-primary-text font-mono">{hospRegNo}</strong>
              </div>
              <div className="flex justify-between">
                <span>Admin Contact:</span>
                <strong className="text-primary-text">{adminEmail}</strong>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full text-xs font-bold py-3"
              onClick={handleBackToPortal}
            >
              ← Back to Portal
            </Button>
          </Card>
        ) : (
          <Card className="p-8 border border-white/5 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl md:text-2xl font-heading font-black text-primary-text">
                {role === 'patient' ? 'User Registration' : 'Register Your Hospital'}
              </h3>
              <p className="text-xs text-secondary-text">
                {role === 'patient'
                  ? 'Join MedRadar AI for emergency resource discovery'
                  : 'Join the MedRadar AI healthcare resource network.'}
              </p>
            </div>

            {/* HOSPITAL STEP PROGRESS INDICATOR */}
            {role === 'hospital_admin' && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-b border-white/5 pb-4">
                {[
                  { num: 1, label: 'Admin' },
                  { num: 2, label: 'Hospital' },
                  { num: 3, label: 'Facilities' },
                  { num: 4, label: 'Verification' }
                ].map(st => (
                  <div
                    key={st.num}
                    className={`p-2 rounded-xl text-center border text-[10px] font-bold transition-all ${
                      hospStep === st.num
                        ? 'bg-medical-teal/20 border-medical-teal/50 text-medical-teal'
                        : hospStep > st.num
                        ? 'bg-success/10 border-success/30 text-success'
                        : 'bg-white/[0.01] border-white/5 text-muted-text'
                    }`}
                  >
                    {hospStep > st.num ? `✓ ${st.label}` : `Step ${st.num}`}
                  </div>
                ))}
              </div>
            )}

            {/* PATIENT REGISTRATION FORM */}
            {role === 'patient' ? (
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Shubham Parkar"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Email Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="shubham@medradar.ai"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      value={patientMobile}
                      onChange={(e) => setPatientMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Location / City (Optional)</label>
                  <input
                    type="text"
                    value={patientLocation}
                    onChange={(e) => setPatientLocation(e.target.value)}
                    placeholder="e.g. Ratnagiri, Maharashtra"
                    className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Password *</label>
                    <input
                      type="password"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Confirm Password *</label>
                    <input
                      type="password"
                      value={patientConfirmPassword}
                      onChange={(e) => setPatientConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-emergency font-semibold bg-emergency/10 border border-emergency/25 p-3 rounded-xl text-center">
                    ⚠️ {error}
                  </p>
                )}

                <Button type="submit" variant="primary" isLoading={isLoading} className="w-full text-xs font-bold py-3 mt-2">
                  Create Account
                </Button>

                <p className="text-[11px] text-center text-secondary-text pt-2">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate('/login/user')} className="text-medical-teal hover:underline font-bold">
                    Login
                  </button>
                </p>
              </form>
            ) : (
              /* HOSPITAL 4-STEP WIZARD FORM */
              <form onSubmit={handleHospNextStep} className="space-y-4">
                {/* STEP 1 — ADMIN INFORMATION */}
                {hospStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-heading font-black text-xs uppercase tracking-wider text-medical-teal border-l-2 border-medical-teal pl-2">
                      Step 1 — Admin Information
                    </h4>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-secondary-text uppercase block">Admin Full Name *</label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Dr. Vivek Parkar"
                        className="w-full px-4 py-2 text-xs rounded-xl glass-input text-primary-text"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-secondary-text uppercase block">Designation *</label>
                      <input
                        type="text"
                        value={adminDesignation}
                        onChange={(e) => setAdminDesignation(e.target.value)}
                        placeholder="Medical Superintendent / Director"
                        className="w-full px-4 py-2 text-xs rounded-xl glass-input text-primary-text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Official Email *</label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@yourhospital.org"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Mobile Number *</label>
                        <input
                          type="tel"
                          value={adminMobile}
                          onChange={(e) => setAdminMobile(e.target.value)}
                          placeholder="+91 98220 12345"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Password *</label>
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Confirm Password *</label>
                        <input
                          type="password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 — HOSPITAL INFORMATION */}
                {hospStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-heading font-black text-xs uppercase tracking-wider text-medical-teal border-l-2 border-medical-teal pl-2">
                      Step 2 — Hospital Information
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Hospital Name *</label>
                        <input
                          type="text"
                          value={hospName}
                          onChange={(e) => setHospName(e.target.value)}
                          placeholder="Apex Hospital Ratnagiri"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Registration No *</label>
                        <input
                          type="text"
                          value={hospRegNo}
                          onChange={(e) => setHospRegNo(e.target.value)}
                          placeholder="REG-MH-10088"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-secondary-text uppercase block">Hospital Type *</label>
                      <CustomSelect
                        value={hospType}
                        onChange={(val) => setHospType(val as any)}
                        options={[
                          { value: 'Private', label: 'Private Facility' },
                          { value: 'Government', label: 'Government / Civil' },
                          { value: 'Charitable', label: 'Charitable Trust' }
                        ]}
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-secondary-text uppercase block">Street Address *</label>
                      <input
                        type="text"
                        value={hospAddress}
                        onChange={(e) => setHospAddress(e.target.value)}
                        placeholder="Khareghat Road, Maruti Mandir"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">City *</label>
                        <input
                          type="text"
                          value={hospCity}
                          onChange={(e) => setHospCity(e.target.value)}
                          placeholder="Ratnagiri"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">State *</label>
                        <input
                          type="text"
                          value={hospState}
                          onChange={(e) => setHospState(e.target.value)}
                          placeholder="Maharashtra"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">PIN Code *</label>
                        <input
                          type="text"
                          value={hospPinCode}
                          onChange={(e) => setHospPinCode(e.target.value)}
                          placeholder="415612"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Hospital Contact *</label>
                        <input
                          type="text"
                          value={hospPhone}
                          onChange={(e) => setHospPhone(e.target.value)}
                          placeholder="+91-2352-223401"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Emergency Phone *</label>
                        <input
                          type="text"
                          value={hospEmergencyPhone}
                          onChange={(e) => setHospEmergencyPhone(e.target.value)}
                          placeholder="+91-2352-223405"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 — FACILITIES */}
                {hospStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-heading font-black text-xs uppercase tracking-wider text-medical-teal border-l-2 border-medical-teal pl-2">
                      Step 3 — Facilities & Capacity
                    </h4>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-secondary-text uppercase block">Active Departments *</label>
                      <input
                        type="text"
                        value={hospDepts}
                        onChange={(e) => setHospDepts(e.target.value)}
                        placeholder="Emergency Medicine, Cardiology, Orthopedics, ICU"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Total Bed Capacity *</label>
                        <input
                          type="number"
                          value={totalBedCap}
                          onChange={(e) => setTotalBedCap(e.target.value)}
                          placeholder="50"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">ICU Capacity *</label>
                        <input
                          type="number"
                          value={icuCap}
                          onChange={(e) => setIcuCap(e.target.value)}
                          placeholder="12"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-secondary-text uppercase block">Emergency Services *</label>
                      <input
                        type="text"
                        value={emergencyServices}
                        onChange={(e) => setEmergencyServices(e.target.value)}
                        placeholder="24x7 Level 1 Trauma Emergency, Cath Lab, OT"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Ambulance Availability</label>
                        <input
                          type="text"
                          value={ambulanceAvailable}
                          onChange={(e) => setAmbulanceAvailable(e.target.value)}
                          placeholder="2 ALS Units"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-secondary-text uppercase block">Blood Services</label>
                        <input
                          type="text"
                          value={bloodServices}
                          onChange={(e) => setBloodServices(e.target.value)}
                          placeholder="In-house Blood Storage"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 — VERIFICATION */}
                {hospStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-heading font-black text-xs uppercase tracking-wider text-medical-teal border-l-2 border-medical-teal pl-2">
                      Step 4 — Verification & Consent
                    </h4>

                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-muted-text block">Verification Certificate / Document ID</span>
                      <input
                        type="text"
                        value={docCertNo}
                        onChange={(e) => setDocCertNo(e.target.value)}
                        placeholder="MH-HEALTH-CERT-XXXXX"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text font-mono"
                      />
                      <p className="text-[10px] text-muted-text pt-1">
                        Attach state medical license or registration certificate reference for admin audit.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsConsented}
                        onChange={(e) => setTermsConsented(e.target.checked)}
                        className="mt-0.5 rounded border-white/10 bg-white/5 text-medical-teal"
                      />
                      <label htmlFor="terms" className="text-xs text-secondary-text leading-snug cursor-pointer">
                        I hereby declare that I am authorized to register this medical facility on the MedRadar AI network. All reported capacity data will be updated truthfully.
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-emergency font-semibold bg-emergency/10 border border-emergency/25 p-3 rounded-xl text-center">
                    ⚠️ {error}
                  </p>
                )}

                {/* Wizard Buttons */}
                <div className="flex gap-2 pt-2">
                  {hospStep > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-1/3 text-xs font-bold py-3"
                      onClick={() => setHospStep(hospStep - 1)}
                    >
                      ← Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full text-xs font-bold py-3"
                  >
                    {hospStep === 4 ? 'Submit Hospital Registration' : 'Next Step →'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
