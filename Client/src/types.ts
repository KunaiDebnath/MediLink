export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type UserRole = 'patient' | 'doctor';

export interface Availability {
  start: string;
  end: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  qualifications: string;
  hospital: string;
  clinic: string;
  location: string;
  consultationFee: number;
  bio: string;
  availability: Record<string, Availability | null>;
  rating: number;
  reviewCount: number;
}

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorHospital: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Page =
  | 'landing'
  | 'login'
  | 'patient-register'
  | 'doctor-register'
  | 'patient-dashboard'
  | 'find-doctors'
  | 'doctor-profile'
  | 'book-appointment'
  | 'patient-appointments'
  | 'patient-profile'
  | 'doctor-dashboard'
  | 'doctor-appointments'
  | 'doctor-profile-manage'
  | 'doctor-availability';

export interface NavParams {
  doctorId?: string;
}
