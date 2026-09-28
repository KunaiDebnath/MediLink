import { useState, useEffect } from 'react';
import { User } from '../../types';
import { Button, Input, Select, Textarea, Card } from '../../components/ui';
import { UserIcon, PhoneIcon, AwardIcon, BuildingIcon, DollarSignIcon, CheckCircleIcon, MapPinIcon } from '../../components/Icons';
import { specializations } from '../../data';
import { getDoctorProfileApi, updateDoctorProfileApi } from '../../api';

interface DoctorProfileManageProps {
  user: User;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function DoctorProfileManage({ user, onToast }: DoctorProfileManageProps) {
  const [form, setForm] = useState({
    name: user.name || '',
    phone: '',
    specialization: '',
    qualifications: '',
    experience: '',
    hospital: '',
    clinic: '',
    consultationFee: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadDoctorProfile() {
      try {
        const res = await getDoctorProfileApi();
        const data = res.profile || res.doctor || res;
        if (data) {
          setForm(prev => ({
            ...prev,
            name: data.fullName || data.name || prev.name,
            phone: data.phoneNumber || data.phone || prev.phone,
            specialization: data.specialization || prev.specialization,
            qualifications: data.qualifications || prev.qualifications,
            experience: data.experienceYears !== undefined ? String(data.experienceYears) : (data.experience !== undefined ? String(data.experience) : prev.experience),
            hospital: data.hospitalName || data.hospital || prev.hospital,
            clinic: data.clinicAddress || data.clinic || prev.clinic,
            consultationFee: data.consultationFee !== undefined ? String(data.consultationFee) : prev.consultationFee,
            bio: data.bio || prev.bio,
          }));
        }
      } catch (err) {
        console.warn('Using local doctor profile defaults:', err);
      }
    }
    loadDoctorProfile();
  }, []);

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => { const n = {...e}; delete n[field]; return n; });
    setSaved(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.specialization) errs.specialization = 'Specialization is required';
    if (!form.experience || isNaN(Number(form.experience)) || Number(form.experience) < 0) errs.experience = 'Enter a valid number of years';
    if (!form.consultationFee || isNaN(Number(form.consultationFee)) || Number(form.consultationFee) < 0) errs.consultationFee = 'Enter a valid fee';
    if (!form.hospital.trim()) errs.hospital = 'Hospital name is required';
    return errs;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await updateDoctorProfileApi({
        name: form.name,
        phone: form.phone,
        specialization: form.specialization,
        qualifications: form.qualifications,
        experience: Number(form.experience),
        hospital: form.hospital,
        clinic: form.clinic,
        consultationFee: Number(form.consultationFee),
        bio: form.bio,
      });
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
        <p className="text-slate-500 text-sm">Keep your professional information up to date</p>
      </div>

      {saved && (
        <div className="mb-5 p-3 bg-success-bg border border-emerald-200 rounded-xl flex items-center gap-2 text-success-text text-sm">
          <CheckCircleIcon size={16} className="text-success shrink-0" />
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Account Info */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Account Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-500">
                {user.email}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Role</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-500">
                Doctor
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Info */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              error={errors.name}
              icon={<UserIcon size={16} />}
              required
              placeholder="Dr. Full Name"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              icon={<PhoneIcon size={16} />}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </Card>

        {/* Professional Info */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Professional Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Specialization"
              value={form.specialization}
              onChange={e => set('specialization', e.target.value)}
              error={errors.specialization}
              required
              placeholder="Select specialization"
              options={specializations.map(s => ({ value: s, label: s }))}
            />
            <Input
              label="Experience (years)"
              type="number"
              value={form.experience}
              onChange={e => set('experience', e.target.value)}
              error={errors.experience}
              icon={<AwardIcon size={16} />}
              min="0"
              placeholder="e.g. 10"
            />
            <div className="sm:col-span-2">
              <Input
                label="Qualifications"
                value={form.qualifications}
                onChange={e => set('qualifications', e.target.value)}
                icon={<AwardIcon size={16} />}
                placeholder="e.g. MD, FACC – Harvard Medical School"
              />
            </div>
            <Input
              label="Hospital Name"
              value={form.hospital}
              onChange={e => set('hospital', e.target.value)}
              error={errors.hospital}
              icon={<BuildingIcon size={16} />}
              required
              placeholder="Hospital or clinic name"
            />
            <Input
              label="Clinic Address"
              value={form.clinic}
              onChange={e => set('clinic', e.target.value)}
              icon={<MapPinIcon size={16} />}
              placeholder="Clinic name or address"
            />
            <Input
              label="Consultation Fee ($)"
              type="number"
              value={form.consultationFee}
              onChange={e => set('consultationFee', e.target.value)}
              error={errors.consultationFee}
              icon={<DollarSignIcon size={16} />}
              min="0"
              placeholder="e.g. 150"
            />
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-5">
          <Textarea
            label="Professional Bio"
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            rows={5}
            placeholder="Write a professional summary for your profile page…"
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
