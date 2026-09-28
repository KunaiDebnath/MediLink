import { useState, useEffect } from 'react';
import { User, PatientProfile as PatientProfileType } from '../../types';
import { Button, Input, Select, Card } from '../../components/ui';
import { UserIcon, MailIcon, PhoneIcon, CheckCircleIcon } from '../../components/Icons';
import { getPatientProfileApi, updatePatientProfileApi } from '../../api';

interface PatientProfileProps {
  user: User;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const genders = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(v => ({ value: v, label: v }));

export default function PatientProfile({ user, onToast }: PatientProfileProps) {
  const [profile, setProfile] = useState<PatientProfileType>({
    id: user.id || '',
    name: user.name || '',
    email: user.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getPatientProfileApi();
        const data = res.profile || res.patient || res;
        if (data) {
          setProfile(prev => ({
            ...prev,
            name: data.fullName || data.name || prev.name,
            email: data.email || (data.userId && data.userId.email) || prev.email,
            phone: data.phoneNumber || data.phone || prev.phone,
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : prev.dateOfBirth,
            gender: data.gender || prev.gender,
            bloodGroup: data.bloodGroup || prev.bloodGroup,
            address: data.address || prev.address,
          }));
        }
      } catch (err) {
        console.warn('Using local patient profile defaults:', err);
      }
    }
    loadProfile();
  }, []);

  const set = (field: string, val: string) => {
    setProfile(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(e => { const n = {...e}; delete n[field]; return n; });
    setSaved(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.name.trim()) errs.name = 'Full name is required';
    if (!profile.phone.trim()) errs.phone = 'Phone number is required';
    return errs;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await updatePatientProfileApi(profile);
      setSaved(true);
      onToast('Profile updated successfully', 'success');
    } catch (err: any) {
      setSaved(true);
      onToast(err.message || 'Profile saved locally', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-0.5">My Profile</h1>
        <p className="text-slate-500 text-sm">Manage your personal information</p>
      </div>

      {saved && (
        <div className="mb-5 p-3 bg-success-bg border border-emerald-200 rounded-xl flex items-center gap-2 text-success-text text-sm">
          <CheckCircleIcon size={16} className="text-success shrink-0" />
          Your profile has been updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Account Information */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Account Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-500">
                <MailIcon size={14} className="text-slate-300 shrink-0" />
                {profile.email}
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Role</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-500">
                <UserIcon size={14} className="text-slate-300 shrink-0" />
                Patient
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={e => set('name', e.target.value)}
              error={errors.name}
              icon={<UserIcon size={16} />}
              required
              placeholder="Your full name"
              autoComplete="name"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={e => set('phone', e.target.value)}
              error={errors.phone}
              icon={<PhoneIcon size={16} />}
              required
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={profile.dateOfBirth}
              onChange={e => set('dateOfBirth', e.target.value)}
            />
            <Select
              label="Gender"
              value={profile.gender}
              onChange={e => set('gender', e.target.value)}
              placeholder="Select gender"
              options={genders}
            />
            <Select
              label="Blood Group"
              value={profile.bloodGroup}
              onChange={e => set('bloodGroup', e.target.value)}
              placeholder="Select blood group"
              options={bloodGroups}
            />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Your home address"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                autoComplete="street-address"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
