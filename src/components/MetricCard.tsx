import React from 'react';
import * as Icons from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Icons;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'blue',
}) => {
  const IconComponent = Icons[icon] as React.ComponentType<{ className?: string }>;

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  };

  const bgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans truncate mr-2">
            {title}
          </span>
          <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border shrink-0 ${bgClass}`}>
            {IconComponent && <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
            {value}
          </span>
          {trend && (
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center whitespace-nowrap ${
              trend.positive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-[10px] sm:text-xs text-slate-400 mt-2 font-medium leading-normal line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
};
