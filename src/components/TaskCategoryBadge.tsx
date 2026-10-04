import React from 'react';
import { CareTask } from '../types';
import { getTaskCategory, TASK_CATEGORY_MAP } from '../utils/taskColors';
import { 
  Pill, Utensils, Activity, Heart, Eye, FileText, 
  Check, Clock, AlertCircle 
} from 'lucide-react';

interface TaskBadgeProps {
  task: CareTask;
  compact?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

export const TaskCategoryBadge: React.FC<TaskBadgeProps> = ({
  task,
  compact = false,
  onClick,
  interactive = false
}) => {
  const categoryKey = getTaskCategory(task.taskName, task.category);
  const cfg = TASK_CATEGORY_MAP[categoryKey];

  const renderIcon = (className: string) => {
    switch (categoryKey) {
      case 'clinical':
        return <Pill className={className} />;
      case 'nutrition':
        return <Utensils className={className} />;
      case 'mobility':
        return <Activity className={className} />;
      case 'hygiene':
        return <Heart className={className} />;
      case 'monitoring':
        return <Eye className={className} />;
      case 'documentation':
      default:
        return <FileText className={className} />;
    }
  };

  if (compact) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${cfg.bgBadge} ${cfg.textBadge} ${cfg.borderBadge} transition-all`}
        title={`Category: ${cfg.label}`}
      >
        {renderIcon('w-2.5 h-2.5 shrink-0')}
        <span>{cfg.label}</span>
      </span>
    );
  }

  const Tag = interactive ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
        task.completed 
          ? 'bg-slate-50/80 border-slate-200/80 opacity-70' 
          : `${cfg.bgLight} ${cfg.borderBadge} hover:shadow-xs`
      } ${interactive ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start space-x-2 min-w-0 flex-1">
        {/* Category color icon indicator */}
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
          task.completed ? 'bg-slate-200 text-slate-500' : `${cfg.bgBadge} ${cfg.textBadge}`
        }`}>
          {renderIcon('w-3.5 h-3.5')}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${cfg.bgBadge} ${cfg.textBadge} ${cfg.borderBadge}`}>
              {cfg.label}
            </span>
            {task.priority === 'High' && (
              <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 bg-rose-600 text-white rounded">
                High Priority
              </span>
            )}
            {task.priority === 'Medium' && (
              <span className="text-[8px] font-bold uppercase px-1 py-0.2 bg-amber-500/20 text-amber-800 rounded">
                Urgent
              </span>
            )}
          </div>

          <p className={`text-xs font-semibold mt-0.5 leading-snug ${
            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
          }`}>
            {task.taskName}
          </p>

          {task.timeCompleted && (
            <p className="text-[9px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>Signed off at {task.timeCompleted}</span>
            </p>
          )}
        </div>
      </div>

      {/* Completion checkmark bubble */}
      <div className="shrink-0 flex items-center">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}>
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>
    </Tag>
  );
};

/**
 * Visual Task Color Legend Bar for easy user understanding
 */
export const TaskColorLegend: React.FC<{ activeFilter?: string; onSelectFilter?: (cat: string | null) => void }> = ({
  activeFilter,
  onSelectFilter
}) => {
  const categories = Object.values(TASK_CATEGORY_MAP);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <span>Task Categories & Color Coding</span>
        {activeFilter && onSelectFilter && (
          <button 
            onClick={() => onSelectFilter(null)}
            className="text-blue-600 hover:underline font-semibold"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const isSelected = activeFilter === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => onSelectFilter && onSelectFilter(isSelected ? null : cat.category)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-xs' 
                  : 'opacity-90 hover:opacity-100'
              } ${cat.bgBadge} ${cat.textBadge} ${cat.borderBadge}`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
