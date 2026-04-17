"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { buildClaudeContext } from "@/lib/claudeContext";

export default function ContextBar({ projects }: { projects: Project[] }) {
  const [copyLabel, setCopyLabel] = useState("⎋ Copy Claude context");

  async function onCopy() {
    const md = buildClaudeContext(projects);
    try {
      await navigator.clipboard.writeText(md);
      setCopyLabel("✓ Copied to clipboard");
    } catch {
      // Fallback: hidden textarea + execCommand
      const ta = document.createElement("textarea");
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopyLabel("✓ Copied"); }
      catch { alert(md); }
      document.body.removeChild(ta);
    }
    setTimeout(() => setCopyLabel("⎋ Copy Claude context"), 1400);
  }

  function onDownload() {
    const md = buildClaudeContext(projects);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `wang-work-brain-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <footer className="mt-16 pt-6 border-t border-paper-edge flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
      <div>Live from Supabase · shared between you + Marco</div>
      <div className="flex gap-2.5">
        <button
          onClick={onCopy}
          title="Copy a markdown digest to paste into any Claude conversation or save as Claude memory"
          className="bg-transparent border border-paper-edge text-ink-soft px-3 py-1.5 rounded-full hover:text-ink hover:border-ink-faint transition-all"
        >
          {copyLabel}
        </button>
        <button
          onClick={onDownload}
          title="Download the same digest as a .md file"
          className="bg-transparent border border-paper-edge text-ink-soft px-3 py-1.5 rounded-full hover:text-ink hover:border-ink-faint transition-all"
        >
          ↓ Download .md
        </button>
      </div>
    </footer>
  );
}
