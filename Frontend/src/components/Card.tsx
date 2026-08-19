import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true, ...props }) => {
  return (
    <div
      className={`glass-card rounded-[24px] p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:-translate-y-1 hover:border-white/15 hover:shadow-black/45' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
