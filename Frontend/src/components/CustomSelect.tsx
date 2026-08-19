import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 text-xs text-left rounded-xl glass-input text-primary-text bg-secondary-surface flex items-center justify-between transition-all duration-200 border ${
          isOpen 
            ? 'border-medical-teal shadow-[0_0_8px_rgba(85,224,193,0.2)]' 
            : 'border-white/5'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-muted-text transition-transform duration-200 ${isOpen ? 'rotate-180 text-medical-teal' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 rounded-xl bg-[#111A2E] border border-white/10 shadow-2xl max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-xs text-left flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'text-medical-teal bg-medical-teal/10 font-bold'
                      : 'text-primary-text hover:bg-white/5 hover:text-medical-teal'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={12} className="text-medical-teal shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
