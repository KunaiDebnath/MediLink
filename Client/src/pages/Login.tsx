import { useState } from 'react';
import { Page, User } from '../types';
import { Button, Input, Divider } from '../components/ui';
import { MailIcon, EyeIcon, EyeOffIcon, CrossIcon } from '../components/Icons';

import { loginApi, setToken, getPatientProfileApi, getDoctorProfileApi } from '../api';

interface LoginProps {
  navigate: (page: Page) => void;
  onLogin: (user: User) => void;
}

export default function Login({ navigate, onLogin }: LoginProps) {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await loginApi({ email: form.email, password: form.password });
      if (res.token) {
        setToken(res.token);
      }
      // Helper to parse JWT payload if present
      const decodeJwt = (token: string) => {
        try {
          const base64Url = token.split('.')[1];
          if (!base64Url) return null;
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        } catch {
          return null;
        }
      };

      const tokenPayload = res.token ? decodeJwt(res.token) : null;
      const rawRole =
        res.role ||
        res.user?.role ||
        res.data?.user?.role ||
        res.data?.role ||
        res.userType ||
        tokenPayload?.role ||
        tokenPayload?.userType ||
        tokenPayload?.type ||
        '';

      let role: 'doctor' | 'patient' | '' =
        typeof rawRole === 'string' && rawRole.toLowerCase().includes('doc')
          ? 'doctor'
          : typeof rawRole === 'string' && rawRole.toLowerCase().includes('pat')
          ? 'patient'
          : '';

      let fullName = '';
      let profileId = res.user?._id || res.user?.id || res.data?.user?._id || res.data?.user?.id || tokenPayload?.id || tokenPayload?._id || '';

      // If role is still undetermined, test doctor profile endpoint
      if (!role) {
        try {
          const docTest = await getDoctorProfileApi();
          const docData = docTest?.doctor || docTest?.profile || docTest?.data || docTest;
          if (docData && (docData._id || docData.fullName || docData.specialization)) {
            role = 'doctor';
            fullName = docData.fullName || fullName;
            profileId = docData._id || profileId;
          }
        } catch {
          role = 'patient';
        }
      }

      if (!role) {
        role = form.email.toLowerCase().includes('doctor') ? 'doctor' : 'patient';
      }

      // Fetch profile based on detected role
      try {
        if (role === 'doctor') {
          const docRes = await getDoctorProfileApi();
          const doc = docRes.doctor || docRes.profile || docRes.data || docRes;
          if (doc && doc.fullName) {
            fullName = doc.fullName;
            profileId = doc._id || doc.id || profileId;
          }
        } else {
          const patRes = await getPatientProfileApi();
          const pat = patRes.patient || patRes.profile || patRes.data || patRes;
          if (pat && pat.fullName) {
            fullName = pat.fullName;
            profileId = pat._id || pat.id || profileId;
          }
        }
      } catch {
        // Fallback gracefully
      }

      const rawName =
        fullName ||
        res.user?.fullName ||
        res.user?.name ||
        res.data?.user?.fullName ||
        res.data?.user?.name ||
        tokenPayload?.name ||
        tokenPayload?.fullName ||
        form.email.split('@')[0];

      const loggedUser: User = {
        id: profileId,
        name: rawName,
        email: res.user?.email || res.data?.user?.email || form.email,
        role: role as 'doctor' | 'patient',
      };
      onLogin(loggedUser);
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please check your credentials and backend server.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <CrossIcon size={18} className="text-white" />
          </div>
          MediLink
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Your health journey<br />starts here.
          </h2>
          <p className="text-brand-200 text-base leading-relaxed">
            Connect with verified doctors, manage appointments, and take control of your healthcare — all in one trusted platform.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-brand-300">
          <span>1,200+ Doctors</span>
          <span>50K+ Patients</span>
          <span>30+ Specializations</span>
        </div>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your MediLink account</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-danger-bg border border-red-200 rounded-lg text-sm text-danger-text">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={errors.email}
            icon={<MailIcon size={16} />}
            required
            autoComplete="email"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Password<span className="text-danger ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                autoComplete="current-password"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 bg-white transition-colors focus:outline-none
                  ${errors.password
                    ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={e => set('remember', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-600">Remember me</span>
            </label>
            <button type="button" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button onClick={() => navigate('patient-register')} className="text-brand-600 font-medium hover:text-brand-700">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
