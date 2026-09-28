import { Doctor } from '../types';
import { Page } from '../types';
import { Button, Avatar } from './ui';
import { MapPinIcon, StarIcon, AwardIcon, BuildingIcon, DollarSignIcon } from './Icons';

interface DoctorCardProps {
  doctor: Doctor;
  navigate: (page: Page, params?: { doctorId?: string }) => void;
}

export default function DoctorCard({ doctor, navigate }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-200 p-5 flex flex-col">
      {/* Header */}
      <div className="flex gap-4 mb-4">
        <Avatar name={doctor.name} size="lg" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base truncate">{doctor.name}</h3>
          <p className="text-brand-600 text-sm font-medium mb-1">{doctor.specialization}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <StarIcon size={12} className="text-amber-400 fill-amber-400" />
            <span className="font-medium text-slate-700">{doctor.rating}</span>
            <span>({doctor.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <AwardIcon size={14} className="text-slate-400 shrink-0" />
          <span>{doctor.experience} yrs experience · {doctor.qualifications}</span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{doctor.hospital}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinIcon size={14} className="text-slate-400 shrink-0" />
          <span>{doctor.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSignIcon size={14} className="text-slate-400 shrink-0" />
          <span>${doctor.consultationFee} consultation fee</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">{doctor.bio}</p>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate('doctor-profile', { doctorId: doctor.id })}
        >
          View Profile
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => navigate('book-appointment', { doctorId: doctor.id })}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
