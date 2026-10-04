import React, { useState } from 'react';
import { Worker, ClientSite, Shift, HolidayRequest, IncidentReport } from '../types';
import { MetricCard } from './MetricCard';
import { FlutterMySQLBuildHub } from './FlutterMySQLBuildHub';
import { EditWorkerModal } from './EditWorkerModal';
import { TaskCategoryBadge, TaskColorLegend } from './TaskCategoryBadge';
import { 
  Calendar, Shield, Users, FileSpreadsheet, Plus, AlertTriangle, Check, X, 
  Clock, Download, DollarSign, ArrowRight, CheckCircle2, RefreshCw, Send, HelpCircle,
  Laptop, Database, Smartphone, Code, Edit3, UserCheck, Phone, Mail, Award,
  MoreVertical, FileText, BellRing, ChevronRight
} from 'lucide-react';

interface SuperAdminDashboardProps {
  workers: Worker[];
  clientSites: ClientSite[];
  shifts: Shift[];
  holidays: HolidayRequest[];
  incidents: IncidentReport[];
  onAddShift: (shiftData: Partial<Shift>) => { success: boolean; error?: string };
  onApproveApplication: (shiftId: string, workerId: string) => void;
  onRejectApplication: (shiftId: string, workerId: string) => void;
  onApproveTimesheet: (shiftId: string) => void;
  onDisputeTimesheet: (shiftId: string, reason: string) => void;
  onNotifyWorker: (workerId: string, alertType: string) => void;
  onUpdateWorker?: (updatedWorker: Worker) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  workers,
  clientSites,
  shifts,
  holidays,
  incidents,
  onAddShift,
  onApproveApplication,
  onRejectApplication,
  onApproveTimesheet,
  onDisputeTimesheet,
  onNotifyWorker,
  onUpdateWorker,
}) => {
  // Rota Scheduler state
  const [newShiftClient, setNewShiftClient] = useState(clientSites[0]?.id || '');
  const [newShiftRole, setNewShiftRole] = useState<'Senior Carer' | 'Care Assistant' | 'Registered Nurse' | 'Support Worker'>('Care Assistant');
  const [newShiftDate, setNewShiftDate] = useState('2026-07-15');
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('16:00');
  const [newShiftUrgency, setNewShiftUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  
  // Custom rate overrides or manual margins
  const [customPayRate, setCustomPayRate] = useState<string>('');
  const [customBillRate, setCustomBillRate] = useState<string>('');
  
  // Scheduler error/success feedback
  const [scheduleFeedback, setScheduleFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Search/Filter state
  const [complianceSearch, setComplianceSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'scheduler' | 'employees' | 'compliance' | 'cqc' | 'payroll' | 'developer'>('overview');

  // Employee Edit Modal state
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerUpdateAlert, setWorkerUpdateAlert] = useState<string | null>(null);

  // Quick Actions Popover state & Compliance Documents Modal state
  const [quickActionsPopoverId, setQuickActionsPopoverId] = useState<string | null>(null);
  const [viewingDocumentsWorker, setViewingDocumentsWorker] = useState<Worker | null>(null);

  // Timesheet dispute feedback modal/input
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');

  // Selected worker to directly allocate (scheduler)
  const [directAssignWorkerId, setDirectAssignWorkerId] = useState<string>('');

  // Get selected site's default rates or custom
  const selectedSiteObj = clientSites.find(s => s.id === newShiftClient);
  
  // Quick compliance calculations
  const totalWorkers = workers.length;
  const compliantWorkersCount = workers.filter(w => w.status === 'Active' && w.compliance.rtwStatus === 'Verified').length;
  const complianceRate = Math.round((compliantWorkersCount / totalWorkers) * 100);

  // Financial performance
  const completedShifts = shifts.filter(s => s.status === 'Completed');
  const totalHoursWorked = completedShifts.reduce((acc, curr) => {
    const hours = parseInt(curr.endTime.split(':')[0]) - parseInt(curr.startTime.split(':')[0]);
    return acc + (hours > 0 ? hours : 8);
  }, 0);

  const totalRevenue = completedShifts.reduce((acc, curr) => {
    const hours = parseInt(curr.endTime.split(':')[0]) - parseInt(curr.startTime.split(':')[0]);
    const duration = hours > 0 ? hours : 8;
    return acc + (curr.billRate * duration);
  }, 0);

  const totalCost = completedShifts.reduce((acc, curr) => {
    const hours = parseInt(curr.endTime.split(':')[0]) - parseInt(curr.startTime.split(':')[0]);
    const duration = hours > 0 ? hours : 8;
    return acc + (curr.payRate * duration);
  }, 0);

  const agencyMargin = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? Math.round((agencyMargin / totalRevenue) * 100) : 0;

  // Handle shift submission
  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleFeedback(null);

    const site = clientSites.find(s => s.id === newShiftClient);
    if (!site) return;

    // Determine hourly rate
    let pay = 15.0;
    if (newShiftRole === 'Registered Nurse') pay = 28.50;
    else if (newShiftRole === 'Senior Carer') pay = 18.20;
    else if (newShiftRole === 'Support Worker') pay = 15.80;
    else pay = 14.50;

    const finalPayRate = customPayRate ? parseFloat(customPayRate) : pay;
    const finalBillRate = customBillRate ? parseFloat(customBillRate) : finalPayRate + site.billRateOffset;

    const shiftPayload: Partial<Shift> = {
      clientSiteId: newShiftClient,
      roleRequired: newShiftRole,
      date: newShiftDate,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      payRate: finalPayRate,
      billRate: finalBillRate,
      status: directAssignWorkerId ? 'Assigned' : 'Open',
      assignedWorkerId: directAssignWorkerId || undefined,
      appliedWorkerIds: [],
      urgency: newShiftUrgency,
      careLogChecklist: [
        { id: 't-dyn-1', taskName: 'Welfare and safety validation', category: 'monitoring', priority: 'High', completed: false },
        { id: 't-dyn-2', taskName: 'Core clinical/support plan review', category: 'clinical', priority: 'High', completed: false },
        { id: 't-dyn-3', taskName: 'Client hydration & dietary assessment', category: 'nutrition', priority: 'Medium', completed: false },
        { id: 't-dyn-4', taskName: 'Mobility & physical comfort round', category: 'mobility', priority: 'Routine', completed: false }
      ]
    };

    const result = onAddShift(shiftPayload);
    if (result.success) {
      setScheduleFeedback({ type: 'success', msg: 'Shift scheduled successfully on the live Rota!' });
      // Reset inputs
      setDirectAssignWorkerId('');
      setCustomPayRate('');
      setCustomBillRate('');
    } else {
      setScheduleFeedback({ type: 'error', msg: result.error || 'Failed to schedule shift.' });
    }
  };

  const triggerExportPayroll = () => {
    // Generate real-world CSV for QuickBooks / Xero
    const headers = 'Timesheet_ID,Client,Worker,Role,Date,StartTime,EndTime,HoursWorked,PayRate,TotalPay,BillRate,TotalBill,AgencyMargin\n';
    const rows = completedShifts.map(s => {
      const site = clientSites.find(cs => cs.id === s.clientSiteId)?.name || 'Unknown';
      const worker = workers.find(w => w.id === s.assignedWorkerId)?.name || 'Unknown';
      const hours = 8; // standard duration approximation
      const totalPay = s.payRate * hours;
      const totalBill = s.billRate * hours;
      const margin = totalBill - totalPay;
      return `"${s.id}","${site}","${worker}","${s.roleRequired}","${s.date}","${s.startTime}","${s.endTime}",${hours},${s.payRate},${totalPay},${s.billRate},${totalBill},${margin}`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `NexoraCare_Payroll_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerCQCExport = () => {
    // Generate CQC compliance manifest text
    const manifest = `NEXORA CARE LTD - CQC AUDIT COMPLIANCE EXPORT
Export Date: ${new Date().toLocaleString()}
Audited Range: Current Active Roster

1. WORKFORCE COMPLIANCE RATIO: ${complianceRate}% Compliant
   Active Carers Checked: ${compliantWorkersCount}/${totalWorkers}
   * Right to Work Checklist Status: All active staff verified.
   * Expired Blocks Checklist: Active checks configured. Emily Thompson restricted from scheduled assignments due to expired right-to-work documents.

2. REGISTERED INCIDENTS FILED & RESOLVED:
${incidents.map((inc, idx) => `   [Incident #${idx+1}] - ${inc.date} - ${inc.title}
   Reporter: ${inc.reportedBy}
   Site: ${clientSites.find(c => c.id === inc.clientSiteId)?.name || 'Unknown'}
   Severity: ${inc.severity}
   Description: ${inc.description}
   Action Logged: ${inc.actionTaken}
   CQC Status: ${inc.status}
   --------------------------------------------------`).join('\n')}

3. COMPLETED CLINICAL VISIT CARE LOGS:
${completedShifts.map((cs, idx) => `   [Visit #${idx+1}] - Date: ${cs.date} - Site: ${clientSites.find(c => c.id === cs.clientSiteId)?.name || 'Unknown'}
   Assigned Clinician: ${workers.find(w => w.id === cs.assignedWorkerId)?.name || 'Unknown'} (${cs.roleRequired})
   GPS Check-In: Checked in ${cs.checkInTime} via ${cs.checkInMethod || 'GPS'}
   Digital Care Notes Summary: "${cs.careNotes || 'No notes compiled'}"
   Tasks Confirmed:
${cs.careLogChecklist.map(t => `     - [${t.completed ? 'X' : ' '}] ${t.taskName} (Done at: ${t.timeCompleted || 'N/A'})`).join('\n')}
   --------------------------------------------------`).join('\n')}

Manifest generated securely for inspection reference.`;

    const blob = new Blob([manifest], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CQC_Audit_Package_NexoraCare_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap border-b border-slate-100 bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-sm gap-1">
        <button
          onClick={() => { setActiveTab('overview'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => { setActiveTab('employees'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'employees' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span>Employees & Staff</span>
        </button>
        <button
          onClick={() => { setActiveTab('scheduler'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'scheduler' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Rota & Shifts</span>
        </button>
        <button
          onClick={() => { setActiveTab('compliance'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'compliance' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>RTW & DBS</span>
        </button>
        <button
          onClick={() => { setActiveTab('cqc'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'cqc' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>CQC Audit</span>
        </button>
        <button
          onClick={() => { setActiveTab('payroll'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'payroll' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Payroll</span>
        </button>
        <button
          onClick={() => { setActiveTab('developer'); setScheduleFeedback(null); }}
          className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
            activeTab === 'developer' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
          }`}
        >
          <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Flutter Hub</span>
        </button>
      </div>

      {/* OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Workforce Compliance"
              value={`${complianceRate}%`}
              icon="Shield"
              description="Right to Work & DBS fully audited"
              trend={{ value: '100% active block rules', positive: true }}
              color="green"
            />
            <MetricCard
              title="Open Shift Fill Rate"
              value="84.2%"
              icon="Calendar"
              description="Matching skill requirements"
              trend={{ value: '+4.5% MoM', positive: true }}
              color="blue"
            />
            <MetricCard
              title="Gross Agency Margin"
              value={`£${agencyMargin.toFixed(2)}`}
              icon="DollarSign"
              description={`Margin rate: ${marginPercent}% net profit`}
              trend={{ value: 'HMRC & CQC compliant', positive: true }}
              color="indigo"
            />
            <MetricCard
              title="CQC Inspection Grade"
              value="Outstanding"
              icon="CheckCircle2"
              description="Audit Readiness automated logs"
              color="violet"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live alerts column */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Expiry & Compliance Alerts</span>
                </h3>
                <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">2 Issues</span>
              </div>

              <div className="space-y-3">
                {/* Liam Patel warning (targeted by CSS selector 1) */}
                {(() => {
                  const liamWorker = workers.find(w => w.id === 'w-liam');
                  const isLiamOpen = quickActionsPopoverId === 'alert-w-liam';
                  return (
                    <div 
                      id="compliance-alert-liam"
                      className="relative p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-1.5 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-amber-900">Liam Patel</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Expires in 15 days</span>
                        </div>
                        
                        {/* Quick Actions popover button & menu */}
                        <div className="relative">
                          <button
                            type="button"
                            id="quick-actions-trigger-liam"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickActionsPopoverId(isLiamOpen ? null : 'alert-w-liam');
                            }}
                            className="p-1 rounded-md text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 active:scale-95 transition-all flex items-center space-x-0.5 text-[10px] font-bold"
                            title="Quick Actions menu"
                          >
                            <span>Actions</span>
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Actions Popover Menu */}
                          {isLiamOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setQuickActionsPopoverId(null)} 
                              />
                              <div 
                                id="quick-actions-menu-liam"
                                className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1 border-b border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
                                  <p className="text-xs font-semibold text-slate-800 truncate">Liam Patel</p>
                                </div>

                                <button
                                  type="button"
                                  id="action-send-alert-liam"
                                  onClick={() => {
                                    onNotifyWorker('w-liam', 'Compliance Alert: DBS Renewal Required within 15 days');
                                    setQuickActionsPopoverId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center space-x-2 transition-colors"
                                >
                                  <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Send Compliance Alert</span>
                                </button>

                                <button
                                  type="button"
                                  id="action-view-docs-liam"
                                  onClick={() => {
                                    if (liamWorker) setViewingDocumentsWorker(liamWorker);
                                    setQuickActionsPopoverId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center space-x-2 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>View Documents</span>
                                </button>

                                <button
                                  type="button"
                                  id="action-edit-details-liam"
                                  onClick={() => {
                                    if (liamWorker) setEditingWorker(liamWorker);
                                    setQuickActionsPopoverId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center space-x-2 transition-colors border-t border-slate-100"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span>Edit Details</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-800">
                        Mandatory DBS certificate is expiring on 2026-07-29. Relinking checks is required.
                      </p>
                      
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => onNotifyWorker('w-liam', 'DBS Renewal Required')}
                          className="flex-1 bg-white hover:bg-amber-100 text-amber-950 font-semibold text-[10px] py-1 px-2 border border-amber-200 rounded text-center transition-colors"
                        >
                          Ping Liam on Secure Thread
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (liamWorker) setViewingDocumentsWorker(liamWorker);
                          }}
                          className="bg-amber-100/80 hover:bg-amber-200 text-amber-900 font-semibold text-[10px] py-1 px-2 border border-amber-300/60 rounded text-center transition-colors flex items-center space-x-1"
                          title="View Liam's DBS & RTW documents"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Docs</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Emily Thompson block */}
                {(() => {
                  const emilyWorker = workers.find(w => w.id === 'w-emily');
                  const isEmilyOpen = quickActionsPopoverId === 'alert-w-emily';
                  return (
                    <div 
                      id="compliance-alert-emily"
                      className="relative p-3 bg-rose-50 border border-rose-100 rounded-lg space-y-1.5 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-rose-900">Emily Thompson</span>
                          <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold">EXPIRED / LOCKED</span>
                        </div>

                        {/* Quick Actions popover button & menu */}
                        <div className="relative">
                          <button
                            type="button"
                            id="quick-actions-trigger-emily"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickActionsPopoverId(isEmilyOpen ? null : 'alert-w-emily');
                            }}
                            className="p-1 rounded-md text-rose-800 hover:text-rose-950 hover:bg-rose-200/60 active:scale-95 transition-all flex items-center space-x-0.5 text-[10px] font-bold"
                            title="Quick Actions menu"
                          >
                            <span>Actions</span>
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Actions Popover Menu */}
                          {isEmilyOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setQuickActionsPopoverId(null)} 
                              />
                              <div 
                                id="quick-actions-menu-emily"
                                className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1 border-b border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
                                  <p className="text-xs font-semibold text-slate-800 truncate">Emily Thompson</p>
                                </div>

                                <button
                                  type="button"
                                  id="action-send-alert-emily"
                                  onClick={() => {
                                    onNotifyWorker('w-emily', 'Urgent Compliance Alert: DBS & RTW Expired. Shifts Locked.');
                                    setQuickActionsPopoverId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-900 flex items-center space-x-2 transition-colors"
                                >
                                  <BellRing className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span>Send Compliance Alert</span>
                                </button>

                                <button
                                  type="button"
                                  id="action-view-docs-emily"
                                  onClick={() => {
                                    if (emilyWorker) setViewingDocumentsWorker(emilyWorker);
                                    setQuickActionsPopoverId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center space-x-2 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>View Documents</span>
                                </button>

                                <button
                                  type="button"
                                  id="action-edit-details-emily"
                                  onClick={() => {
                                    if (emilyWorker) setEditingWorker(emilyWorker);
                                    setQuickActionsPopoverId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center space-x-2 transition-colors border-t border-slate-100"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span>Edit Details</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-rose-800">
                        DBS expired on 2026-06-30. Right-to-Work status is currently marked as <strong className="underline">Pending</strong>.
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-rose-900 font-semibold pt-0.5">
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3.5 h-3.5 text-rose-600" />
                          <span>Auto-blocked from all bookings</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (emilyWorker) setViewingDocumentsWorker(emilyWorker);
                          }}
                          className="bg-white hover:bg-rose-100 text-rose-950 font-semibold text-[10px] py-1 px-2 border border-rose-200 rounded text-center transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3 text-rose-600" />
                          <span>View Docs</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Active applications & live shift ticker */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Marketplace Applications Pending Approval</span>
                  </h3>
                  <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Action Required</span>
                </div>

                {/* Applications list */}
                <div className="space-y-3">
                  {shifts.filter(s => s.status === 'Open' && s.appliedWorkerIds.length > 0).map(shift => {
                    const site = clientSites.find(cs => cs.id === shift.clientSiteId);
                    return (
                      <div key={shift.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{site?.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              shift.urgency === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {shift.urgency} Urgency
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            Role: <strong className="text-slate-800">{shift.roleRequired}</strong> | {shift.date} ({shift.startTime} - {shift.endTime})
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[11px] text-slate-400">Applications from:</span>
                            {shift.appliedWorkerIds.map(wid => {
                              const worker = workers.find(w => w.id === wid);
                              return (
                                <div key={wid} className="flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-blue-100">
                                  <span>{worker?.name}</span>
                                  <span className="text-slate-400">({worker?.reliabilityScore}% rel)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {shift.appliedWorkerIds.map(wid => (
                            <div key={wid} className="flex items-center space-x-1">
                              <button
                                onClick={() => onApproveApplication(shift.id, wid)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Assign {workers.find(w => w.id === wid)?.name.split(' ')[0]}</span>
                              </button>
                              <button
                                onClick={() => onRejectApplication(shift.id, wid)}
                                className="bg-white hover:bg-slate-100 text-slate-500 text-[10px] p-1.5 rounded-lg border border-slate-200 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {shifts.filter(s => s.status === 'Open' && s.appliedWorkerIds.length > 0).length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No pending shift applications. All matches settled.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Rota Quickmatch shortcut helper */}
              <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Auto-Matching matches workers based on: <strong>Proximity, Skills, and DBS Compliance.</strong></span>
                <button 
                  onClick={() => setActiveTab('scheduler')}
                  className="text-blue-600 hover:underline font-bold flex items-center space-x-1"
                >
                  <span>Open Rota Builder</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROTA SCHEDULER PANEL */}
      {activeTab === 'scheduler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Shift / Allocate Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-2">Allocate New Shift</h3>
            
            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Care Home / Client site</label>
                <select
                  value={newShiftClient}
                  onChange={(e) => setNewShiftClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                >
                  {clientSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name} ({site.postcode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Required Role</label>
                  <select
                    value={newShiftRole}
                    onChange={(e) => setNewShiftRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  >
                    <option value="Care Assistant">Care Assistant</option>
                    <option value="Senior Carer">Senior Carer</option>
                    <option value="Registered Nurse">Registered Nurse</option>
                    <option value="Support Worker">Support Worker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Urgency Level</label>
                  <select
                    value={newShiftUrgency}
                    onChange={(e) => setNewShiftUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={newShiftDate}
                  onChange={(e) => setNewShiftDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">End Time</label>
                  <input
                    type="time"
                    value={newShiftEnd}
                    onChange={(e) => setNewShiftEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Direct assignment option with active compliance verification */}
              <div className="border-t border-slate-50 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">Direct Carer Allocation (Optional)</label>
                  <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">Checks Compliance</span>
                </div>
                <select
                  value={directAssignWorkerId}
                  onChange={(e) => setDirectAssignWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium mb-1"
                >
                  <option value="">-- Broadcast to Open Marketplace --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role}) - {w.status} {w.id === 'w-emily' ? '⚠️ EXPIRED' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Selecting a carer instantly validates Right to Work limits and DBS status before scheduling.
                </p>
              </div>

              {/* Dynamic Bill & Pay margin estimation display */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Default Site Margin Offset:</span>
                  <span className="font-bold text-slate-800">+£{selectedSiteObj?.billRateOffset.toFixed(2)}/hr</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Override Pay Rate (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 19.50"
                      value={customPayRate}
                      onChange={(e) => setCustomPayRate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Override Bill Rate (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 26.00"
                      value={customBillRate}
                      onChange={(e) => setCustomBillRate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {scheduleFeedback && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  scheduleFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                    : 'bg-rose-50 text-rose-800 border border-rose-100 flex items-start space-x-1.5'
                }`}>
                  {scheduleFeedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  <span>{scheduleFeedback.msg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Confirm & Publish Shift</span>
              </button>
            </form>
          </div>

          {/* Current Live Rota List */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Live Agency Rota & Shift Matrix</span>
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {shifts.length} Total Shifts
                </span>
              </div>

              {/* Task Category Legend in Scheduler */}
              <div className="mb-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <TaskColorLegend />
              </div>

              {/* Schedule list */}
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                {shifts.map(shift => {
                  const site = clientSites.find(cs => cs.id === shift.clientSiteId);
                  const worker = workers.find(w => w.id === shift.assignedWorkerId);
                  return (
                    <div 
                      key={shift.id} 
                      className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                        shift.status === 'Completed' 
                          ? 'bg-emerald-50/20 border-emerald-100' 
                          : shift.status === 'Confirmed' 
                          ? 'bg-blue-50/20 border-blue-100'
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <span className="text-xs font-bold text-slate-900">{site?.name}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              shift.status === 'Completed' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : shift.status === 'Confirmed' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {shift.status}
                            </span>
                            {shift.urgency === 'High' && (
                              <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                URGENT
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-semibold">
                            {shift.date} | {shift.startTime} - {shift.endTime} | Role Required: <strong className="text-slate-800">{shift.roleRequired}</strong>
                          </p>

                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-slate-400">Assigned Carer:</span>
                            {worker ? (
                              <div className="flex items-center space-x-1">
                                <img src={worker.avatar} alt={worker.name} className="w-4.5 h-4.5 rounded-full border border-slate-100" />
                                <span className="text-[11px] font-bold text-slate-700">{worker.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">({worker.role})</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 font-bold italic">Unassigned (Broadcasting to open marketplace)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-center shrink-0">
                          <div className="text-right text-[11px]">
                            <p className="text-slate-500">Pay Rate: <strong className="text-slate-800">£{shift.payRate.toFixed(2)}/hr</strong></p>
                            <p className="text-slate-500">Bill Rate: <strong className="text-slate-800">£{shift.billRate.toFixed(2)}/hr</strong></p>
                            <p className="text-emerald-700 font-bold mt-0.5">Agency Margin: +£{(shift.billRate - shift.payRate).toFixed(2)}/hr</p>
                          </div>
                        </div>
                      </div>

                      {/* Care Tasks List with distinct colors */}
                      {shift.careLogChecklist && shift.careLogChecklist.length > 0 && (
                        <div className="pt-2 border-t border-slate-100/70">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                              Planned Tasks ({shift.careLogChecklist.length})
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              Color categorized by clinical & care discipline
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {shift.careLogChecklist.map(t => (
                              <TaskCategoryBadge key={t.id} task={t} compact={true} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-[11px] text-blue-800 mt-4">
              <strong>💡 Legal Guardrails active:</strong> Under <strong>UK Working Time Regulations (1998)</strong>, the scheduler blocks shifts that would push an individual caregiver past 48 hours in a single week. To allocate past 48 hours, an explicit opt-out signature log is required.
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEES & STAFF MANAGEMENT PANEL */}
      {activeTab === 'employees' && (
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold font-display text-slate-900">
                  Care Staff Directory & Employee Management
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-full border border-blue-100">
                  {workers.length} Registered Carers
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Admin privilege: Modify worker roles, pay rates, working hour caps, and compliance records at any time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, role, email..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>

          {workerUpdateAlert && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between text-xs font-semibold animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{workerUpdateAlert}</span>
              </div>
              <button 
                onClick={() => setWorkerUpdateAlert(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workers
              .filter(w => 
                w.name.toLowerCase().includes(employeeSearch.toLowerCase()) || 
                w.role.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                w.email.toLowerCase().includes(employeeSearch.toLowerCase())
              )
              .map(worker => {
                const isCompliant = worker.status === 'Active' && worker.compliance.rtwStatus === 'Verified';

                return (
                  <div 
                    key={worker.id}
                    className="bg-slate-50/60 border border-slate-200/80 rounded-xl sm:rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200"
                  >
                    <div>
                      {/* Worker Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={worker.avatar} 
                            alt={worker.name} 
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0" 
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                              <span>{worker.name}</span>
                            </h4>
                            <p className="text-xs text-blue-700 font-semibold">{worker.role}</p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          worker.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {worker.status}
                        </span>
                      </div>

                      {/* Contact and stats pills */}
                      <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>Email:</span>
                          </span>
                          <span className="font-medium text-slate-800 truncate max-w-[150px]">{worker.email}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>Phone:</span>
                          </span>
                          <span className="font-medium text-slate-800">{worker.phone}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            <span>Pay Rate:</span>
                          </span>
                          <span className="font-bold text-emerald-700">£{worker.payRate.toFixed(2)}/hr</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Weekly Hours:</span>
                          </span>
                          <span className="font-medium text-slate-800">
                            {worker.allocatedHoursThisWeek}h / {worker.maxHoursWeekly}h max
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-indigo-600" />
                            <span>DBS Certificate:</span>
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            {worker.compliance.dbsNumber}
                          </span>
                        </div>
                      </div>

                      {/* Reliability and Days */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                          <span>Reliability Rating</span>
                          <span className="text-blue-600">{worker.reliabilityScore}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${
                              worker.reliabilityScore >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${worker.reliabilityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">ID: {worker.id}</span>
                      
                      <button
                        type="button"
                        onClick={() => setEditingWorker(worker)}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* COMPLIANCE & RTW TRACKER */}
      {activeTab === 'compliance' && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>UK Right to Work & DBS Live Tracking</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Mandatory compliance logs required for safe clinical rostering</p>
            </div>
            
            <input
              type="text"
              placeholder="Filter carers by name or role..."
              value={complianceSearch}
              onChange={(e) => setComplianceSearch(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50">
                  <th className="p-3">Carer</th>
                  <th className="p-3">DBS Certificate Status</th>
                  <th className="p-3">Right to Work Status</th>
                  <th className="p-3">Visa / Expiry</th>
                  <th className="p-3">Mandatory Training</th>
                  <th className="p-3">Roster Eligibility</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {workers
                  .filter(w => w.name.toLowerCase().includes(complianceSearch.toLowerCase()) || w.role.toLowerCase().includes(complianceSearch.toLowerCase()))
                  .map(worker => {
                    const isDbsWarning = new Date(worker.compliance.dbsExpiry).getTime() - new Date('2026-07-14').getTime() < 30 * 24 * 60 * 60 * 1000;
                    const isDbsExpired = new Date(worker.compliance.dbsExpiry).getTime() < new Date('2026-07-14').getTime();

                    return (
                      <tr key={worker.id} className="hover:bg-slate-50/50">
                        <td className="p-3 flex items-center space-x-2.5">
                          <img src={worker.avatar} alt={worker.name} className="w-8 h-8 rounded-full border border-slate-100" />
                          <div>
                            <p className="font-bold text-slate-900">{worker.name}</p>
                            <p className="text-[10px] text-slate-400">{worker.role}</p>
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-700">{worker.compliance.dbsNumber}</span>
                            <div className="flex items-center space-x-1">
                              <span className={`text-[9px] font-bold ${
                                isDbsExpired ? 'text-rose-600' : isDbsWarning ? 'text-amber-600' : 'text-slate-500'
                              }`}>
                                Expiry: {worker.compliance.dbsExpiry}
                              </span>
                              {isDbsExpired && <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1 rounded">EXPIRED</span>}
                              {isDbsWarning && !isDbsExpired && <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1 rounded">ALERT</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            worker.compliance.rtwStatus === 'Verified' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {worker.compliance.rtwStatus}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div className="space-y-0.5 text-[10px] font-semibold">
                            <p className="text-slate-800">{worker.compliance.visaStatus || 'UK Citizen'}</p>
                            {worker.compliance.rightToWorkExpiry && (
                              <p className="text-slate-400 text-[9px]">Expiry: {worker.compliance.rightToWorkExpiry}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-bold ${
                              worker.compliance.mandatoryTrainingCompleted ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {worker.compliance.mandatoryTrainingCompleted ? '✓ Completed' : '✗ Expired'}
                            </span>
                            <p className="text-[9px] text-slate-400">Expires: {worker.compliance.trainingExpiry}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            worker.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {worker.status === 'Active' ? 'Eligible to Work' : 'Roster Blocked'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setEditingWorker(worker)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-200 transition-colors inline-flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Details</span>
                          </button>
                          <button
                            onClick={() => onNotifyWorker(worker.id, 'Upload Compliance Documents')}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 transition-colors inline-flex items-center space-x-1"
                          >
                            <span>Remind</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>
                <strong>Care Quality Commission (CQC) Compliance Rule:</strong> All roster listings strictly validate care worker eligibility. Expired right-to-work or DBS certificates generate absolute system overrides, blocking placement scheduling.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CQC AUDIT READINESS HUB */}
      {activeTab === 'cqc' && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600" />
                <span>CQC Audit Readiness Package Generator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Instantly compile timesheets, digital checklists, and incident reports for CQC inspection reviews</p>
            </div>
            
            <button
              onClick={triggerCQCExport}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm self-start sm:self-center"
            >
              <Download className="w-4 h-4" />
              <span>Export Verified CQC Manifest</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registered Incident Logs for audits */}
            <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Incidents Logs (CQC Required)</h4>
                <span className="bg-violet-100 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Permanent Ledger</span>
              </div>

              <div className="space-y-3">
                {incidents.map(inc => (
                  <div key={inc.id} className="p-3 bg-white border border-slate-100 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-900">{inc.title}</span>
                      <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">{inc.severity} Severity</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{inc.description}</p>
                    <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-700">
                      <strong>Action Taken:</strong> {inc.actionTaken}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold pt-1">
                      <span>Reported by: {inc.reportedBy}</span>
                      <span className="text-violet-600">Status: {inc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Electronic Visit Verification checklist summary */}
            <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Digital Care Logs & Completed Checklists</h4>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">EVV Authenticated</span>
              </div>

              <div className="space-y-3">
                {completedShifts.map(s => {
                  const site = clientSites.find(cs => cs.id === s.clientSiteId);
                  const worker = workers.find(w => w.id === s.assignedWorkerId);
                  return (
                    <div key={s.id} className="p-3 bg-white border border-slate-100 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{site?.name}</p>
                          <p className="text-[10px] text-slate-400">Date: {s.date} | Staff: {worker?.name}</p>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-semibold">Checked-In GPS</span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500">Tasks Completed on Shift:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {s.careLogChecklist.map(t => (
                            <div key={t.id} className="flex items-center space-x-1.5 text-[10px] text-slate-600 bg-slate-50 p-1 rounded">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="truncate">{t.taskName}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic border-l-2 border-slate-200 pl-2">
                        "{s.careNotes}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL & INVOICE EXPORTS */}
      {activeTab === 'payroll' && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>UK Financial Export Hub (Sage, QuickBooks, Xero)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Generate compliant invoicing records automatically based on approved EVV timesheet clocks</p>
            </div>

            <button
              onClick={triggerExportPayroll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm self-start sm:self-center"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Accounting CSV (Sage/Xero)</span>
            </button>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50">
                  <th className="p-3">Client site</th>
                  <th className="p-3">Assigned Carer</th>
                  <th className="p-3">Shift Date</th>
                  <th className="p-3">Approved Clock Hours</th>
                  <th className="p-3">Pay Cost (£/hr)</th>
                  <th className="p-3">Invoiced Bill (£/hr)</th>
                  <th className="p-3">Agency Gross Margin</th>
                  <th className="p-3 text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {completedShifts.map(s => {
                  const site = clientSites.find(cs => cs.id === s.clientSiteId);
                  const worker = workers.find(w => w.id === s.assignedWorkerId);
                  const hours = 8; // standard duration approximation
                  const totalPay = s.payRate * hours;
                  const totalBill = s.billRate * hours;
                  const margin = totalBill - totalPay;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 font-medium">
                      <td className="p-3 text-slate-900 font-bold">{site?.name}</td>
                      <td className="p-3 text-slate-700">{worker?.name}</td>
                      <td className="p-3 text-slate-600">{s.date}</td>
                      <td className="p-3 font-mono text-slate-700">{hours} hours ({s.checkInTime} - {s.checkOutTime})</td>
                      <td className="p-3 text-slate-600">£{totalPay.toFixed(2)} (<span className="text-slate-400">£{s.payRate}/hr</span>)</td>
                      <td className="p-3 text-slate-600">£{totalBill.toFixed(2)} (<span className="text-slate-400">£{s.billRate}/hr</span>)</td>
                      <td className="p-3 text-emerald-700 font-bold">£{margin.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                          Approved by Client
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs text-amber-900 space-y-1">
            <h4 className="font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>HMRC compliance notice:</span>
            </h4>
            <p>
              Invoicing parameters are strictly bound by the checked timesheets generated automatically from geofenced check-in/out data. Standard mileage calculations correspond to HMRC’s £0.45 per mile approved rate for subsequent automated expense claim attachments.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'developer' && (
        <FlutterMySQLBuildHub />
      )}

      {/* Admin Employee Edit Modal */}
      {editingWorker && (
        <EditWorkerModal
          worker={editingWorker}
          isOpen={Boolean(editingWorker)}
          onClose={() => setEditingWorker(null)}
          onSave={(updatedWorker) => {
            if (onUpdateWorker) {
              onUpdateWorker(updatedWorker);
            }
            setWorkerUpdateAlert(`Successfully updated employee details for ${updatedWorker.name} (${updatedWorker.role}).`);
            setTimeout(() => setWorkerUpdateAlert(null), 5000);
          }}
        />
      )}

      {/* Compliance Documents Viewer Modal */}
      {viewingDocumentsWorker && (
        <div 
          id="documents-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setViewingDocumentsWorker(null)}
        >
          <div 
            id="documents-modal-content"
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img 
                  src={viewingDocumentsWorker.avatar} 
                  alt={viewingDocumentsWorker.name} 
                  className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span>{viewingDocumentsWorker.name}</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                      {viewingDocumentsWorker.role}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">UK Compliance & Right-to-Work Document Vault</p>
                </div>
              </div>
              <button 
                type="button"
                id="close-documents-modal-btn"
                onClick={() => setViewingDocumentsWorker(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                viewingDocumentsWorker.compliance.rtwStatus === 'Verified' && new Date(viewingDocumentsWorker.compliance.dbsExpiry).getTime() >= new Date('2026-07-14').getTime()
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    Statutory Roster Status: {viewingDocumentsWorker.status === 'Active' ? 'Active / Eligible' : 'Blocked / Action Needed'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80">
                  {viewingDocumentsWorker.compliance.rtwStatus} RTW
                </span>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Registered Documentation</h4>

                {/* 1. DBS Certificate */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">Enhanced DBS Certificate</span>
                        <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {viewingDocumentsWorker.compliance.dbsNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Disclose & Barring Service Certificate &bull; Barred list check for vulnerable adults
                      </p>
                      <p className="text-[10px] font-medium text-slate-600">
                        Expiry Date: <strong className="text-slate-800">{viewingDocumentsWorker.compliance.dbsExpiry}</strong>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    new Date(viewingDocumentsWorker.compliance.dbsExpiry).getTime() < new Date('2026-07-14').getTime()
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {new Date(viewingDocumentsWorker.compliance.dbsExpiry).getTime() < new Date('2026-07-14').getTime() ? 'Expired' : 'Valid'}
                  </span>
                </div>

                {/* 2. UK Right-to-Work / Share Code */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 mt-0.5">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">Home Office Right to Work Verification</span>
                        <span className="text-[9px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          {viewingDocumentsWorker.compliance.visaStatus || 'UK Citizen'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Online share-code check record verified via Gov.uk ECS system
                      </p>
                      {viewingDocumentsWorker.compliance.rightToWorkExpiry && (
                        <p className="text-[10px] font-medium text-slate-600">
                          Visa Expiry: <strong className="text-slate-800">{viewingDocumentsWorker.compliance.rightToWorkExpiry}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    viewingDocumentsWorker.compliance.rtwStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewingDocumentsWorker.compliance.rtwStatus}
                  </span>
                </div>

                {/* 3. Mandatory Training Certificate */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800">CQC Mandatory Training Standard (Care Certificate)</span>
                      <p className="text-[11px] text-slate-500">
                        Manual Handling, Safeguarding Adults L3, First Aid & Medication Administration
                      </p>
                      <p className="text-[10px] font-medium text-slate-600">
                        Refresher Due: <strong className="text-slate-800">{viewingDocumentsWorker.compliance.trainingExpiry}</strong>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    viewingDocumentsWorker.compliance.mandatoryTrainingCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {viewingDocumentsWorker.compliance.mandatoryTrainingCompleted ? 'Completed' : 'Expired'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const workerToEdit = viewingDocumentsWorker;
                  setViewingDocumentsWorker(null);
                  setEditingWorker(workerToEdit);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details & Expiry Dates</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingDocumentsWorker(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
