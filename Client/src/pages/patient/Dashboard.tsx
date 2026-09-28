import { useState, useEffect } from 'react';
import { User, Appointment, Page, AppointmentStatus } from '../../types';
import { Button, StatsCard, StatusBadge, EmptyState, ConfirmDialog, Card } from '../../components/ui';
import { CalendarIcon, ClockIcon, CheckCircleIcon, SearchIcon, BuildingIcon, ArrowRightIcon } from '../../components/Icons';
import AppointmentCard from '../../components/AppointmentCard';
import { getMyAppointmentsApi, cancelAppointmentApi } from '../../api';

interface PatientDashboardProps {
  user: User;
  navigate: (page: Page, params?: { doctorId?: string }) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function PatientDashboard({ user, navigate, onToast }: PatientDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      try {
        const res = await getMyAppointmentsApi();
        const list = Array.isArray(res) ? res : res.appointments || [];
        if (list) {
          const normalized = list.map((a: any) => ({
            id: a._id || a.id || `apt_${Math.random()}`,
            doctorId: a.doctorId?._id || a.doctorId?.id || a.doctorId || 'd1',
            doctorName: a.doctorId?.fullName || a.doctorName || (a.doctor && a.doctor.name) || 'Doctor',
            doctorSpecialization: a.doctorId?.specialization || a.doctorSpecialization || 'Specialist',
            doctorHospital: a.doctorId?.hospitalName || a.doctorHospital || 'Medical Clinic',
            patientId: a.patientId?._id || a.patientId?.id || a.patientId || 'p1',
            patientName: a.patientId?.fullName || a.patientName || 'Patient',
            date: a.appointmentDate ? a.appointmentDate.split('T')[0] : (a.date ? a.date.split('T')[0] : ''),
            time: a.timeSlot || a.time || '10:00 AM',
            status: (a.status ? a.status.toLowerCase() : 'pending') as AppointmentStatus,
            reason: a.reasonForVisit || a.reason || '',
          }));
          setAppointments(normalized);
        }
      } catch (err) {
        console.warn('Could not fetch patient appointments from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const pending = appointments.filter(a => a.status === 'pending');
  const completed = appointments.filter(a => a.status === 'completed');

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelAppointmentApi(cancelTarget);
      setAppointments(prev => prev.map(a => a.id === cancelTarget ? { ...a, status: 'cancelled' } : a));
      setCancelTarget(null);
      onToast('Appointment cancelled successfully', 'info');
    } catch (err: any) {
      setAppointments(prev => prev.map(a => a.id === cancelTarget ? { ...a, status: 'cancelled' } : a));
      setCancelTarget(null);
      onToast(err.message || 'Appointment cancelled', 'info');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, <span className="text-brand-600">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's an overview of your health appointments</p>
        </div>
        <Button onClick={() => navigate('find-doctors')}>
          <SearchIcon size={16} />
          Find a Doctor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Upcoming"
          value={upcoming.length}
          sub={upcoming.length === 1 ? '1 appointment scheduled' : `${upcoming.length} appointments scheduled`}
          icon={<CalendarIcon size={20} />}
          color="bg-brand-50 text-brand-600"
        />
        <StatsCard
          label="Pending Confirmation"
          value={pending.length}
          sub="Awaiting doctor confirmation"
          icon={<ClockIcon size={20} />}
          color="bg-warning-bg text-warning"
        />
        <StatsCard
          label="Completed"
          value={completed.length}
          sub="Successfully completed visits"
          icon={<CheckCircleIcon size={20} />}
          color="bg-success-bg text-success"
        />
      </div>

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Upcoming Appointments</h2>
          <button
            onClick={() => navigate('patient-appointments')}
            className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700"
          >
            View all <ArrowRightIcon size={14} />
          </button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon size={28} />}
            title="No upcoming appointments"
            description="You don't have any appointments yet. Find a doctor to get started."
            action={
              <Button onClick={() => navigate('find-doctors')}>
                <SearchIcon size={16} />
                Find a Doctor
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {upcoming.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                viewAs="patient"
                navigate={navigate}
                onCancel={id => setCancelTarget(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected').length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-50">
              {appointments
                .filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status))
                .slice(0, 3)
                .map(apt => (
                  <div key={apt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm flex-shrink-0">
                      {apt.doctorName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{apt.doctorName}</p>
                      <p className="text-xs text-slate-500">{apt.doctorSpecialization} · {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={apt.status} />
                      <button
                        onClick={() => navigate('doctor-profile', { doctorId: apt.doctorId })}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Re-book
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* CTA if no appointments at all */}
      {appointments.length === 0 && (
        <Card className="p-8 text-center mt-6">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-400 mx-auto mb-4">
            <SearchIcon size={28} />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Find your first doctor</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
            Browse our network of verified doctors and book your first appointment in minutes.
          </p>
          <Button onClick={() => navigate('find-doctors')}>
            <SearchIcon size={16} />
            Browse Doctors
          </Button>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Cancel Appointment"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
}
