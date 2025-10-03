import React from 'react';

// Design System - Typography
export const Typography = {
  // Headers - Clear hierarchy
  H1: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h1 className={`text-4xl font-bold text-gray-900 leading-tight tracking-tight ${className}`}>
      {children}
    </h1>
  ),
  
  H2: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h2 className={`text-3xl font-bold text-gray-900 leading-tight tracking-tight ${className}`}>
      {children}
    </h2>
  ),
  
  H3: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-2xl font-semibold text-gray-900 leading-tight ${className}`}>
      {children}
    </h3>
  ),
  
  H4: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h4 className={`text-xl font-semibold text-gray-900 leading-tight ${className}`}>
      {children}
    </h4>
  ),
  
  H5: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h5 className={`text-lg font-medium text-gray-900 leading-tight ${className}`}>
      {children}
    </h5>
  ),
  
  H6: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h6 className={`text-base font-medium text-gray-900 leading-tight ${className}`}>
      {children}
    </h6>
  ),

  // Body Text - Clear hierarchy
  Body: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-lg text-gray-700 leading-relaxed ${className}`}>
      {children}
    </p>
  ),
  
  BodyMedium: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-base text-gray-700 leading-relaxed ${className}`}>
      {children}
    </p>
  ),
  
  BodySmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-gray-600 leading-relaxed ${className}`}>
      {children}
    </p>
  ),
  
  Caption: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-xs text-gray-500 leading-relaxed ${className}`}>
      {children}
    </p>
  ),

  // Labels - Clear hierarchy
  Label: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-sm font-semibold text-gray-600 uppercase tracking-wider ${className}`}>
      {children}
    </span>
  ),
  
  LabelSmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </span>
  ),

  // Numbers/Metrics - Clear hierarchy
  Metric: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-3xl font-bold text-gray-900 ${className}`}>
      {children}
    </span>
  ),
  
  MetricMedium: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-2xl font-bold text-gray-900 ${className}`}>
      {children}
    </span>
  ),
  
  MetricSmall: ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </span>
  ),

  // Badges
  Badge: ({ children, variant = "default", className = "" }: { 
    children: React.ReactNode; 
    variant?: "default" | "success" | "warning" | "error" | "info";
    className?: string;
  }) => {
    const variants = {
      default: "bg-gray-100 text-gray-700",
      success: "bg-green-50 text-green-700",
      warning: "bg-yellow-50 text-yellow-700", 
      error: "bg-red-50 text-red-700",
      info: "bg-blue-50 text-blue-700"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
        {children}
      </span>
    );
  }
};

export default Typography;
