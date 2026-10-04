import React, { useState } from 'react';
import { 
  Key, Lock, LogIn, Copy, Check, Shield, UserCheck, 
  Building, Users, Heart, MessageSquare, AlertCircle, 
  Eye, EyeOff, Sparkles, ArrowRight, Smartphone, X, Terminal
} from 'lucide-react';

export interface LoginCredential {
  id: string;
  roleTitle: string;
  portal: 'agency' | 'client' | 'worker' | 'family' | 'messaging';
  workerId?: string;
  siteId?: string;
  email: string;
  passwordOrPin: string;
  accessLevel: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
}

const PRESET_CREDENTIALS: LoginCredential[] = [
  {
    id: 'cred-admin',
    roleTitle: '1. Super Admin & HR Director',
    portal: 'agency',
    email: 'admin@nexoracare.co.uk',
    passwordOrPin: 'NexoraAdmin!2026',
    accessLevel: 'Full System Administration (Tier 1)',
    description: 'Create rota shifts, approve DBS/Right-to-Work documents, run UK Sage/QuickBooks payroll exports, and oversee CQC compliance.',
    badge: 'AGENCY SUPERUSER',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Building
  },
  {
    id: 'cred-client',
    roleTitle: '2. Care Home Site Manager',
    portal: 'client',
    siteId: 'c-oakridge',
    email: 'manager.oakridge@carehomes.uk',
    passwordOrPin: 'Oakridge#7788',
    accessLevel: 'Facility Partner Manager',
    description: 'View live care workers checked in via GPS, approve completed electronic timesheets, monitor staffing levels, and log CQC incidents.',
    badge: 'CLIENT SITE LEADER',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Users
  },
  {
    id: 'cred-worker-active',
    roleTitle: '3. Mobile Care Worker (Active RN)',
    portal: 'worker',
    workerId: 'w-sarah',
    email: 'sarah.j@nexoracare.co.uk',
    passwordOrPin: 'PIN: 4892 (or SarahCare#2026)',
    accessLevel: 'Field Healthcare Professional',
    description: 'Simulate the mobile field app. Slide to check in/out with EVV GPS coordinates, tick off daily care task checklists, and sync offline logs.',
    badge: 'VERIFIED NURSE',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Smartphone
  },
  {
    id: 'cred-worker-blocked',
    roleTitle: '4. Care Worker (Expired DBS Test)',
    portal: 'worker',
    workerId: 'w-emily',
    email: 'emily.t@nexoracare.co.uk',
    passwordOrPin: 'Emily#2026',
    accessLevel: 'Restricted Status (Compliance Lock)',
    description: 'Demonstrates automated statutory CQC guardrails. Expired DBS certificate blocks shift application and rota placement.',
    badge: 'STATUTORY BLOCKED',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle
  },
  {
    id: 'cred-family',
    roleTitle: '5. Family Companion Circle',
    portal: 'family',
    email: 'm.smith.family@companion.net',
    passwordOrPin: 'FamilyLove24',
    accessLevel: 'Authorized Next of Kin',
    description: 'Transparent family portal. Read Margaret Smith\'s care logs, meal intake, and medication records written by caregivers on site.',
    badge: 'FAMILY CIRCLE',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Heart
  },
  {
    id: 'cred-cqc',
    roleTitle: '6. CQC Inspector & Auditor',
    portal: 'messaging',
    email: 'inspector.cqc@gov.uk',
    passwordOrPin: 'CQCAudit#Pass2026',
    accessLevel: 'Government Compliance Auditor',
    description: 'Access the immutable communications ledger, review audit logs, check training compliance trackers, and verify GDPR data handling.',
    badge: 'CQC AUDITOR',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Shield
  }
];

interface LoginDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (portal: 'agency' | 'client' | 'worker' | 'family' | 'messaging', workerId?: string, siteId?: string) => void;
  currentPortal: string;
}

