import React, { useState } from 'react';
import { Worker, ClientSite, Shift } from '../types';
import { Heart, Shield, Sparkles, MessageCircle, Clock, Calendar, Check } from 'lucide-react';
import { TaskCategoryBadge } from './TaskCategoryBadge';

interface FamilyPortalProps {
  workers: Worker[];
  clientSites: ClientSite[];
  shifts: Shift[];
  onSendMessage: (recipientId: string, content: string) => void;
}

export const FamilyPortal: React.FC<FamilyPortalProps> = ({
  workers,
  clientSites,
  shifts,
  onSendMessage,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Let's filter shifts for Margaret Smith at Cherry Tree Dementia Clinic (c-cherry) or Oakridge Manor (c-oakridge)
  const familyShifts = shifts.filter(
    s => s.clientSiteId === 'c-cherry' || s.clientSiteId === 'c-oakridge'
  );

  const activeVisits = familyShifts.filter(s => s.status === 'Confirmed');
  const pastVisits = familyShifts.filter(s => s.status === 'Completed');

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    onSendMessage('agency', messageText);
    setMessageText('');
    setFeedback('Your message has been dispatched to the Nexora on-duty agency coordinator. They will follow up immediately.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Premium Warm Welcoming Family Portal Banner */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Nexora Family & Companion Circle</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Welcome, The Smith Family</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Currently monitoring care status logs for: <strong className="text-slate-700">Margaret Smith</strong> (Resident at Cherry Tree Clinic)
          </p>
        </div>

        <div className="bg-white/80 p-3 rounded-lg border border-rose-100 text-xs">
          <p className="text-slate-500 font-medium">Continuous Quality of Care</p>
          <div className="flex items-center space-x-1 font-bold text-slate-800 mt-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>CQC Inspection Safe</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily care logs & digital checklist reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Daily Care Hand-Off Diaries (Margaret's Log)</span>
              </h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Live Synced</span>
            </div>

            <div className="space-y-4">
              {pastVisits.map(visit => {
                const worker = workers.find(w => w.id === visit.assignedWorkerId);
                const site = clientSites.find(cs => cs.id === visit.clientSiteId);

                return (
                  <div key={visit.id} className="p-4 border border-rose-100/50 rounded-xl bg-rose-50/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2.5">
                        <img src={worker?.avatar} alt={worker?.name} className="w-8 h-8 rounded-full border border-rose-200" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{worker?.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{worker?.role} | Visited {visit.date}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded font-extrabold uppercase">
                        Care Completed
                      </span>
                    </div>

                    {visit.careNotes ? (
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-100">
                        "{visit.careNotes}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No custom text log was written for this visit.</p>
                    )}

                    {/* Show completed checklists so families feel secure */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Care Checklists:</p>
                        <span className="text-[9px] text-slate-400 font-medium">Color categorized</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {visit.careLogChecklist.map(t => (
                          <div key={t.id} className="flex items-center justify-between gap-1 text-[10px] text-slate-700 bg-white p-1.5 rounded-lg border border-slate-100 shadow-2xs">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate font-medium">{t.taskName}</span>
                            </div>
                            <TaskCategoryBadge task={t} compact={true} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {pastVisits.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Margaret has not had any signed completed visits logged yet on the live dashboard.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming visits list */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Upcoming Scheduled Care & Companions</span>
              </h3>
            </div>

            <div className="space-y-3">
              {activeVisits.map(visit => {
                const worker = workers.find(w => w.id === visit.assignedWorkerId);
                return (
                  <div key={visit.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-3 bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                      <img src={worker?.avatar} alt={worker?.name} className="w-9 h-9 rounded-full border border-slate-100" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{worker?.name}</p>
                        <p className="text-[10px] text-slate-500">{worker?.role}</p>
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">Scheduled: {visit.date} ({visit.startTime} - {visit.endTime})</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[9px] font-bold px-2 py-0.5 rounded">
                        Confirmed Assignment
                      </span>
                    </div>
                  </div>
                );
              })}

              {activeVisits.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs">
                  No upcoming visits booked for Margaret Smith this week.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messaging & Quality Guarantee column */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-50 pb-2">
              <MessageCircle className="w-4 h-4 text-rose-500" />
              <span>Direct Coordinator Support</span>
            </h3>

            <p className="text-xs text-slate-500">
              Need to request scheduling changes, query prescription lists, or request cover? Send an audited message to our duty coordinators.
            </p>

            <form onSubmit={handleSendMessageSubmit} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Type your message to Nexora Care Office..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-medium focus:outline-none"
                required
              />

              {feedback && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-lg border border-emerald-100">
                  {feedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-lg transition-colors"
              >
                Dispatch Audited Message
              </button>
            </form>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nexora Care Guarantee</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Margaret’s assigned caregivers are certified by the **UK Care Quality Commission (CQC)**. Right to Work verification, DBS background screening, and biometric login authentication are enforced. Let us know immediately if you have any feedback on our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
