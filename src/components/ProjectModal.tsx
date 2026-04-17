"use client";

import { useState, useEffect } from "react";
import type { Project, Category, Status } from "@/lib/types";
import { CATEGORIES, CATEGORY_LONG, STATUSES, STATUS_LABEL, LINK_TYPES, type LinkKey } from "@/lib/constants";
import { uid } from "@/lib/utils";

export default function ProjectModal({
  project, allProjects, onClose, onSave, onDelete,
}: {
  project: Project | null;
  allProjects: Project[];
  onClose: () => void;
  onSave: (p: Project) => void;
  onDelete?: () => void;
}) {
  const [title,    setTitle]    = useState(project?.title || "");
  const [tagline,  setTagline]  = useState(project?.tagline || "");
  const [category, setCategory] = useState<Category>(project?.category || "misc");
  const [status,   setStatus]   = useState<Status>(project?.status || "idea");
  const [stack,    setStack]    = useState((project?.stack || []).join(", "));
  const [nextAct,  setNextAct]  = useState(project?.next_action || "");
  const [notes,    setNotes]    = useState(project?.notes || "");
  const [localPath, setLocalPath] = useState(project?.local_path || "");
  const [related,  setRelated]  = useState<string[]>(project?.related || []);
  const [linkVals, setLinkVals] = useState<Record<LinkKey, string>>(() => {
    const init: Record<string, string> = {};
    LINK_TYPES.forEach(t => { init[t.key] = project?.links?.[t.key] || ""; });
    return init as Record<LinkKey, string>;
  });

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function toggleRelated(id: string) {
    setRelated(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id]);
  }

  function save() {
    if (!title.trim()) return;
    const links: Record<string, string> = {};
    (Object.keys(linkVals) as LinkKey[]).forEach(k => {
      const v = linkVals[k].trim();
      if (v) links[k] = v;
    });
    const payload: Project = {
      id: project?.id || `user/${uid()}`,
      title: title.trim(),
      tagline: tagline.trim(),
      category,
      status,
      stack: stack.split(",").map(s => s.trim()).filter(Boolean),
      links: links as Project["links"],
      related,
      next_action: nextAct.trim(),
      notes: notes.trim(),
      local_path: localPath.trim(),
      sort_order: project?.sort_order ?? 999,
      updated_at: new Date().toISOString(),
    };
    onSave(payload);
  }

  const others = allProjects.filter(p => p.id !== project?.id);

  return (
    <div
      className="fixed inset-0 bg-[rgba(28,24,18,0.55)] backdrop-blur-[3px] z-50 flex justify-center items-start overflow-y-auto px-5 py-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-paper border border-paper-edge rounded w-full max-w-[620px] shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)] overflow-hidden animate-[pop_220ms_ease]">
        <header className="flex justify-between items-center px-7 pt-5 pb-4 border-b border-paper-edge">
          <h3 className="font-display text-[26px] m-0 tracking-[-0.01em] font-[440]" style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50' }}>
            {project ? "Edit project" : "New project"}
          </h3>
          <button onClick={onClose} className="text-[22px] text-ink-faint hover:text-accent leading-none">×</button>
        </header>

        <div className="px-7 py-5 space-y-3.5">
          <Field label="Project name">
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent focus:bg-[#fff8ea]" />
          </Field>

          <Field label="Tagline" hint="what it actually does">
            <input value={tagline} onChange={e => setTagline(e.target.value)}
              className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent focus:bg-[#fff8ea]" />
          </Field>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Category">
              <select value={category} onChange={e => setCategory(e.target.value as Category)}
                className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LONG[c]}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={e => setStatus(e.target.value as Status)}
                className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tech stack" hint="comma-separated">
            <input value={stack} onChange={e => setStack(e.target.value)} placeholder="Next.js, Supabase, Vercel"
              className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent" />
          </Field>

          <Field label="Next action">
            <input value={nextAct} onChange={e => setNextAct(e.target.value)}
              className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent" />
          </Field>

          <Field label="Notes & ideas" hint="URLs auto-link">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              className="w-full font-sans text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent min-h-[80px]" />
          </Field>

          <Field label="Local path" hint="for Claude Code launch, e.g. ~/Projects/photobox">
            <input value={localPath} onChange={e => setLocalPath(e.target.value)} placeholder="~/Projects/my-project"
              className="w-full font-mono text-sm px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm focus:outline-none focus:border-accent" />
          </Field>

          <Field label="Related projects" hint="how this connects to your other work">
            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto px-3 py-2.5 bg-paper-deep border border-paper-edge rounded-sm">
              {others.length === 0 ? (
                <div className="col-span-full text-ink-faint italic text-sm">Add more projects to start mapping connections.</div>
              ) : others.map(o => (
                <label key={o.id} className="flex items-center gap-2 text-sm text-ink-soft px-1.5 py-1 rounded-sm cursor-pointer hover:bg-paper hover:text-ink">
                  <input type="checkbox" checked={related.includes(o.id)} onChange={() => toggleRelated(o.id)} className="accent-accent" />
                  <span>{o.title}</span>
                </label>
              ))}
            </div>
          </Field>

          <div className="border border-paper-edge bg-paper-deep rounded-sm px-3.5 pt-3 pb-1.5">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint mb-2.5">Quick links. Leave blank if none.</div>
            {LINK_TYPES.map(t => (
              <div key={t.key} className="grid grid-cols-[80px_1fr] gap-2.5 items-center mb-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ background: linkDot(t.key) }} />
                  {t.label}
                </span>
                <input
                  value={linkVals[t.key]}
                  onChange={e => setLinkVals({ ...linkVals, [t.key]: e.target.value })}
                  placeholder={placeholders[t.key]}
                  className="w-full bg-paper text-[13px] px-2.5 py-1.5 border border-paper-edge rounded-sm focus:outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>
        </div>

        <footer className="flex justify-between gap-2.5 px-7 py-4 border-t border-paper-edge bg-paper-deep">
          {onDelete ? (
            <button onClick={onDelete} className="px-4 py-2 text-[13px] text-accent hover:underline">Delete project</button>
          ) : <div />}
          <div className="flex gap-2.5 ml-auto">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium rounded border border-paper-edge text-ink-soft hover:text-ink hover:border-ink-faint">Cancel</button>
            <button onClick={save} className="px-4 py-2 text-[13px] font-medium rounded bg-ink text-paper border border-ink hover:bg-accent hover:border-accent">Save</button>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes pop {
          from { transform: translateY(10px) scale(.98); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint mb-1.5">
        {label}
        {hint && <span className="ml-1.5 italic normal-case tracking-normal text-ink-faint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function linkDot(k: string): string {
  return ({ live:"#3E5B44", repo:"#1C1812", admin:"#B0451F", host:"#334A6B", design:"#7A4A8C", docs:"#4A4236" } as Record<string,string>)[k];
}

const placeholders: Record<string, string> = {
  live:   "https://…",
  repo:   "github URL. Comma-separate for app + backend, etc.",
  admin:  "Supabase / database / backend",
  host:   "Vercel / Railway / etc. Comma-separate for multiple.",
  design: "Figma / mockup",
  docs:   "Notion / Google Doc / spec",
};
