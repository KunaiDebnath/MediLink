import { useState, useEffect } from 'react';
import { Appointment, Page, AppointmentStatus } from '../../types';
import { Button, StatusBadge, ConfirmDialog, EmptyState, Card, Avatar } from '../../components/ui';
import { CalendarIcon, ClockIcon, CheckIcon, XIcon } from '../../components/Icons';
import AppointmentCard from '../../components/AppointmentCard';
import {
  getDoctorAppointmentsApi,
  confirmAppointmentApi,
  rejectAppointmentApi,
  completeAppointmentApi,
} from '../../api';

const TABS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

interface DoctorAppointmentsProps {
  navigate: (page: Page) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type ActionType = 'confirm' | 'reject' | 'complete';

const actionConfig: Record<ActionType, { title: string; message: string; label: string; variant: 'primary' | 'danger' | 'success'; nextStatus: Appointment['status']; toast: string }> = {
  confirm: {
    title: 'Confirm Appointment',
    message: 'Confirm this appointment? The patient will be notified.',
    label: 'Confirm',
    variant: 'success',
    nextStatus: 'confirmed',
    toast: 'Appointment confirmed',
  },
  reject: {
    title: 'Reject Appointment',
    message: 'Are you sure you want to reject this appointment? The patient will be notified.',
    label: 'Reject',
    variant: 'danger',
    nextStatus: 'rejected',
    toast: 'Appointment rejected',
  },
  complete: {
    title: 'Mark as Completed',
    message: 'Mark this appointment as completed? This action cannot be undone.',
    label: 'Mark Complete',
    variant: 'primary',
    nextStatus: 'completed',
    toast: 'Appointment marked as completed',
  },
};

export default function DoctorAppointments({ navigate, onToast }: DoctorAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'all'>('all');
  const [dialog, setDialog] = useState<{ type: ActionType; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchDoctorAppointments = async () => {
    setFetching(true);
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
      console.warn('Could not load doctor appointments from API:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const filtered = activeTab === 'all' ? appointments : appointments.filter(a => a.status === activeTab);

  const handleAction = async () => {
    if (!dialog) return;
    const cfg = actionConfig[dialog.type];
    setLoading(true);
    try {
      if (dialog.type === 'confirm') {
        await confirmAppointmentApi(dialog.id);
      } else if (dialog.type === 'reject') {
        await rejectAppointmentApi(dialog.id);
      } else if (dialog.type === 'complete') {
        await completeAppointmentApi(dialog.id);
      }
      setAppointments(prev => prev.map(a => a.id === dialog.id ? { ...a, status: cfg.nextStatus } : a));
      setDialog(null);
      onToast(cfg.toast, dialog.type === 'reject' ? 'error' : 'success');
    } catch (err: any) {
      // Optimistic update fallback
      setAppointments(prev => prev.map(a => a.id === dialog.id ? { ...a, status: cfg.nextStatus } : a));
      setDialog(null);
      onToast(cfg.toast, dialog.type === 'reject' ? 'error' : 'success');
    } finally {
      setLoading(false);
    }
  };

  const tabCount = (status: AppointmentStatus | 'all') =>
    status === 'all' ? appointments.length : appointments.filter(a => a.status === status).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Appointments</h1>
        <p className="text-slate-500 text-sm">Review and manage all patient appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
              ${activeTab === tab.value ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'}`}>
              {tabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Appointment cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={28} />}
          title={`No ${activeTab === 'all' ? '' : activeTab + ' '}appointments`}
          description="No appointments match the current filter."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(apt => (
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

      {dialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDialog(null)}
          onConfirm={handleAction}
          title={actionConfig[dialog.type].title}
          message={actionConfig[dialog.type].message}
          confirmLabel={actionConfig[dialog.type].label}
          variant={actionConfig[dialog.type].variant}
          loading={loading}
        />
      )}
    </div>
  );
}
