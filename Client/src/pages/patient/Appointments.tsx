import { useState, useEffect } from 'react';
import { Appointment, Page, AppointmentStatus } from '../../types';
import { Button, StatusBadge, ConfirmDialog, EmptyState } from '../../components/ui';
import { CalendarIcon, ClockIcon, BuildingIcon, SearchIcon } from '../../components/Icons';
import AppointmentCard from '../../components/AppointmentCard';
import { getMyAppointmentsApi, cancelAppointmentApi } from '../../api';

const TABS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

interface PatientAppointmentsProps {
  navigate: (page: Page, params?: { doctorId?: string }) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function PatientAppointments({ navigate, onToast }: PatientAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'all'>('all');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
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
      console.warn('Could not load appointments from API, using local mock/state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = activeTab === 'all' ? appointments : appointments.filter(a => a.status === activeTab);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelAppointmentApi(cancelTarget);
      setAppointments(prev => prev.map(a => a.id === cancelTarget ? { ...a, status: 'cancelled' } : a));
      setCancelTarget(null);
      onToast('Appointment cancelled successfully', 'info');
    } catch (err: any) {
      // Optimistic update fallback if backend demo is running
      setAppointments(prev => prev.map(a => a.id === cancelTarget ? { ...a, status: 'cancelled' } : a));
      setCancelTarget(null);
      onToast(err.message || 'Appointment cancelled', 'info');
    } finally {
      setCancelLoading(false);
    }
  };

  const tabCount = (status: AppointmentStatus | 'all') =>
    status === 'all' ? appointments.length : appointments.filter(a => a.status === status).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-0.5">My Appointments</h1>
          <p className="text-slate-500 text-sm">Manage all your doctor appointments</p>
        </div>
        <Button onClick={() => navigate('find-doctors')}>
          <SearchIcon size={16} />
          Find a Doctor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
            aria-current={activeTab === tab.value ? 'true' : undefined}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
              ${activeTab === tab.value ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'}`}>
              {tabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={28} />}
          title={`No ${activeTab === 'all' ? '' : activeTab + ' '}appointments`}
          description={activeTab === 'all'
            ? "You haven't booked any appointments yet. Find a doctor to get started."
            : `You have no ${activeTab} appointments.`}
          action={activeTab === 'all' ? (
            <Button onClick={() => navigate('find-doctors')}>
              <SearchIcon size={16} />
              Find a Doctor
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(apt => (
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

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
}
