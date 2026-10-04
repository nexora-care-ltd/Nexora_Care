export interface WorkerCompliance {
  dbsNumber: string;
  dbsExpiry: string; // YYYY-MM-DD
  rtwStatus: 'Verified' | 'Pending' | 'Expired';
  rightToWorkExpiry: string;
  mandatoryTrainingCompleted: boolean;
  trainingExpiry: string;
  visaStatus: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: 'Senior Carer' | 'Care Assistant' | 'Registered Nurse' | 'Support Worker';
  phone: string;
  avatar: string;
  compliance: WorkerCompliance;
  reliabilityScore: number; // e.g., 98 for percentage
  status: 'Active' | 'Pending Compliance' | 'Suspended';
  payRate: number; // £/hr
  maxHoursWeekly: number;
  allocatedHoursThisWeek: number;
  availableDays: string[]; // ['Monday', 'Tuesday', ...]
}

export interface ClientSite {
  id: string;
  name: string;
  address: string;
  postcode: string;
  contactName: string;
  phone: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  minComplianceLevel: 'Standard' | 'Enhanced' | 'Senior';
  billRateOffset: number; // agency margin e.g. £5/hr added to payRate
}

export interface CareTask {
  id: string;
  taskName: string;
  completed: boolean;
  timeCompleted?: string;
  category?: 'clinical' | 'nutrition' | 'mobility' | 'hygiene' | 'monitoring' | 'documentation';
  priority?: 'High' | 'Medium' | 'Routine';
}

export interface Shift {
  id: string;
  clientSiteId: string;
  roleRequired: 'Senior Carer' | 'Care Assistant' | 'Registered Nurse' | 'Support Worker';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  payRate: number; // £/hr
  billRate: number; // £/hr
  status: 'Open' | 'Applied' | 'Assigned' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';
  assignedWorkerId?: string;
  appliedWorkerIds: string[];
  urgency: 'Low' | 'Medium' | 'High';
  checkInTime?: string;
  checkOutTime?: string;
  checkInMethod?: 'GPS' | 'QR/NFC' | 'Manual';
  checkInReason?: string;
  checkOutReason?: string;
  careLogChecklist: CareTask[];
  careNotes?: string;
  incidentReported?: boolean;
  timesheetApproved?: boolean;
  timesheetDisputed?: boolean;
  disputeReason?: string;
}

export interface HolidayRequest {
  id: string;
  workerId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  requestedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'agency' | 'worker' | 'client';
  recipientId: string;
  timestamp: string;
  content: string;
}

export interface IncidentReport {
  id: string;
  clientSiteId: string;
  workerId: string;
  date: string;
  title: string;
  description: string;
  actionTaken: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Pending Review' | 'Resolved' | 'Logged for CQC';
  reportedBy: string;
}
