import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  role: 'patient' | 'hospital_admin' | 'super_admin';
  onBack?: () => void;
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ role, onBack, onSuccess }) => {
  const navigate = useNavigate();
  const { login, hospitals, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Hospital Verification Status View State
  const [hospitalStatusState, setHospitalStatusState] = useState<'pending' | 'rejected' | 'suspended' | null>(null);

  const handleBackToPortal = () => {
    if (onBack) onBack();
    else navigate('/auth');
  };

  const setDemoUser = (userType: 'patient' | 'verified_hosp' | 'pending_hosp' | 'super_admin') => {
    setError('');
    setHospitalStatusState(null);
    if (userType === 'patient') {
      setEmail('shubham@medradar.ai');
      setPassword('demo123');
    } else if (userType === 'verified_hosp') {
      setEmail('admin@parkarhospital.com');
      setPassword('demo123');
    } else if (userType === 'pending_hosp') {
      setEmail('admin@shreeram.com');
      setPassword('demo123');
    } else if (userType === 'super_admin') {
      setEmail('admin@medradar.ai');
      setPassword('demo123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHospitalStatusState(null);

    if (!email) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const isOk = login(email, role);
      setIsLoading(false);

      if (isOk) {
        // If hospital admin, check hospital verification status
        if (role === 'hospital_admin') {
          // Find logged in user's hospital
          const loggedUser = currentUser || { email };
          const userHosp = hospitals.find(h => h.id === (loggedUser as any).hospitalId || h.phone?.includes(email));

          if (userHosp && !userHosp.verified) {
            setHospitalStatusState('pending');
            return;
          }
        }

        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            if (role === 'patient') navigate('/user/dashboard');
            else if (role === 'hospital_admin') navigate('/hospital/dashboard');
            else if (role === 'super_admin') navigate('/admin/dashboard');
          }
        }, 600);
      } else {
        // Handle pending demo email explicitly
        if (role === 'hospital_admin' && email.toLowerCase() === 'admin@shreeram.com') {
          setHospitalStatusState('pending');
          return;
        }
        setError('Invalid email or password.');
      }
    }, 800);
  };

  const getHeadingText = () => {
    if (role === 'patient') return { title: 'User Login', subtitle: 'Sign in to access your emergency dashboard' };
    if (role === 'hospital_admin') return { title: 'Hospital Admin Login', subtitle: 'Official hospital resource management portal' };
    return { title: 'MedRadar AI Admin Portal', subtitle: 'Secure platform administration' };
  };

  const headings = getHeadingText();

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden text-left">
      {/* Background Glow */}
      <div className="absolute top-[30%] w-[350px] h-[350px] bg-medical-teal/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-6">
        <button
          onClick={handleBackToPortal}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft size={14} /> ← Back to Portal
        </button>

        {/* Hospital Verification Pending View */}
        {hospitalStatusState === 'pending' ? (
          <Card className="p-8 border border-warning/30 bg-warning/5 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto text-2xl">
              🟡
            </div>
            <div>
              <h3 className="text-lg font-heading font-black text-primary-text">Verification Pending</h3>
              <p className="text-xs text-secondary-text mt-2 leading-relaxed">
                Your hospital registration is currently pending verification. A MedRadar AI administrator will verify your information before the hospital becomes a trusted provider.
              </p>
            </div>
            <Button variant="secondary" className="w-full text-xs font-bold py-2.5" onClick={handleBackToPortal}>
              ← Back to Portal
            </Button>
          </Card>
        ) : (
          <Card className="p-8 border border-white/5 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-heading font-black text-primary-text">
                {headings.title}
              </h3>
              <p className="text-xs text-secondary-text">
                {headings.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">
                  {role === 'hospital_admin' ? 'Official Hospital Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'hospital_admin' ? 'admin@yourhospital.org' : 'user@medradar.ai'}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your email.'); }} className="text-[10px] text-medical-teal hover:underline font-semibold">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-text hover:text-primary-text"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-medical-teal focus:ring-0"
                />
                <label htmlFor="remember" className="text-secondary-text cursor-pointer text-[11px]">Remember Me</label>
              </div>

              {/* Notifications */}
              {error && (
                <p className="text-xs text-emergency font-semibold bg-emergency/10 border border-emergency/25 p-3 rounded-xl text-center">
                  ⚠️ {error}
                </p>
              )}

              {success && (
                <p className="text-xs text-success font-semibold bg-success/10 border border-success/25 p-3 rounded-xl text-center animate-pulse">
                  ✓ Authentication successful. Redirecting...
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant={role === 'super_admin' ? 'emergency' : 'primary'}
                isLoading={isLoading}
                className="w-full text-xs font-black py-3 mt-2"
              >
                {role === 'super_admin' ? 'Secure Login' : 'Login'}
              </Button>

              {/* Bottom Register Links (USER & HOSPITAL ONLY — NO REGISTER FOR ADMIN) */}
              {role === 'patient' && (
                <p className="text-[11px] text-center text-secondary-text pt-2">
                  Don't have a user account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register/user')}
                    className="text-medical-teal hover:underline font-bold"
                  >
                    Register
                  </button>
                </p>
              )}

              {role === 'hospital_admin' && (
                <p className="text-[11px] text-center text-secondary-text pt-2">
                  Don't have a hospital account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register/hospital')}
                    className="text-medical-teal hover:underline font-bold"
                  >
                    Register Hospital
                  </button>
                </p>
              )}
            </form>

            {/* Demo Credentials Assist */}
            <div className="pt-4 border-t border-white/5 space-y-2 text-center">
              <span className="text-[9px] uppercase font-bold text-muted-text block">Demo Credentials Quick-Fill</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {role === 'patient' && (
                  <button
                    type="button"
                    onClick={() => setDemoUser('patient')}
                    className="px-3 py-1 bg-medical-teal/10 hover:bg-medical-teal/20 text-medical-teal rounded-lg text-[10px] font-bold border border-medical-teal/20"
                  >
                    🔑 Demo Patient
                  </button>
                )}
                {role === 'hospital_admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDemoUser('verified_hosp')}
                      className="px-3 py-1 bg-success/10 hover:bg-success/20 text-success rounded-lg text-[10px] font-bold border border-success/20"
                    >
                      🟢 Verified Hospital Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoUser('pending_hosp')}
                      className="px-3 py-1 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg text-[10px] font-bold border border-warning/20"
                    >
                      🟡 Pending Hospital Demo
                    </button>
                  </>
                )}
                {role === 'super_admin' && (
                  <button
                    type="button"
                    onClick={() => setDemoUser('super_admin')}
                    className="px-3 py-1 bg-emergency/10 hover:bg-emergency/20 text-emergency rounded-lg text-[10px] font-bold border border-emergency/20"
                  >
                    🛡️ Demo Super Admin
                  </button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
