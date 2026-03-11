"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Building2, MapPin, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUSES, type Status } from "./status-switcher";

const KANBAN_COLUMNS: {
  id: string;
  label: string;
  statuses: Status[];
  dropStatus: Status;
  dotClass: string;
}[] = [
  { id: "tracking",    label: "Tracking",    statuses: ["active", "applying"],                              dropStatus: "active",    dotClass: "bg-zinc-400" },
  { id: "applied",     label: "Applied",     statuses: ["applied", "screening"],                            dropStatus: "applied",   dotClass: "bg-blue-400" },
  { id: "interviewing",label: "Interviewing",statuses: ["interview", "assessment", "final_round"],          dropStatus: "interview", dotClass: "bg-violet-400" },
  { id: "offer",       label: "Offer Stage", statuses: ["offer", "negotiating", "accepted"],                dropStatus: "offer",     dotClass: "bg-emerald-400" },
  { id: "closed",      label: "Closed",      statuses: ["rejected", "withdrawn", "ghosted", "declined"],   dropStatus: "rejected",  dotClass: "bg-red-400" },
];
import type { JobPosting } from "@/types/jobs";

interface JobKanbanBoardProps {
  jobs: JobPosting[];
  onStatusChange: (jobId: string, newStatus: Status, statusDate: string) => void;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function KanbanCard({ job, isDragging = false }: { job: JobPosting; isDragging?: boolean }) {
  const keywordCount =
    (job.required_skills?.length ?? 0) +
    (job.preferred_skills?.length ?? 0) +
    (job.keywords?.length ?? 0);

  return (
    <div
      className={`group rounded-lg border bg-card p-3 shadow-sm transition-shadow ${
        isDragging ? "shadow-lg opacity-80" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <Link
          href={`/jobs/${job.id}`}
          className="min-w-0 flex-1 text-sm font-medium leading-snug hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {job.title}
        </Link>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/70" />
      </div>
      {job.company && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
      )}
      {job.location && (
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
      )}
      {keywordCount > 0 && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {keywordCount} keyword{keywordCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}
    </div>
  );
}

// ─── Draggable card wrapper ────────────────────────────────────────────────────

function DraggableCard({ job }: { job: JobPosting }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : undefined }}
      className="touch-none"
    >
      <KanbanCard job={job} />
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  jobs,
}: {
  col: (typeof KANBAN_COLUMNS)[number];
  jobs: JobPosting[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="flex w-[240px] shrink-0 flex-col gap-2 md:w-auto md:flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${col.dotClass}`} />
          <span className="text-sm font-medium">{col.label}</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {jobs.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-col gap-2 rounded-lg border-2 border-dashed p-2 transition-colors ${
          isOver ? "border-primary/50 bg-primary/5" : "border-transparent bg-muted/30"
        }`}
      >
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <p className="my-auto text-center text-xs text-muted-foreground/50">Drop here</p>
        )}
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function JobKanbanBoard({ jobs, onStatusChange }: JobKanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<JobPosting | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const grouped = useMemo(() => {
    const map: Record<string, JobPosting[]> = {};
    for (const col of KANBAN_COLUMNS) map[col.id] = [];
    for (const job of jobs) {
      const col = KANBAN_COLUMNS.find((c) => (c.statuses as readonly string[]).includes(job.status));
      if (col) map[col.id].push(job);
    }
    return map;
  }, [jobs]);

  function handleDragEnd(event: DragEndEvent) {
    setActiveJob(null);
    const { active, over } = event;
    if (!over) return;
    const jobId = active.id as string;
    const col = KANBAN_COLUMNS.find((c) => c.id === over.id);
    if (!col) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const currentCol = KANBAN_COLUMNS.find((c) => (c.statuses as readonly string[]).includes(job.status));
    if (currentCol?.id === col.id) return;
    onStatusChange(jobId, col.dropStatus, new Date().toISOString().split("T")[0]);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        const job = jobs.find((j) => j.id === e.active.id);
        setActiveJob(job ?? null);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveJob(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 md:overflow-visible">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn key={col.id} col={col} jobs={grouped[col.id] ?? []} />
        ))}
      </div>

      <DragOverlay>
        {activeJob ? <KanbanCard job={activeJob} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
