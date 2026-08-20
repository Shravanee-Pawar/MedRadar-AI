import React from 'react';

type StatusType = 'Available' | 'Operational' | 'Limited' | 'Critical' | 'Stale' | 'Unknown' | 'Pending' | 'Approved' | 'Collected' | 'Dispatched';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.trim().toLowerCase();

  let colorClasses = 'bg-white/5 border border-white/10 text-primary-text';
  let dotColor = 'bg-slate-400';
  let hasPulse = false;

  if (normalized === 'available' || normalized === 'operational' || normalized === 'approved') {
    colorClasses = 'bg-success/10 border border-success/30 text-success';
    dotColor = 'bg-success';
    hasPulse = true;
  } else if (normalized === 'limited' || normalized === 'pending') {
    colorClasses = 'bg-warning/10 border border-warning/30 text-warning';
    dotColor = 'bg-warning';
    hasPulse = true;
  } else if (normalized === 'critical') {
    colorClasses = 'bg-emergency/10 border border-emergency/30 text-emergency';
    dotColor = 'bg-emergency';
    hasPulse = true;
  } else if (normalized === 'stale' || normalized === 'unknown') {
    colorClasses = 'bg-amber-500/10 border border-amber-500/30 text-amber-500';
    dotColor = 'bg-amber-500';
    hasPulse = false;
  } else if (normalized === 'dispatched' || normalized === 'collected') {
    colorClasses = 'bg-info/10 border border-info/30 text-info';
    dotColor = 'bg-info';
    hasPulse = true;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${colorClasses} ${className}`}
    >
      <span className={`relative flex h-2 w-2`}>
        {hasPulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
      {status}
    </span>
  );
};
