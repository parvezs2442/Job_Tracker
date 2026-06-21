'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ChevronRight,
  TrendingUp,
  X,
  Sparkles
} from 'lucide-react';
import { InterviewType, InterviewResult } from '@prisma/client';

interface Interview {
  id: string;
  jobId: string;
  round: string;
  type: InterviewType;
  scheduledDate: string;
  feedback: string | null;
  result: InterviewResult;
  createdAt: string;
  job: {
    title: string;
    company: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formJobId, setFormJobId] = useState('');
  const [formRound, setFormRound] = useState('');
  const [formType, setFormType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [formDate, setFormDate] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [formResult, setFormResult] = useState<InterviewResult>(InterviewResult.PENDING);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch interviews
      const intRes = await fetch('/api/interviews');
      if (!intRes.ok) throw new Error('Failed to retrieve interviews');
      const intData = await intRes.json();
      setInterviews(intData);

      // Fetch active jobs (for dropdown selection)
      const jobsRes = await fetch('/api/jobs?limit=100');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setActiveJobs(jobsData.jobs.map((j: any) => ({ id: j.id, title: j.title, company: j.company })));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingInterview(null);
    setFormJobId(activeJobs[0]?.id || '');
    setFormRound('');
    setFormType(InterviewType.TECHNICAL);
    // Set default date to 1 day from now
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(0);
    setFormDate(new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setFormFeedback('');
    setFormResult(InterviewResult.PENDING);
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (interview: Interview) => {
    setEditingInterview(interview);
    setFormJobId(interview.jobId);
    setFormRound(interview.round);
    setFormType(interview.type);
    setFormDate(new Date(new Date(interview.scheduledDate).getTime() - new Date(interview.scheduledDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setFormFeedback(interview.feedback || '');
    setFormResult(interview.result);
    setModalError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingInterview(null);
    setModalError(null);
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJobId && !editingInterview) {
      setModalError('Please select a valid job application.');
      return;
    }
    setModalLoading(true);
    setModalError(null);

    const payload = {
      jobId: editingInterview ? undefined : formJobId, // Job ID is immutable once scheduled
      round: formRound,
      type: formType,
      scheduledDate: new Date(formDate).toISOString(),
      feedback: formFeedback || null,
      result: formResult,
    };

    try {
      const url = editingInterview ? `/api/interviews/${editingInterview.id}` : '/api/interviews';
      const method = editingInterview ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An error occurred while saving the interview');
      }

      handleCloseModal();
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Network request failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteInterview = async (id: string, round: string) => {
    if (!confirm(`Are you sure you want to cancel the scheduled "${round}" interview?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/interviews/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Could not delete scheduled interview');
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete interview');
    }
  };

  // Check if an interview is scheduled within 24 hours
  const isWithin24Hours = (dateStr: string) => {
    const interviewTime = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = interviewTime - now;
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  };

  const getResultIcon = (result: InterviewResult) => {
    switch (result) {
      case InterviewResult.PASSED:
        return <CheckCircle className="text-emerald-400" size={16} />;
      case InterviewResult.FAILED:
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-amber-400" size={16} />;
    }
  };

  const getResultStyle = (result: InterviewResult) => {
    switch (result) {
      case InterviewResult.PASSED:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case InterviewResult.FAILED:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-indigo-400" size={24} />
            Interview Schedule
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Schedule and manage interview rounds, results, and feedback.</p>
        </div>

        {activeJobs.length > 0 && (
          <button 
            onClick={handleOpenCreateModal}
            className="btn-primary py-2 px-4 shadow-lg"
          >
            <Plus size={16} />
            Schedule Interview
          </button>
        )}
      </div>

      {/* ERROR / EMPTY STATE */}
      {error && (
        <div className="p-3.5 bg-red-950/30 border border-red-500/20 rounded-lg flex gap-3 text-sm text-red-400 max-w-lg">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
          <span className="text-sm text-zinc-400">Loading interview timeline...</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-10 text-center max-w-sm mx-auto shadow-sm">
          <CalendarDays className="mx-auto text-zinc-650 mb-4" size={32} />
          <h3 className="text-base font-semibold text-zinc-300">No interviews scheduled</h3>
          {activeJobs.length === 0 ? (
            <p className="text-xs text-zinc-500 mt-1.5 mb-6">
              You must add at least one job application before you can schedule interviews.
            </p>
          ) : (
            <>
              <p className="text-xs text-zinc-500 mt-1.5 mb-6">
                You have no scheduled interview rounds recorded yet.
              </p>
              <button onClick={handleOpenCreateModal} className="btn-primary py-2 px-4 text-xs">
                Schedule First Interview
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TIMELINE VIEW */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Interview Timeline</h2>
            
            <div className="relative border-l border-zinc-800 pl-6 ml-4 space-y-6 py-2">
              {interviews.map((interview) => {
                const urgent = isWithin24Hours(interview.scheduledDate);
                const isPast = new Date(interview.scheduledDate).getTime() < Date.now();
                
                return (
                  <div 
                    key={interview.id} 
                    className={`
                      relative card p-5 hover:bg-zinc-900/40 border border-zinc-800/80 transition-all duration-200
                      ${urgent ? 'glow-24h border-indigo-500/50' : ''}
                      ${isPast && interview.result === InterviewResult.PENDING ? 'border-zinc-800 bg-zinc-900/10' : ''}
                    `}
                  >
                    {/* Circle timeline connector marker */}
                    <span className={`
                      absolute -left-[31px] top-7 w-3.5 h-3.5 rounded-full border-2 ring-4 ring-[#09090b]
                      ${urgent ? 'bg-indigo-500 border-indigo-400' : 'bg-zinc-800 border-zinc-700'}
                    `} />

                    {/* Urgent Alert Banner */}
                    {urgent && (
                      <div className="mb-3.5 py-1 px-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-md flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider animate-pulse">
                        <Sparkles size={11} /> Interview happening in less than 24 hours!
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {interview.type} ROUND
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-200 mt-0.5">
                          {interview.round}
                        </h3>
                        <p className="text-xs text-indigo-400 font-medium mt-1">
                          {interview.job.company} — <span className="text-zinc-400">{interview.job.title}</span>
                        </p>
                      </div>

                      <span className={`inline-flex items-center border text-[10px] font-bold px-2 py-0.5 rounded-md ${getResultStyle(interview.result)}`}>
                        {interview.result}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-850 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-zinc-500" />
                        <span>
                          {new Date(interview.scheduledDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} className="text-zinc-500" />
                        <span>
                          {new Date(interview.scheduledDate).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {interview.feedback && (
                      <div className="mt-4 p-3 bg-zinc-950/40 rounded-lg text-xs text-zinc-400 border border-zinc-850/60">
                        <div className="font-semibold text-zinc-500 mb-1 flex items-center gap-1.5">
                          <FileText size={12} /> Notes & Feedback:
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{interview.feedback}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-zinc-850/40">
                      <button
                        onClick={() => handleOpenEditModal(interview)}
                        className="btn-secondary py-1 px-3 text-[11px]"
                      >
                        Edit / Log Result
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(interview.id, interview.round)}
                        className="text-xs text-red-500 hover:text-red-400 font-medium px-2 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDE INFO CARD */}
          <div className="space-y-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Metrics Overview</h2>
            
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-zinc-850">
                <span className="text-xs text-zinc-400">Total Interviews Logged</span>
                <span className="text-sm font-semibold text-zinc-200">{interviews.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-850">
                <span className="text-xs text-zinc-400">Passed Rounds</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {interviews.filter(i => i.result === InterviewResult.PASSED).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-850">
                <span className="text-xs text-zinc-400">Failed Rounds</span>
                <span className="text-sm font-semibold text-red-400">
                  {interviews.filter(i => i.result === InterviewResult.FAILED).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-zinc-400">Pending Response</span>
                <span className="text-sm font-semibold text-amber-400">
                  {interviews.filter(i => i.result === InterviewResult.PENDING).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE & EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          
          {/* Dialog Container */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl w-full max-w-[480px] p-6 shadow-2xl relative z-10 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-400" />
                {editingInterview ? 'Edit Interview Details' : 'Schedule Interview Round'}
              </h2>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/20 rounded-lg flex gap-3 text-sm text-red-400 items-start">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveInterview} className="space-y-4">
              
              {/* Job Selection Dropdown (Create Mode Only) */}
              {!editingInterview && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Select Job Application <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    className="input-field"
                    required
                    value={formJobId}
                    onChange={(e) => setFormJobId(e.target.value)}
                  >
                    {activeJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.company} — {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Round Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Round Title / Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coding Assessment, Technical Panel"
                  className="input-field"
                  value={formRound}
                  onChange={(e) => setFormRound(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Interview Type */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Interview Type
                  </label>
                  <select
                    className="input-field"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as InterviewType)}
                  >
                    <option value="HR">HR / Recruiter Screening</option>
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="MANAGERIAL">Managerial Fit</option>
                    <option value="FINAL">Final Executive Round</option>
                  </select>
                </div>

                {/* Status / Result */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    Round Result
                  </label>
                  <select
                    className="input-field"
                    value={formResult}
                    onChange={(e) => setFormResult(e.target.value as InterviewResult)}
                  >
                    <option value="PENDING">Pending Response</option>
                    <option value="PASSED">Passed Round</option>
                    <option value="FAILED">Failed Round</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Scheduled Date & Time <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  className="input-field"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              {/* Notes / Feedback */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Round Notes / Recruiter Feedback
                </label>
                <textarea
                  rows={4}
                  placeholder="Record interview notes, questions asked, prep plans, or recap feedback details here..."
                  className="input-field resize-none py-2.5"
                  value={formFeedback}
                  onChange={(e) => setFormFeedback(e.target.value)}
                />
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
                  ) : editingInterview ? (
                    'Save Changes'
                  ) : (
                    'Schedule'
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
