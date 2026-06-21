'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  DollarSign,
  MapPin,
  Globe,
  FileText,
  X,
  AlertCircle
} from 'lucide-react';
import { JobStatus } from '@prisma/client';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  platform: string | null;
  status: JobStatus;
  applicationDate: string;
  notes: string | null;
  jobUrl: string | null;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [platform, setPlatform] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company'>('newest');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<{ [key: string]: string[] } | string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formPlatform, setFormPlatform] = useState('');
  const [formStatus, setFormStatus] = useState<JobStatus>(JobStatus.WISHLIST);
  const [formNotes, setFormNotes] = useState('');
  const [formJobUrl, setFormJobUrl] = useState('');
  const [formAppDate, setFormAppDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch Jobs List
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (platform) queryParams.append('platform', platform);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      queryParams.append('sortBy', sortBy);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to retrieve jobs list');
      }
      const data = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching jobs');
    } finally {
      setLoading(false);
    }
  }, [search, status, platform, startDate, endDate, sortBy, page]);

  useEffect(() => {
    // Debounce search slightly to avoid excessive calls
    const handler = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchJobs]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormTitle('');
    setFormCompany('');
    setFormLocation('');
    setFormSalary('');
    setFormPlatform('');
    setFormStatus(JobStatus.WISHLIST);
    setFormNotes('');
    setFormJobUrl('');
    setFormAppDate(new Date().toISOString().split('T')[0]);
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setFormTitle(job.title);
    setFormCompany(job.company);
    setFormLocation(job.location || '');
    setFormSalary(job.salary || '');
    setFormPlatform(job.platform || '');
    setFormStatus(job.status);
    setFormNotes(job.notes || '');
    setFormJobUrl(job.jobUrl || '');
    setFormAppDate(job.applicationDate ? new Date(job.applicationDate).toISOString().split('T')[0] : '');
    setModalError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingJob(null);
    setModalError(null);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const payload = {
      title: formTitle,
      company: formCompany,
      location: formLocation || null,
      salary: formSalary || null,
      platform: formPlatform || null,
      status: formStatus,
      notes: formNotes || null,
      jobUrl: formJobUrl || null,
      applicationDate: new Date(formAppDate).toISOString(),
    };

    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setModalError(data.errors);
        } else {
          setModalError(data.message || 'An error occurred while saving the job');
        }
        return;
      }

      handleCloseModal();
      fetchJobs();
    } catch (err: any) {
      setModalError(err.message || 'Network request failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteJob = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the job listing for "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Could not delete job application');
      }
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.WISHLIST:
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
      case JobStatus.APPLIED:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case JobStatus.OA:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case JobStatus.INTERVIEW:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case JobStatus.OFFER:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case JobStatus.REJECTED:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      
      {/* TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Job Applications</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {total} Total
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">Add, update, and manage your ongoing application pipeline.</p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary py-2 px-4 shadow-lg hover:shadow-indigo-500/5 transition-all"
        >
          <Plus size={16} />
          Add Application
        </button>
      </div>

      {/* FILTER DASHBOARD */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search title, company..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Status Select */}
          <div>
            <select
              className="input-field"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="WISHLIST">Wishlist</option>
              <option value="APPLIED">Applied</option>
              <option value="OA">OA (Online Assessment)</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div className="relative">
            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Platform (e.g. LinkedIn)"
              className="input-field pl-10"
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
            />
          </div>

          {/* Sort Selection */}
          <div>
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
            >
              <option value="newest">Sort: Newest Applied</option>
              <option value="oldest">Sort: Oldest Applied</option>
              <option value="company">Sort: Company Name</option>
            </select>
          </div>
        </div>

        {/* Date Ranges and Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-zinc-850 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal size={12} />
              Applied Date Range:
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                className="input-field py-1 text-xs max-w-[140px]"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              />
              <span className="text-zinc-650 text-xs">—</span>
              <input
                type="date"
                className="input-field py-1 text-xs max-w-[140px]"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {(search || status || platform || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setPlatform('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors shrink-0 flex items-center gap-1"
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* JOBS DATA TABLE */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
            <span className="text-sm text-zinc-400">Fetching applications...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">
            <AlertCircle className="mx-auto mb-3" size={28} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/40 border border-zinc-700/40 flex items-center justify-center text-zinc-500 mx-auto mb-4">
              <Briefcase size={22} />
            </div>
            <h3 className="text-base font-semibold text-zinc-300">No applications found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search criteria, or add a new job application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-900/30 text-zinc-400 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Title & Company</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Platform</th>
                  <th className="py-3.5 px-4 font-semibold">Salary</th>
                  <th className="py-3.5 px-4 font-semibold">Date Applied</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-zinc-900/20 transition-colors">
                    {/* Title & Company */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">
                          {job.title}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          {job.company}
                          {job.location && (
                            <>
                              <span className="text-zinc-650">•</span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500">
                                <MapPin size={10} /> {job.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center border text-[11px] px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>

                    {/* Platform */}
                    <td className="py-4 px-4 text-xs text-zinc-400">
                      {job.platform || <span className="text-zinc-650">—</span>}
                    </td>

                    {/* Salary */}
                    <td className="py-4 px-4 text-xs text-zinc-400">
                      {job.salary || <span className="text-zinc-650">—</span>}
                    </td>

                    {/* Date Applied */}
                    <td className="py-4 px-4 text-xs text-zinc-400">
                      {new Date(job.applicationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors rounded-md hover:bg-zinc-800"
                            title="Open URL"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-800"
                          title="Edit Job"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id, job.company)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800"
                          title="Delete Job"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PANEL */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-850 text-xs text-zinc-400">
            <div>
              Showing page <span className="font-semibold text-zinc-300">{page}</span> of{' '}
              <span className="font-semibold text-zinc-300">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn-secondary py-1 px-2.5 gap-1 text-[11px]"
              >
                <ChevronLeft size={12} />
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn-secondary py-1 px-2.5 gap-1 text-[11px]"
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          
          {/* Dialog Container */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl w-full max-w-[560px] p-6 shadow-2xl relative z-10 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-400" />
                {editingJob ? 'Edit Application Details' : 'Add New Application'}
              </h2>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Error Messages */}
            {modalError && typeof modalError === 'string' && (
              <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/20 rounded-lg flex gap-3 text-sm text-red-400 items-start">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Job Title <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineer"
                    className="input-field"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                  {modalError && typeof modalError === 'object' && modalError.title && (
                    <p className="text-[11px] text-red-400 mt-1">{modalError.title[0]}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Company <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    className="input-field"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                  />
                  {modalError && typeof modalError === 'object' && modalError.company && (
                    <p className="text-[11px] text-red-400 mt-1">{modalError.company[0]}</p>
                  )}
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LinkedIn, Indeed"
                    className="input-field"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hybrid, Remote"
                    className="input-field"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Salary range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $120k - $140k"
                    className="input-field"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Stage status
                  </label>
                  <select
                    className="input-field"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                  >
                    <option value="WISHLIST">Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="OA">OA (Online Assessment)</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Application Date */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formAppDate}
                    onChange={(e) => setFormAppDate(e.target.value)}
                  />
                </div>

                {/* URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Job Posting URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://linkedin.com/jobs/..."
                    className="input-field"
                    value={formJobUrl}
                    onChange={(e) => setFormJobUrl(e.target.value)}
                  />
                  {modalError && typeof modalError === 'object' && modalError.jobUrl && (
                    <p className="text-[11px] text-red-400 mt-1">{modalError.jobUrl[0]}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add details, requirements, recruiter info..."
                    className="input-field resize-none py-2.5"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary min-w-[90px] justify-center"
                >
                  {modalLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingJob ? (
                    'Save Changes'
                  ) : (
                    'Create Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
