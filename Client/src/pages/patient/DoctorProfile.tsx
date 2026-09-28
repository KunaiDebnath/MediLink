import { useState, useEffect } from 'react';
import { Page, Doctor } from '../../types';
import { Button, Avatar, Card } from '../../components/ui';
import {
  MapPinIcon, StarIcon, AwardIcon, BuildingIcon, DollarSignIcon,
  PhoneIcon, MailIcon, CalendarIcon, ChevronLeftIcon,
} from '../../components/Icons';
import { DAYS } from '../../data';
import { getDoctorsApi } from '../../api';

interface DoctorProfileProps {
  doctorId: string;
  navigate: (page: Page, params?: { doctorId?: string }) => void;
}

export default function DoctorProfile({ doctorId, navigate }: DoctorProfileProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctor() {
      setLoading(true);
      try {
        const res = await getDoctorsApi();
        const docs = Array.isArray(res) ? res : res.doctors || [];
        const found = docs.find((d: any) => d._id === doctorId || d.id === doctorId);
        if (found) {
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
            availability: {
              Monday: found.availability?.monday || found.availability?.Monday || null,
              Tuesday: found.availability?.tuesday || found.availability?.Tuesday || null,
              Wednesday: found.availability?.wednesday || found.availability?.Wednesday || null,
              Thursday: found.availability?.thursday || found.availability?.Thursday || null,
              Friday: found.availability?.friday || found.availability?.Friday || null,
              Saturday: found.availability?.saturday || found.availability?.Saturday || null,
              Sunday: found.availability?.sunday || found.availability?.Sunday || null,
            },
            rating: found.rating || 5.0,
            reviewCount: found.reviewCount || 0,
          });
        }
      } catch (err) {
        console.warn('Failed to load doctor from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, [doctorId]);

  if (loading) {
    return <div className="px-8 py-16 text-center text-slate-400">Loading doctor profile...</div>;
  }

  if (!doctor) {
    return (
      <div className="px-8 py-16 text-center">
        <p className="text-slate-600 mb-4">Doctor not found.</p>
        <Button onClick={() => navigate('find-doctors')}>Find Doctors</Button>
      </div>
    );
  }

  const availableDays = DAYS.filter(d => doctor?.availability && (doctor.availability[d] || (doctor.availability as any)[d.toLowerCase()]));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('find-doctors')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ChevronLeftIcon size={16} />
        Back to Find Doctors
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 text-center">
            <Avatar name={doctor.name} size="xl" className="mx-auto mb-4" />
            <h1 className="text-lg font-bold text-slate-900">{doctor.name}</h1>
            <p className="text-brand-600 font-medium text-sm mb-3">{doctor.specialization}</p>

            <div className="flex items-center justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(s => (
                <StarIcon
                  key={s}
                  size={14}
                  className={s <= Math.round(doctor.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                />
              ))}
              <span className="text-sm font-semibold text-slate-700 ml-1">{doctor.rating}</span>
              <span className="text-xs text-slate-400">({doctor.reviewCount})</span>
            </div>

            <Button className="w-full" onClick={() => navigate('book-appointment', { doctorId: doctor.id })}>
              Book Appointment
            </Button>
          </Card>

          {/* Contact */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <PhoneIcon size={14} className="text-slate-400 shrink-0" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon size={14} className="text-slate-400 shrink-0" />
                <span>{doctor.location}</span>
              </div>
            </div>
          </Card>

          {/* Availability summary */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Weekly Availability</h3>
            <div className="space-y-1.5">
              {DAYS.map(day => {
                const avail = doctor?.availability ? (doctor.availability[day] || (doctor.availability as any)[day.toLowerCase()]) : null;
                return (
                  <div key={day} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 w-24">{day}</span>
                    {avail ? (
                      <span className="text-slate-800 font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                        {avail.start} – {avail.end}
                      </span>
                    ) : (
                      <span className="text-slate-300">Not available</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3">About</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          </Card>

          {/* Professional Info */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Professional Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 shrink-0">
                  <AwardIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Experience</p>
                  <p className="text-sm font-semibold text-slate-900">{doctor.experience} Years</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 shrink-0">
                  <StarIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Qualifications</p>
                  <p className="text-sm font-semibold text-slate-900">{doctor.qualifications}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 shrink-0">
                  <BuildingIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Hospital</p>
                  <p className="text-sm font-semibold text-slate-900">{doctor.hospital}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 shrink-0">
                  <MapPinIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Clinic</p>
                  <p className="text-sm font-semibold text-slate-900">{doctor.clinic}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 bg-success-bg rounded-lg flex items-center justify-center text-success shrink-0">
                  <DollarSignIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Consultation Fee</p>
                  <p className="text-sm font-semibold text-slate-900">${doctor.consultationFee} per visit</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Available Days</p>
                  <p className="text-sm font-semibold text-slate-900">{availableDays.length} days/week</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Book CTA */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold mb-0.5">Ready to book?</p>
              <p className="text-brand-200 text-sm">Select a date and time that works for you</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('book-appointment', { doctorId: doctor.id })}
              className="shrink-0 font-semibold !bg-white !text-brand-700 hover:!bg-brand-50"
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
