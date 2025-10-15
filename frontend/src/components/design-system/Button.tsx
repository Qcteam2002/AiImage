import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'plain';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[#212326] hover:bg-[#1A1C1E] active:bg-[#0A0B0C] text-white focus:ring-[#212326] disabled:bg-[#BABEC3]',
      secondary: 'bg-white hover:bg-[#F6F6F7] active:bg-[#F1F2F3] text-[#212326] border border-[#D1D3D4] focus:ring-[#212326] disabled:bg-[#F6F6F7] disabled:text-[#BABEC3]',
      tertiary: 'bg-transparent hover:bg-[#F6F6F7] active:bg-[#F1F2F3] text-[#212326] focus:ring-[#212326] disabled:text-[#BABEC3]',
      destructive: 'bg-[#D72C0D] hover:bg-[#B71C0C] active:bg-[#9A1A0A] text-white focus:ring-[#D72C0D] disabled:bg-[#BABEC3]',
      plain: 'bg-transparent hover:bg-[#F6F6F7] active:bg-[#F1F2F3] text-[#212326] focus:ring-[#212326] disabled:text-[#BABEC3]',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs h-7',
      md: 'px-4 py-2 text-sm h-8',
      lg: 'px-4 py-2.5 text-sm h-9',
      xl: 'px-5 py-3 text-sm h-10',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
