'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  useDroppable, 
  useDraggable,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  Active
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  Trello, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { JobStatus } from '@prisma/client';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  platform: string | null;
  status: JobStatus;
  applicationDate: string;
  jobUrl: string | null;
}

// Columns configuration
const COLUMNS: { id: JobStatus; title: string; color: string; dotColor: string }[] = [
  { id: JobStatus.WISHLIST, title: 'Wishlist', color: 'border-zinc-800 bg-zinc-900/10', dotColor: 'bg-zinc-500' },
  { id: JobStatus.APPLIED, title: 'Applied', color: 'border-blue-500/10 bg-blue-500/[0.01]', dotColor: 'bg-blue-500' },
  { id: JobStatus.OA, title: 'Online Assessment', color: 'border-amber-500/10 bg-amber-500/[0.01]', dotColor: 'bg-amber-500' },
  { id: JobStatus.INTERVIEW, title: 'Interviewing', color: 'border-purple-500/10 bg-purple-500/[0.01]', dotColor: 'bg-purple-500' },
  { id: JobStatus.OFFER, title: 'Offers', color: 'border-emerald-500/10 bg-emerald-500/[0.01]', dotColor: 'bg-emerald-500' },
  { id: JobStatus.REJECTED, title: 'Rejected', color: 'border-red-500/10 bg-red-500/[0.01]', dotColor: 'bg-red-500' },
];

export default function KanbanBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track currently dragged item details
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeJob = useMemo(() => jobs.find(j => j.id === activeId) || null, [activeId, jobs]);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires dragging 8px before activation to distinguish clicks from drags
      },
    })
  );

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=100'); // Fetch up to 100 jobs for board view
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs);
    } catch (err: any) {
      setError(err.message || 'An error occurred loading jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;
    
    // Find target job
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate || jobToUpdate.status === newStatus) return;

    // Save previous state for potential rollback
    const previousJobs = [...jobs];

    // 1. Optimistic Update (Immediate UI response)
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    // 2. Server Sync
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update stage on the database');
      }
    } catch (err: any) {
      console.error('Failed to sync Kanban drop:', err);
      // Rollback to previous state on failure
      setJobs(previousJobs);
      alert('Failed to update application stage. Reverting changes.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-indigo-500 mb-4" />
        <span className="text-sm text-zinc-400">Loading Kanban board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-400">
        <AlertCircle className="mx-auto mb-3" size={28} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Title bar */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Trello className="text-indigo-400" size={24} />
            Pipeline Kanban
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Drag and drop job cards to change their active stage.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-10 text-center max-w-md mx-auto my-auto shadow-sm">
          <Briefcase className="mx-auto text-zinc-600 mb-4" size={32} />
          <h3 className="text-base font-semibold text-zinc-300">No applications to display</h3>
          <p className="text-xs text-zinc-500 mt-1.5 mb-6">
            You need to add job applications to see them in the pipeline stages.
          </p>
          <Link href="/jobs" className="btn-primary py-2 px-4 text-xs">
            Add Application
          </Link>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto pb-4 flex gap-4 min-h-0 select-none items-start">
            {COLUMNS.map((col) => {
              const columnJobs = jobs.filter(j => j.status === col.id);
              return (
                <KanbanColumn 
                  key={col.id} 
                  id={col.id} 
                  title={col.title} 
                  color={col.color}
                  dotColor={col.dotColor}
                  count={columnJobs.length}
                >
                  {columnJobs.map((job) => (
                    <KanbanCard key={job.id} job={job} />
                  ))}
                </KanbanColumn>
              );
            })}
          </div>

          {/* Render standard floating ghost when item is active */}
          <DragOverlay>
            {activeJob ? (
              <div className="w-[280px] bg-zinc-900 border-2 border-indigo-500 rounded-xl p-4 shadow-2xl opacity-90 scale-105 pointer-events-none cursor-grabbing">
                <div className="font-semibold text-sm text-zinc-100 truncate">{activeJob.title}</div>
                <div className="text-xs text-zinc-400 mt-1 truncate">{activeJob.company}</div>
                {activeJob.location && (
                  <div className="text-[10px] text-zinc-550 mt-3 flex items-center gap-1">
                    <MapPin size={10} /> {activeJob.location}
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

// Droppable Column Component
interface ColumnProps {
  id: JobStatus;
  title: string;
  color: string;
  dotColor: string;
  count: number;
  children: React.ReactNode;
}

function KanbanColumn({ id, title, color, dotColor, count, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`
        w-[290px] max-h-full flex flex-col shrink-0 rounded-xl border border-zinc-800/80 p-3.5 transition-colors duration-200
        ${color} ${isOver ? 'ring-2 ring-indigo-500/20 bg-indigo-500/[0.02]' : ''}
      `}
    >
      {/* Column Title */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
        </div>
        <span className="bg-zinc-800/60 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700/30">
          {count}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {children}
        {count === 0 && (
          <div className="border border-dashed border-zinc-850 rounded-xl py-8 text-center text-zinc-650 text-[11px]">
            No jobs in this stage
          </div>
        )}
      </div>
    </div>
  );
}

// Draggable Card Component
interface CardProps {
  job: Job;
}

function KanbanCard({ job }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`
        bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl shadow-sm hover:border-zinc-700 transition-all duration-200
        group relative active:cursor-grabbing hover:bg-zinc-900
      `}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="font-semibold text-sm text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
          {job.title}
        </div>
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent triggering drag context
            className="text-zinc-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="text-xs text-zinc-400 mt-1 truncate">{job.company}</div>

      {/* Bottom Row */}
      <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-zinc-850/60">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 truncate">
            <MapPin size={10} className="shrink-0" /> {job.location}
          </span>
        )}
        
        <div className="flex justify-between items-center text-[9px] text-zinc-500">
          <span>
            {job.platform || 'Direct'}
          </span>
          <span>
            {new Date(job.applicationDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
