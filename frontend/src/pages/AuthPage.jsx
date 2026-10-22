import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Check
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  changePassword,
  setAuthToken,
  setCurrentUser
} from '../services/api';

export default function AuthPage({ onNavigate }) {
  // mode: 'login' | 'register' | 'forgot' | 'change'
  const [mode, setMode] = useState('login');

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Password reset & change fields
  const [resetCode, setResetCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: enter code & reset
  const [generatedCodeHint, setGeneratedCodeHint] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetMessages();
    setForgotStep(1);
    setGeneratedCodeHint('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await loginUser(email, password);
        setAuthToken(data.access_token);
        setCurrentUser(data.user);
        onNavigate('analyze');
      } else if (mode === 'register') {
        const data = await registerUser(email, password, fullName);
        setAuthToken(data.access_token);
        setCurrentUser(data.user);
        setSuccess('Account created successfully! Redirecting to your personal skin dashboard...');
        setTimeout(() => onNavigate('analyze'), 1200);
      } else if (mode === 'forgot') {
        // Direct reset without email code verification
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New password and confirmation do not match.');
        }
        const data = await resetPassword(email, null, newPassword);
        setAuthToken(data.access_token);
        setCurrentUser(data.user);
        setSuccess('Password updated successfully! Logging you in...');
        setTimeout(() => onNavigate('analyze'), 1200);
      } else if (mode === 'change') {
        // Direct change password
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New password and confirmation do not match.');
        }
        const res = await changePassword(email, currentPassword, newPassword);
        setSuccess(res.message || 'Password changed successfully! You can now sign in.');
        setPassword(newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => switchMode('login'), 1600);
      }
    } catch (err) {
      setError(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 px-4 max-w-lg mx-auto">
      <div className="bg-white border border-dermo-warm/90 rounded-3xl p-6 sm:p-9 shadow-xl shadow-dermo-sand/30 space-y-6">
        
        {/* =========================================================================
            TOP HEADER & TAB SWITCHER
        ========================================================================= */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dermo-sand text-dermo-teal text-[10px] font-bold uppercase tracking-widest border border-dermo-warm">
            <ShieldCheck className="w-3.5 h-3.5 text-dermo-teal" />
            Personalized Skin Care AI Security
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-dermo-charcoal">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Free Profile'}
            {mode === 'forgot' && 'Reset Forgotten Password'}
            {mode === 'change' && 'Change Account Password'}
          </h2>

          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {mode === 'login' && 'Access past Vision Transformer scans, SkinKart 3D try-on, and personalized routines.'}
            {mode === 'register' && 'Join ALSKINCARE AI to track your dermal barrier journey and product formulation matches.'}
            {mode === 'forgot' && 'Enter your username or email address and choose your new password to reset directly.'}
            {mode === 'change' && 'Enter your username or email and choose your new secure password.'}
          </p>
        </div>

        {/* Tab Selector for Quick Switching */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-dermo-sand/80 rounded-2xl border border-dermo-warm text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 px-1 rounded-xl transition-all text-center truncate ${
              mode === 'login'
                ? 'bg-white text-dermo-charcoal font-bold shadow-xs'
                : 'text-stone-500 hover:text-dermo-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 px-1 rounded-xl transition-all text-center truncate ${
              mode === 'register'
                ? 'bg-white text-dermo-charcoal font-bold shadow-xs'
                : 'text-stone-500 hover:text-dermo-charcoal'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className={`py-2 px-1 rounded-xl transition-all text-center truncate ${
              mode === 'forgot'
                ? 'bg-white text-dermo-charcoal font-bold shadow-xs'
                : 'text-stone-500 hover:text-dermo-charcoal'
            }`}
          >
            Forgot
          </button>
          <button
            type="button"
            onClick={() => switchMode('change')}
            className={`py-2 px-1 rounded-xl transition-all text-center truncate ${
              mode === 'change'
                ? 'bg-white text-dermo-charcoal font-bold shadow-xs'
                : 'text-stone-500 hover:text-dermo-charcoal'
            }`}
          >
            Change
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-snug block">{success}</span>
          </div>
        )}

        {/* =========================================================================
            FORM SECTION
        ========================================================================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Sign Up only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-dermo-accent uppercase tracking-wider mb-1.5">
                Full Name / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arun or Jane Doe"
                  className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-dermo-teal transition-all"
                />
              </div>
            </div>
          )}

          {/* Username or Email Address (All modes) */}
          <div>
            <label className="block text-xs font-bold text-dermo-accent uppercase tracking-wider mb-1.5">
              {mode === 'register' ? 'Email Address' : 'Username or Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type={mode === 'register' ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'register' ? 'member@alskincare.ai' : 'e.g. arun1111 or member@alskincare.ai'}
                className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-dermo-teal transition-all"
              />
            </div>
          </div>

          {/* Password (Sign In & Sign Up) */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-dermo-teal hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-dermo-teal transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Current Password (Change Password mode - optional) */}
          {mode === 'change' && (
            <div>
              <label className="block text-xs font-bold text-dermo-accent uppercase tracking-wider mb-1.5">
                Current Password <span className="text-stone-400 font-normal lowercase">(optional if logged in)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Existing password"
                  className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-dermo-teal transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password & Confirm Password (Forgot OR Change Password) */}
          {(mode === 'forgot' || mode === 'change') && (
            <>
              <div>
                <label className="block text-xs font-bold text-dermo-accent uppercase tracking-wider mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New secure password"
                    className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-dermo-teal transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dermo-accent uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-dermo-teal transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-dermo-teal hover:bg-dermo-tealDark text-white transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                Create Free Account
              </>
            ) : mode === 'forgot' ? (
              <>
                <Check className="w-4 h-4" />
                Reset Password & Sign In
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>

        {/* Bottom Helper Navigation */}
        <div className="pt-2 border-t border-dermo-warm/70 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="hover:text-dermo-teal transition-colors font-medium"
              >
                New here? <span className="font-bold underline text-dermo-teal">Create Account</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode('change')}
                className="hover:text-dermo-teal transition-colors font-medium text-stone-500"
              >
                Change Existing Password &rarr;
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="hover:text-dermo-teal transition-colors font-semibold flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
}