import React, { useState } from 'react';
import { Worker } from '../types';
import { 
  X, Check, User, Phone, Mail, DollarSign, Clock, 
  Shield, Calendar, FileText, AlertCircle, Save, Sparkles 
} from 'lucide-react';

interface EditWorkerModalProps {
  worker: Worker;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWorker: Worker) => void;
}

export const EditWorkerModal: React.FC<EditWorkerModalProps> = ({
  worker,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Worker>({ ...worker });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if a different worker is opened
  React.useEffect(() => {
    setFormData({ ...worker });
    setSaveSuccess(false);
  }, [worker]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleAvailableDayToggle = (day: string) => {
    const exists = formData.availableDays.includes(day);
    const updated = exists
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    setFormData({ ...formData, availableDays: updated });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src={formData.avatar} 
              alt={formData.name} 
              className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold font-display text-white">
                  Edit Employee: {formData.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ID: {formData.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Admin Privilege: Modify personal info, pay rates, working hours, and compliance certificates anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 font-bold text-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Employee record updated successfully in live system!</span>
            </div>
          )}

          {/* Section 1: Basic Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-500 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Personal & Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Clinical / Care Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Senior Carer">Senior Carer</option>
                  <option value="Care Assistant">Care Assistant</option>
                  <option value="Registered Nurse">Registered Nurse</option>
                  <option value="Support Worker">Support Worker</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">UK Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Employment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active (Roster Eligible)</option>
                  <option value="Pending Compliance">Pending Compliance</option>
                  <option value="Suspended">Suspended (Blocked)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pay Rates & Working Hours */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-500 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payroll Rates & Working Hours (UK WTR 1998)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Hourly Pay Rate (£/hr)</label>
                <input
                  type="number"
                  step="0.25"
                  min="11.44"
                  required
                  value={formData.payRate}
                  onChange={(e) => setFormData({ ...formData, payRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Max Weekly Hours (Cap)</label>
                <input
                  type="number"
                  max="60"
                  min="0"
                  required
                  value={formData.maxHoursWeekly}
                  onChange={(e) => setFormData({ ...formData, maxHoursWeekly: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Reliability Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.reliabilityScore}
                  onChange={(e) => setFormData({ ...formData, reliabilityScore: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Days available */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Rota Available Days</label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map(day => {
                  const isAvailable = formData.availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleAvailableDayToggle(day)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        isAvailable 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: CQC Statutory Compliance & Certificates */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-500 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>CQC Statutory Compliance & DBS Ledger</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Enhanced DBS Certificate Number</label>
                <input
                  type="text"
                  value={formData.compliance.dbsNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, dbsNumber: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">DBS Expiry Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={formData.compliance.dbsExpiry}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, dbsExpiry: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Right to Work Status</label>
                <select
                  value={formData.compliance.rtwStatus}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, rtwStatus: e.target.value as any }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Verified">Verified (Eligible)</option>
                  <option value="Pending">Pending Check</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Visa / Right to Work Expiry</label>
                <input
                  type="date"
                  value={formData.compliance.rightToWorkExpiry}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, rightToWorkExpiry: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Visa Status / Nationality Category</label>
                <input
                  type="text"
                  value={formData.compliance.visaStatus}
                  onChange={(e) => setFormData({
                    ...formData,
                    compliance: { ...formData.compliance, visaStatus: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mandatory Care Certificate Training</label>
                <div className="flex items-center space-x-3 mt-2">
                  <label className="inline-flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.compliance.mandatoryTrainingCompleted}
                      onChange={(e) => setFormData({
                        ...formData,
                        compliance: { ...formData.compliance, mandatoryTrainingCompleted: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Training Completed</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Employee Record</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
