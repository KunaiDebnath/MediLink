export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Token helpers
export const getToken = (): string | null => {
  return localStorage.getItem('medilink_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('medilink_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('medilink_token');
};

// Generic Fetch Wrapper
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------
// POST http://localhost:5000/api/auth/register/patient
export async function registerPatientApi(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
}) {
  const body = {
    email: payload.email.trim(),
    password: payload.password,
    fullName: payload.name.trim(),
    phoneNumber: payload.phone.trim(),
  };
  return apiRequest('/auth/register/patient', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// POST http://localhost:5000/api/auth/register/doctor
export async function registerDoctorApi(payload: {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  password: string;
  role?: string;
  experience?: number;
  qualifications?: string;
  hospital?: string;
  clinic?: string;
  consultationFee?: number;
  bio?: string;
}) {
  const body = {
    email: payload.email.trim(),
    password: payload.password,
    fullName: payload.name.trim(),
    phoneNumber: payload.phone.trim(),
    specialization: payload.specialization.trim(),
  };
  return apiRequest('/auth/register/doctor', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// POST http://localhost:5000/api/auth/login
export async function loginApi(payload: { email: string; password: string }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// GET http://localhost:5000/api/auth/me
export async function getMeApi() {
  return apiRequest('/auth/me', {
    method: 'GET',
  });
}

// -------------------------------------------------------------
// Doctor Routes
// -------------------------------------------------------------
// GET http://localhost:5000/api/doctors
export async function getDoctorsApi(params?: { specialization?: string; location?: string }) {
  const query = new URLSearchParams();
  if (params?.specialization) query.append('specialization', params.specialization);
  if (params?.location) query.append('location', params.location);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/doctors${qStr}`, {
    method: 'GET',
  });
}

// GET http://localhost:5000/api/doctors/profile
export async function getDoctorProfileApi() {
  return apiRequest('/doctors/profile', {
    method: 'GET',
  });
}

// PUT http://localhost:5000/api/doctors/profile
export async function updateDoctorProfileApi(profileData: {
  name?: string;
  phone?: string;
  specialization?: string;
  qualifications?: string;
  experience?: number;
  hospital?: string;
  clinic?: string;
  consultationFee?: number;
  bio?: string;
  fullName?: string;
  phoneNumber?: string;
  experienceYears?: number;
  hospitalName?: string;
  clinicAddress?: string;
}) {
  const body: Record<string, any> = {};
  if (profileData.name || profileData.fullName) body.fullName = (profileData.name || profileData.fullName)!.trim();
  if (profileData.phone || profileData.phoneNumber) body.phoneNumber = (profileData.phone || profileData.phoneNumber)!.trim();
  if (profileData.specialization) body.specialization = profileData.specialization.trim();
  if (profileData.qualifications !== undefined) body.qualifications = profileData.qualifications;
  if (profileData.experience !== undefined || profileData.experienceYears !== undefined) {
    body.experienceYears = Number(profileData.experience ?? profileData.experienceYears);
  }
  if (profileData.hospital || profileData.hospitalName) body.hospitalName = profileData.hospital || profileData.hospitalName;
  if (profileData.clinic || profileData.clinicAddress) body.clinicAddress = profileData.clinic || profileData.clinicAddress;
  if (profileData.consultationFee !== undefined) body.consultationFee = Number(profileData.consultationFee);
  if (profileData.bio !== undefined) body.bio = profileData.bio;

  return apiRequest('/doctors/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// PUT http://localhost:5000/api/doctors/profile (or availability handler if wired)
export async function updateDoctorAvailabilityApi(availabilityData: Record<string, { start: string; end: string }>) {
  // Lowercase keys strictly: monday, tuesday, etc.
  const formatted: Record<string, { start: string; end: string }> = {};
  Object.entries(availabilityData).forEach(([day, slot]) => {
    if (slot && slot.start && slot.end) {
      formatted[day.toLowerCase()] = {
        start: slot.start,
        end: slot.end,
      };
    }
  });

  // Include both { availability: formatted } and flat keys to support any backend Mongoose schema
  const body = {
    availability: formatted,
    ...formatted,
  };

  return apiRequest('/doctors/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// GET http://localhost:5000/api/doctors/:id/slots
export async function getDoctorSlotsApi(doctorId: string, date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiRequest(`/doctors/${doctorId}/slots${q}`, {
    method: 'GET',
  });
}

// -------------------------------------------------------------
// Patient Routes
// -------------------------------------------------------------
// GET http://localhost:5000/api/patients/profile
export async function getPatientProfileApi() {
  return apiRequest('/patients/profile', {
    method: 'GET',
  });
}

// PUT http://localhost:5000/api/patients/profile
export async function updatePatientProfileApi(profileData: {
  name?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
}) {
  const body: Record<string, any> = {};

  const name = (profileData.fullName || profileData.name || '').trim();
  if (name) body.fullName = name;

  const phone = (profileData.phoneNumber || profileData.phone || '').trim();
  if (phone) body.phoneNumber = phone;

  if (profileData.dateOfBirth && typeof profileData.dateOfBirth === 'string' && profileData.dateOfBirth.trim()) {
    const dobStr = profileData.dateOfBirth.split('T')[0].trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
      body.dateOfBirth = dobStr;
    }
  }

  if (profileData.gender && typeof profileData.gender === 'string' && profileData.gender.trim()) {
    body.gender = profileData.gender.trim();
  }

  if (profileData.bloodGroup && typeof profileData.bloodGroup === 'string' && profileData.bloodGroup.trim()) {
    body.bloodGroup = profileData.bloodGroup.trim();
  }

  if (profileData.address && typeof profileData.address === 'string' && profileData.address.trim()) {
    body.address = profileData.address.trim();
  }

  return apiRequest('/patients/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// -------------------------------------------------------------
// Appointment Routes
// -------------------------------------------------------------
// POST http://localhost:5000/api/appointments (book appointment)
export async function bookAppointmentApi(payload: {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  doctorHospital?: string;
  fee?: number;
}) {
  // Controller expects format /^(?:[01]\d|2[0-3]):[0-5]\d$/ (HH:MM 24-hr)
  let formattedTimeSlot = payload.time;
  if (/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(payload.time.trim())) {
    const [timePart, modifier] = payload.time.trim().split(/\s+/);
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    formattedTimeSlot = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } else if (/^\d{1,2}:\d{2}$/.test(payload.time.trim())) {
    const [hours, minutes] = payload.time.trim().split(':').map(Number);
    formattedTimeSlot = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const body = {
    // Mongoose schema and controller exact fields
    doctorId: payload.doctorId,
    appointmentDate: payload.date,
    timeSlot: formattedTimeSlot,
    reasonForVisit: payload.reason.trim(),
    patientId: payload.patientId,
    status: 'Pending',

    // Compatibility aliases
    doctor: payload.doctorId,
    patient: payload.patientId,
    date: payload.date,
    time: formattedTimeSlot,
    slot: formattedTimeSlot,
    reason: payload.reason.trim(),
    patientName: payload.patientName,
    patientEmail: payload.patientEmail,
    doctorName: payload.doctorName,
    doctorSpecialization: payload.doctorSpecialization,
    doctorHospital: payload.doctorHospital,
  };
  return apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// GET http://localhost:5000/api/appointments/my (patient appointments)
export async function getMyAppointmentsApi() {
  return apiRequest('/appointments/my', {
    method: 'GET',
  });
}

// GET http://localhost:5000/api/appointments/doctor (doctor appointments)
export async function getDoctorAppointmentsApi() {
  return apiRequest('/appointments/doctor', {
    method: 'GET',
  });
}

// PUT or POST http://localhost:5000/api/appointments/:id/cancel
export async function cancelAppointmentApi(appointmentId: string) {
  return apiRequest(`/appointments/${appointmentId}/cancel`, {
    method: 'PUT',
  });
}

// PUT or POST http://localhost:5000/api/appointments/:id/confirm
export async function confirmAppointmentApi(appointmentId: string) {
  return apiRequest(`/appointments/${appointmentId}/confirm`, {
    method: 'PUT',
  });
}

// PUT or POST http://localhost:5000/api/appointments/:id/reject
export async function rejectAppointmentApi(appointmentId: string, reason?: string) {
  return apiRequest(`/appointments/${appointmentId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

// PUT or POST http://localhost:5000/api/appointments/:id/complete
export async function completeAppointmentApi(appointmentId: string) {
  return apiRequest(`/appointments/${appointmentId}/complete`, {
    method: 'PUT',
  });
}
