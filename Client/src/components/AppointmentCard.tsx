import { Appointment, Page, UserRole } from '../types';
import { Button, StatusBadge, Avatar } from './ui';
import { CalendarIcon, ClockIcon, BuildingIcon, ClipboardIcon } from './Icons';

interface AppointmentCardProps {
  appointment: Appointment;
  viewAs: UserRole;
  navigate: (page: Page, params?: { doctorId?: string }) => void;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export default function AppointmentCard({
  appointment,
  viewAs,
  navigate,
  onCancel,
  onConfirm,
  onReject,
  onComplete,
}: AppointmentCardProps) {
  const { status } = appointment;
  const canCancel = viewAs === 'patient' && (status === 'pending' || status === 'confirmed');
  const canConfirm = viewAs === 'doctor' && status === 'pending';
  const canReject = viewAs === 'doctor' && status === 'pending';
  const canComplete = viewAs === 'doctor' && status === 'confirmed';

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={viewAs === 'patient' ? appointment.doctorName : appointment.patientName}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm truncate">
              {viewAs === 'patient' ? appointment.doctorName : appointment.patientName}
            </h4>
            <p className="text-xs text-brand-600 font-medium">{appointment.doctorSpecialization}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={12} className="text-slate-400" />
          <span>{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ClockIcon size={12} className="text-slate-400" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <BuildingIcon size={12} className="text-slate-400" />
          <span className="truncate">{appointment.doctorHospital}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="flex gap-1.5 mb-4">
        <ClipboardIcon size={12} className="text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{appointment.reason}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {viewAs === 'patient' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('doctor-profile', { doctorId: appointment.doctorId })}
          >
            View Doctor
          </Button>
        )}

        {canCancel && onCancel && (
          <Button variant="danger" size="sm" onClick={() => onCancel(appointment.id)}>
            Cancel
          </Button>
        )}

        {canConfirm && onConfirm && (
          <Button variant="success" size="sm" onClick={() => onConfirm(appointment.id)}>
            Confirm
          </Button>
        )}

        {canReject && onReject && (
          <Button variant="danger" size="sm" onClick={() => onReject(appointment.id)}>
            Reject
          </Button>
        )}

        {canComplete && onComplete && (
          <Button variant="primary" size="sm" onClick={() => onComplete(appointment.id)}>
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
}
