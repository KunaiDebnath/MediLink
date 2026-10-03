import { useState, useEffect } from 'react';
import { User, Appointment, Page, AppointmentStatus } from '../../types';
import { Button, StatsCard, StatusBadge, EmptyState, ConfirmDialog, Card, Avatar } from '../../components/ui';
import { CalendarIcon, ClockIcon, CheckCircleIcon, UserIcon, ArrowRightIcon } from '../../components/Icons';
import AppointmentCard from '../../components/AppointmentCard';
import {
  getDoctorAppointmentsApi,
  confirmAppointmentApi,
  rejectAppointmentApi,
  completeAppointmentApi,
} from '../../api';

interface DoctorDashboardProps {
  user: User;
  navigate: (page: Page) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type DialogType = 'confirm' | 'reject' | 'complete' | null;

export default function DoctorDashboard({ user, navigate, onToast }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dialog, setDialog] = useState<{ type: DialogType; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await getDoctorAppointmentsApi();
        const list = Array.isArray(res) ? res : res.appointments || [];
        if (list) {
          const normalized = list.map((a: any) => ({
            id: a.id || a._id || `apt_${Math.random()}`,
            doctorId: a.doctorId?._id || a.doctorId || (a.doctor && (a.doctor.id || a.doctor._id)) || 'd1',
            doctorName: a.doctorId?.fullName || a.doctorName || (a.doctor && a.doctor.name) || 'Doctor',
            doctorSpecialization: a.doctorId?.specialization || a.doctorSpecialization || (a.doctor && a.doctor.specialization) || 'General',
            doctorHospital: a.doctorId?.hospitalName || a.doctorHospital || (a.doctor && a.doctor.hospital) || 'City Clinic',
            patientId: a.patientId?._id || a.patientId || (a.patient && (a.patient.id || a.patient._id)) || 'p1',
            patientName: a.patientId?.fullName || a.patientName || (a.patient && a.patient.name) || 'Patient',
            date: a.appointmentDate ? a.appointmentDate.split('T')[0] : (a.date ? a.date.split('T')[0] : ''),
            time: a.timeSlot || a.time || a.slot || '10:00 AM',
            status: (a.status ? a.status.toLowerCase() : 'pending') as AppointmentStatus,
            reason: a.reasonForVisit || a.reason || 'Consultation',
          }));
          setAppointments(normalized);
        }
      } catch (err) {
        console.warn('Could not load doctor dashboard appointments from API:', err);
      }
    }
    loadAppointments();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === today);

  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed');

  const dialogConfig: Record<
    NonNullable<DialogType>,
    { title: string; message: string; label: string; variant: 'primary' | 'danger' | 'success'; nextStatus: Appointment['status']; toast: string }
  > = {
    confirm: {
      title: 'Confirm Appointment',
      message: 'Are you sure you want to confirm this appointment?',
      label: 'Confirm Appointment',
      variant: 'success',
      nextStatus: 'confirmed',
      toast: 'Appointment confirmed',
    },
    reject: {
      title: 'Reject Appointment',
      message: 'Are you sure you want to reject this appointment? The patient will be notified.',
      label: 'Reject Appointment',
      variant: 'danger',
      nextStatus: 'rejected',
      toast: 'Appointment rejected',
    },
    complete: {
      title: 'Mark as Completed',
      message: 'Mark this appointment as completed?',
      label: 'Mark Complete',
      variant: 'primary',
      nextStatus: 'completed',
      toast: 'Appointment marked as completed',
    },
  };

  const handleAction = async () => {
    if (!dialog || !dialog.type) return;
    const cfg = dialogConfig[dialog.type];
    setActionLoading(true);
    try {
      if (dialog.type === 'confirm') {
        await confirmAppointmentApi(dialog.id);
      } else if (dialog.type === 'reject') {
        await rejectAppointmentApi(dialog.id);
      } else if (dialog.type === 'complete') {
        await completeAppointmentApi(dialog.id);
      }
      setAppointments(prev =>
        prev.map(a => a.id === dialog.id ? { ...a, status: cfg.nextStatus } : a)
      );
      setDialog(null);
      onToast(cfg.toast, dialog.type === 'reject' ? 'error' : 'success');
    } catch (err: any) {
      setAppointments(prev =>
        prev.map(a => a.id === dialog.id ? { ...a, status: cfg.nextStatus } : a)
      );
      setDialog(null);
      onToast(cfg.toast, dialog.type === 'reject' ? 'error' : 'success');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, <span className="text-brand-600">Dr. {user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your appointment overview</p>
        </div>
        <Button variant="outline" onClick={() => navigate('doctor-appointments')}>
          View All Appointments
          <ArrowRightIcon size={16} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Pending"
          value={pending.length}
          sub="Awaiting your confirmation"
          icon={<ClockIcon size={20} />}
          color="bg-warning-bg text-warning"
        />
        <StatsCard
          label="Confirmed"
          value={confirmed.length}
          sub="Scheduled and ready"
          icon={<CalendarIcon size={20} />}
          color="bg-info-bg text-info"
        />
        <StatsCard
          label="Completed"
          value={completed.length}
          sub="Successfully completed"
          icon={<CheckCircleIcon size={20} />}
          color="bg-success-bg text-success"
        />
      </div>

      {/* Today's appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Today's Appointments</h2>
          <span className="text-xs text-slate-500 font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {todayApts.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon size={28} />}
            title="No appointments today"
            description="You have no scheduled appointments for today."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {todayApts.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                viewAs="doctor"
                navigate={navigate}
                onConfirm={id => setDialog({ type: 'confirm', id })}
                onReject={id => setDialog({ type: 'reject', id })}
                onComplete={id => setDialog({ type: 'complete', id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Pending Requests
              <span className="ml-2 text-xs bg-warning-bg text-warning-text px-2 py-0.5 rounded-full font-medium">{pending.length}</span>
            </h2>
            <button
              onClick={() => navigate('doctor-appointments')}
              className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700"
            >
              View all <ArrowRightIcon size={14} />
            </button>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-50">
              {pending.slice(0, 3).map(apt => (
                <div key={apt.id} className="flex items-center gap-4 px-5 py-3.5">
                  <Avatar name={apt.patientName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{apt.patientName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {apt.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="success" size="sm" onClick={() => setDialog({ type: 'confirm', id: apt.id })}>
                      Confirm
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDialog({ type: 'reject', id: apt.id })}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Action dialog */}
      {dialog && dialog.type && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDialog(null)}
          onConfirm={handleAction}
          title={dialogConfig[dialog.type].title}
          message={dialogConfig[dialog.type].message}
          confirmLabel={dialogConfig[dialog.type].label}
          variant={dialogConfig[dialog.type].variant}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
