import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'emergency' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medical-teal/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-medical-teal text-primary-bg-deep hover:bg-medical-teal-dark hover:scale-[1.02] shadow-md shadow-medical-teal/15',
    secondary: 'bg-white/5 border border-white/10 text-primary-text hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]',
    emergency: 'bg-emergency text-primary-text hover:bg-emergency-dark hover:scale-[1.03] pulse-emergency shadow-lg shadow-emergency/25',
    outline: 'border border-medical-teal/40 text-medical-teal hover:bg-medical-teal/10 hover:border-medical-teal hover:scale-[1.01]',
    danger: 'bg-emergency/10 border border-emergency/30 text-emergency hover:bg-emergency/20 hover:scale-[1.01]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
