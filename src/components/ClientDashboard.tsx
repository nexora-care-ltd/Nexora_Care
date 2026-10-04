import React, { useState } from 'react';
import { Worker, ClientSite, Shift, IncidentReport } from '../types';
import { 
  Users, Calendar, Clock, Plus, Shield, Check, AlertTriangle, FileText, Send 
} from 'lucide-react';
import { TaskCategoryBadge, TaskColorLegend } from './TaskCategoryBadge';

interface ClientDashboardProps {
  currentClientSiteId: string;
  workers: Worker[];
  clientSites: ClientSite[];
  shifts: Shift[];
  incidents: IncidentReport[];
  onAddShift: (shiftData: Partial<Shift>) => { success: boolean; error?: string };
  onApproveTimesheet: (shiftId: string) => void;
  onDisputeTimesheet: (shiftId: string, reason: string) => void;
  onReportIncident: (incidentData: Partial<IncidentReport>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentClientSiteId,
  workers,
  clientSites,
  shifts,
  incidents,
  onAddShift,
  onApproveTimesheet,
  onDisputeTimesheet,
  onReportIncident,
}) => {
  const currentSiteObj = clientSites.find(site => site.id === currentClientSiteId);

  // Self-service shift post state
  const [roleRequired, setRoleRequired] = useState<'Senior Carer' | 'Care Assistant' | 'Registered Nurse' | 'Support Worker'>('Care Assistant');
  const [shiftDate, setShiftDate] = useState('2026-07-16');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [postFeedback, setPostFeedback] = useState<string | null>(null);

  // Incident form state
  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incAction, setIncAction] = useState('');
  const [incSeverity, setIncSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [incFeedback, setIncFeedback] = useState<string | null>(null);

  // Dispute timesheet text fields
  const [activeDisputeShiftId, setActiveDisputeShiftId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Calculations for current client site
  const siteShifts = shifts.filter(s => s.clientSiteId === currentClientSiteId);
  const liveWorkersOnShift = siteShifts.filter(s => s.status === 'Confirmed' && s.checkInTime && !s.checkOutTime);
  
  const awaitingApprovalTimesheets = siteShifts.filter(s => s.status === 'Completed' && !s.timesheetApproved && !s.timesheetDisputed);
  const completedHistory = siteShifts.filter(s => s.status === 'Completed' && s.timesheetApproved);

  const handlePostShift = (e: React.FormEvent) => {
    e.preventDefault();
    setPostFeedback(null);

    let pay = 15.0;
    if (roleRequired === 'Registered Nurse') pay = 28.50;
    else if (roleRequired === 'Senior Carer') pay = 18.20;
    else if (roleRequired === 'Support Worker') pay = 15.80;

    const result = onAddShift({
      clientSiteId: currentClientSiteId,
      roleRequired,
      date: shiftDate,
      startTime,
      endTime,
      payRate: pay,
      billRate: pay + (currentSiteObj?.billRateOffset || 6.0),
      status: 'Open',
      urgency,
      careLogChecklist: [
        { id: 't-cl-1', taskName: 'Assigned clinical observations', category: 'clinical', priority: 'High', completed: false },
        { id: 't-cl-2', taskName: 'Supervise resident dietary plan', category: 'nutrition', priority: 'Medium', completed: false },
        { id: 't-cl-3', taskName: 'Mobility support and transfer care', category: 'mobility', priority: 'Medium', completed: false }
      ]
    });

    if (result.success) {
      setPostFeedback('Your request has been broadcasted to the Nexora Care workforce marketplace!');
    } else {
      setPostFeedback(`Failed to submit request: ${result.error}`);
    }
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle || !incDesc) return;

    onReportIncident({
      clientSiteId: currentClientSiteId,
      workerId: liveWorkersOnShift[0]?.assignedWorkerId || 'w-sarah',
      title: incTitle,
      description: incDesc,
      actionTaken: incAction,
      severity: incSeverity,
      reportedBy: `${currentSiteObj?.contactName} (Care Home Manager)`
    });

    setIncTitle('');
    setIncDesc('');
    setIncAction('');
    setIncFeedback('Incident report logged securely for statutory CQC ledger inspection. Recruiter flagged.');
  };

  return (
    <div className="space-y-6">
      {/* Client Site Summary Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider">Client Portal</span>
            <span className="text-slate-400 text-xs font-semibold">Home Registry: {currentSiteObj?.postcode}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">{currentSiteObj?.name}</h2>
          <p className="text-xs text-slate-300 font-medium">{currentSiteObj?.address} | Manager: {currentSiteObj?.contactName}</p>
        </div>
        
        <div className="flex items-center space-x-4 shrink-0 text-xs">
          <div className="bg-white/10 p-3 rounded-lg border border-white/5">
            <p className="text-slate-400 font-medium">Standard Compliance</p>
            <p className="text-base font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
              <Shield className="w-4 h-4" />
              <span>{currentSiteObj?.minComplianceLevel} Required</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live on shift right now */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Who's Currently on Shift (Live Attendance Board)</span>
              </h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-100">
                {liveWorkersOnShift.length} Checked In
              </span>
            </div>

            <div className="space-y-3">
              {liveWorkersOnShift.map(shift => {
                const worker = workers.find(w => w.id === shift.assignedWorkerId);
                return (
                  <div key={shift.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img src={worker?.avatar} alt={worker?.name} className="w-10 h-10 rounded-full border border-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{worker?.name}</p>
                        <p className="text-xs text-slate-500 font-semibold">{worker?.role}</p>
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">GPS Checked In: {shift.checkInTime} today</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm w-full md:w-auto text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-700">Digital Care Plan Tasks:</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                          {shift.careLogChecklist.filter(t => t.completed).length}/{shift.careLogChecklist.length} done
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {shift.careLogChecklist.map(task => (
                          <div key={task.id} className="flex items-center justify-between gap-1.5 p-1 bg-white rounded border border-slate-100 text-[10px]">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <span className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold text-white ${
                                task.completed ? 'bg-emerald-500' : 'bg-slate-200 text-slate-400'
                              }`}>
                                {task.completed ? '✓' : '•'}
                              </span>
                              <span className={`truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                                {task.taskName}
                              </span>
                            </div>
                            <TaskCategoryBadge task={task} compact={true} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {liveWorkersOnShift.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No caregivers are checked in at your site right now. Upcoming roster items will sync upon GPS EVV entry.
                </div>
              )}
            </div>
          </div>

          {/* Timesheet Approval list */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Timesheets Awaiting Manager Sign-Off</span>
              </h3>
              <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {awaitingApprovalTimesheets.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {awaitingApprovalTimesheets.map(shift => {
                const worker = workers.find(w => w.id === shift.assignedWorkerId);
                const hours = 8; // standard duration approximation
                const totalBill = shift.billRate * hours;

                return (
                  <div key={shift.id} className="p-4 border border-slate-100 rounded-xl bg-white space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{worker?.name} ({worker?.role})</p>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Shift: {shift.date} | Hours Checked: <strong className="text-slate-800 font-bold">{shift.checkInTime} - {shift.checkOutTime} ({hours} hrs)</strong>
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-bold text-slate-900">Est. Billing: £{totalBill.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">Rate: £{shift.billRate.toFixed(2)}/hr</p>
                      </div>
                    </div>

                    {shift.careNotes && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-600 italic">
                        <strong>Daily Hand-off Notes compiled by carer:</strong> "{shift.careNotes}"
                      </div>
                    )}

                    {/* Signed Task Checklist with visual color categorization */}
                    {shift.careLogChecklist && shift.careLogChecklist.length > 0 && (
                      <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            Signed Digital Checklist ({shift.careLogChecklist.filter(t => t.completed).length}/{shift.careLogChecklist.length})
                          </span>
                          <span className="text-[9px] text-slate-400">Color-categorized disciplines</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {shift.careLogChecklist.map(task => (
                            <div key={task.id} className="flex items-center justify-between gap-1 p-1.5 bg-white rounded border border-slate-100 text-[10px]">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold text-white ${
                                  task.completed ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}>
                                  {task.completed ? '✓' : '•'}
                                </span>
                                <span className={`truncate ${task.completed ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                                  {task.taskName}
                                </span>
                              </div>
                              <TaskCategoryBadge task={task} compact={true} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onApproveTimesheet(shift.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Hours & Pay</span>
                      </button>
                      <button
                        onClick={() => setActiveDisputeShiftId(shift.id)}
                        className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        Flag / Dispute Hours
                      </button>
                    </div>

                    {activeDisputeShiftId === shift.id && (
                      <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg space-y-2">
                        <label className="block text-[10px] font-bold text-rose-900">Reason for Dispute / Audit Check:</label>
                        <textarea
                          rows={2}
                          placeholder="Please detail incorrect timings, tasks not done, or dispute reason..."
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          className="w-full bg-white border border-rose-200 rounded p-2 text-xs focus:outline-none"
                        />
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => {
                              if (disputeReason.trim()) {
                                onDisputeTimesheet(shift.id, disputeReason);
                                setDisputeReason('');
                                setActiveDisputeShiftId(null);
                              }
                            }}
                            className="bg-rose-600 text-white text-[9px] font-bold px-2 py-1 rounded"
                          >
                            Submit Dispute Block
                          </button>
                          <button
                            onClick={() => setActiveDisputeShiftId(null)}
                            className="bg-white text-slate-500 text-[9px] font-bold px-2 py-1 rounded border border-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {awaitingApprovalTimesheets.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Zero pending timesheets. Your roster approvals are fully up to date.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post shift & Report Incident Column */}
        <div className="space-y-6">
          {/* Post Shift form */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-50 pb-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Self-Service Shift Request</span>
            </h3>

            <form onSubmit={handlePostShift} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Role Required</label>
                <select
                  value={roleRequired}
                  onChange={(e) => setRoleRequired(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Care Assistant">Care Assistant</option>
                  <option value="Senior Carer">Senior Carer</option>
                  <option value="Registered Nurse">Registered Nurse (RN)</option>
                  <option value="Support Worker">Support Worker</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Shift Date</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Urgency cover</option>
                </select>
              </div>

              {postFeedback && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-lg border border-emerald-100">
                  {postFeedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors"
              >
                Broadcast Shift Requirement
              </button>
            </form>
          </div>

          {/* Incident reporting for CQC */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-50 pb-2">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>Report Clinical/Safety Incident</span>
            </h3>

            <form onSubmit={handleIncidentSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Incident Title</label>
                <input
                  type="text"
                  placeholder="e.g. Minor Resident Slip / Fall"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Immediate Action Logged</label>
                <input
                  type="text"
                  placeholder="e.g. Vitals monitored, doctor notified"
                  value={incAction}
                  onChange={(e) => setIncAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Details of what happened, resident name, time..."
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Severity</label>
                <select
                  value={incSeverity}
                  onChange={(e) => setIncSeverity(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="Low">Low (Minor bump/remark)</option>
                  <option value="Medium">Medium (Attention/Doctor called)</option>
                  <option value="High">High (Serious Injury/Hospitalized)</option>
                </select>
              </div>

              {incFeedback && (
                <div className="p-3 bg-violet-50 text-violet-800 text-[11px] font-semibold rounded-lg border border-violet-100">
                  {incFeedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Log into CQC Statutory Ledger</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
