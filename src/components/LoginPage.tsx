import React from 'react';
import { 
  Laptop, Smartphone, Wifi, Battery, Shield, CheckCircle2, 
  ArrowRight, Key, Lock, Sparkles, UserCheck, AlertCircle, 
  Clock, MapPin, QrCode
} from 'lucide-react';
import { Worker } from '../types';

interface LoginPageProps {
  workers: Worker[];
  onAdminLogin: (adminUser: { name: string; email: string; role: string }) => void;
  onWorkerLogin: (workerId: string) => void;
  initialMode?: 'admin' | 'worker';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  workers,
  onAdminLogin,
  onWorkerLogin,
  initialMode = 'admin'
}) => {
  const [activeDevice, setActiveDevice] = React.useState<'laptop' | 'mobile'>(
    initialMode === 'worker' ? 'mobile' : 'laptop'
  );

  // Admin Laptop State
  const [adminEmail, setAdminEmail] = React.useState('admin@nexoracare.co.uk');
  const [adminPassword, setAdminPassword] = React.useState('NexoraAdmin!2026');
  const [adminRole, setAdminRole] = React.useState<'agency' | 'client'>('agency');
  const [adminError, setAdminError] = React.useState<string | null>(null);

  // Worker Phone State
  const [selectedWorkerId, setSelectedWorkerId] = React.useState<string>('w-sarah');
  const [workerPin, setWorkerPin] = React.useState<string>('4892');
  const [workerError, setWorkerError] = React.useState<string | null>(null);

  // Loading animation state
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = React.useState<string | null>(null);

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError('Please enter both your work email and password.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      if (adminEmail.includes('oakridge') || adminRole === 'client') {
        setAuthSuccessMessage('Authenticated as Oakridge Manor Site Manager');
        setTimeout(() => {
          onAdminLogin({
            name: 'Oakridge Manor Manager',
            email: adminEmail,
            role: 'client'
          });
        }, 600);
      } else {
        setAuthSuccessMessage('Access Granted: Nexora Agency Super Admin');
        setTimeout(() => {
          onAdminLogin({
            name: 'Super Admin & HR Director',
            email: adminEmail,
            role: 'agency'
          });
        }, 600);
      }
    }, 600);
  };

  const handleWorkerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setWorkerError(null);

    if (!selectedWorkerId) {
      setWorkerError('Please select a registered care worker.');
      return;
    }

    if (!workerPin.trim() || workerPin.length !== 4) {
      setWorkerError('Please enter a 4-digit Security PIN (only 4 digits allowed).');
      return;
    }

    // Validate PIN: Default correct PIN is 4892 (or 1234)
    if (workerPin !== '4892' && workerPin !== '1234') {
      setWorkerError('Wrong PIN entered. It is wrong, retry.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      if (selectedWorker) {
        setAuthSuccessMessage(`Welcome back, ${selectedWorker.name} (${selectedWorker.role})`);
        setTimeout(() => {
          onWorkerLogin(selectedWorker.id);
        }, 600);
      } else {
        setWorkerError('Worker profile not found in agency directory.');
      }
    }, 600);
  };

  const appendPinDigit = (digit: string) => {
    if (workerPin.length < 4) {
      const nextPin = workerPin + digit;
      setWorkerPin(nextPin);
      if (workerError) {
        setWorkerError(null);
      }
      // If 4th digit entered and wrong, check immediately
      if (nextPin.length === 4 && nextPin !== '4892' && nextPin !== '1234') {
        setWorkerError('Wrong PIN entered. It is wrong, retry.');
      }
    }
  };

  const deletePinDigit = () => {
    setWorkerPin(prev => prev.slice(0, -1));
    if (workerError) {
      setWorkerError(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Device Platform Switcher Header (Starting Gateway Header) */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-30 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 border border-blue-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-white font-display tracking-tight">NEXORA CARE</span>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                Start &bull; Gateway
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Portal Ready</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Healthcare Workforce Platform &bull; UK Statutory CQC Compliance Engine</p>
          </div>
        </div>

        {/* Big Device Selector Pills - The Starting Gateway Portals */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveDevice('laptop');
              setAdminError(null);
              setWorkerError(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeDevice === 'laptop'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Admin Portal (Laptop / Desktop)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDevice('mobile');
              setAdminError(null);
              setWorkerError(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeDevice === 'mobile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 border border-emerald-400/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Care Worker App (Mobile Phone)</span>
          </button>
        </div>
      </header>

      {/* Main View Area - Beginning Experience Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-x-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.14),rgba(2,6,23,0))]">
        
        {/* Welcome Announcement banner */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-slate-300 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Welcome to Nexora Care &mdash; Choose a portal below to begin operations</span>
          </div>
        </div>
        
        {/* Background glow */}
        <div className={`absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
          activeDevice === 'laptop' ? 'bg-blue-600/10' : 'bg-emerald-600/10'
        }`} />

        {authSuccessMessage && (
          <div className="fixed top-20 z-50 bg-emerald-500 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>{authSuccessMessage}</span>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 1: ADMIN LAPTOP / DESKTOP EXPERIENCE */}
        {/* ======================================================================= */}
        {activeDevice === 'laptop' && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
            {/* Laptop Frame Mockup */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-t-3xl shadow-2xl overflow-hidden">
              
              {/* Laptop Screen Top Bezel */}
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <span className="text-[11px] text-slate-500 pl-2">https://admin.nexoracare.co.uk/secure/login</span>
                </div>
                <div className="flex items-center space-x-3 text-[10px]">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                    LAPTOP WORKSTATION DISPLAY
                  </span>
                  <span>🔒 SSL 256-Bit</span>
                </div>
              </div>

              {/* Laptop Screen Inner Canvas */}
              <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
                
                {/* Left Column: Admin Branding & System Overview */}
                <div className="md:col-span-5 space-y-4">
                  <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>BACKOFFICE DESKTOP CONSOLE</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight leading-tight">
                    Care Home Workforce & Rota Operations
                  </h1>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed for office monitors and laptops. Manage multi-site rota schedules, monitor live GPS check-ins, approve timesheets, and run automated UK CQC compliance audits.
                  </p>

                  <div className="pt-2 space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Electronic Visit Verification (EVV) Live Map</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Sage & QuickBooks Payroll Ledger Export</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Automated DBS & Right-to-Work Expiry Lock</span>
                    </div>
                  </div>

                  {/* Switch to mobile prompt */}
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveDevice('mobile')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 font-bold transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Are you a Care Worker? Switch to Phone App &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Admin Login Form */}
                <div className="md:col-span-7 bg-slate-950/70 p-6 sm:p-8 rounded-2xl border border-slate-800/90 shadow-xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Administrator Sign In</h2>
                      <p className="text-xs text-slate-400">Select persona or type login credentials</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400">
                      PORT 3000 SECURED
                    </span>
                  </div>

                  {/* Demo Profile Pickers */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminEmail('admin@nexoracare.co.uk');
                        setAdminPassword('NexoraAdmin!2026');
                        setAdminRole('agency');
                      }}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        adminRole === 'agency'
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/40'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Agency Super Admin</span>
                        {adminRole === 'agency' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">admin@nexoracare.co.uk</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdminEmail('manager.oakridge@carehomes.uk');
                        setAdminPassword('Oakridge#7788');
                        setAdminRole('client');
                      }}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        adminRole === 'client'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Care Home Manager</span>
                        {adminRole === 'client' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">manager.oakridge@...</div>
                    </button>
                  </div>

                  {adminError && (
                    <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Staff Work Email</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Password</span>
                        <span className="text-[10px] text-blue-400 font-normal">Demo: NexoraAdmin!2026</span>
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating Laptop Session...</span>
                        </div>
                      ) : (
                        <>
                          <span>Sign In to Admin Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* Laptop Base Stand Graphic */}
            <div className="h-4 bg-slate-700 rounded-b-xl max-w-4xl mx-auto shadow-xl relative flex justify-center">
              <div className="w-24 h-1.5 bg-slate-600 rounded-b-md"></div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 2: CARE WORKER MOBILE SMARTPHONE EXPERIENCE */}
        {/* ======================================================================= */}
        {activeDevice === 'mobile' && (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            
            {/* Phone Outer Chassis with realistic borders */}
            <div className="bg-slate-900 border-[6px] border-slate-700 rounded-[44px] shadow-2xl overflow-hidden p-3 relative ring-4 ring-slate-800/80">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-center space-x-2 border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-blue-900/60"></div>
              </div>

              {/* Phone Screen Canvas */}
              <div className="bg-slate-950 rounded-[34px] border border-slate-800 overflow-hidden flex flex-col justify-between min-h-[640px] text-white">
                
                {/* Phone Status Bar */}
                <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-400 shrink-0">
                  <span>9:41 AM</span>
                  <div className="flex items-center space-x-1.5">
                    <Wifi className="w-3 h-3 text-slate-400" />
                    <span>5G</span>
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                {/* Mobile App Header & Logo */}
                <div className="p-6 text-center space-y-2 shrink-0">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 border border-emerald-400/30">
                    <Smartphone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight font-display text-white">Nexora Go</h2>
                    <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Field Healthcare Staff App</p>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    GPS Check-in, care checklists, and instant shift rota notifications on your phone.
                  </p>
                </div>

                {/* Mobile Body Content */}
                <div className="px-6 flex-1 space-y-4">
                  
                  {/* Select Registered Worker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Care Worker</label>
                    <div className="grid grid-cols-2 gap-2">
                      {workers.slice(0, 4).map(w => {
                        const isSelected = selectedWorkerId === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setSelectedWorkerId(w.id);
                              setWorkerPin(w.id === 'w-sarah' ? '4892' : '2026');
                              setWorkerError(null);
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                              isSelected
                                ? 'bg-emerald-600/20 border-emerald-500 ring-1 ring-emerald-500/40 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <img src={w.avatar} alt={w.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold truncate">{w.name}</div>
                              <div className="text-[9px] text-slate-400 truncate">{w.role}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Worker Status notification */}
                  {selectedWorker && selectedWorker.status !== 'Active' && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[10px] flex items-center space-x-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Expired DBS: App is accessible, but rota shifts are locked.</span>
                    </div>
                  )}

                  {workerError && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-[10px] flex items-center justify-between space-x-2 animate-shake">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span className="font-semibold">{workerError}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setWorkerPin('');
                          setWorkerError(null);
                        }}
                        className="bg-rose-600/60 hover:bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* 4-Digit PIN Keypad Screen */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    workerError 
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500/50' 
                      : workerPin.length > 0 
                        ? 'bg-slate-900/90 border-rose-500/50 shadow-md shadow-rose-900/20' 
                        : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="text-center space-y-1.5">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          workerError 
                            ? 'text-rose-400' 
                            : workerPin.length > 0 
                              ? 'text-rose-400' 
                              : 'text-slate-400'
                        }`}>
                          {workerError ? 'PIN Error: Wrong PIN entered' : 'Enter 4-Digit Carer Passcode'}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                          {workerPin.length}/4
                        </span>
                      </div>

                      {/* Explicit 4-digit input box with red text & border while typing */}
                      <div className="relative max-w-[160px] mx-auto">
                        <input
                          type="password"
                          readOnly
                          maxLength={4}
                          value={workerPin}
                          placeholder="••••"
                          className={`w-full text-center tracking-[0.8em] font-mono text-xl font-black py-1.5 rounded-xl border transition-all cursor-default focus:outline-none ${
                            workerError
                              ? 'bg-rose-950/70 border-rose-500 text-rose-300 ring-2 ring-rose-500/50 placeholder-rose-700'
                              : workerPin.length > 0
                                ? 'bg-slate-950 border-rose-500 text-rose-500 ring-1 ring-rose-500/40 placeholder-slate-700'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 placeholder-slate-700'
                          }`}
                        />
                      </div>

                      {/* PIN Dots display styled in vibrant red when entering pin or error */}
                      <div className="flex justify-center space-x-3 pt-1">
                        {[0, 1, 2, 3].map(index => {
                          const isFilled = workerPin.length > index;
                          return (
                            <div 
                              key={index} 
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                workerError
                                  ? 'bg-rose-500 border-rose-400 scale-110 shadow-sm shadow-rose-500/80 animate-pulse'
                                  : isFilled
                                    ? 'bg-rose-500 border-rose-400 scale-110 shadow-sm shadow-rose-500/80'
                                    : 'bg-slate-800 border-slate-700'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {workerError ? (
                        <p className="text-[10px] text-rose-400 font-bold animate-bounce">
                          Wrong PIN. Retry with default PIN: 4892
                        </p>
                      ) : (
                        <p className={`text-[9px] font-mono transition-colors ${
                          workerPin.length > 0 ? 'text-rose-400/90 font-bold' : 'text-slate-500'
                        }`}>
                          Entering PIN in red &bull; Default PIN: 4892 (or 1234)
                        </p>
                      )}
                    </div>

                    {/* Numeric Keypad Grid */}
                    <div className="grid grid-cols-3 gap-1.5 max-w-[220px] mx-auto">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                          key={num}
                          type="button"
                          disabled={workerPin.length >= 4}
                          onClick={() => appendPinDigit(num)}
                          className={`h-10 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
                            workerPin.length >= 4 
                              ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-rose-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setWorkerPin('');
                          setWorkerError(null);
                        }}
                        className="h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 font-medium text-[10px] active:scale-95 transition-transform flex items-center justify-center"
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        disabled={workerPin.length >= 4}
                        onClick={() => appendPinDigit('0')}
                        className={`h-10 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center ${
                          workerPin.length >= 4 
                            ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-rose-300'
                        }`}
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={deletePinDigit}
                        className="h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-rose-400 font-bold text-xs active:scale-95 transition-transform flex items-center justify-center"
                      >
                        DEL
                      </button>
                    </div>
                  </div>

                  {/* Launch App Button */}
                  <form onSubmit={handleWorkerSubmit}>
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Phone Token...</span>
                        </div>
                      ) : (
                        <>
                          <span>Unlock Mobile Field App</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Quick toggle to admin */}
                  <div className="text-center pt-1 pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveDevice('laptop')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Switch to Admin Laptop View &rarr;
                    </button>
                  </div>

                </div>

                {/* iPhone Home Bar indicator */}
                <div className="pb-2 pt-1 flex justify-center shrink-0">
                  <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
                </div>

              </div>
            </div>

            {/* Hint tag */}
            <p className="text-center text-xs text-slate-500 mt-4">
              Care staff carry smartphones to capture GPS coords and time-stamped CQC care handoffs.
            </p>
          </div>
        )}

      </main>

      {/* Global Brand Footer - Enterprise Trust Standards */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/90 text-center text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-300">Nexora Care Technologies Ltd</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-[11px] text-slate-400">UK Statutory CQC Compliance & Workforce Platform</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
            🔒 256-Bit TLS
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
            🛡️ CQC Audit Ready
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
            💻 Laptop Admin & 📱 Carer Mobile
          </span>
        </div>
      </footer>

    </div>
  );
};
