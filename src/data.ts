import { Worker, ClientSite, Shift, HolidayRequest, ChatMessage, IncidentReport } from './types';

export const SEED_WORKERS: Worker[] = [
  {
    id: 'w-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@nexoracare.co.uk',
    role: 'Registered Nurse',
    phone: '+44 7700 900077',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    compliance: {
      dbsNumber: '00124589632',
      dbsExpiry: '2027-11-20',
      rtwStatus: 'Verified',
      rightToWorkExpiry: '2028-05-15',
      mandatoryTrainingCompleted: true,
      trainingExpiry: '2026-10-12',
      visaStatus: 'UK Citizen'
    },
    reliabilityScore: 99,
    status: 'Active',
    payRate: 28.50,
    maxHoursWeekly: 40,
    allocatedHoursThisWeek: 24,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'w-liam',
    name: 'Liam Patel',
    email: 'liam.patel@nexoracare.co.uk',
    role: 'Senior Carer',
    phone: '+44 7700 900143',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    compliance: {
      dbsNumber: '00329811405',
      dbsExpiry: '2026-07-29', // Expiring in 15 days (Current Date: July 14, 2026)
      rtwStatus: 'Verified',
      rightToWorkExpiry: '2027-02-14',
      mandatoryTrainingCompleted: true,
      trainingExpiry: '2026-07-25',
      visaStatus: 'UK Citizen'
    },
    reliabilityScore: 94,
    status: 'Active',
    payRate: 18.20,
    maxHoursWeekly: 48,
    allocatedHoursThisWeek: 36,
    availableDays: ['Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  {
    id: 'w-emily',
    name: 'Emily Thompson',
    email: 'emily.t@nexoracare.co.uk',
    role: 'Care Assistant',
    phone: '+44 7700 900251',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    compliance: {
      dbsNumber: '00478129032',
      dbsExpiry: '2026-06-30', // EXPIRED! -> must block scheduling.
      rtwStatus: 'Pending',
      rightToWorkExpiry: '2026-06-30', // EXPIRED!
      mandatoryTrainingCompleted: false,
      trainingExpiry: '2026-05-10',
      visaStatus: 'Biometric Residence Permit'
    },
    reliabilityScore: 82,
    status: 'Pending Compliance',
    payRate: 14.50,
    maxHoursWeekly: 20,
    allocatedHoursThisWeek: 0,
    availableDays: ['Monday', 'Wednesday', 'Friday']
  },
  {
    id: 'w-david',
    name: 'David Ndlovu',
    email: 'david.n@nexoracare.co.uk',
    role: 'Support Worker',
    phone: '+44 7700 900332',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    compliance: {
      dbsNumber: '00983145781',
      dbsExpiry: '2027-04-18',
      rtwStatus: 'Verified',
      rightToWorkExpiry: '2029-01-01',
      mandatoryTrainingCompleted: true,
      trainingExpiry: '2027-01-15',
      visaStatus: 'UK Citizen'
    },
    reliabilityScore: 96,
    status: 'Active',
    payRate: 15.80,
    maxHoursWeekly: 37.5,
    allocatedHoursThisWeek: 15,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Saturday', 'Sunday']
  }
];

export const SEED_CLIENT_SITES: ClientSite[] = [
  {
    id: 'c-oakridge',
    name: 'Oakridge Manor Care Home',
    address: '14 Oakridge Lane, Highgate, London',
    postcode: 'N6 5UP',
    contactName: 'Margaret Higgins',
    phone: '+44 20 8340 1234',
    latitude: 51.5711,
    longitude: -0.1481,
    geofenceRadiusMeters: 150,
    minComplianceLevel: 'Enhanced',
    billRateOffset: 6.50
  },
  {
    id: 'c-cherry',
    name: 'Cherry Tree Dementia Clinic',
    address: '42 Harley Street, Marylebone, London',
    postcode: 'W1G 9QN',
    contactName: 'Dr. Alistair Vance',
    phone: '+44 20 7935 5678',
    latitude: 51.5212,
    longitude: -0.1456,
    geofenceRadiusMeters: 100,
    minComplianceLevel: 'Senior',
    billRateOffset: 8.00
  },
  {
    id: 'c-silverbirch',
    name: 'Silver Birch Assisted Living',
    address: '109 Greenwich High Road, London',
    postcode: 'SE10 8JA',
    contactName: 'Prisha Patel',
    phone: '+44 20 8858 9012',
    latitude: 51.4789,
    longitude: -0.0156,
    geofenceRadiusMeters: 150,
    minComplianceLevel: 'Standard',
    billRateOffset: 5.50
  }
];

export const SEED_SHIFTS: Shift[] = [
  // Historic completed shifts
  {
    id: 's-completed-1',
    clientSiteId: 'c-oakridge',
    roleRequired: 'Senior Carer',
    date: '2026-07-12',
    startTime: '08:00',
    endTime: '16:00',
    payRate: 18.20,
    billRate: 24.70,
    status: 'Completed',
    assignedWorkerId: 'w-liam',
    appliedWorkerIds: ['w-liam'],
    urgency: 'Medium',
    checkInTime: '07:54',
    checkOutTime: '16:03',
    checkInMethod: 'GPS',
    timesheetApproved: true,
    careNotes: 'Assisted residents with morning mobility. Supervised breakfast and administered morning medication checklist. Conducted hourly welfare rounds.',
    careLogChecklist: [
      { id: 't1', taskName: 'Medication administration', category: 'clinical', priority: 'High', completed: true, timeCompleted: '08:30' },
      { id: 't2', taskName: 'Breakfast assistance', category: 'nutrition', priority: 'Medium', completed: true, timeCompleted: '09:00' },
      { id: 't3', taskName: 'Hydration checks (hourly)', category: 'monitoring', priority: 'Routine', completed: true, timeCompleted: '15:00' },
      { id: 't4', taskName: 'Log daily observations', category: 'documentation', priority: 'Routine', completed: true, timeCompleted: '15:45' }
    ]
  },
  {
    id: 's-completed-2',
    clientSiteId: 'c-cherry',
    roleRequired: 'Registered Nurse',
    date: '2026-07-13',
    startTime: '07:00',
    endTime: '19:00',
    payRate: 28.50,
    billRate: 36.50,
    status: 'Completed',
    assignedWorkerId: 'w-sarah',
    appliedWorkerIds: ['w-sarah'],
    urgency: 'High',
    checkInTime: '06:58',
    checkOutTime: '19:05',
    checkInMethod: 'QR/NFC',
    timesheetApproved: true,
    careNotes: 'Supervised clinical ward operations. Addressed high blood pressure incident with resident Margaret Smith (stabilised after consultation). Handed over to night shift.',
    careLogChecklist: [
      { id: 't2-1', taskName: 'Controlled drug audits', category: 'clinical', priority: 'High', completed: true, timeCompleted: '07:15' },
      { id: 't2-2', taskName: 'Wound care dressings', category: 'hygiene', priority: 'High', completed: true, timeCompleted: '11:30' },
      { id: 't2-3', taskName: 'Care plan updates', category: 'documentation', priority: 'Medium', completed: true, timeCompleted: '14:00' },
      { id: 't2-4', taskName: 'Physician handovers', category: 'monitoring', priority: 'Medium', completed: true, timeCompleted: '18:15' }
    ]
  },
  // Upcoming assigned shifts (today and future)
  {
    id: 's-upcoming-today',
    clientSiteId: 'c-oakridge',
    roleRequired: 'Registered Nurse',
    date: '2026-07-14',
    startTime: '08:00',
    endTime: '16:00',
    payRate: 28.50,
    billRate: 35.00,
    status: 'Confirmed',
    assignedWorkerId: 'w-sarah',
    appliedWorkerIds: ['w-sarah', 'w-david'],
    urgency: 'Medium',
    careLogChecklist: [
      { id: 't3-1', taskName: 'Clinical rounds & vitals check', category: 'clinical', priority: 'High', completed: false },
      { id: 't3-2', taskName: 'Administer morning prescriptions', category: 'clinical', priority: 'High', completed: false },
      { id: 't3-3', taskName: 'Lunchtime posture & mobility assistance', category: 'mobility', priority: 'Medium', completed: false },
      { id: 't3-4', taskName: 'Hydration & fluid intake logging', category: 'nutrition', priority: 'Routine', completed: false },
      { id: 't3-5', taskName: 'Personal hygiene & freshen up', category: 'hygiene', priority: 'Medium', completed: false },
      { id: 't3-6', taskName: 'End of shift handover log', category: 'documentation', priority: 'Routine', completed: false }
    ]
  },
  {
    id: 's-upcoming-tomorrow',
    clientSiteId: 'c-silverbirch',
    roleRequired: 'Senior Carer',
    date: '2026-07-15',
    startTime: '14:00',
    endTime: '22:00',
    payRate: 18.20,
    billRate: 23.70,
    status: 'Assigned',
    assignedWorkerId: 'w-liam',
    appliedWorkerIds: ['w-liam'],
    urgency: 'Low',
    careLogChecklist: [
      { id: 't4-1', taskName: 'Review resident support journals', category: 'documentation', priority: 'Routine', completed: false },
      { id: 't4-2', taskName: 'Evening meal prep & dietary assistance', category: 'nutrition', priority: 'Medium', completed: false },
      { id: 't4-3', taskName: 'Assisted evening walking exercise', category: 'mobility', priority: 'Medium', completed: false },
      { id: 't4-4', taskName: 'Night-time security & room welfare check', category: 'monitoring', priority: 'High', completed: false }
    ]
  },
  // Open shifts for Marketplace
  {
    id: 's-open-1',
    clientSiteId: 'c-cherry',
    roleRequired: 'Registered Nurse',
    date: '2026-07-16',
    startTime: '08:00',
    endTime: '18:00',
    payRate: 28.50,
    billRate: 36.50,
    status: 'Open',
    appliedWorkerIds: [],
    urgency: 'High',
    careLogChecklist: [
      { id: 't5-1', taskName: 'Clinical handover round', category: 'clinical', priority: 'High', completed: false },
      { id: 't5-2', taskName: 'Prescription logs validation', category: 'documentation', priority: 'High', completed: false },
      { id: 't5-3', taskName: 'Dietary fluid balance check', category: 'nutrition', priority: 'Medium', completed: false }
    ]
  },
  {
    id: 's-open-2',
    clientSiteId: 'c-silverbirch',
    roleRequired: 'Support Worker',
    date: '2026-07-17',
    startTime: '09:00',
    endTime: '17:00',
    payRate: 15.80,
    billRate: 21.30,
    status: 'Open',
    appliedWorkerIds: ['w-david'],
    urgency: 'Low',
    careLogChecklist: [
      { id: 't6-1', taskName: 'Social interaction diary update', category: 'documentation', priority: 'Routine', completed: false },
      { id: 't6-2', taskName: 'Hydration logs monitoring', category: 'monitoring', priority: 'Routine', completed: false },
      { id: 't6-3', taskName: 'Lunch companion meal setup', category: 'nutrition', priority: 'Medium', completed: false }
    ]
  },
  {
    id: 's-open-urgent',
    clientSiteId: 'c-oakridge',
    roleRequired: 'Care Assistant',
    date: '2026-07-15',
    startTime: '07:00',
    endTime: '15:00',
    payRate: 14.50,
    billRate: 21.00,
    status: 'Open',
    appliedWorkerIds: [],
    urgency: 'High',
    careLogChecklist: [
      { id: 't7-1', taskName: 'Morning wash & dressing assistance', category: 'hygiene', priority: 'High', completed: false },
      { id: 't7-2', taskName: 'Breakfast tray distribution', category: 'nutrition', priority: 'Medium', completed: false },
      { id: 't7-3', taskName: 'Bed-to-chair hoist transfer', category: 'mobility', priority: 'High', completed: false }
    ]
  }
];

export const SEED_HOLIDAYS: HolidayRequest[] = [
  {
    id: 'h-1',
    workerId: 'w-sarah',
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    status: 'Approved',
    reason: 'Family summer holiday in Cornwall',
    requestedAt: '2026-07-01'
  },
  {
    id: 'h-2',
    workerId: 'w-liam',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    status: 'Pending',
    reason: 'Dental appointment & personal chores',
    requestedAt: '2026-07-10'
  }
];

export const SEED_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-1',
    clientSiteId: 'c-cherry',
    workerId: 'w-sarah',
    date: '2026-07-13',
    title: 'Resident fall - no injury',
    description: 'Resident Margaret Smith slipped slightly while returning from the restroom. Caught her weight on the side table. Inspected immediately, vitals stable, zero bruising. Advised doctor on call as a precaution.',
    actionTaken: 'Completed physiological tests. Added non-slip slippers to her care plan checklist.',
    severity: 'Medium',
    status: 'Logged for CQC',
    reportedBy: 'Sarah Jenkins (Registered Nurse)'
  }
];

export const SEED_CHATS: ChatMessage[] = [
  {
    id: 'ch-1',
    senderId: 'agency',
    senderName: 'Nexora Backoffice',
    senderRole: 'agency',
    recipientId: 'w-sarah',
    timestamp: '2026-07-13 14:30',
    content: 'Hi Sarah, we notice your training certificate renewal is coming up in October. We will pre-book you onto the September refresher course. Let us know if that works!'
  },
  {
    id: 'ch-2',
    senderId: 'w-sarah',
    senderName: 'Sarah Jenkins',
    senderRole: 'worker',
    recipientId: 'agency',
    timestamp: '2026-07-13 14:45',
    content: 'Hi, yes September works perfectly. Thank you for sorting!'
  },
  {
    id: 'ch-3',
    senderId: 'agency',
    senderName: 'Nexora Backoffice',
    senderRole: 'agency',
    recipientId: 'w-liam',
    timestamp: '2026-07-14 08:30',
    content: 'Liam, please note your DBS check requires renewal by July 29. Please submit your application form immediately to avoid roster blockages.'
  }
];