export const LoginDetailsModal: React.FC<LoginDetailsModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  currentPortal
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('admin@nexoracare.co.uk');
  const [customPassword, setCustomPassword] = useState('NexoraAdmin!2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authSuccessToast, setAuthSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(identifier);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleQuickLogin = (cred: LoginCredential) => {
    onSelectRole(cred.portal, cred.workerId, cred.siteId);
    setAuthSuccessToast(`Authenticated as ${cred.roleTitle.split('.')[1]?.trim() || cred.roleTitle} (JWT Token Issued)`);
    setTimeout(() => {
      setAuthSuccessToast(null);
      onClose();
    }, 1500);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = PRESET_CREDENTIALS.find(c => 
      c.email.toLowerCase() === customEmail.trim().toLowerCase()
    );
    
    if (matched) {
      handleQuickLogin(matched);
    } else {
      // Default to agency if manual custom email
      onSelectRole('agency');
      setAuthSuccessToast(`Authenticated custom user: ${customEmail} (Role: Super Admin)`);
      setTimeout(() => {
        setAuthSuccessToast(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40 border border-blue-400/30">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-display tracking-tight">Nexora Care System Login & Demo Credentials</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                  ROLE-BASED ACCESS CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Test any user persona, mobile field app, or management dashboard with pre-configured credentials & OAuth simulation.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Background decoration */}
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Shield className="w-48 h-48 text-blue-400" />
          </div>
        </div>

        {/* Success Toast Notification */}
        {authSuccessToast && (
          <div className="bg-emerald-600 text-white px-6 py-3 flex items-center justify-between text-xs font-bold shadow-inner animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 bg-white text-emerald-700 rounded-full p-0.5" />
              <span>{authSuccessToast}</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-700 px-2 py-0.5 rounded">Redirecting Portal...</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          
          {/* Quick Manual Login Sim Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm font-display">
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Interactive Authentication Console</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Standard JWT / OAuth Handshake Simulator</span>
            </div>

            <form onSubmit={handleManualLogin} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email Address / Username</label>
                <input
                  type="text"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. admin@nexoracare.co.uk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Password / PIN</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                >
                  <span>Authenticate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Directory of Pre-configured Roles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">Pre-configured Role Directory & Test Accounts</h4>
                <p className="text-xs text-slate-500">Select any role below to instantly simulate that user's permissions, dashboard, and workflow.</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                {PRESET_CREDENTIALS.length} Roles Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_CREDENTIALS.map((cred) => {
                const IconComponent = cred.icon;
                const isActive = currentPortal === cred.portal;

                return (
                  <div 
                    key={cred.id}
                    className={`bg-white rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                      isActive 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2.5 rounded-xl border ${cred.badgeColor}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-display">{cred.roleTitle}</h5>
                            <span className="text-[10px] text-slate-500 font-medium">{cred.accessLevel}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono ${cred.badgeColor}`}>
                          {cred.badge}
                        </span>
                      </div>

                      {/* Role Description */}
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-4 line-clamp-2">
                        {cred.description}
                      </p>

                      {/* Credentials Display Box */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 mb-4 font-mono text-xs">
                        {/* Email / Username row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5 overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">USER:</span>
                            <span className="text-slate-800 font-semibold truncate">{cred.email}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(cred.email, `${cred.id}-email`)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                            title="Copy Username"
                          >
                            {copiedField === `${cred.id}-email` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Password / PIN row */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center space-x-1.5 overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">PASS:</span>
                            <span className="text-slate-700 font-semibold truncate">{cred.passwordOrPin}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(cred.passwordOrPin, `${cred.id}-pass`)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                            title="Copy Password"
                          >
                            {copiedField === `${cred.id}-pass` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setCustomEmail(cred.email);
                        setCustomPassword(cred.passwordOrPin);
                        handleQuickLogin(cred);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        isActive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-900 hover:bg-blue-600 text-white shadow-sm'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Currently Logged In (Reload)' : 'Login as this Role'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Guidance Notice */}
          <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-900">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">UK CQC & GDPR Compliance Notice</span>
              <p className="text-blue-800/80 text-[11px] leading-relaxed">
                All demonstration user accounts operate within an isolated, encrypted test sandbox. Role-based access control (RBAC) ensures care workers only see assigned client shifts, site managers only see their home staff, and Super Admins maintain complete oversight of rota schedules and payroll ledgers.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="font-mono">Status: JWT Mock Service Active (Port 3000)</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
