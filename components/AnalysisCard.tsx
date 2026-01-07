
import React from 'react';

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <span className="text-slate-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-sm">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
