import React, { useState, useEffect } from 'react';
import { 
  Building, Users, Calendar, Shield, Heart, MessageSquare, 
  Sparkles, Clock, ArrowLeftRight, Settings, Activity, Info, Key, LogIn, LogOut, Lock, Smartphone, Laptop, Menu, X
} from 'lucide-react';

import { Worker, ClientSite, Shift, HolidayRequest, ChatMessage, IncidentReport, CareTask } from './types';
import { 
  SEED_WORKERS, SEED_CLIENT_SITES, SEED_SHIFTS, 
  SEED_HOLIDAYS, SEED_INCIDENTS, SEED_CHATS 
} from './data';

import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { WorkerAppPortal } from './components/WorkerAppPortal';
import { FamilyPortal } from './components/FamilyPortal';
import { ChatSystem } from './components/ChatSystem';
import { LoginDetailsModal } from './components/LoginDetailsModal';
import { LoginPage } from './components/LoginPage';

export default function App() {
  // Primary state pools (initialized from local storage or seeds)
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('nexora_workers');
    return saved ? JSON.parse(saved) : SEED_WORKERS;
  });

  const [clientSites, setClientSites] = useState<ClientSite[]>(() => {
    const saved = localStorage.getItem('nexora_client_sites');
    return saved ? JSON.parse(saved) : SEED_CLIENT_SITES;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('nexora_shifts');
    return saved ? JSON.parse(saved) : SEED_SHIFTS;
  });

  const [holidays, setHolidays] = useState<HolidayRequest[]>(() => {
    const saved = localStorage.getItem('nexora_holidays');
    return saved ? JSON.parse(saved) : SEED_HOLIDAYS;
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('nexora_incidents');
    return saved ? JSON.parse(saved) : SEED_INCIDENTS;
  });

  const [chats, setChats] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nexora_chats');
    return saved ? JSON.parse(saved) : SEED_CHATS;
  });

  // Authentication & Session State
  // The Login Gateway is configured as the application's beginning / starting page
  const [currentUserSession, setCurrentUserSession] = useState<{
    isAuthenticated: boolean;
    userType: 'admin' | 'worker';
    name: string;
    email: string;
    role: string;
    workerId?: string;
  } | null>(null);

  const [loginPageMode, setLoginPageMode] = useState<'admin' | 'worker'>('admin');

  // Role switching control panel state
  const [activePortal, setActivePortal] = useState<'agency' | 'client' | 'worker' | 'family' | 'messaging'>('agency');
  const [currentWorkerId, setCurrentWorkerId] = useState<string>('w-sarah');
  const [currentClientSiteId, setCurrentClientSiteId] = useState<string>('c-oakridge');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync session
  useEffect(() => {
    if (currentUserSession) {
      localStorage.setItem('nexora_auth_session', JSON.stringify(currentUserSession));
    } else {
      localStorage.removeItem('nexora_auth_session');
    }
  }, [currentUserSession]);

  // Trigger state persistence
  useEffect(() => {
    localStorage.setItem('nexora_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('nexora_client_sites', JSON.stringify(clientSites));
  }, [clientSites]);

  useEffect(() => {
    localStorage.setItem('nexora_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('nexora_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('nexora_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('nexora_chats', JSON.stringify(chats));
  }, [chats]);

  // SYSTEM ACTIONS
  
  // 1. Add shift with strict CQC / Working Hours validation
  const handleAddShift = (shiftData: Partial<Shift>): { success: boolean; error?: string } => {
    // A. Compliance Guardrail: Restrict Pending/Blocked Workers
    if (shiftData.assignedWorkerId === 'w-emily') {
      return { 
        success: false, 
        error: 'Compliance Violation: Emily Thompson is currently marked as "Pending Compliance" due to expired right-to-work and DBS documents. Statutory CQC rules prohibit placing non-compliant staff on shifts.' 
      };
    }

    // B. Compliance Guardrail: Limit Working Hours past 48 hrs (UK Working Time Directive)
    if (shiftData.assignedWorkerId) {
      const worker = workers.find(w => w.id === shiftData.assignedWorkerId);
      if (worker) {
        const estimatedHours = 8; // standard duration approximation
        if (worker.allocatedHoursThisWeek + estimatedHours > 48) {
          return {
            success: false,
            error: `Working Time Limit Violated: Assigning this shift to ${worker.name} would push their scheduled hours to ${worker.allocatedHoursThisWeek + estimatedHours} this week, exceeding the legal UK 48-hour limit. An explicit Opt-Out Agreement is required.`
          };
        }
      }
    }

    // Create final shift entity
    const newShift: Shift = {
      id: `s-${Date.now()}`,
      clientSiteId: shiftData.clientSiteId || 'c-oakridge',
      roleRequired: shiftData.roleRequired || 'Care Assistant',
      date: shiftData.date || '2026-07-15',
      startTime: shiftData.startTime || '08:00',
      endTime: shiftData.endTime || '16:00',
      payRate: shiftData.payRate || 14.50,
      billRate: shiftData.billRate || 21.00,
      status: shiftData.status || 'Open',
      assignedWorkerId: shiftData.assignedWorkerId,
      appliedWorkerIds: shiftData.appliedWorkerIds || [],
      urgency: shiftData.urgency || 'Medium',
      careLogChecklist: shiftData.careLogChecklist || []
    };

    setShifts(prev => [newShift, ...prev]);

    // Update worker allocated hours if assigned
    if (shiftData.assignedWorkerId) {
      setWorkers(prev => prev.map(w => {
        if (w.id === shiftData.assignedWorkerId) {
          return { ...w, allocatedHoursThisWeek: w.allocatedHoursThisWeek + 8 };
        }
        return w;
      }));
    }

    return { success: true };
  };

  // 2. Approve applicant from open marketplace
  const handleApproveApplication = (shiftId: string, workerId: string) => {
    // Validate compliance first
    if (workerId === 'w-emily') {
      alert('Action blocked: Emily Thompson has expired documents and cannot be scheduled.');
      return;
    }

    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'Confirmed',
          assignedWorkerId: workerId,
          appliedWorkerIds: []
        };
      }
      return s;
    }));

    // Update worker's scheduled hours
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        return { ...w, allocatedHoursThisWeek: w.allocatedHoursThisWeek + 8 };
      }
      return w;
    }));
  };

  // 3. Reject applicant
  const handleRejectApplication = (shiftId: string, workerId: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          appliedWorkerIds: s.appliedWorkerIds.filter(wid => wid !== workerId)
        };
      }
      return s;
    }));
  };

  // 4. Approve timesheet from Client Site manager
  const handleApproveTimesheet = (shiftId: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          timesheetApproved: true,
          timesheetDisputed: false
        };
      }
      return s;
    }));
  };

  // 5. Dispute timesheet
  const handleDisputeTimesheet = (shiftId: string, reason: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          timesheetDisputed: true,
          timesheetApproved: false,
          disputeReason: reason
        };
      }
      return s;
    }));
  };

  // 6. Update employee details (Admin Full Privilege)
  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
  };

  // 7. Send alert / chat message to worker
  const handleNotifyWorker = (workerId: string, alertType: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    const autoMsg: ChatMessage = {
      id: `ch-auto-${Date.now()}`,
      senderId: 'agency',
      senderName: 'Nexora Backoffice Alerts',
      senderRole: 'agency',
      recipientId: workerId,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `[Compliance Alert: ${alertType}] Hello ${worker.name}, please upload your updated regulatory certificates to our secure RTW portal immediately to avoid roster blocks.`
    };

    setChats(prev => [...prev, autoMsg]);
    alert(`Audit Notification dispatched securely to ${worker.name}. Permanent chat log recorded.`);
  };

  // 7. Log safety/clinical incidents to statutory ledger
  const handleReportIncident = (incidentData: Partial<IncidentReport>) => {
    const newInc: IncidentReport = {
      id: `inc-${Date.now()}`,
      clientSiteId: incidentData.clientSiteId || 'c-oakridge',
      workerId: incidentData.workerId || 'w-sarah',
      date: new Date().toISOString().split('T')[0],
      title: incidentData.title || 'Incident Logged',
      description: incidentData.description || 'Details',
      actionTaken: incidentData.actionTaken || 'No action specified',
      severity: incidentData.severity || 'Medium',
      status: 'Logged for CQC',
      reportedBy: incidentData.reportedBy || 'System'
    };

    setIncidents(prev => [newInc, ...prev]);
  };

  // 8. Worker GPS Check-In
  const handleCheckIn = (shiftId: string, method: 'GPS' | 'QR/NFC' | 'Manual', reason?: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          checkInTime: nowTime,
          checkInMethod: method,
          checkInReason: reason,
          status: 'Confirmed'
        };
      }
      return s;
    }));
  };

  // 9. Worker GPS Check-Out
  const handleCheckOut = (shiftId: string, careNotes: string, checklist: CareTask[]) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          checkOutTime: nowTime,
          careNotes,
          careLogChecklist: checklist,
          status: 'Completed'
        };
      }
      return s;
    }));
  };

  // 10. Worker apply for open shift vacancy
  const handleApplyForShift = (shiftId: string, workerId: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        if (!s.appliedWorkerIds.includes(workerId)) {
          return {
            ...s,
            appliedWorkerIds: [...s.appliedWorkerIds, workerId]
          };
        }
      }
      return s;
    }));
  };

  // 11. Send Support Thread message
  const handleSendMessage = (recipientId: string, content: string) => {
    const senderName = activePortal === 'agency' 
      ? 'Nexora Coordinator' 
      : activePortal === 'client' 
      ? 'Client Admin' 
      : workers.find(w => w.id === currentWorkerId)?.name || 'Carer';

    const senderRole = activePortal === 'agency' 
      ? 'agency' 
      : activePortal === 'client' 
      ? 'client' 
      : 'worker';

    const newMsg: ChatMessage = {
      id: `ch-user-${Date.now()}`,
      senderId: activePortal === 'agency' ? 'agency' : currentWorkerId,
      senderName,
      senderRole,
      recipientId,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content
    };

    setChats(prev => [...prev, newMsg]);
  };

  // 12. Offline Queue synchronizer
  const handleOfflineSync = (offlineLogs: any[]) => {
    offlineLogs.forEach(log => {
      if (log.type === 'check-in') {
        handleCheckIn(log.shiftId, log.method, log.reason);
      } else if (log.type === 'check-out') {
        handleCheckOut(log.shiftId, log.careNotes, log.checklist);
      }
    });
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore the simulation database to factory default seeds?')) {
      localStorage.clear();
      setWorkers(SEED_WORKERS);
      setClientSites(SEED_CLIENT_SITES);
      setShifts(SEED_SHIFTS);
      setHolidays(SEED_HOLIDAYS);
      setIncidents(SEED_INCIDENTS);
      setChats(SEED_CHATS);
      setActivePortal('agency');
    }
  };

  const currentSiteObj = clientSites.find(cs => cs.id === currentClientSiteId);
  const workerObj = workers.find(w => w.id === currentWorkerId);

  // Authentication Handlers
  const handleAdminLogin = (adminUser: { name: string; email: string; role: string }) => {
    setCurrentUserSession({
      isAuthenticated: true,
      userType: 'admin',
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });
    if (adminUser.role === 'client') {
      setActivePortal('client');
      setCurrentClientSiteId('c-oakridge');
    } else {
      setActivePortal('agency');
    }
  };

  const handleWorkerLogin = (workerId: string) => {
    const w = workers.find(item => item.id === workerId);
    setCurrentUserSession({
      isAuthenticated: true,
      userType: 'worker',
      name: w ? w.name : 'Care Professional',
      email: w ? w.email : 'worker@nexoracare.co.uk',
      role: w ? w.role : 'Carer',
      workerId: workerId
    });
    setCurrentWorkerId(workerId);
    setActivePortal('worker');
  };

  const handleLogout = (targetMode: 'admin' | 'worker' = 'admin') => {
    setCurrentUserSession(null);
    setLoginPageMode(targetMode);
  };

  // If user is logged out, render the dedicated separate Login Page
  if (!currentUserSession || !currentUserSession.isAuthenticated) {
    return (
      <LoginPage
        workers={workers}
        onAdminLogin={handleAdminLogin}
        onWorkerLogin={handleWorkerLogin}
        initialMode={loginPageMode}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-30 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Left Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col shrink-0 h-full text-slate-400 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/30 font-display">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-black text-white tracking-wider uppercase font-display">Nexora Care</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1 py-0.2 rounded border border-emerald-500/30 font-mono tracking-tighter">CQC COMPLIANT</span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SYSTEM PORTALS</div>
          
          <button 
            onClick={() => { setActivePortal('agency'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activePortal === 'agency' 
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-600 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            <Building className="w-5 h-5 shrink-0" />
            <span className="text-xs">1. Super Admin (Agency)</span>
          </button>

          <button 
            onClick={() => { setActivePortal('client'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activePortal === 'client' 
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-600 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="text-xs">2. Client Care Home</span>
          </button>

          <button 
            onClick={() => { setActivePortal('worker'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activePortal === 'worker' 
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-600 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-xs">3. Worker Mobile App</span>
          </button>

          <button 
            onClick={() => { setActivePortal('family'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activePortal === 'family' 
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-600 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            <Heart className="w-5 h-5 shrink-0" />
            <span className="text-xs">4. Family Companion</span>
          </button>

          <button 
            onClick={() => { setActivePortal('messaging'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activePortal === 'messaging' 
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-600 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span className="text-xs">5. Secure Chat Log</span>
          </button>

          {/* Context Switch Dropdowns integrated directly into sidebar */}
          <div className="mt-6 pt-4 border-t border-slate-800 px-6">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">SIMULATOR CONTROLS</div>
            
            {activePortal === 'worker' && (
              <div className="space-y-1.5 mb-4">
                <label className="text-[10px] font-bold text-slate-400">Switch Carer Profile:</label>
                <select
                  value={currentWorkerId}
                  onChange={(e) => setCurrentWorkerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="w-sarah">Sarah Jenkins (Nurse)</option>
                  <option value="w-liam">Liam Patel (Senior Carer)</option>
                  <option value="w-emily">Emily Thompson (Blocked)</option>
                  <option value="w-david">David Ndlovu (Support)</option>
                </select>
              </div>
            )}

            {activePortal === 'client' && (
              <div className="space-y-1.5 mb-4">
                <label className="text-[10px] font-bold text-slate-400">Switch Client Site:</label>
                <select
                  value={currentClientSiteId}
                  onChange={(e) => setCurrentClientSiteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {clientSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name.split(' ')[0]} Manor</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full mb-2 text-center text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-blue-900/30 flex items-center justify-center space-x-2 border border-blue-400/30 group"
            >
              <Key className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>Login Details & Vault</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <button
                onClick={() => handleLogout('admin')}
                className="text-center text-[10px] bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700 py-1.5 rounded-lg transition-colors font-bold text-slate-300 flex items-center justify-center space-x-1"
                title="Go to Admin Laptop Portal"
              >
                <Laptop className="w-3 h-3 text-blue-400" />
                <span>Admin (Lap)</span>
              </button>

              <button
                onClick={() => handleLogout('worker')}
                className="text-center text-[10px] bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 py-1.5 rounded-lg transition-colors font-bold text-slate-300 flex items-center justify-center space-x-1"
                title="Go to Worker Mobile Portal"
              >
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Worker (Mobile)</span>
              </button>
            </div>

            <button
              onClick={handleResetData}
              className="w-full text-center text-[10px] bg-slate-800 hover:bg-rose-950/30 hover:text-rose-400 border border-slate-700 py-1.5 rounded-lg transition-colors font-bold text-slate-400"
            >
              Restore Factory Seeds
            </button>
          </div>
        </nav>

        {/* User Profile Widget */}
        <div 
          className="p-4 border-t border-slate-800 bg-slate-950/40"
        >
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to view credentials"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs font-mono shrink-0">
                {currentUserSession?.userType === 'worker' ? "CW" : "AD"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  {currentUserSession?.name || "Active User"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUserSession?.userType === 'worker' ? "Field Care Worker" : "Management / Admin"}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleLogout(currentUserSession?.userType || 'admin')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all ml-2 shrink-0"
              title="Sign Out / Change User"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 font-display truncate max-w-[180px] sm:max-w-none">
                {activePortal === 'agency' && "Super Admin Command Centre"}
                {activePortal === 'client' && "Partner Client Dashboard"}
                {activePortal === 'worker' && "Nexora Go: Mobile Field App"}
                {activePortal === 'family' && "Family Companion Circle"}
                {activePortal === 'messaging' && "CQC Communications Ledger"}
              </h2>
            </div>
            <span className="hidden md:inline px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 uppercase tracking-wide font-mono">
              CQC AUDIT READY
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-slate-900 hover:bg-blue-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1 sm:space-x-1.5 border border-slate-700 hover:border-blue-500 active:scale-95"
            >
              <Key className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="hidden sm:inline">Login Accounts</span>
              <span className="sm:hidden">Logins</span>
            </button>

            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
              {currentUserSession?.userType === 'worker' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Worker Mobile View</span>
                </>
              ) : (
                <>
                  <Laptop className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Laptop View</span>
                </>
              )}
            </div>

            <button
              onClick={() => handleLogout(currentUserSession?.userType || 'admin')}
              className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 active:scale-95"
              title="Sign out to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>UK: 14:42</span>
            </div>
          </div>
        </header>

        {/* Context Simulation Banner */}
        <div className="bg-blue-50/70 border-b border-blue-100/50 py-2.5 px-4 sm:px-8 flex items-center space-x-2 text-xs text-blue-900 shrink-0">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium text-[11px] leading-relaxed truncate sm:whitespace-normal">
            {activePortal === 'agency' && "Agency operations: Rota Shifts, employee editing, compliance documents, and payroll exports."}
            {activePortal === 'client' && `Site manager for ${currentSiteObj?.name || "Care Home"}. Live caregivers, timesheets, and CQC incident logs.`}
            {activePortal === 'worker' && `Mobile care worker app for ${workerObj?.name || "Carer"}. Check in/out, checklist tasks, and offline sync.`}
            {activePortal === 'family' && "Family companion circle for Margaret Smith. Daily care logs directly by site caregivers."}
            {activePortal === 'messaging' && "CQC compliance messaging hub. Permanent logs of regulatory communications."}
          </span>
        </div>

        {/* Scrollable Main Grid/Content Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          {activePortal === 'agency' && (
            <SuperAdminDashboard
              workers={workers}
              clientSites={clientSites}
              shifts={shifts}
              holidays={holidays}
              incidents={incidents}
              onAddShift={handleAddShift}
              onApproveApplication={handleApproveApplication}
              onRejectApplication={handleRejectApplication}
              onApproveTimesheet={handleApproveTimesheet}
              onDisputeTimesheet={handleDisputeTimesheet}
              onNotifyWorker={handleNotifyWorker}
              onUpdateWorker={handleUpdateWorker}
            />
          )}

          {activePortal === 'client' && (
            <ClientDashboard
              currentClientSiteId={currentClientSiteId}
              workers={workers}
              clientSites={clientSites}
              shifts={shifts}
              incidents={incidents}
              onAddShift={handleAddShift}
              onApproveTimesheet={handleApproveTimesheet}
              onDisputeTimesheet={handleDisputeTimesheet}
              onReportIncident={handleReportIncident}
            />
          )}

          {activePortal === 'worker' && (
            <WorkerAppPortal
              currentWorkerId={currentWorkerId}
              workers={workers}
              clientSites={clientSites}
              shifts={shifts}
              onApplyForShift={handleApplyForShift}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onOfflineSync={handleOfflineSync}
            />
          )}

          {activePortal === 'family' && (
            <FamilyPortal
              workers={workers}
              clientSites={clientSites}
              shifts={shifts}
              onSendMessage={handleSendMessage}
            />
          )}

          {activePortal === 'messaging' && (
            <ChatSystem
              messages={chats}
              currentUserId={activePortal === 'agency' ? 'agency' : currentWorkerId}
              currentUserName={activePortal === 'agency' ? 'Nexora Backoffice' : workers.find(w => w.id === currentWorkerId)?.name || 'Carer'}
              currentUserRole={activePortal === 'agency' ? 'agency' : 'worker'}
              onSendMessage={handleSendMessage}
              workers={workers}
            />
          )}
        </div>
      </main>

      {/* Login Credentials & Demo Account Switcher Hub */}
      <LoginDetailsModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSelectRole={(portal, workerId, siteId) => {
          setActivePortal(portal);
          if (workerId) setCurrentWorkerId(workerId);
          if (siteId) setCurrentClientSiteId(siteId);
        }}
        currentPortal={activePortal}
      />
    </div>
  );
}
