import { useState } from 'react';
import { Page, User } from '../types';
import { Button } from './ui';
import {
  HomeIcon,
  SearchIcon,
  CalendarIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  CrossIcon,
  SettingsIcon,
  ClipboardIcon,
} from './Icons';

interface NavbarProps {
  user: User | null;
  navigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
}

export default function Navbar({ user, navigate, onLogout, currentPage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const guestLinks = [
    { label: 'Home', page: 'landing' as Page, icon: <HomeIcon size={16} /> },
    { label: 'Find Doctors', page: 'find-doctors' as Page, icon: <SearchIcon size={16} /> },
  ];

  const patientLinks = [
    { label: 'Dashboard', page: 'patient-dashboard' as Page, icon: <HomeIcon size={16} /> },
    { label: 'Find Doctors', page: 'find-doctors' as Page, icon: <SearchIcon size={16} /> },
    { label: 'My Appointments', page: 'patient-appointments' as Page, icon: <CalendarIcon size={16} /> },
    { label: 'My Profile', page: 'patient-profile' as Page, icon: <UserIcon size={16} /> },
  ];

  const doctorLinks = [
    { label: 'Dashboard', page: 'doctor-dashboard' as Page, icon: <HomeIcon size={16} /> },
    { label: 'Appointments', page: 'doctor-appointments' as Page, icon: <CalendarIcon size={16} /> },
    { label: 'My Profile', page: 'doctor-profile-manage' as Page, icon: <UserIcon size={16} /> },
    { label: 'Availability', page: 'doctor-availability' as Page, icon: <SettingsIcon size={16} /> },
  ];

  const links = !user ? guestLinks : user.role === 'patient' ? patientLinks : doctorLinks;

  const isActive = (page: Page) => currentPage === page;

  const handleNav = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav(user ? (user.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard') : 'landing')}
            className="flex items-center gap-2 font-bold text-xl text-brand-700 focus-visible:outline-none"
            aria-label="MediLink home"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <CrossIcon size={16} className="text-white" />
            </div>
            <span>Medi<span className="text-brand-400">Link</span></span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {links.map(link => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(link.page)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                aria-current={isActive(link.page) ? 'page' : undefined}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleNav('login')}>Login</Button>
                <Button size="sm" onClick={() => handleNav('patient-register')}>Get Started</Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">
                  {user.role === 'doctor' ? 'Dr. ' : ''}{user.name.split(' ')[0]}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-danger transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                  aria-label="Logout"
                >
                  <LogoutIcon size={16} />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {links.map(link => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                ${isActive(link.page) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 mt-2">
            {!user ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleNav('login')}>Login</Button>
                <Button size="sm" className="flex-1" onClick={() => handleNav('patient-register')}>Get Started</Button>
              </div>
            ) : (
              <button
                onClick={() => { onLogout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 text-sm text-danger px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogoutIcon size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
