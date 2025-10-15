import React from 'react';

// Design System - Typography (Polaris Standard)
export const Typography = {
  // Display - Large headings
  DisplayLarge: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h1 className={`text-4xl font-bold text-[#212326] leading-tight tracking-tight ${className}`}>
      {children}
    </h1>
  ),
  
  DisplayMedium: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h1 className={`text-3xl font-bold text-[#212326] leading-tight tracking-tight ${className}`}>
      {children}
    </h1>
  ),
  
  DisplaySmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h1 className={`text-2xl font-bold text-[#212326] leading-tight tracking-tight ${className}`}>
      {children}
    </h1>
  ),

  // Headers - Clear hierarchy
  H1: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h1 className={`text-2xl font-bold text-[#212326] leading-tight tracking-tight ${className}`}>
      {children}
    </h1>
  ),
  
  H2: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h2 className={`text-xl font-semibold text-[#212326] leading-tight ${className}`}>
      {children}
    </h2>
  ),
  
  H3: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-lg font-semibold text-[#212326] leading-tight ${className}`}>
      {children}
    </h3>
  ),
  
  H4: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h4 className={`text-base font-medium text-[#212326] leading-tight ${className}`}>
      {children}
    </h4>
  ),
  
  H5: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h5 className={`text-sm font-medium text-[#212326] leading-tight ${className}`}>
      {children}
    </h5>
  ),
  
  H6: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h6 className={`text-xs font-medium text-[#212326] leading-tight ${className}`}>
      {children}
    </h6>
  ),

  // Body Text - Clear hierarchy
  Body: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-base text-[#212326] leading-relaxed ${className}`}>
      {children}
    </p>
  ),
  
  BodyMedium: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-[#212326] leading-relaxed ${className}`}>
      {children}
    </p>
  ),
  
  BodySmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-xs text-[#6D7175] leading-relaxed ${className}`}>
      {children}
    </p>
  ),
  
  Caption: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-xs text-[#8C9196] leading-relaxed ${className}`}>
      {children}
    </p>
  ),

  // Labels - Clear hierarchy
  Label: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-sm font-semibold text-[#6D7175] uppercase tracking-wider ${className}`}>
      {children}
    </span>
  ),
  
  LabelSmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-xs font-medium text-[#8C9196] uppercase tracking-wider ${className}`}>
      {children}
    </span>
  ),

  // Numbers/Metrics - Clear hierarchy
  Metric: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-3xl font-bold text-[#212326] ${className}`}>
      {children}
    </span>
  ),
  
  MetricMedium: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-2xl font-bold text-[#212326] ${className}`}>
      {children}
    </span>
  ),
  
  MetricSmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-xl font-semibold text-[#212326] ${className}`}>
      {children}
    </span>
  ),

  // Badges (Polaris Colors)
  Badge: ({ children, variant = "default", className = "" }: { 
    children: React.ReactNode; 
    variant?: "default" | "success" | "warning" | "critical" | "info" | "error";
    className?: string;
  }) => {
    const variants = {
      default: "bg-[#F6F6F7] text-[#6D7175]",
      success: "bg-[#E3F2ED] text-[#008060]",
      warning: "bg-[#FEF3E2] text-[#F79009]", 
      critical: "bg-[#FEF2F2] text-[#D72C0D]",
      info: "bg-[#E7F3FF] text-[#0969DA]",
      error: "bg-[#FEF2F2] text-[#D72C0D]"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
        {children}
      </span>
    );
  }
};

export default Typography;
