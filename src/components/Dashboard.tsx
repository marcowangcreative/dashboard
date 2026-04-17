"use client";

import { useMemo, useState, useTransition } from "react";
import type { Project, Category, Status } from "@/lib/types";
import {
  CATEGORIES, CATEGORY_LABEL, STATUS_LABEL, LINK_TYPES,
} from "@/lib/constants";
import { splitUrls, deriveLinkLabel, timeAgo, linkifyNotes } from "@/lib/utils";
import { upsertProject, deleteProject, syncRelationships } from "@/lib/actions";
import ProjectModal from "./ProjectModal";
import GraphView from "./GraphView";
import ContextBar from "./ContextBar";

type View = "cards" | "graph";
type StatusFilter = "all" | Status;
type CatFilter = "all" | Category;
type SortKey = "updated" | "status" | "name";

export default function Dashboard({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [view, setView]         = useState<View>("cards");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [catFilter, setCatFilter]       = useState<CatFilter>("all");
  const [sort, setSort]         = useState<SortKey>("updated");
  const [editing, setEditing]   = useState<Project | null>(null);
  const [isOpen, setIsOpen]     = useState(false);
  const [, startTransition]     = useTransition();

  const counts = useMemo(() => {
    const c = { total: projects.length, idea: 0, building: 0, live: 0, shelved: 0 };
    projects.forEach(p => { c[p.status]++; });
    return c;
  }, [projects]);

  const list = useMemo(() => {
    let l = [...projects];
    if (statusFilter !== "all") l = l.filter(p => p.status === statusFilter);
    if (catFilter    !== "all") l = l.filter(p => p.category === catFilter);
    if (sort === "updated")
      l.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
    else if (sort === "status")
      l.sort((a, b) => ["building","idea","live","shelved"].indexOf(a.status) -
                       ["building","idea","live","shelved"].indexOf(b.status));
    else if (sort === "name")
      l.sort((a, b) => a.title.localeCompare(b.title));
    return l;
  }, [projects, statusFilter, catFilter, sort]);

  function openNew()  { setEditing(null); setIsOpen(true); }
  function openEdit(p: Project) { setEditing(p); setIsOpen(true); }

  async function handleSave(p: Project) {
    startTransition(async () => {
      await upsertProject({ ...p, id: p.id });
      await syncRelationships(p.id, p.related);
      setProjects(prev => {
        const exists = prev.some(x => x.id === p.id);
        const updated = exists
          ? prev.map(x => x.id === p.id ? p : x)
          : [p, ...prev];
        return updated;
      });
      setIsOpen(false);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    startTransition(async () => {
      await deleteProject(id);
      setProjects(prev => prev.filter(x => x.id !== id));
      setIsOpen(false);
    });
  }

  async function handleCycleStatus(p: Project) {
    const order: Status[] = ["idea","building","live","shelved"];
    const next = order[(order.indexOf(p.status) + 1) % order.length];
    const updated = { ...p, status: next };
    startTransition(async () => {
      await upsertProject(updated);
      setProjects(prev => prev.map(x => x.id === p.id ? updated : x));
    });
  }

  function sortLabel(k: SortKey) {
    return ({ updated: "Updated", status: "Status", name: "Name" } as const)[k];
  }

  return (
    <>
      {/* Summary */}
      <section className="grid grid-cols-4 gap-[2px] bg-paper-edge p-[2px] rounded mb-9 max-sm:grid-cols-2 overflow-hidden">
        <SummaryCell n={counts.total}    label="Total projects" />
        <SummaryCell n={counts.building} label="In the darkroom" color="accent" />
        <SummaryCell n={counts.idea}     label="On the light table" />
        <SummaryCell n={counts.live}     label="Shipped & live" color="sage" />
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-1.5 flex-wrap items-center">
          <FilterChip active={statusFilter === "all"}      onClick={() => setStatusFilter("all")}>All</FilterChip>
          <FilterChip active={statusFilter === "idea"}     onClick={() => setStatusFilter("idea")}>Idea</FilterChip>
          <FilterChip active={statusFilter === "building"} onClick={() => setStatusFilter("building")}>Building</FilterChip>
          <FilterChip active={statusFilter === "live"}     onClick={() => setStatusFilter("live")}>Live</FilterChip>
          <FilterChip active={statusFilter === "shelved"}  onClick={() => setStatusFilter("shelved")}>Shelved</FilterChip>
          <span className="w-px self-stretch bg-paper-edge mx-1.5" />
          <FilterChip active={catFilter === "all"}      onClick={() => setCatFilter("all")}>All categories</FilterChip>
          <FilterChip active={catFilter === "photo"}    onClick={() => setCatFilter("photo")}    colorVar="#2E5568">Photo</FilterChip>
          <FilterChip active={catFilter === "weddings"} onClick={() => setCatFilter("weddings")} colorVar="#8E5378">Weddings</FilterChip>
          <FilterChip active={catFilter === "hair"}     onClick={() => setCatFilter("hair")}     colorVar="#A8574E">Hair</FilterChip>
          <FilterChip active={catFilter === "misc"}     onClick={() => setCatFilter("misc")}     colorVar="#7F7869">Misc</FilterChip>
        </div>
        <div className="flex gap-2.5 items-center">
          <div className="inline-flex border border-paper-edge rounded-full bg-paper-deep p-[3px] gap-[2px]">
            <ViewChip active={view === "cards"} onClick={() => setView("cards")}>Cards</ViewChip>
            <ViewChip active={view === "graph"} onClick={() => setView("graph")}>Graph</ViewChip>
          </div>
          <button
            onClick={() => setSort(s => ({ updated:"status", status:"name", name:"updated" } as const)[s])}
            className="px-4 py-2 text-[13px] font-medium rounded border border-paper-edge text-ink-soft hover:text-ink hover:border-ink-faint transition-all"
          >
            Sort: {sortLabel(sort)}
          </button>
          <button
            onClick={openNew}
            className="px-4 py-2 text-[13px] font-medium rounded bg-ink text-paper border border-ink hover:bg-accent hover:border-accent hover:-translate-y-px transition-all"
          >
            + Add project
          </button>
        </div>
      </div>

      {/* Card grid */}
      {view === "cards" && (
        <section className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {list.length === 0 ? (
            <div className="col-span-full text-center py-20 text-ink-faint font-display italic text-2xl">
              Nothing here yet. Press <em>+ Add project</em>.
            </div>
          ) : list.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i + 1}
              onEdit={() => openEdit(p)}
              onCycle={() => handleCycleStatus(p)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </section>
      )}

      {/* Graph */}
      {view === "graph" && <GraphView projects={projects} onNodeClick={openEdit} />}

      {/* Modal */}
      {isOpen && (
        <ProjectModal
          project={editing}
          allProjects={projects}
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          onDelete={editing ? () => handleDelete(editing.id) : undefined}
        />
      )}

      {/* Claude context export */}
      <ContextBar projects={projects} />
    </>
  );
}

/* ---------- subcomponents ---------- */

function SummaryCell({ n, label, color }: { n: number; label: string; color?: "accent" | "sage" }) {
  const clr = color === "accent" ? "text-accent" : color === "sage" ? "text-sage" : "text-ink";
  return (
    <div className="bg-paper-deep px-[22px] py-[18px] flex flex-col gap-0.5">
      <div className={`font-display text-[34px] font-medium leading-none ${clr}`} style={{ fontVariationSettings: '"opsz" 144' }}>
        {String(n).padStart(2, "0")}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mt-1">{label}</div>
    </div>
  );
}

function FilterChip({
  active, onClick, children, colorVar,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  colorVar?: string;
}) {
  const base = "font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-[7px] rounded-full transition-all cursor-pointer border";
  if (active) return <button onClick={onClick} className={`${base} bg-ink text-paper border-ink`}>{children}</button>;
  return (
    <button
      onClick={onClick}
      className={`${base} bg-transparent border-paper-edge hover:border-ink-faint`}
      style={colorVar ? { color: colorVar } : { color: "#4A4236" }}
    >
      {children}
    </button>
  );
}

function ViewChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full font-mono text-[10.5px] uppercase tracking-[0.16em] transition-all ${
        active ? "bg-ink text-paper" : "text-ink-faint hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Card ---------- */

function ProjectCard({
  project: p, index, onEdit, onCycle, onDelete,
}: {
  project: Project;
  index: number;
  onEdit: () => void;
  onCycle: () => void;
  onDelete: () => void;
}) {
  const idx = String(index).padStart(2, "0");
  const catClass = `card-${p.category}`;
  const statusBorder =
    p.status === "building" ? "ring-4 ring-accent/15" : "";

  return (
    <article
      className={`relative crop-corners border rounded p-[26px] pb-5 flex flex-col gap-3 shadow-[0_1px_0_rgba(0,0,0,.04),0_12px_30px_-18px_rgba(40,24,8,.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_0_rgba(0,0,0,.04),0_22px_40px_-20px_rgba(40,24,8,.45)] hover:border-ink-faint ${catClass}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] font-medium`} style={{ color: `var(--cat-${p.category}, #7F7869)` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: catColor(p.category) }} />
            {CATEGORY_LABEL[p.category]}
          </span>
          <span className="font-mono text-[11px] text-ink-faint tracking-[0.15em]">№ {idx}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          <span className={`w-2 h-2 rounded-full ${statusDotClass(p.status)} ${statusBorder}`} />
          {STATUS_LABEL[p.status]}
        </div>
      </div>

      <h2 className="font-display text-[26px] leading-[1.1] tracking-[-0.015em] font-[460] mt-1" style={{ fontVariationSettings: '"opsz" 72, "SOFT" 40' }}>
        {p.title}
      </h2>
      {p.tagline && <p className="italic text-ink-soft text-sm leading-snug -mt-0.5">{p.tagline}</p>}

      {p.next_action && (
        <div className="bg-paper border-l-2 border-accent rounded-sm px-3.5 py-[11px] text-[14px] leading-snug">
          <span className="block font-mono text-[9.5px] uppercase tracking-[0.2em] text-accent mb-0.5">Next</span>
          {p.next_action}
        </div>
      )}

      {p.notes && (
        <div className="text-[13.5px] text-ink-soft leading-[1.55] whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: linkifyNotes(p.notes) }} />
      )}

      {p.stack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.stack.map(t => (
            <span key={t} className="font-mono text-[10px] tracking-[0.06em] px-2 py-0.5 border border-paper-edge bg-paper text-ink-soft rounded-sm">{t}</span>
          ))}
        </div>
      )}

      <LinkPills links={p.links} />

      <div className="mt-auto pt-3 border-t border-dashed border-paper-edge flex justify-between items-center gap-2.5">
        <span className="font-mono text-[10px] text-ink-faint tracking-[0.06em]">Updated {timeAgo(p.updated_at)}</span>
        <div className="flex gap-0.5">
          <IconBtn onClick={onEdit}>Edit</IconBtn>
          <IconBtn onClick={onCycle} title="Cycle status">↻</IconBtn>
          <IconBtn onClick={onDelete} danger>Del</IconBtn>
        </div>
      </div>
    </article>
  );
}

function IconBtn({ onClick, children, danger, title }: { onClick: () => void; children: React.ReactNode; danger?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] rounded-sm transition-all text-ink-faint hover:bg-paper ${danger ? "hover:text-accent" : "hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function LinkPills({ links }: { links: Project["links"] }) {
  const items: { key: string; label: string; url: string }[] = [];
  LINK_TYPES.forEach(t => {
    const urls = splitUrls(links?.[t.key]);
    urls.forEach(url => {
      items.push({
        key: t.key,
        label: urls.length > 1 ? deriveLinkLabel(url, t.label) : t.label,
        url,
      });
    });
  });
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <a
          key={i}
          href={it.url}
          target="_blank"
          rel="noopener"
          title={it.url}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium pl-2.5 pr-3 py-1.5 bg-paper border border-paper-edge rounded-full text-ink hover:bg-ink hover:text-paper hover:border-ink transition-all"
        >
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: linkDotColor(it.key) }} />
          {it.label}
          <span className="text-[11px] text-ink-faint">↗</span>
        </a>
      ))}
    </div>
  );
}

function catColor(cat: Category): string {
  return ({ photo: "#2E5568", hair: "#A8574E", weddings: "#8E5378", misc: "#7F7869" } as const)[cat];
}

function statusDotClass(s: Status): string {
  return ({
    idea:     "bg-[#9A8754]",
    building: "bg-accent",
    live:     "bg-sage",
    shelved:  "bg-ink-faint",
  } as Record<Status, string>)[s];
}

function linkDotColor(key: string): string {
  return ({
    live:   "#3E5B44",
    repo:   "#1C1812",
    admin:  "#B0451F",
    host:   "#334A6B",
    design: "#7A4A8C",
    docs:   "#4A4236",
  } as Record<string, string>)[key] || "#8A8172";
}
