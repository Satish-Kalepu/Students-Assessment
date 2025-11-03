
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-slate-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
      <h2 className={`text-xl font-semibold text-slate-800 ${className}`}>
        {children}
      </h2>
    );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
      <div className={`mt-4 ${className}`}>
        {children}
      </div>
    );
};
