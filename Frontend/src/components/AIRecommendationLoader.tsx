import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Cpu, Database, CheckCircle2 } from 'lucide-react';

interface AIRecommendationLoaderProps {
  onComplete: () => void;
}

export const AIRecommendationLoader: React.FC<AIRecommendationLoaderProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { text: 'Ingesting Emergency SOS details...', icon: Sparkles, color: 'text-warning' },
    { text: 'Scanning real-time regional hospital inventories...', icon: Database, color: 'text-info' },
    { text: 'Calculating specialist schedules & ambulance vectors...', icon: Cpu, color: 'text-medical-teal' },
    { text: 'Optimizing resource matching coefficient...', icon: Brain, color: 'text-emergency' }
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border border-medical-teal/20 w-24 h-24 animate-ping opacity-40" />
        <div className="absolute inset-2 rounded-full border border-medical-teal/40 w-20 h-20 animate-pulse opacity-60" />
        
        {/* Core spinning/processing graphic */}
        <div className="relative flex items-center justify-center bg-secondary-surface border border-white/10 rounded-full w-16 h-16 shadow-lg shadow-medical-teal/10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="text-medical-teal"
          >
            <Cpu size={32} />
          </motion.div>
        </div>
      </div>

      <h3 className="text-xl font-bold font-heading text-primary-text mb-2">MedRadar AI Matchmaking</h3>
      <p className="text-muted-text text-sm mb-6 max-w-sm">
        Analyzing emergency requirements against live resources in Ratnagiri District.
      </p>

      <div className="w-full max-w-xs space-y-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isDone = idx < step;
          const isActive = idx === step;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0.3, y: 10 }}
              animate={{
                opacity: isDone ? 0.7 : isActive ? 1 : 0.2,
                y: 0,
                scale: isActive ? 1.02 : 1
              }}
              className="flex items-center gap-3 text-left p-3 rounded-xl border border-white/5 bg-white/[0.01]"
            >
              {isDone ? (
                <CheckCircle2 size={18} className="text-medical-teal flex-shrink-0" />
              ) : (
                <Icon size={18} className={`${s.color} ${isActive ? 'animate-pulse' : ''} flex-shrink-0`} />
              )}
              <span className={`text-xs ${isActive ? 'text-primary-text font-medium' : 'text-secondary-text'}`}>
                {s.text}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-white/5 h-1.5 rounded-full overflow-hidden mt-8 border border-white/5">
        <motion.div
          className="bg-medical-teal h-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / steps.length) * 100}%` }}
          transition={{ ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};
