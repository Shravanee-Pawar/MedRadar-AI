import React from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Shield, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const AuthGateway: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      role: 'user',
      title: '👤 PATIENT / USER',
      description: 'Find hospitals, emergency resources, blood availability and specialists.',
      icon: User,
      color: 'text-medical-teal border-medical-teal/20 bg-medical-teal/5',
      glow: 'group-hover:shadow-medical-teal/10',
      actions: [
        { label: 'Login', route: '/login/user', variant: 'primary' as const },
        { label: 'Register', route: '/register/user', variant: 'secondary' as const }
      ]
    },
    {
      role: 'hospital',
      title: '🏥 HOSPITAL',
      description: 'Manage hospital resources, doctors, blood inventory and emergency coordination.',
      icon: Building2,
      color: 'text-info border-info/20 bg-info/5',
      glow: 'group-hover:shadow-info/10',
      actions: [
        { label: 'Login', route: '/login/hospital', variant: 'primary' as const },
        { label: 'Register Hospital', route: '/register/hospital', variant: 'secondary' as const }
      ]
    },
    {
      role: 'admin',
      title: '🛡️ ADMIN',
      description: 'Manage the MedRadar healthcare resource network.',
      icon: Shield,
      color: 'text-emergency border-emergency/20 bg-emergency/5',
      glow: 'group-hover:shadow-emergency/10',
      actions: [
        { label: 'Admin Login', route: '/login/admin', variant: 'primary' as const }
      ],
      notice: 'Platform Super Admin accounts are provisioned securely.'
    }
  ];

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden text-left">
      {/* Background Glow */}
      <div className="absolute top-[20%] w-[350px] h-[350px] bg-medical-teal/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-emergency/5 rounded-full blur-[90px] pointer-events-none" />
      
      <div className="max-w-5xl w-full z-10 space-y-8">
        {/* Back to Home navigation */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-text hover:text-primary-text transition-colors"
          >
            <ArrowLeft size={14} /> ← Back to Home
          </button>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-heading font-black text-primary-text">
            Welcome to MedRadar AI
          </h2>
          <p className="text-xs md:text-sm text-secondary-text max-w-md mx-auto">
            Choose your portal to continue
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group h-full"
              >
                <Card className={`h-full flex flex-col justify-between p-8 border border-white/5 hover:border-white/15 shadow-2xl transition-all ${card.glow}`}>
                  <div className="space-y-5">
                    {/* Icon bubble */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.color}`}>
                      <Icon size={22} />
                    </div>

                    {/* Meta */}
                    <div className="space-y-2">
                      <h4 className="font-heading font-black text-base text-primary-text tracking-wide">{card.title}</h4>
                      <p className="text-xs text-secondary-text leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-8 space-y-3">
                    <div className={`grid gap-2 ${card.actions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {card.actions.map((act) => (
                        <Button
                          key={act.label}
                          variant={act.variant}
                          size="md"
                          className="w-full text-xs font-bold py-2.5"
                          onClick={() => navigate(act.route)}
                        >
                          {act.label}
                        </Button>
                      ))}
                    </div>

                    {card.notice && (
                      <p className="text-[10px] text-muted-text font-medium pt-2 border-t border-white/5 italic text-center">
                        🔒 {card.notice}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
