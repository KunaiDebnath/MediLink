import { useState, useEffect } from 'react';
import { Button, Card } from '../../components/ui';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon } from '../../components/Icons';
import { DAYS } from '../../data';
import { getDoctorProfileApi, updateDoctorAvailabilityApi } from '../../api';

interface DoctorAvailabilityProps {
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface DaySlot {
  enabled: boolean;
  start: string;
  end: string;
}

const defaultSlot: DaySlot = { enabled: false, start: '09:00', end: '17:00' };

export const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  const hh = String(h).padStart(2, '0');
  TIME_OPTIONS.push(`${hh}:00`);
  TIME_OPTIONS.push(`${hh}:30`);
}

export function formatTimeDisplay(timeStr: string) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const dispH = h % 12 === 0 ? 12 : h % 12;
  return `${dispH}:${m} ${period}`;
}

function initAvailability(): Record<string, DaySlot> {
  return Object.fromEntries(
    DAYS.map(day => [day, { ...defaultSlot }])
  );
}

export default function DoctorAvailability({ onToast }: DoctorAvailabilityProps) {
  const [schedule, setSchedule] = useState<Record<string, DaySlot>>(initAvailability);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadDoctorAvailability() {
      try {
        const res = await getDoctorProfileApi();
        const data = res.profile || res.doctor || res;
        if (data && (data.availability || data)) {
          const availSource = data.availability || data;
          const loaded: Record<string, DaySlot> = {};
          DAYS.forEach(day => {
            const avail =
              availSource[day] ||
              availSource[day.toLowerCase()] ||
              availSource[day.toUpperCase()];
            loaded[day] = (avail && avail.start && avail.end)
              ? { enabled: true, start: avail.start, end: avail.end }
              : { ...defaultSlot };
          });
          setSchedule(loaded);
        }
      } catch (err) {
        console.warn('Using default availability:', err);
      }
    }
    loadDoctorAvailability();
  }, []);

  const setDay = (day: string, field: keyof DaySlot, value: string | boolean) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    if (errors[day]) setErrors(e => { const n = {...e}; delete n[day]; return n; });
    setSaved(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    DAYS.forEach(day => {
      const slot = schedule[day];
      if (!slot.enabled) return;
      if (!slot.start) { errs[day] = 'Start time is required'; return; }
      if (!slot.end) { errs[day] = 'End time is required'; return; }
      if (slot.start >= slot.end) errs[day] = 'Start time must be before end time';
    });
    return errs;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    const formattedAvail: Record<string, { start: string; end: string } | null> = {};
    DAYS.forEach(day => {
      const slot = schedule[day];
      if (slot.enabled && slot.start && slot.end) {
        formattedAvail[day.toLowerCase()] = { start: slot.start, end: slot.end };
      } else {
        formattedAvail[day.toLowerCase()] = null;
      }
    });

    try {
      await updateDoctorAvailabilityApi(formattedAvail);
      setSaved(true);
      onToast('Availability updated and saved to profile!', 'success');
    } catch (err: any) {
      setSaved(false);
      onToast(err.message || 'Failed to save availability to backend server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = DAYS.filter(d => schedule[d].enabled).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Manage Availability</h1>
        <p className="text-slate-500 text-sm">Set your weekly working hours for patient appointments</p>
      </div>

      {saved && (
        <div className="mb-5 p-3 bg-success-bg border border-emerald-200 rounded-xl flex items-center gap-2 text-success-text text-sm">
          <CheckCircleIcon size={16} className="text-success shrink-0" />
          Availability updated. Patients can now book within your new schedule.
        </div>
      )}

      {/* Summary bar */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-brand-700">
          <ClockIcon size={16} />
          <span>
            <strong>{enabledCount}</strong> working {enabledCount === 1 ? 'day' : 'days'} per week
          </span>
        </div>
        <span className="text-xs text-brand-500">30-minute appointment slots</span>
      </div>

      <form onSubmit={handleSave}>
        <Card className="overflow-hidden mb-5">
          <div className="divide-y divide-slate-50">
            {DAYS.map(day => {
              const slot = schedule[day];
              return (
                <div key={day} className={`px-5 py-4 transition-colors ${slot.enabled ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer" style={{ minWidth: '7rem' }}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={slot.enabled}
                        onClick={() => setDay(day, 'enabled', !slot.enabled)}
                        className={`relative rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 outline-none flex-shrink-0
                          ${slot.enabled ? 'bg-brand-600' : 'bg-slate-200'}`}
                        style={{ width: 40, height: 22 }}
                        aria-label={`${slot.enabled ? 'Disable' : 'Enable'} ${day}`}
                      >
                        <span
                          className="absolute top-0.5 bg-white rounded-full shadow-sm transition-transform"
                          style={{ width: 18, height: 18, left: 2, transform: slot.enabled ? 'translateX(18px)' : 'translateX(0)' }}
                        />
                      </button>
                      <span className={`text-sm font-medium w-20 ${slot.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                        {day}
                      </span>
                    </label>

                    {slot.enabled ? (
                      <div className="flex items-center gap-3 flex-1 flex-wrap">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-xs font-medium text-slate-500" htmlFor={`start-${day}`}>Start Time</label>
                          <select
                            id={`start-${day}`}
                            value={slot.start}
                            onChange={e => setDay(day, 'start', e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors cursor-pointer"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>
                                {formatTimeDisplay(time)} ({time})
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-slate-300 mt-4 text-base font-bold">→</span>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-xs font-medium text-slate-500" htmlFor={`end-${day}`}>End Time</label>
                          <select
                            id={`end-${day}`}
                            value={slot.end}
                            onChange={e => setDay(day, 'end', e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors cursor-pointer"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>
                                {formatTimeDisplay(time)} ({time})
                              </option>
                            ))}
                          </select>
                        </div>
                        {slot.start && slot.end && slot.start < slot.end && (
                          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mt-4">
                            {Math.round((
                              (parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1])) -
                              (parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]))
                            ) / 30)} slots (30m each)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Not available</span>
                    )}
                  </div>

                  {errors[day] && (
                    <div className="flex items-center gap-1.5 text-xs text-danger mt-2 ml-0 sm:ml-36">
                      <AlertCircleIcon size={12} />
                      {errors[day]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Save Availability
          </Button>
        </div>
      </form>
    </div>
  );
}
