import { useState } from 'react';
import { Page, User } from '../types';
import { Button, Input } from '../components/ui';
import { MailIcon, PhoneIcon, UserIcon, EyeIcon, EyeOffIcon, CrossIcon } from '../components/Icons';

import { registerPatientApi, setToken } from '../api';

interface PatientRegisterProps {
  navigate: (page: Page) => void;
  onLogin: (user: User) => void;
}

export default function PatientRegister({ navigate, onLogin }: PatientRegisterProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (form.name.trim().split(' ').length < 2) errs.name = 'Please enter your full name';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.phone) errs.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-().]{7,}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
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
      const res = await registerPatientApi({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (res.token) {
        setToken(res.token);
      }
      const loggedUser: User = res.user || {
        id: res.id || res._id || 'p_new',
        name: form.name,
        email: form.email,
        role: 'patient',
      };
      onLogin(loggedUser);
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
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
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-teal-600 to-brand-700 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <CrossIcon size={18} className="text-white" />
          </div>
          MediLink
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Find your doctor today.</h2>
          <p className="text-teal-100 text-sm leading-relaxed mb-8">
            Create your patient account and start booking appointments with top doctors in minutes.
          </p>
          <ul className="space-y-3">
            {['Search verified doctors', 'View real-time availability', 'Book appointments instantly', 'Track your health journey'].map(item => (
              <li key={item} className="flex items-center gap-2 text-teal-100 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">✓</div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-teal-300 text-sm">Already have an account?{' '}
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Patient Account</h1>
          <p className="text-slate-500 text-sm">Join MediLink to connect with doctors near you</p>
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
            placeholder="John Smith"
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
            placeholder="you@example.com"
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
            autoComplete="tel"
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
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
            {form.password && !errors.password && (
              <div className="flex gap-1 mt-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${
                    form.password.length >= 12 ? 'bg-success' :
                    form.password.length >= 8 && i < 3 ? 'bg-warning' :
                    i < 2 && form.password.length >= 4 ? 'bg-danger' : 'bg-slate-200'
                  }`} />
                ))}
              </div>
            )}
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
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? 'Hide' : 'Show'}>
                {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-danger">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Patient Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-brand-600 font-medium hover:text-brand-700">Sign in</button>
        </p>
        <p className="mt-3 text-center text-sm text-slate-500">
          Are you a doctor?{' '}
          <button onClick={() => navigate('doctor-register')} className="text-brand-600 font-medium hover:text-brand-700">Register as a Doctor</button>
        </p>
      </div>
    </div>
  );
}
