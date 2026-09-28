import { useState } from 'react';
import { Page, User } from '../types';
import { Button, Input, Select } from '../components/ui';
import { MailIcon, PhoneIcon, UserIcon, EyeIcon, EyeOffIcon, CrossIcon, AwardIcon } from '../components/Icons';
import { specializations } from '../data';

import { registerDoctorApi, setToken } from '../api';

interface DoctorRegisterProps {
  navigate: (page: Page) => void;
  onLogin: (user: User) => void;
}

export default function DoctorRegister({ navigate, onLogin }: DoctorRegisterProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', specialization: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.phone) errs.phone = 'Phone number is required';
    if (!form.specialization) errs.specialization = 'Please select your specialization';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await registerDoctorApi({
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        password: form.password,
      });
      if (res.token) {
        setToken(res.token);
      }
      const loggedUser: User = res.user || {
        id: res.id || res._id || 'd_new',
        name: form.name,
        email: form.email,
        role: 'doctor',
      };
      onLogin(loggedUser);
    } catch (err: any) {
      setServerError(err.message || 'Doctor registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-brand-700 to-slate-800 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" aria-hidden="true"
          style={{ backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%), linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <CrossIcon size={18} className="text-white" />
          </div>
          MediLink
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Grow your practice.</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Join MediLink as a doctor and connect with patients who need your expertise. Manage your appointments efficiently.
          </p>
          <ul className="space-y-3">
            {['Reach more patients online', 'Manage your appointment calendar', 'Set your availability flexibly', 'Professional profile & reviews'].map(item => (
              <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-300 text-xs">✓</div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-slate-400 text-sm">Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-white font-medium underline">Sign in</button>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 mb-4 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <button onClick={() => navigate('landing')} className="lg:hidden flex items-center gap-2 font-bold text-brand-700 mb-4">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <CrossIcon size={16} className="text-white" />
            </div>
            MediLink
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Doctor Account</h1>
          <p className="text-slate-500 text-sm">Join MediLink to expand your practice</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-danger-bg border border-red-200 rounded-lg text-sm text-danger-text">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            placeholder="Dr. John Smith"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
            icon={<UserIcon size={16} />}
            required
            autoComplete="name"
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@hospital.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={errors.email}
            icon={<MailIcon size={16} />}
            required
            autoComplete="email"
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            error={errors.phone}
            icon={<PhoneIcon size={16} />}
            required
          />
          <Select
            label="Specialization"
            value={form.specialization}
            onChange={e => set('specialization', e.target.value)}
            error={errors.specialization}
            required
            placeholder="Select your specialization"
            options={specializations.map(s => ({ value: s, label: s }))}
          />

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Password<span className="text-danger ml-0.5">*</span></label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                autoComplete="new-password"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 bg-white transition-colors focus:outline-none
                  ${errors.password ? 'border-danger focus:ring-2 focus:ring-danger/20' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'}`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPw ? 'Hide' : 'Show'}>
                {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Confirm Password<span className="text-danger ml-0.5">*</span></label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                autoComplete="new-password"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 bg-white transition-colors focus:outline-none
                  ${errors.confirm ? 'border-danger focus:ring-2 focus:ring-danger/20' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showConfirm ? 'Hide' : 'Show'}>
                {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-danger">{errors.confirm}</p>}
          </div>

          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100 flex gap-2 text-xs text-brand-700">
            <AwardIcon size={14} className="shrink-0 mt-0.5" />
            Your profile will be reviewed before being listed. Please complete your profile after registration.
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Doctor Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-brand-600 font-medium hover:text-brand-700">Sign in</button>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Looking for a doctor?{' '}
          <button onClick={() => navigate('patient-register')} className="text-brand-600 font-medium hover:text-brand-700">Register as a Patient</button>
        </p>
      </div>
    </div>
  );
}
