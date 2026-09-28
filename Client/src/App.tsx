import { useState, useEffect, useRef } from 'react';
import { Page, User, ToastMessage } from './types';
import { Toast } from './components/ui';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import { getToken, getMeApi, removeToken, getPatientProfileApi, getDoctorProfileApi } from './api';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import PatientRegister from './pages/PatientRegister';
import DoctorRegister from './pages/DoctorRegister';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorProfilePage from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import PatientProfile from './pages/patient/Profile';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorProfileManage from './pages/doctor/Profile';
import DoctorAvailability from './pages/doctor/Availability';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('d1');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const toastTimer = useRef<Record<string, number>>({});

  useEffect(() => {
    async function loadUser() {
      try {
        const token = getToken();
        if (token) {
          const res = await getMeApi();
          const u = res.user || res.data?.user || res;
          if (u && (u.role || u._id)) {
            const role = u.role || 'patient';
            let fullName = '';
            let profileId = u._id || u.id;

            // Fetch patient or doctor profile to get the actual full name
            try {
              if (role === 'patient') {
                const patRes = await getPatientProfileApi();
                const pat = patRes.patient || patRes.profile || patRes;
                if (pat && pat.fullName) {
                  fullName = pat.fullName;
                  profileId = pat._id || profileId;
                }
              } else if (role === 'doctor') {
                const docRes = await getDoctorProfileApi();
                const doc = docRes.doctor || docRes.profile || docRes;
                if (doc && doc.fullName) {
                  fullName = doc.fullName;
                  profileId = doc._id || profileId;
                }
              }
            } catch {
              // Ignore profile fetch failure
            }

            const fetchedUser: User = {
              id: profileId,
              name: fullName || u.fullName || u.name || (u.email ? u.email.split('@')[0] : (role === 'doctor' ? 'Doctor' : 'Patient')),
              email: u.email || '',
              role: role,
            };
            setUser(fetchedUser);
            // Default to dashboard on first load if currently on landing
            setPage(prev => prev === 'landing' ? (role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard') : prev);
          }
        }
      } catch (err) {
        console.warn('Auth verify failed:', err);
        removeToken();
      } finally {
        setInitialLoading(false);
      }
    }
    loadUser();
  }, []);

  const navigate = (to: Page, params?: { doctorId?: string }) => {
    setPage(to);
    if (params?.doctorId) setSelectedDoctorId(params.doctorId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (u: User) => {
    setUser(u);
    navigate(u.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    navigate('landing');
  };

  const showToast = (message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    toastTimer.current[id] = window.setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    clearTimeout(toastTimer.current[id]);
    delete toastTimer.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Route protection and redirection
  useEffect(() => {
    if (initialLoading) return;
    const patientPages: Page[] = ['patient-dashboard', 'patient-appointments', 'patient-profile'];
    const doctorPages: Page[] = ['doctor-dashboard', 'doctor-appointments', 'doctor-profile-manage', 'doctor-availability'];
    
    // Redirect unauthenticated users away from protected pages
    if (!user && (patientPages.includes(page) || doctorPages.includes(page) || page === 'book-appointment')) {
      navigate('login');
    }

    // Redirect logged-in users away from public landing/auth pages to their dashboard
    if (user && (page === 'landing' || page === 'login' || page === 'patient-register' || page === 'doctor-register')) {
      navigate(user.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
    }
  }, [page, user, initialLoading]);

  const publicNavbarPages: Page[] = ['landing', 'login', 'patient-register', 'doctor-register'];
  const isPublicPage = publicNavbarPages.includes(page);
  const isAuthPage = page === 'login' || page === 'patient-register' || page === 'doctor-register';

  // Render page content
  const renderPage = () => {
    // Public pages
    if (page === 'landing') return <Landing navigate={navigate} />;
    if (page === 'login') return <Login navigate={navigate} onLogin={handleLogin} />;
    if (page === 'patient-register') return <PatientRegister navigate={navigate} onLogin={handleLogin} />;
    if (page === 'doctor-register') return <DoctorRegister navigate={navigate} onLogin={handleLogin} />;

    // Find doctors (available to all but with navbar context)
    if (page === 'find-doctors') return <FindDoctors navigate={navigate} />;
    if (page === 'doctor-profile') return <DoctorProfilePage doctorId={selectedDoctorId} navigate={navigate} />;

    // Patient-only pages
    if (page === 'book-appointment' && user) return (
      <BookAppointment doctorId={selectedDoctorId} user={user} navigate={navigate} onToast={showToast} />
    );
    if (page === 'patient-dashboard' && user) return (
      <PatientDashboard user={user} navigate={navigate} onToast={showToast} />
    );
    if (page === 'patient-appointments') return <PatientAppointments navigate={navigate} onToast={showToast} />;
    if (page === 'patient-profile' && user) return <PatientProfile user={user} onToast={showToast} />;

    // Doctor-only pages
    if (page === 'doctor-dashboard' && user) return (
      <DoctorDashboard user={user} navigate={navigate} onToast={showToast} />
    );
    if (page === 'doctor-appointments') return <DoctorAppointments navigate={navigate} onToast={showToast} />;
    if (page === 'doctor-profile-manage' && user) return <DoctorProfileManage user={user} onToast={showToast} />;
    if (page === 'doctor-availability') return <DoctorAvailability onToast={showToast} />;

    return <Landing navigate={navigate} />;
  };

  // Auth pages get full-screen layout (no navbar)
  if (isAuthPage) {
    return (
      <div className="relative">
        {renderPage()}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // Authenticated users get sidebar layout
  if (user) {
    return (
      <div className="relative">
        <Layout user={user} navigate={navigate} onLogout={handleLogout} currentPage={page}>
          {renderPage()}
        </Layout>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // Unauthenticated public pages get top navbar
  return (
    <div className="relative">
      <Navbar user={null} navigate={navigate} onLogout={handleLogout} currentPage={page} />
      <div className="pt-16">
        {renderPage()}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  );
}
