import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadinessScoreProps {
  score: number;
  lastUpdatedTime?: string;
  showDetails?: boolean;
}

export const ReadinessScore: React.FC<ReadinessScoreProps> = ({
  score,
  lastUpdatedTime = '2 min ago',
  showDetails = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let statusText = 'Excellent Resource Readiness';
  let badgeStyle = 'text-success bg-success/15 border-success/30';
  let progressColor = 'stroke-success';

  if (score >= 90) {
    statusText = 'Excellent Resource Readiness';
    badgeStyle = 'text-success bg-success/15 border-success/30';
    progressColor = 'stroke-success';
  } else if (score >= 75) {
    statusText = 'Good Resource Readiness';
    badgeStyle = 'text-success bg-success/15 border-success/30';
    progressColor = 'stroke-success';
  } else if (score >= 50) {
    statusText = 'Limited Resource Readiness';
    badgeStyle = 'text-warning bg-warning/15 border-warning/30';
    progressColor = 'stroke-warning';
  } else if (score >= 25) {
    statusText = 'Low Resource Readiness';
    badgeStyle = 'text-warning bg-warning/15 border-warning/30';
    progressColor = 'stroke-warning';
  } else {
    statusText = 'Critical Resource Readiness';
    badgeStyle = 'text-emergency bg-emergency/15 border-emergency/30';
    progressColor = 'stroke-emergency';
  }

  // Circular gauge math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] relative backdrop-blur-md">
      {/* Gauge Circular Display */}
      <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="28" cy="28" r={radius} className="stroke-white/5 fill-none" strokeWidth="3.5" />
          <circle
            cx="28"
            cy="28"
            r={radius}
            className={`${progressColor} fill-none transition-all duration-500`}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-black text-primary-text font-heading">{score}%</span>
      </div>

      <div className="text-left space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-text uppercase font-black tracking-wider block">RESOURCE READINESS</span>
          {/* Info Tooltip Icon */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-muted-text hover:text-primary-text transition-colors p-0.5 cursor-pointer"
              aria-label="Resource Readiness info"
            >
              <Info size={12} />
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-primary-bg-deep border border-white/20 rounded-xl shadow-2xl text-[11px] text-secondary-text z-30 leading-relaxed pointer-events-none"
                >
                  Resource Readiness reflects currently reported operational resources and data freshness. It is not a medical quality or hospital ranking.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
            {statusText}
          </span>
          <span className="text-[9.5px] text-muted-text">Updated: {lastUpdatedTime}</span>
        </div>

        {showDetails && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary-text pt-0.5">
            <span className="text-success flex items-center gap-0.5"><Check size={10} /> ICU</span>
            <span className="text-success flex items-center gap-0.5"><Check size={10} /> Ventilator</span>
            <span className="text-success flex items-center gap-0.5"><Check size={10} /> Oxygen</span>
          </div>
        )}
      </div>
    </div>
  );
};
