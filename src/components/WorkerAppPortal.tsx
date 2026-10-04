import React, { useState } from 'react';
import { Worker, ClientSite, Shift, CareTask } from '../types';
import { 
  Lock, Scan, Shield, RefreshCw, AlertTriangle, Check, MapPin, 
  Clock, Calendar, FileText, Compass, CheckCircle2, Sparkles, Filter
} from 'lucide-react';
import { TaskCategoryBadge, TaskColorLegend } from './TaskCategoryBadge';

interface WorkerAppPortalProps {
  currentWorkerId: string;
  workers: Worker[];
  clientSites: ClientSite[];
  shifts: Shift[];
  onApplyForShift: (shiftId: string, workerId: string) => void;
  onCheckIn: (shiftId: string, method: 'GPS' | 'QR/NFC' | 'Manual', reason?: string) => void;
  onCheckOut: (shiftId: string, careNotes: string, checklist: CareTask[]) => void;
  onOfflineSync: (offlineLogs: any[]) => void;
}

export const WorkerAppPortal: React.FC<WorkerAppPortalProps> = ({
  currentWorkerId,
  workers,
  clientSites,
  shifts,
  onApplyForShift,
  onCheckIn,
  onCheckOut,
  onOfflineSync,
}) => {
  // Authentication PIN lock screen simulation
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Offline Mode state
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Field operations active states
  const [scannedQR, setScannedQR] = useState(false);
  const [weakGPSText, setWeakGPSText] = useState('');
  const [careNotesText, setCareNotesText] = useState('');

  // Find worker details
  const workerObj = workers.find(w => w.id === currentWorkerId);

  // Find active today shift
  const todayShift = shifts.find(
    s => s.assignedWorkerId === currentWorkerId && 
    (s.status === 'Confirmed' || s.status === 'Assigned') && 
    !s.checkOutTime
  );

  // Active care checklist if checked-in
  const [activeChecklist, setActiveChecklist] = useState<CareTask[]>(
    todayShift?.careLogChecklist || []
  );
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string | null>(null);

  // Refresh checklist if shift changes or checks in
  React.useEffect(() => {
    if (todayShift) {
      setActiveChecklist(todayShift.careLogChecklist);
    }
  }, [todayShift?.id]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleGPSCheckIn = (method: 'GPS' | 'QR/NFC' | 'Manual') => {
    if (!todayShift) return;

    if (isOffline) {
      // Queue offline log
      const log = {
        type: 'check-in',
        shiftId: todayShift.id,
        method,
        timestamp: new Date().toLocaleTimeString(),
        reason: weakGPSText,
      };
      setOfflineQueue([...offlineQueue, log]);
      alert('Offline Mode Active: Check-In queued locally on your phone. Will sync automatically upon reconnection.');
      return;
    }

    onCheckIn(todayShift.id, method, weakGPSText);
    setWeakGPSText('');
    setScannedQR(false);
  };

  const handleGPSCheckOut = () => {
    if (!todayShift) return;

    // Validate if all mandatory checklist tasks are done
    const uncompleted = activeChecklist.filter(t => !t.completed);
    if (uncompleted.length > 0) {
      alert(`Mandatory Checklist incomplete! Please confirm you completed all client care tasks (e.g. ${uncompleted[0].taskName}) before checking out.`);
      return;
    }

    if (!careNotesText.trim()) {
      alert('Clinical hand-off notes are statutory. Please input brief visit notes for the daily care ledger.');
      return;
    }

    if (isOffline) {
      const log = {
        type: 'check-out',
        shiftId: todayShift.id,
        careNotes: careNotesText,
        checklist: activeChecklist,
        timestamp: new Date().toLocaleTimeString(),
      };
      setOfflineQueue([...offlineQueue, log]);
      setIsOffline(false); // Trigger online toggle to sync
      alert('Offline Mode Active: Check-Out queued. Reconnecting...');
      return;
    }

    onCheckOut(todayShift.id, careNotesText, activeChecklist);
    setCareNotesText('');
  };

  const toggleTask = (taskId: string) => {
    const updated = activeChecklist.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          completed: !t.completed, 
          timeCompleted: !t.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined 
        };
      }
      return t;
    });
    setActiveChecklist(updated);
  };

  const triggerOfflineSync = () => {
    if (offlineQueue.length === 0) return;
    setSyncFeedback('Syncing offline GPS check-in logs with Nexora cloud database...');
    setTimeout(() => {
      onOfflineSync(offlineQueue);
      setOfflineQueue([]);
      setSyncFeedback('Synchronized! 2 logs pushed securely onto CQC ledger.');
      setTimeout(() => setSyncFeedback(null), 3500);
    }, 1500);
  };

  // Lock UI screen
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 text-white rounded-3xl p-8 border-4 border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between h-[520px]">
        <div className="text-center space-y-2 pt-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Nexora Carer Hub</h2>
          <p className="text-xs text-slate-400">Biometric PIN Authentication Required</p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="space-y-1 text-center">
            <div className="flex items-center justify-between px-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${
                pinError || pinInput.length > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                Enter 4-Digit Passcode
              </label>
              <span className="text-[10px] font-mono text-slate-400">{pinInput.length}/4</span>
            </div>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinInput(val);
                if (pinError) setPinError(false);
              }}
              className={`w-full text-center tracking-[1.5em] text-2xl font-bold rounded-xl p-3 focus:outline-none transition-all ${
                pinError
                  ? 'bg-rose-950/60 border-2 border-rose-500 text-rose-400 ring-2 ring-rose-500/50'
                  : pinInput.length > 0
                    ? 'bg-slate-900 border-2 border-rose-500 text-rose-500 ring-1 ring-rose-500/40'
                    : 'bg-slate-800 border border-slate-700 text-white placeholder-slate-600'
              }`}
            />
            {pinError && (
              <p className="text-[11px] text-rose-400 font-bold mt-1.5 animate-bounce">
                Wrong PIN entered. It is wrong, retry.
              </p>
            )}
            {!pinError && pinInput.length > 0 && (
              <p className="text-[10px] text-rose-400 font-mono mt-1">
                Entering PIN in red &bull; Only 4 digits allowed
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-xs active:scale-95"
          >
            Unlock biometric keychain
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500">
          UK National Care Register secured endpoint. Security audit key logged on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xl flex flex-col">
      {/* Phone status bar simulator */}
      <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center border-b border-slate-800 text-[10px] font-bold">
        <span>📶 4G LTE</span>
        <span className="text-[11px]">Nexora Carer App v1.4</span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              const newMode = !isOffline;
              setIsOffline(newMode);
              if (!newMode && offlineQueue.length > 0) {
                triggerOfflineSync();
              }
            }}
            className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase transition-colors ${
              isOffline ? 'bg-amber-500 text-slate-900' : 'bg-emerald-600 text-white'
            }`}
          >
            {isOffline ? 'Offline Mode' : 'Online'}
          </button>
          <span>🔋 98%</span>
        </div>
      </div>

      {/* User Info Header */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img src={workerObj?.avatar} alt={workerObj?.name} className="w-10 h-10 rounded-full border border-slate-100 object-cover" />
          <div>
            <h3 className="text-xs font-bold text-slate-800">{workerObj?.name}</h3>
            <p className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.2 rounded-full w-max">{workerObj?.role}</p>
          </div>
        </div>

        <button
          onClick={() => setIsUnlocked(false)}
          className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-all"
          title="Lock App"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Sync banner if relevant */}
      {syncFeedback && (
        <div className="bg-blue-600 text-white text-[10px] py-1.5 px-4 font-bold animate-pulse text-center flex items-center justify-center space-x-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Main viewport */}
      <div className="p-4 space-y-4 overflow-y-auto h-[550px]">
        
        {/* Compliance locker overview banner */}
        {workerObj?.id === 'w-liam' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-800 space-y-1">
              <p className="font-bold">Mandatory Document Action Needed</p>
              <p>Your DBS Check is due to expire in 15 days. Please click below to verify renewal application progress.</p>
              <button className="underline font-bold text-[9px] uppercase tracking-wider text-amber-950">Update DBS Status</button>
            </div>
          </div>
        )}

        {/* FIELD OPERATIONS MODULE: Check-In/Check-Out */}
        {todayShift ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Shift Scheduled Today</span>
                <h4 className="text-xs font-bold text-slate-800">
                  {clientSites.find(c => c.id === todayShift.clientSiteId)?.name}
                </h4>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                todayShift.urgency === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {todayShift.urgency} Urgency
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{clientSites.find(c => c.id === todayShift.clientSiteId)?.address}</span>
            </div>

            {/* Check-in Actions */}
            {!todayShift.checkInTime ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center space-y-1">
                  <p className="text-[10px] font-bold text-blue-900">EVV Location Validation Active</p>
                  <p className="text-[9px] text-blue-700">You are within the 150m care home geofence bounds.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleGPSCheckIn('GPS')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Compass className="w-4 h-4" />
                    <span>GPS EVV Check-In</span>
                  </button>

                  <button
                    onClick={() => {
                      setScannedQR(true);
                      setTimeout(() => handleGPSCheckIn('QR/NFC'), 1000);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{scannedQR ? 'Scanning...' : 'Scan Home QR/NFC'}</span>
                  </button>
                </div>

                {/* GPS Fallback manual checkin reason text */}
                <div className="pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => setWeakGPSText(weakGPSText ? '' : 'Weak GPS signal in concrete basement area')}
                    className="text-[9px] text-slate-500 underline font-semibold"
                  >
                    Fallback: Strong concrete structure blocks GPS?
                  </button>
                  {weakGPSText && (
                    <div className="mt-1.5 space-y-1">
                      <input
                        type="text"
                        placeholder="Explain weak GPS fallback (CQC ledger required)"
                        value={weakGPSText}
                        onChange={(e) => setWeakGPSText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px]"
                      />
                      <button 
                        onClick={() => handleGPSCheckIn('Manual')}
                        className="w-full bg-amber-500 text-slate-950 font-bold text-[9px] py-1 rounded"
                      >
                        Submit Fallback Manual Entry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Active checked in view -> Mandatory Care Log Checklist & Checkout Notes
              <div className="space-y-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-100 flex justify-between items-center">
                  <span>✓ Checked-In: {todayShift.checkInTime} today</span>
                  <span className="font-semibold text-slate-400">Method: {todayShift.checkInMethod}</span>
                </div>

                {/* Checklist Form */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Mandatory Care Checklist</span>
                      <p className="text-[9px] text-slate-400">Color-coded by clinical & care discipline</p>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">CQC Audit Proof</span>
                  </div>

                  {/* Task Category Color Legend */}
                  <TaskColorLegend 
                    activeFilter={taskCategoryFilter || undefined}
                    onSelectFilter={(cat) => setTaskCategoryFilter(cat)}
                  />

                  {/* Filter count indicator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                    <span>
                      {activeChecklist.filter(t => t.completed).length} of {activeChecklist.length} tasks completed
                    </span>
                    {taskCategoryFilter && (
                      <span className="text-blue-600 font-bold">
                        Showing filtered discipline ({activeChecklist.filter(t => (t.category || 'documentation') === taskCategoryFilter).length})
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {activeChecklist
                      .filter(task => !taskCategoryFilter || (task.category || 'documentation') === taskCategoryFilter)
                      .map(task => (
                        <TaskCategoryBadge
                          key={task.id}
                          task={task}
                          interactive={true}
                          onClick={() => toggleTask(task.id)}
                        />
                      ))}
                  </div>
                </div>

                {/* Hand-off visit notes */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Statutory Hand-off Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter care observations, resident mood, or health logs..."
                    value={careNotesText}
                    onChange={(e) => setCareNotesText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] focus:outline-none"
                    required
                  />
                </div>

                <button
                  onClick={handleGPSCheckOut}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2.5 rounded-xl flex items-center justify-center space-x-1 transition-colors shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GPS EVV Check-Out (Submit Timesheet)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl p-4 text-center text-slate-500 text-xs py-8">
            <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold">No Active Shift Today</p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">
              Select open assignments in the marketplace board below to schedule.
            </p>
          </div>
        )}

        {/* OPEN SHIFT MARKETPLACE */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
          <div className="border-b border-slate-50 pb-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Nexora Open Shift Marketplace</span>
            </h4>
            <p className="text-[9px] text-slate-400">Claim vacancies matching your '{workerObj?.role}' skillset instantly</p>
          </div>

          <div className="space-y-2.5">
            {shifts
              .filter(s => s.status === 'Open' && s.roleRequired === workerObj?.role)
              .map(shift => {
                const site = clientSites.find(cs => cs.id === shift.clientSiteId);
                const hasApplied = shift.appliedWorkerIds.includes(currentWorkerId);

                return (
                  <div key={shift.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[11px] font-bold text-slate-900">{site?.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{shift.date} | {shift.startTime} - {shift.endTime}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">£{shift.payRate.toFixed(2)}/hr</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/50">
                      <span className="text-[9px] text-slate-400 font-medium">Postcode: {site?.postcode}</span>
                      <button
                        onClick={() => onApplyForShift(shift.id, currentWorkerId)}
                        disabled={hasApplied}
                        className={`text-[9px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          hasApplied 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {hasApplied ? '✓ Applied (Reviewing)' : 'Apply Instant'}
                      </button>
                    </div>
                  </div>
                );
              })}

            {shifts.filter(s => s.status === 'Open' && s.roleRequired === workerObj?.role).length === 0 && (
              <div className="text-center py-4 text-slate-400 text-[10px]">
                No current open marketplace vacancies matching your credential level.
              </div>
            )}
          </div>
        </div>

        {/* PERSONAL SCHEDULE SUMMARY */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 border-b border-slate-50 pb-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>My Upcoming Roster Schedule</span>
          </h4>

          <div className="space-y-2">
            {shifts
              .filter(s => s.assignedWorkerId === currentWorkerId && s.status !== 'Completed')
              .map(shift => {
                const site = clientSites.find(cs => cs.id === shift.clientSiteId);
                return (
                  <div key={shift.id} className="p-2.5 border border-slate-100 rounded-lg flex justify-between items-center text-[10px] bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-800">{site?.name}</p>
                      <p className="text-slate-400 font-semibold">{shift.date} | {shift.startTime} - {shift.endTime}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-800 font-extrabold px-2 py-0.5 rounded">
                      {shift.status}
                    </span>
                  </div>
                );
              })}

            {shifts.filter(s => s.assignedWorkerId === currentWorkerId && s.status !== 'Completed').length === 0 && (
              <div className="text-center py-2 text-slate-400 text-[10px]">
                No upcoming assignments booked.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
