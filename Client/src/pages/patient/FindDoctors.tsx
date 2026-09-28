import { useState, useMemo, useEffect } from 'react';
import { Page, Doctor } from '../../types';
import { Button, Select, Input, EmptyState, ErrorState, DoctorCardSkeleton } from '../../components/ui';
import { SearchIcon, FilterIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/Icons';
import { specializations, locations } from '../../data';
import DoctorCard from '../../components/DoctorCard';
import { getDoctorsApi } from '../../api';

const PAGE_SIZE = 6;

interface FindDoctorsProps {
  navigate: (page: Page, params?: { doctorId?: string }) => void;
}

export default function FindDoctors({ navigate }: FindDoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    minExp: '',
    maxFee: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      try {
        const res = await getDoctorsApi({
          specialization: filters.specialization || undefined,
          location: filters.location || undefined,
        });
        const docsList = Array.isArray(res) ? res : res.doctors || [];
        if (docsList) {
          // Format doctor data from Mongoose schema
          const normalized = docsList.map((d: any) => ({
            id: d._id || d.id || `d_${Math.random()}`,
            name: d.fullName || d.name || 'Doctor',
            email: d.email || (d.userId && d.userId.email) || '',
            phone: d.phoneNumber || d.phone || '',
            specialization: d.specialization || 'General',
            experience: d.experienceYears !== undefined ? Number(d.experienceYears) : (d.experience ? Number(d.experience) : 0),
            qualifications: d.qualifications || 'MD',
            hospital: d.hospitalName || d.hospital || 'Medical Center',
            clinic: d.clinicAddress || d.clinic || '',
            location: d.clinicAddress || d.location || d.hospitalName || 'City Hospital',
            consultationFee: d.consultationFee !== undefined ? Number(d.consultationFee) : 0,
            bio: d.bio || '',
            availability: {
              Monday: d.availability?.monday || d.availability?.Monday || null,
              Tuesday: d.availability?.tuesday || d.availability?.Tuesday || null,
              Wednesday: d.availability?.wednesday || d.availability?.Wednesday || null,
              Thursday: d.availability?.thursday || d.availability?.Thursday || null,
              Friday: d.availability?.friday || d.availability?.Friday || null,
              Saturday: d.availability?.saturday || d.availability?.Saturday || null,
              Sunday: d.availability?.sunday || d.availability?.Sunday || null,
            },
            rating: d.rating || 5.0,
            reviewCount: d.reviewCount || 0,
          }));
          setDoctors(normalized);
        }
      } catch (err) {
        console.warn('Failed to fetch doctors from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, [filters.specialization, filters.location]);

  const filtered = useMemo(() => {
    return doctors.filter(d => {
      const q = query.toLowerCase();
      if (q && !d.name.toLowerCase().includes(q) && !d.specialization.toLowerCase().includes(q)) return false;
      if (filters.specialization && d.specialization !== filters.specialization) return false;
      if (filters.location && d.location !== filters.location) return false;
      if (filters.minExp && d.experience < Number(filters.minExp)) return false;
      if (filters.maxFee && d.consultationFee > Number(filters.maxFee)) return false;
      return true;
    });
  }, [doctors, query, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setFilter = (key: string, val: string) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ specialization: '', location: '', minExp: '', maxFee: '' });
    setQuery('');
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean) || query;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Find a Doctor</h1>
        <p className="text-slate-500 text-sm">Search from verified doctors across various specializations</p>
      </div>

      {/* Search + Filter row */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name or specialization…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            aria-label="Search doctors"
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(v => !v)}
          className="gap-1.5"
        >
          <FilterIcon size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center ml-0.5">
              {(filters.specialization ? 1 : 0) + (filters.location ? 1 : 0) + (filters.minExp ? 1 : 0) + (filters.maxFee ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <XIcon size={14} />
            Clear
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Filter Doctors</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Specialization"
              value={filters.specialization}
              onChange={e => setFilter('specialization', e.target.value)}
              placeholder="All specializations"
              options={specializations.map(s => ({ value: s, label: s }))}
            />
            <Select
              label="Location"
              value={filters.location}
              onChange={e => setFilter('location', e.target.value)}
              placeholder="All locations"
              options={locations.map(l => ({ value: l, label: l }))}
            />
            <Input
              label="Min. Experience (years)"
              type="number"
              placeholder="e.g. 5"
              value={filters.minExp}
              onChange={e => setFilter('minExp', e.target.value)}
              min="0"
            />
            <Input
              label="Max. Fee ($)"
              type="number"
              placeholder="e.g. 200"
              value={filters.maxFee}
              onChange={e => setFilter('maxFee', e.target.value)}
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
            <Button size="sm" onClick={() => setShowFilters(false)}>Apply Filters</Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        {filtered.length === 0 ? 'No doctors found' : `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} doctors`}
      </p>

      {/* Doctor grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => <DoctorCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={28} />}
          title="No doctors found"
          description={hasActiveFilters
            ? "No doctors match your current filters. Try adjusting or clearing them."
            : "No doctors match your search. Try different keywords."}
          action={hasActiveFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paged.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                  ${p === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
