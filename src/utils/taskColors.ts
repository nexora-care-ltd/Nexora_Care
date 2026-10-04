export type TaskCategory = 
  | 'clinical'      // Medication, dressings, vitals, clinical handover
  | 'nutrition'     // Meals, hydration, breakfast, dinner prep
  | 'mobility'      // Mobility assistance, transfers, posture, physiotherapy
  | 'hygiene'       // Personal care, bathing, grooming, dressings
  | 'monitoring'    // Observations, hourly checks, welfare rounds, security
  | 'documentation';// Handover logs, care plan updates, audit notes

export interface TaskCategoryConfig {
  category: TaskCategory;
  label: string;
  bgLight: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
  dotColor: string;
  accentBar: string;
  iconName: string;
  chipClass: string;
}

export const TASK_CATEGORY_MAP: Record<TaskCategory, TaskCategoryConfig> = {
  clinical: {
    category: 'clinical',
    label: 'Clinical & Meds',
    bgLight: 'bg-rose-50/70',
    bgBadge: 'bg-rose-100',
    textBadge: 'text-rose-800',
    borderBadge: 'border-rose-200',
    dotColor: 'bg-rose-500',
    accentBar: 'border-l-rose-500',
    iconName: 'Pill',
    chipClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
  },
  nutrition: {
    category: 'nutrition',
    label: 'Nutrition & Hydration',
    bgLight: 'bg-amber-50/70',
    bgBadge: 'bg-amber-100',
    textBadge: 'text-amber-800',
    borderBadge: 'border-amber-200',
    dotColor: 'bg-amber-500',
    accentBar: 'border-l-amber-500',
    iconName: 'Utensils',
    chipClass: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
  },
  mobility: {
    category: 'mobility',
    label: 'Mobility & Physical',
    bgLight: 'bg-indigo-50/70',
    bgBadge: 'bg-indigo-100',
    textBadge: 'text-indigo-800',
    borderBadge: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    accentBar: 'border-l-indigo-500',
    iconName: 'Activity',
    chipClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
  },
  hygiene: {
    category: 'hygiene',
    label: 'Hygiene & Personal Care',
    bgLight: 'bg-teal-50/70',
    bgBadge: 'bg-teal-100',
    textBadge: 'text-teal-800',
    borderBadge: 'border-teal-200',
    dotColor: 'bg-teal-500',
    accentBar: 'border-l-teal-500',
    iconName: 'Heart',
    chipClass: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
  },
  monitoring: {
    category: 'monitoring',
    label: 'Welfare & Monitoring',
    bgLight: 'bg-sky-50/70',
    bgBadge: 'bg-sky-100',
    textBadge: 'text-sky-800',
    borderBadge: 'border-sky-200',
    dotColor: 'bg-sky-500',
    accentBar: 'border-l-sky-500',
    iconName: 'Eye',
    chipClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
  },
  documentation: {
    category: 'documentation',
    label: 'Audit & Records',
    bgLight: 'bg-purple-50/70',
    bgBadge: 'bg-purple-100',
    textBadge: 'text-purple-800',
    borderBadge: 'border-purple-200',
    dotColor: 'bg-purple-500',
    accentBar: 'border-l-purple-500',
    iconName: 'FileText',
    chipClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
  }
};

/**
 * Automatically infers task category based on keywords in the task name if not explicitly set
 */
export function getTaskCategory(taskName: string, explicitCategory?: TaskCategory): TaskCategory {
  if (explicitCategory && TASK_CATEGORY_MAP[explicitCategory]) {
    return explicitCategory;
  }

  const lower = taskName.toLowerCase();

  // Clinical
  if (
    lower.includes('medic') || 
    lower.includes('drug') || 
    lower.includes('wound') || 
    lower.includes('dress') || 
    lower.includes('prescript') || 
    lower.includes('clinical') ||
    lower.includes('vital') ||
    lower.includes('blood') ||
    lower.includes('nurse')
  ) {
    return 'clinical';
  }

  // Nutrition
  if (
    lower.includes('meal') || 
    lower.includes('breakfast') || 
    lower.includes('lunch') || 
    lower.includes('dinner') || 
    lower.includes('food') || 
    lower.includes('hydrat') || 
    lower.includes('drink') || 
    lower.includes('diet') ||
    lower.includes('eat')
  ) {
    return 'nutrition';
  }

  // Mobility
  if (
    lower.includes('mobility') || 
    lower.includes('transfer') || 
    lower.includes('posture') || 
    lower.includes('walk') || 
    lower.includes('rehab') || 
    lower.includes('hoist') ||
    lower.includes('physio') ||
    lower.includes('exercise')
  ) {
    return 'mobility';
  }

  // Hygiene
  if (
    lower.includes('bath') || 
    lower.includes('shower') || 
    lower.includes('wash') || 
    lower.includes('hygiene') || 
    lower.includes('groom') || 
    lower.includes('toilet') ||
    lower.includes('bed') ||
    lower.includes('incontinence')
  ) {
    return 'hygiene';
  }

  // Monitoring
  if (
    lower.includes('observ') || 
    lower.includes('check') || 
    lower.includes('round') || 
    lower.includes('welfare') || 
    lower.includes('security') || 
    lower.includes('watch') ||
    lower.includes('monitor')
  ) {
    return 'monitoring';
  }

  // Default to documentation/audit
  return 'documentation';
}
