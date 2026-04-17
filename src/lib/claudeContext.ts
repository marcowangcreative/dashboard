import type { Project } from "./types";
import { STATUS_LABEL, LINK_TYPES } from "./constants";
import { splitUrls, deriveLinkLabel } from "./utils";

export function buildClaudeContext(projects: Project[]): string {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const byId = new Map(projects.map(p => [p.id, p]));
  const lines: string[] = [];

  lines.push("# Wang Work Brain: Project Context");
  lines.push("");
  lines.push(`_Snapshot: ${today}. This is a digest of my in-progress photography and wedding-tech projects. Use it to understand how they connect before helping with any single one._`);
  lines.push("");

  // Status at a glance
  const byStatus = {
    building: [] as Project[],
    idea:     [] as Project[],
    live:     [] as Project[],
    shelved:  [] as Project[],
  };
  projects.forEach(p => byStatus[p.status]?.push(p));
  lines.push("## At a glance");
  lines.push("");
  lines.push(`- **Building now (${byStatus.building.length}):** ${byStatus.building.map(p => p.title).join(", ") || "none"}`);
  lines.push(`- **On the light table / ideas (${byStatus.idea.length}):** ${byStatus.idea.map(p => p.title).join(", ") || "none"}`);
  lines.push(`- **Live (${byStatus.live.length}):** ${byStatus.live.map(p => p.title).join(", ") || "none"}`);
  if (byStatus.shelved.length) {
    lines.push(`- **Shelved (${byStatus.shelved.length}):** ${byStatus.shelved.map(p => p.title).join(", ")}`);
  }
  lines.push("");

  // Category breakdown
  const byCat = {
    photo:    [] as Project[],
    hair:     [] as Project[],
    weddings: [] as Project[],
    misc:     [] as Project[],
  };
  projects.forEach(p => byCat[p.category]?.push(p));
  lines.push(`- **By business:** Photo (${byCat.photo.length}) · Weddings/joint (${byCat.weddings.length}) · Hair (${byCat.hair.length}) · Misc (${byCat.misc.length})`);
  lines.push("");

  // Grouped detail
  const CAT_HEAD = {
    photo:    "## Photo business (MWP / Marco Wang Creative)",
    weddings: "## Weddings: the joint surface where Jordan (hair) + Marco (photo) work together",
    hair:     "## Hair business (Flowe Collective, Jordan)",
    misc:     "## Misc",
  } as const;

  let idx = 0;
  (["photo", "weddings", "hair", "misc"] as const).forEach(cat => {
    const items = byCat[cat];
    if (!items.length) return;
    lines.push(CAT_HEAD[cat]);
    lines.push("");
    items.forEach(p => {
      const n = String(++idx).padStart(2, "0");
      lines.push(`### ${n} · ${p.title}`);
      if (p.tagline) lines.push(`*${p.tagline}*`);
      lines.push("");
      lines.push(`- **Status:** ${STATUS_LABEL[p.status] || p.status}`);
      if (p.stack?.length) lines.push(`- **Stack:** ${p.stack.join(", ")}`);
      if (p.next_action) lines.push(`- **Next action:** ${p.next_action}`);

      const linkLines: string[] = [];
      LINK_TYPES.forEach(t => {
        const urls = splitUrls(p.links?.[t.key]);
        urls.forEach(url => {
          const lbl = urls.length > 1 ? deriveLinkLabel(url, t.label) : t.label;
          linkLines.push(`  - ${lbl}: ${url}`);
        });
      });
      if (linkLines.length) {
        lines.push(`- **Links:**`);
        linkLines.forEach(l => lines.push(l));
      }

      const relatedTitles = (p.related || [])
        .map(rid => byId.get(rid)?.title)
        .filter(Boolean);
      if (relatedTitles.length) {
        lines.push(`- **Connects to:** ${relatedTitles.join(", ")}`);
      }

      if (p.notes) {
        lines.push(`- **Notes:**`);
        p.notes.split("\n").forEach(line => lines.push(`  > ${line}`));
      }
      lines.push("");
    });
  });

  // Relationship map
  const edges: string[] = [];
  const seen = new Set<string>();
  projects.forEach(p => {
    (p.related || []).forEach(rid => {
      const key = [p.id, rid].sort().join("::");
      if (seen.has(key)) return;
      seen.add(key);
      const other = byId.get(rid);
      if (other) edges.push(`- ${p.title} ↔ ${other.title}`);
    });
  });
  if (edges.length) {
    lines.push("## How things connect");
    lines.push("");
    edges.forEach(e => lines.push(e));
    lines.push("");
  }

  lines.push("---");
  lines.push("_When you help me with one of these, assume the others exist and may be affected. Flag any overlap or reuse opportunity you notice._");
  lines.push("");
  return lines.join("\n");
}

export function buildSingleProjectContext(project: Project, allProjects: Project[]): string {
  const byId = new Map(allProjects.map(p => [p.id, p]));
  const lines: string[] = [];

  lines.push(`# Focus: ${project.title}`);
  if (project.tagline) lines.push(`*${project.tagline}*`);
  lines.push("");
  lines.push(`- **Status:** ${STATUS_LABEL[project.status] || project.status}`);
  lines.push(`- **Category:** ${project.category}`);
  if (project.stack?.length) lines.push(`- **Stack:** ${project.stack.join(", ")}`);
  if (project.next_action) lines.push(`- **Next action:** ${project.next_action}`);

  const linkLines: string[] = [];
  LINK_TYPES.forEach(t => {
    const urls = splitUrls(project.links?.[t.key]);
    urls.forEach(url => {
      const lbl = urls.length > 1 ? deriveLinkLabel(url, t.label) : t.label;
      linkLines.push(`  - ${lbl}: ${url}`);
    });
  });
  if (linkLines.length) {
    lines.push(`- **Links:**`);
    linkLines.forEach(l => lines.push(l));
  }

  if (project.notes) {
    lines.push(`- **Notes:**`);
    project.notes.split("\n").forEach(line => lines.push(`  > ${line}`));
  }
  lines.push("");

  // Related projects with brief context
  const relatedProjects = (project.related || [])
    .map(rid => byId.get(rid))
    .filter((p): p is Project => !!p);
  if (relatedProjects.length) {
    lines.push("## Related projects (brief)");
    lines.push("");
    relatedProjects.forEach(rp => {
      lines.push(`- **${rp.title}** (${STATUS_LABEL[rp.status]}) — ${rp.tagline || "no description"}`);
      if (rp.links?.repo) lines.push(`  Repo: ${rp.links.repo}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("_Help me work on this project. Read the repo to understand the current codebase, then tackle the next action. Flag any overlap or reuse opportunities with the related projects listed above. After completing each meaningful change, commit and push to the remote with a clear commit message._");
  lines.push("");
  return lines.join("\n");
}
