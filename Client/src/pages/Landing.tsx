import { Page } from '../types';
import { Button } from '../components/ui';
import {
  SearchIcon, CalendarIcon, CheckCircleIcon, ArrowRightIcon,
  UserIcon, StarIcon, HeartPulseIcon, ShieldIcon,
} from '../components/Icons';

interface LandingProps {
  navigate: (page: Page) => void;
}


const features = [
  {
    icon: <SearchIcon size={22} />,
    title: 'Doctor Search',
    desc: 'Find the right specialist by name, specialization, or location.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: <CalendarIcon size={22} />,
    title: 'Real-time Availability',
    desc: 'View up-to-date appointment slots and choose what works for you.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: <CheckCircleIcon size={22} />,
    title: 'Easy Booking',
    desc: 'Book confirmed appointments in minutes, from any device.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: <UserIcon size={22} />,
    title: 'Patient Dashboard',
    desc: 'Track all your appointments, history, and health providers in one place.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: <StarIcon size={22} />,
    title: 'Doctor Dashboard',
    desc: 'Manage appointments, set availability, and stay organized effortlessly.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <HeartPulseIcon size={22} />,
    title: 'Status Tracking',
    desc: 'Real-time appointment status updates for both patients and doctors.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const steps = [
  {
    num: '01',
    title: 'Find a Doctor',
    desc: 'Search by specialization, location, experience, or consultation fee to find the right doctor for your needs.',
    icon: <SearchIcon size={24} />,
    color: 'bg-brand-600',
  },
  {
    num: '02',
    title: 'Choose a Time',
    desc: 'Browse the doctor\'s weekly availability and pick a date and time slot that suits your schedule.',
    icon: <CalendarIcon size={24} />,
    color: 'bg-teal-600',
  },
  {
    num: '03',
    title: 'Book Your Appointment',
    desc: 'Confirm your appointment with a brief reason for your visit. Track status from your personal dashboard.',
    icon: <CheckCircleIcon size={24} />,
    color: 'bg-emerald-600',
  },
];

const stats = [
  { value: '1,200+', label: 'Verified Doctors' },
  { value: '50K+', label: 'Patients Served' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '30+', label: 'Specializations' },
];

export default function Landing({ navigate }: LandingProps) {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50/30 pt-24 pb-20">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-100/40 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-12 left-0 w-64 h-64 rounded-full bg-teal-100/40 blur-2xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <HeartPulseIcon size={14} />
                Healthcare, simplified
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
                Find the right doctor.{' '}
                <span className="text-brand-600">Book the right time.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                MediLink makes it simple to discover doctors, check availability, and manage appointments — all in one trusted platform.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Button size="lg" onClick={() => navigate('find-doctors')}>
                  Find a Doctor
                  <ArrowRightIcon size={16} />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('patient-register')}>
                  Get Started Free
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ShieldIcon size={16} className="text-brand-400" />
                Trusted by thousands of patients and doctors
              </div>
            </div>

            {/* Right: Hero visual */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-white rounded-2xl shadow-xl border border-brand-100 p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">SM</div>
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Sarah Mitchell</p>
                      <p className="text-sm text-brand-600">Cardiologist</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-sm font-medium text-amber-500">
                      <StarIcon size={14} className="fill-amber-400 text-amber-400" />
                      4.9
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'].map(t => (
                      <button key={t} className={`text-xs py-2 rounded-lg border font-medium transition-colors
                        ${t === '10:30 AM'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <button className="w-full bg-brand-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
                    Confirm Appointment
                  </button>
                </div>

                {/* Floating badge 1 */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2 flex items-center gap-2 z-20">
                  <div className="w-7 h-7 rounded-full bg-success-bg flex items-center justify-center">
                    <CheckCircleIcon size={14} className="text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Appointment Confirmed</p>
                    <p className="text-xs text-slate-400">Today at 10:30 AM</p>
                  </div>
                </div>

                {/* Floating badge 2 */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2 z-20">
                  <p className="text-xs text-slate-500 mb-0.5">Doctors available</p>
                  <p className="text-lg font-bold text-brand-600">1,200+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-brand-600 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold mb-1">{s.value}</p>
                <p className="text-brand-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-3xl font-bold text-slate-900">Book your appointment in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-200 z-0" style={{ width: 'calc(100% - 4rem)', left: '4.5rem' }} />
                )}
                <div className="relative z-10 flex flex-col items-start">
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-300 mb-1">{step.num}</span>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-2">Platform features</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need, in one place</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              MediLink is designed for both patients and doctors — making every step of the appointment process seamless.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 bg-white">
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your healthcare?</h2>
          <p className="text-brand-200 text-base mb-8">Join MediLink today and connect with the right doctor, at the right time.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" variant="secondary" className="!bg-white !text-brand-700 font-bold hover:!bg-brand-50 shadow-md" onClick={() => navigate('patient-register')}>
              Create Patient Account
            </Button>
            <Button size="lg" variant="outline" className="!text-white !border-white/40 hover:!bg-white/10 !bg-transparent" onClick={() => navigate('doctor-register')}>
              Join as a Doctor
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <HeartPulseIcon size={14} className="text-white" />
              </div>
              Medi<span className="text-brand-400">Link</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 MediLink(Kunai). All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
