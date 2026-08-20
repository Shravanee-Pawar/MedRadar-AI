import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface FreshnessIndicatorProps {
  updatedAt: string;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({ updatedAt }) => {
  // Simple check for stale state based on string contents
  const isStale = updatedAt.toLowerCase().includes('hour') || updatedAt.toLowerCase().includes('day') || updatedAt.toLowerCase().includes('ago') && parseInt(updatedAt) >= 2;
  const isModerate = updatedAt.toLowerCase().includes('min') && parseInt(updatedAt) > 15;

  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 animate-pulse">
        <AlertTriangle size={12} />
        <span>Stale Feed ({updatedAt})</span>
      </span>
    );
  }

  if (isModerate) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-warning/30 bg-warning/10 text-warning">
        <Clock size={12} />
        <span>Delayed ({updatedAt})</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-success/30 bg-success/10 text-success">
      <Clock size={12} />
      <span>Fresh ({updatedAt})</span>
    </span>
  );
};
