import { useState, useEffect } from 'react';
import { Page, User, Doctor } from '../../types';
import { Button, Textarea, Modal, Card } from '../../components/ui';
import { CalendarIcon, ClockIcon, CheckCircleIcon, DollarSignIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/Icons';
import { getDoctorSlotsApi, bookAppointmentApi, getDoctorsApi } from '../../api';

interface BookAppointmentProps {
  doctorId: string;
  user: User;
  navigate: (page: Page) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function BookAppointment({ doctorId, user, navigate, onToast }: BookAppointmentProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [apiSlots, setApiSlots] = useState<string[]>([]);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch doctor info from DB
  useEffect(() => {
    async function loadDoctor() {
      setLoadingDoctor(true);
      try {
        const res = await getDoctorsApi();
        const docs = Array.isArray(res) ? res : res.doctors || [];
        const found = docs.find((d: any) => d._id === doctorId || d.id === doctorId);
        if (found) {
          const rawAvail = found.availability || {};
          const normalizedAvail: Record<string, { start: string; end: string } | null> = {
            Monday: rawAvail.monday || rawAvail.Monday || (rawAvail.Monday?.start ? rawAvail.Monday : null) || null,
            Tuesday: rawAvail.tuesday || rawAvail.Tuesday || (rawAvail.Tuesday?.start ? rawAvail.Tuesday : null) || null,
            Wednesday: rawAvail.wednesday || rawAvail.Wednesday || (rawAvail.Wednesday?.start ? rawAvail.Wednesday : null) || null,
            Thursday: rawAvail.thursday || rawAvail.Thursday || (rawAvail.Thursday?.start ? rawAvail.Thursday : null) || null,
            Friday: rawAvail.friday || rawAvail.Friday || (rawAvail.Friday?.start ? rawAvail.Friday : null) || null,
            Saturday: rawAvail.saturday || rawAvail.Saturday || (rawAvail.Saturday?.start ? rawAvail.Saturday : null) || null,
            Sunday: rawAvail.sunday || rawAvail.Sunday || (rawAvail.Sunday?.start ? rawAvail.Sunday : null) || null,
          };

          setDoctor({
            id: found._id || found.id || doctorId,
            name: found.fullName || found.name || 'Doctor',
            email: found.email || (found.userId && found.userId.email) || '',
            phone: found.phoneNumber || found.phone || '',
            specialization: found.specialization || 'General',
            experience: found.experienceYears !== undefined ? Number(found.experienceYears) : (found.experience ? Number(found.experience) : 0),
            qualifications: found.qualifications || 'MD',
            hospital: found.hospitalName || found.hospital || 'Medical Center',
            clinic: found.clinicAddress || found.clinic || '',
            location: found.clinicAddress || found.location || found.hospitalName || 'City Hospital',
            consultationFee: found.consultationFee !== undefined ? Number(found.consultationFee) : 0,
            bio: found.bio || '',
            availability: normalizedAvail,
            rating: found.rating || 5.0,
            reviewCount: found.reviewCount || 0,
          });
        }
      } catch (err) {
        console.warn('Failed to load doctor from API:', err);
      } finally {
        setLoadingDoctor(false);
      }
    }
    loadDoctor();
  }, [doctorId]);

  // Fetch available slots from DB controller for selected date
  useEffect(() => {
    if (!selectedDate || !doctorId) {
      setApiSlots([]);
      return;
    }
    async function loadSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await getDoctorSlotsApi(doctorId, selectedDate);
        if (res && res.slots && Array.isArray(res.slots) && res.slots.length > 0) {
          setApiSlots(res.slots);
        } else if (Array.isArray(res) && res.length > 0) {
          setApiSlots(res);
        } else {
          // Generate fallback slots if doctor has set hours for this day of week
          const dow = getDayOfWeek(selectedDate);
          const dayAvail = doctor?.availability?.[dow] || (doctor?.availability as any)?.[dow.toLowerCase()];
          if (dayAvail && dayAvail.start && dayAvail.end) {
            const [sh, sm] = dayAvail.start.split(':').map(Number);
            const [eh, em] = dayAvail.end.split(':').map(Number);
            const generated: string[] = [];
            let currentMin = sh * 60 + sm;
            const endMin = eh * 60 + em;
            while (currentMin + 30 <= endMin) {
              const h = Math.floor(currentMin / 60);
              const m = currentMin % 60;
              const period = h >= 12 ? 'PM' : 'AM';
              const dispH = h % 12 === 0 ? 12 : h % 12;
              const dispM = m === 0 ? '00' : String(m).padStart(2, '0');
              generated.push(`${dispH}:${dispM} ${period}`);
              currentMin += 30;
            }
            setApiSlots(generated.length ? generated : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']);
          } else {
            setApiSlots([]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic slots from backend:', err);
        const dow = getDayOfWeek(selectedDate);
        const dayAvail = doctor?.availability?.[dow] || (doctor?.availability as any)?.[dow.toLowerCase()];
        if (dayAvail && dayAvail.start && dayAvail.end) {
          const [sh, sm] = dayAvail.start.split(':').map(Number);
          const [eh, em] = dayAvail.end.split(':').map(Number);
          const generated: string[] = [];
          let currentMin = sh * 60 + sm;
          const endMin = eh * 60 + em;
          while (currentMin + 30 <= endMin) {
            const h = Math.floor(currentMin / 60);
            const m = currentMin % 60;
            const period = h >= 12 ? 'PM' : 'AM';
            const dispH = h % 12 === 0 ? 12 : h % 12;
            const dispM = m === 0 ? '00' : String(m).padStart(2, '0');
            generated.push(`${dispH}:${dispM} ${period}`);
            currentMin += 30;
          }
          setApiSlots(generated.length ? generated : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']);
        } else {
          setApiSlots([]);
        }
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [doctorId, selectedDate, doctor]);

  const calDays = getCalendarDays(calYear, calMonth);

  const getDateString = (day: number) =>
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  };

  const isDateAvailable = (day: number) => {
    const dateStr = getDateString(day);
    const d = new Date(dateStr + 'T23:59:59');
    if (d < today) return false;
    const dow = getDayOfWeek(dateStr);
    const avail = doctor?.availability?.[dow] || (doctor?.availability as any)?.[dow.toLowerCase()];
    return !!(avail && (avail.start || avail.end));
  };

  const timeSlots: string[] = apiSlots;

  const selectDate = (day: number) => {
    const dateStr = getDateString(day);
    if (!isDateAvailable(day)) return;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    if (errors.date) setErrors(e => { const n = {...e}; delete n.date; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedDate) errs.date = 'Please select a date';
    if (!selectedTime) errs.time = 'Please select a time slot';
    if (!reason.trim()) errs.reason = 'Please describe the reason for your visit';
    else if (reason.trim().length < 10) errs.reason = 'Please provide more detail (at least 10 characters)';
    return errs;
  };

  const handleBooking = async () => {
    if (!doctor) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBooking(true);
    setServerError('');
    try {
      await bookAppointmentApi({
        doctorId: doctor.id || doctorId,
        date: selectedDate!,
        time: selectedTime!,
        reason: reason.trim(),
        patientName: user.name,
        patientEmail: user.email,
        patientId: user.id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        doctorHospital: doctor.hospital,
        fee: doctor.consultationFee,
      });
      setBooking(false);
      setConfirmed(true);
      onToast('Appointment request submitted successfully!', 'success');
    } catch (err: any) {
      setBooking(false);
      setServerError(err.message || 'Booking failed');
      onToast(err.message || 'Booking failed', 'error');
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (loadingDoctor) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-3xl mx-auto text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-3xl mx-auto text-center">
        <p className="text-slate-700 font-semibold mb-2">Doctor not found</p>
        <Button onClick={() => navigate('find-doctors')}>Back to Find Doctors</Button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('doctor-profile')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ChevronLeftIcon size={16} />
        Back to Doctor Profile
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Book an Appointment</h1>

      {/* Doctor summary */}
      <Card className="p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0">
          {doctor.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{doctor.name}</p>
          <p className="text-brand-600 text-sm">{doctor.specialization}</p>
          <p className="text-slate-500 text-xs">{doctor.hospital}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400 mb-0.5">Consultation</p>
          <p className="font-bold text-slate-900 text-lg">${doctor.consultationFee}</p>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Date picker */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <CalendarIcon size={16} className="text-brand-500" />
            Select Date
          </h2>

          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-0.5">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dateStr = getDateString(day);
              const available = isDateAvailable(day);
              const selected = selectedDate === dateStr;
              const isPast = new Date(dateStr) < today;
              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  disabled={!available}
                  aria-label={`${MONTH_NAMES[calMonth]} ${day}`}
                  aria-selected={selected}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors font-medium
                    ${selected ? 'bg-brand-600 text-white shadow-sm' :
                      available ? 'text-slate-800 hover:bg-brand-50 hover:text-brand-700' :
                      isPast ? 'text-slate-200 cursor-not-allowed' :
                      'text-slate-300 cursor-not-allowed'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {errors.date && <p className="text-xs text-danger mt-2">{errors.date}</p>}

          {selectedDate && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Selected: <span className="font-medium text-slate-800">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </p>
          )}
        </Card>

        {/* Time slots */}
        {selectedDate && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <ClockIcon size={16} className="text-brand-500" />
              Available Time Slots
            </h2>

            {loadingSlots ? (
              <div className="py-6 text-center">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Checking availability...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No slots available for this day.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map(slot => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedTime(slot);
                        if (errors.time) setErrors(e => { const n = {...e}; delete n.time; return n; });
                      }}
                      aria-pressed={isSelected}
                      aria-label={slot}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors
                        ${isSelected ? 'border-brand-600 bg-brand-600 text-white shadow-sm' :
                          'border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700'
                        }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.time && <p className="text-xs text-danger mt-2">{errors.time}</p>}
          </Card>
        )}

        {/* Reason */}
        <Card className="p-5">
          <Textarea
            label="Reason for Visit"
            placeholder="Describe your symptoms or reason for this appointment…"
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              if (errors.reason) setErrors(e => { const n = {...e}; delete n.reason; return n; });
            }}
            error={errors.reason}
            rows={4}
            required
          />
        </Card>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm">
            <p className="font-semibold text-brand-800 mb-2">Appointment Summary</p>
            <div className="space-y-1 text-brand-700">
              <div className="flex justify-between"><span>Doctor</span><span className="font-medium">{doctor.name}</span></div>
              <div className="flex justify-between"><span>Date</span><span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
              <div className="flex justify-between"><span>Time</span><span className="font-medium">{selectedTime}</span></div>
              <div className="flex justify-between"><span>Fee</span><span className="font-medium">${doctor.consultationFee}</span></div>
            </div>
          </div>
        )}

        <Button className="w-full" size="lg" onClick={handleBooking} loading={booking}>
          Confirm Appointment
        </Button>
      </div>

      {/* Success modal */}
      <Modal isOpen={confirmed} onClose={() => { setConfirmed(false); navigate('patient-appointments'); }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Appointment Booked!</h3>
          <p className="text-slate-500 text-sm mb-4">Your appointment has been requested successfully.</p>

          <div className="bg-slate-50 rounded-xl p-4 text-sm text-left mb-5 space-y-2">
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Doctor</span>
              <span className="font-medium">{doctor.name}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="text-slate-500">Time</span>
              <span className="font-medium">{selectedTime ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning-text">
                <ClockIcon size={11} /> Pending
              </span>
            </div>
          </div>

          <Button className="w-full" onClick={() => { setConfirmed(false); navigate('patient-appointments'); }}>
            View My Appointments
          </Button>
        </div>
      </Modal>
    </div>
  );
}
