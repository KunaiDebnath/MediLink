import { useState, ReactNode } from 'react';
import { Page, User } from '../types';
import {
  HomeIcon, SearchIcon, CalendarIcon, UserIcon, LogoutIcon,
  MenuIcon, XIcon, SettingsIcon, CrossIcon, ClipboardIcon,
} from './Icons';

interface LayoutProps {
  user: User;
  navigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
  children: ReactNode;
}

export default function Layout({ user, navigate, onLogout, currentPage, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const patientNav = [
    { label: 'Dashboard', page: 'patient-dashboard' as Page, icon: <HomeIcon size={18} /> },
    { label: 'Find Doctors', page: 'find-doctors' as Page, icon: <SearchIcon size={18} /> },
    { label: 'My Appointments', page: 'patient-appointments' as Page, icon: <CalendarIcon size={18} /> },
    { label: 'My Profile', page: 'patient-profile' as Page, icon: <UserIcon size={18} /> },
  ];

  const doctorNav = [
    { label: 'Dashboard', page: 'doctor-dashboard' as Page, icon: <HomeIcon size={18} /> },
    { label: 'Appointments', page: 'doctor-appointments' as Page, icon: <CalendarIcon size={18} /> },
    { label: 'My Profile', page: 'doctor-profile-manage' as Page, icon: <UserIcon size={18} /> },
    { label: 'Availability', page: 'doctor-availability' as Page, icon: <SettingsIcon size={18} /> },
  ];

  const navItems = user.role === 'patient' ? patientNav : doctorNav;

  const isActive = (page: Page) => currentPage === page;

  const handleNav = (page: Page) => {
    navigate(page);
    setSidebarOpen(false);
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <button
          onClick={() => handleNav(user.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard')}
          className="flex items-center gap-2 font-bold text-lg text-brand-700"
        >
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <CrossIcon size={16} className="text-white" />
          </div>
          <span>Medi<span className="text-brand-400">Link</span></span>
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
            {user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.role === 'doctor' ? 'Dr. ' : ''}{user.name}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Sidebar navigation">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => handleNav(item.page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
              ${isActive(item.page)
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            aria-current={isActive(item.page) ? 'page' : undefined}
          >
            <span className={isActive(item.page) ? 'text-brand-600' : 'text-slate-400'}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-danger transition-colors"
          aria-label="Logout"
        >
          <LogoutIcon size={18} className="text-slate-400" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div className="relative w-64 flex-shrink-0 z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <MenuIcon size={20} />
          </button>
          <span className="font-bold text-brand-700">
            Medi<span className="text-brand-400">Link</span>
          </span>
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
            {user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
