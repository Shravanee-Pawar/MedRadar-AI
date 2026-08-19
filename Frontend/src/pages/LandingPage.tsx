import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Navigation, Activity, Flame, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  // Define node details for the glowing interactive network animation
  const nodes = [
    { id: 'ai', label: 'MedRadar AI Core', icon: Sparkles, x: '50%', y: '50%', color: 'border-medical-teal text-medical-teal bg-medical-teal/10 glow-teal', size: 'w-16 h-16 md:w-20 md:h-20' },
    { id: 'patient', label: 'Patient SOS', icon: Flame, x: '18%', y: '30%', color: 'border-emergency text-emergency bg-emergency/10 glow-coral', size: 'w-12 h-12 md:w-14 md:h-14' },
    { id: 'hospital', label: 'Civil Hospital', icon: Shield, x: '82%', y: '25%', color: 'border-info text-info bg-info/10', size: 'w-12 h-12 md:w-14 md:h-14' },
    { id: 'doctor', label: 'Trauma Specialist', icon: Navigation, x: '72%', y: '75%', color: 'border-success text-success bg-success/10', size: 'w-12 h-12 md:w-14 md:h-14' },
    { id: 'blood', label: 'Blood Bank O-', icon: Activity, x: '25%', y: '70%', color: 'border-warning text-warning bg-warning/10', size: 'w-12 h-12 md:w-14 md:h-14' }
  ];

  return (
    <div className="min-h-screen bg-primary-bg overflow-hidden relative flex flex-col justify-between">
      {/* Top Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-medical-teal/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emergency/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 md:px-8 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center bg-medical-teal/10 w-9 h-9 rounded-xl border border-medical-teal/20 text-medical-teal shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12h3l2-4 3 8 2-6 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-sm tracking-wider text-primary-text">
              MEDRADAR <span className="text-medical-teal">AI</span>
            </h1>
            <span className="text-[9px] text-muted-text uppercase tracking-widest font-semibold block">Emergency Grid</span>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={onGetStarted}>
          Login Portal
        </Button>
      </nav>

      {/* Hero Body */}
      <main className="max-w-7xl w-full mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative flex-1">
        {/* Text Area */}
        <div className="lg:col-span-6 text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-medical-teal/10 border border-medical-teal/25 text-medical-teal mb-4 animate-pulse">
              🛡️ Verified Ratnagiri Health Grid
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight text-primary-text leading-[1.1] mb-4">
              Find the Right Emergency <br className="hidden md:inline" />
              Healthcare Resource, <br />
              <span className="text-medical-teal font-extrabold">Right Now.</span>
            </h2>
            <p className="text-sm md:text-base text-secondary-text max-w-lg leading-relaxed">
              MedRadar AI connects patients and first responders with verified healthcare resources in real-time. Experience intelligent emergency matchmaking, automated blood finder query streams, and operational hospital capacity coordinates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center"
          >
            <Button variant="primary" size="lg" onClick={onGetStarted}>
              Get Started <ArrowRight size={16} className="ml-2" />
            </Button>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-md"
          >
            <div>
              <p className="text-xl md:text-2xl font-black text-medical-teal">15</p>
              <p className="text-[10px] text-muted-text uppercase font-semibold mt-1">Verified Clinics</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black text-info">90+</p>
              <p className="text-[10px] text-muted-text uppercase font-semibold mt-1">Resource Feeds</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black text-emergency">O-</p>
              <p className="text-[10px] text-muted-text uppercase font-semibold mt-1">Blood Locating</p>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Network Visualization */}
        <div className="lg:col-span-6 relative h-[380px] md:h-[450px] w-full flex items-center justify-center bg-white/[0.005] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          {/* Animated background stars/grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          {/* Connecting SVG lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Draw connections to AI core */}
            <motion.line x1="18%" y1="30%" x2="50%" y2="50%" stroke="rgba(85, 224, 193, 0.2)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-pulse" />
            <motion.line x1="82%" y1="25%" x2="50%" y2="50%" stroke="rgba(85, 224, 193, 0.2)" strokeWidth="1.5" strokeDasharray="5,5" />
            <motion.line x1="72%" y1="75%" x2="50%" y2="50%" stroke="rgba(85, 224, 193, 0.2)" strokeWidth="1.5" strokeDasharray="5,5" />
            <motion.line x1="25%" y1="70%" x2="50%" y2="50%" stroke="rgba(85, 224, 193, 0.2)" strokeWidth="1.5" strokeDasharray="5,5" />
            
            {/* Perimeter connections */}
            <motion.line x1="18%" y1="30%" x2="25%" y2="70%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <motion.line x1="82%" y1="25%" x2="72%" y2="75%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          </svg>

          {/* Floating Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
                style={{ left: node.x, top: node.y }}
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: node.id === 'ai' ? 4 : 5 + Math.random() * 2,
                  ease: 'easeInOut',
                }}
              >
                <div className={`rounded-full border flex items-center justify-center shadow-lg transition-transform hover:scale-110 pointer-events-auto ${node.size} ${node.color}`}>
                  <Icon size={20} className={node.id === 'ai' ? 'animate-spin-slow' : ''} />
                </div>
                <span className="text-[10px] font-bold text-secondary-text bg-primary-bg-deep/80 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-sm pointer-events-none">
                  {node.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="w-full text-center py-6 border-t border-white/5 z-10 relative">
        <p className="text-[11px] text-muted-text max-w-xl mx-auto px-6">
          <strong>Security Notice</strong>: MedRadar AI displays simulated values marked as "Simulated / Reported Data" for demonstration. Confirm actual resource parameters directly with facilities before dispatch or travel.
        </p>
      </footer>
    </div>
  );
};
