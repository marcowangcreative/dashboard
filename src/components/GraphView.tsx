"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Project } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/constants";

type Node = d3.SimulationNodeDatum & {
  id: string;
  title: string;
  category: Project["category"];
  status: Project["status"];
  related: string[];
  degree: number;
};
type Link = d3.SimulationLinkDatum<Node>;

const CAT_COLORS = {
  photo:    "#2E5568",
  hair:     "#A8574E",
  weddings: "#8E5378",
  misc:     "#7F7869",
} as const;
const STATUS_STROKE = {
  building: "#B0451F",
  live:     "#3E5B44",
  idea:     "#9A8754",
  shelved:  "#8A8172",
} as const;

export default function GraphView({
  projects, onNodeClick,
}: {
  projects: Project[];
  onNodeClick: (p: Project) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const rect = svgRef.current.getBoundingClientRect();
    const W = rect.width  || 900;
    const H = rect.height || 600;

    const nodes: Node[] = projects.map(p => ({
      id: p.id, title: p.title,
      category: p.category, status: p.status,
      related: (p.related || []).slice(),
      degree: 0,
    }));
    const byId = new Map(nodes.map(n => [n.id, n]));
    const seen = new Set<string>();
    const links: Link[] = [];
    nodes.forEach(n => {
      n.related.forEach(rid => {
        if (!byId.has(rid)) return;
        const key = [n.id, rid].sort().join("::");
        if (seen.has(key)) return;
        seen.add(key);
        links.push({ source: n.id, target: rid });
        n.degree++;
        byId.get(rid)!.degree++;
      });
    });

    const g = svg.append("g");

    const linkSel = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#8A8172")
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", 1.25);

    const nodeSel = g.append("g")
      .selectAll("g.node")
      .data(nodes, (d: any) => d.id)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    nodeSel.append("circle")
      .attr("r", d => 14 + Math.min(d.degree, 6) * 2.5)
      .attr("fill", d => CAT_COLORS[d.category])
      .attr("stroke", d => STATUS_STROKE[d.status])
      .attr("stroke-width", d => d.status === "building" ? 3 : 2.5);

    nodeSel.append("text")
      .attr("dy", d => (14 + Math.min(d.degree, 6) * 2.5) + 16)
      .attr("text-anchor", "middle")
      .style("font-family", "var(--font-instrument-sans)")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#1C1812")
      .style("pointer-events", "none")
      .text(d => d.title.length > 28 ? d.title.slice(0, 26) + "…" : d.title);

    nodeSel.append("text")
      .attr("dy", d => (14 + Math.min(d.degree, 6) * 2.5) + 30)
      .attr("text-anchor", "middle")
      .style("font-family", "var(--font-jetbrains-mono)")
      .style("font-size", "9px")
      .style("fill", "#8A8172")
      .style("letter-spacing", "0.08em")
      .style("text-transform", "uppercase")
      .style("pointer-events", "none")
      .text(d => STATUS_LABEL[d.status] || "");

    nodeSel.on("click", (event: MouseEvent, d: Node) => {
      event.stopPropagation();
      const p = projects.find(x => x.id === d.id);
      if (p) onNodeClick(p);
    });

    nodeSel.on("mouseenter", (_, d) => {
      const neighborIds = new Set<string>([d.id]);
      links.forEach(l => {
        const sid = (l.source as any).id ?? l.source;
        const tid = (l.target as any).id ?? l.target;
        if (sid === d.id) neighborIds.add(tid);
        if (tid === d.id) neighborIds.add(sid);
      });
      nodeSel.style("opacity", n => neighborIds.has(n.id) ? 1 : 0.25);
      linkSel
        .attr("stroke-opacity", l => {
          const sid = (l.source as any).id ?? l.source;
          const tid = (l.target as any).id ?? l.target;
          return (sid === d.id || tid === d.id) ? 0.85 : 0.08;
        })
        .attr("stroke-width", l => {
          const sid = (l.source as any).id ?? l.source;
          const tid = (l.target as any).id ?? l.target;
          return (sid === d.id || tid === d.id) ? 2 : 1.25;
        });
    }).on("mouseleave", () => {
      nodeSel.style("opacity", 1);
      linkSel.attr("stroke-opacity", 0.35).attr("stroke-width", 1.25);
    });

    const sim = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id((d: any) => d.id).distance(140).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-380))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide", d3.forceCollide<Node>().radius(d => 14 + Math.min(d.degree, 6) * 2.5 + 12))
      .force("x", d3.forceX<Node>(d => {
        if (d.category === "photo")    return W * 0.22;
        if (d.category === "hair")     return W * 0.78;
        if (d.category === "weddings") return W * 0.50;
        return W * 0.50;
      }).strength(0.11))
      .force("y", d3.forceY<Node>(d => d.category === "misc" ? H * 0.82 : H * 0.45).strength(0.07))
      .on("tick", () => {
        linkSel
          .attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        nodeSel.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

    const drag = d3.drag<SVGGElement, Node>()
      .on("start", (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag",  (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end",   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
    nodeSel.call(drag as any);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on("zoom", (event) => { g.attr("transform", event.transform); });
    svg.call(zoom as any).on("dblclick.zoom", null);

    return () => { sim.stop(); };
  }, [projects, onNodeClick]);

  return (
    <section className="relative bg-paper-deep border border-paper-edge rounded overflow-hidden shadow-[0_1px_0_rgba(0,0,0,.04),0_12px_30px_-18px_rgba(40,24,8,.35)]" style={{ height: "min(720px, 78vh)" }}>
      <div className="absolute top-4 left-4 flex gap-[18px] font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft pointer-events-none bg-paper/75 backdrop-blur-sm px-3.5 py-2 rounded-full">
        <LegendDot color="#2E5568" label="Photo" />
        <LegendDot color="#8E5378" label="Weddings" />
        <LegendDot color="#A8574E" label="Hair" />
        <LegendDot color="#7F7869" label="Misc" />
      </div>
      <svg ref={svgRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-3.5 right-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint pointer-events-none">
        Scroll to zoom · Drag to pan · Click a node to edit
      </div>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
