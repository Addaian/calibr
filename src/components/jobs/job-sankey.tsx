"use client";

import { useMemo, useState } from "react";
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
import type { SankeyNode, SankeyLink } from "d3-sankey";
import type { JobPosting } from "@/types/jobs";

// ─── Dimensions ───────────────────────────────────────────────────────────────
const VW = 800;
const VH = 400;
const PAD = { top: 36, right: 130, bottom: 20, left: 10 };
const NODE_WIDTH = 20;
const NODE_PADDING = 22;

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  all:          "#818cf8",
  not_applied:  "#94a3b8",
  applied_ever: "#60a5fa",
  no_resp:      "#94a3b8",
  interviewed:  "#a78bfa",
  ongoing:      "#fbbf24",
  offer:        "#34d399",
  closed:       "#f87171",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface NodeDatum { id: string; label: string; count: number; color: string; }
type SNode = SankeyNode<NodeDatum, object>;
type SLink = SankeyLink<NodeDatum, object>;
interface Tooltip { label: string; count: number; pct: number; x: number; y: number; }

// ─── Graph input builder ──────────────────────────────────────────────────────
function buildInput(jobs: JobPosting[]) {
  const total = jobs.length;
  if (total === 0) return null;

  const notApplied    = jobs.filter(j => ["active","applying"].includes(j.status)).length;
  const noResponse    = jobs.filter(j => ["applied","ghosted"].includes(j.status)).length;
  const interviewEver = jobs.filter(j => ["screening","interview","assessment","final_round","offer","negotiating","accepted","rejected","declined","withdrawn"].includes(j.status)).length;
  const ongoing       = jobs.filter(j => ["screening","interview","assessment","final_round"].includes(j.status)).length;
  const offerCount    = jobs.filter(j => ["offer","negotiating","accepted"].includes(j.status)).length;
  const closedNeg     = jobs.filter(j => ["rejected","declined","withdrawn"].includes(j.status)).length;
  const appliedEver   = total - notApplied;

  const allLinks = [
    { source: "all",          target: "not_applied",  value: notApplied },
    { source: "all",          target: "applied_ever", value: appliedEver },
    { source: "applied_ever", target: "no_resp",      value: noResponse },
    { source: "applied_ever", target: "interviewed",  value: interviewEver },
    { source: "interviewed",  target: "ongoing",      value: ongoing },
    { source: "interviewed",  target: "offer",        value: offerCount },
    { source: "interviewed",  target: "closed",       value: closedNeg },
  ].filter(l => l.value > 0);

  const usedIds = new Set(["all", ...allLinks.flatMap(l => [l.source, l.target])]);

  const allNodes: NodeDatum[] = [
    { id: "all",          label: "All Jobs",    count: total,         color: COLORS.all },
    { id: "not_applied",  label: "Not Applied", count: notApplied,    color: COLORS.not_applied },
    { id: "applied_ever", label: "Applied",     count: appliedEver,   color: COLORS.applied_ever },
    { id: "no_resp",      label: "No Response", count: noResponse,    color: COLORS.no_resp },
    { id: "interviewed",  label: "Interviewed", count: interviewEver, color: COLORS.interviewed },
    { id: "ongoing",      label: "In Progress", count: ongoing,       color: COLORS.ongoing },
    { id: "offer",        label: "Offer",       count: offerCount,    color: COLORS.offer },
    { id: "closed",       label: "Closed",      count: closedNeg,     color: COLORS.closed },
  ];

  return {
    nodes: allNodes.filter(n => usedIds.has(n.id)),
    links: allLinks,
    stats: { total, notApplied, appliedEver, interviewEver, offerCount },
  };
}

function lid(link: SLink): string {
  return `${(link.source as SNode).id}→${(link.target as SNode).id}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function JobSankeyView({ jobs }: { jobs: JobPosting[] }) {
  const total = jobs.length;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip]     = useState<Tooltip | null>(null);

  const input = useMemo(() => buildInput(jobs), [jobs]);

  const { nodes, links } = useMemo(() => {
    if (!input) return { nodes: [] as SNode[], links: [] as SLink[] };

    const layout = d3Sankey<NodeDatum, object>()
      .nodeId(d => (d as NodeDatum).id)
      .nodeWidth(NODE_WIDTH)
      .nodePadding(NODE_PADDING)
      .nodeAlign(sankeyLeft)
      .extent([[PAD.left, PAD.top], [VW - PAD.right, VH - PAD.bottom]]);

    const g = layout({
      nodes: input.nodes.map(d => ({ ...d })),
      links: input.links.map(d => ({ ...d })),
    });

    return { nodes: g.nodes as SNode[], links: g.links as SLink[] };
  }, [input]);

  // Compute column header positions from node x positions
  const colHeaders = useMemo(() => {
    const colMap = new Map<number, number>();
    for (const n of nodes) {
      const col = Math.round((n.x0 ?? 0) * 100); // key by rounded x
      if (!colMap.has(col)) colMap.set(col, (n.x0 ?? 0) + NODE_WIDTH / 2);
    }
    const labels = ["Tracked", "Status", "Response", "Outcome"];
    return Array.from(colMap.values())
      .sort((a, b) => a - b)
      .map((x, i) => ({ x, label: labels[i] ?? "" }));
  }, [nodes]);

  const linkGen = useMemo(() => sankeyLinkHorizontal<NodeDatum, object>(), []);

  // ── Opacity ─────────────────────────────────────────────────────────────────
  function nodeOpacity(n: SNode): number {
    if (!hoveredId) return 1;
    if (hoveredId === n.id) return 1;
    const isNode = nodes.some(x => x.id === hoveredId);
    if (isNode) {
      const connected =
        (n.sourceLinks ?? []).some(l => (l.target as SNode).id === hoveredId) ||
        (n.targetLinks ?? []).some(l => (l.source as SNode).id === hoveredId);
      return connected ? 0.9 : 0.12;
    }
    const hl = links.find(l => lid(l) === hoveredId);
    if (!hl) return 0.12;
    return ((hl.source as SNode).id === n.id || (hl.target as SNode).id === n.id) ? 1 : 0.12;
  }

  function linkOpacity(link: SLink): number {
    if (!hoveredId) return 0.38;
    const id = lid(link);
    if (hoveredId === id) return 0.8;
    const isNode = nodes.some(x => x.id === hoveredId);
    if (isNode) {
      const src = (link.source as SNode).id;
      const tgt = (link.target as SNode).id;
      return (src === hoveredId || tgt === hoveredId) ? 0.65 : 0.05;
    }
    return 0.05;
  }

  // ── Tooltip handlers ─────────────────────────────────────────────────────────
  function onNodeEnter(n: SNode, e: React.MouseEvent) {
    const pct = total > 0 ? Math.round((n.count / total) * 100) : 0;
    setTooltip({ label: n.label, count: n.count, pct, x: e.clientX, y: e.clientY });
    setHoveredId(n.id!);
  }

  function onLinkEnter(link: SLink, e: React.MouseEvent) {
    const src = link.source as SNode;
    const tgt = link.target as SNode;
    const pct = total > 0 ? Math.round((tgt.count / total) * 100) : 0;
    setTooltip({ label: `${src.label} → ${tgt.label}`, count: tgt.count, pct, x: e.clientX, y: e.clientY });
    setHoveredId(lid(link));
  }

  function onMouseMove(e: React.MouseEvent) {
    setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
  }

  function onLeave() { setHoveredId(null); setTooltip(null); }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground">No job postings to visualize</p>
      </div>
    );
  }

  const s = input?.stats ?? { total: 0, notApplied: 0, appliedEver: 0, interviewEver: 0, offerCount: 0 };
  const applyRate     = s.total         > 0 ? Math.round((s.appliedEver   / s.total)         * 100) : 0;
  const interviewRate = s.appliedEver   > 0 ? Math.round((s.interviewEver / s.appliedEver)   * 100) : 0;
  const offerRate     = s.interviewEver > 0 ? Math.round((s.offerCount    / s.interviewEver) * 100) : 0;

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ maxHeight: 440 }}
        onMouseLeave={onLeave}
        onMouseMove={onMouseMove}
      >
        {/* Column headers */}
        {colHeaders.map(h => (
          <text key={h.label} x={h.x} y={20} textAnchor="middle" fontSize={11}
            fill="hsl(var(--muted-foreground))" fontWeight="500" letterSpacing="0.05em">
            {h.label.toUpperCase()}
          </text>
        ))}

        {/* Links — rendered as stroked bezier paths (the "flowy" ribbon) */}
        {links.map(link => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = linkGen(link as any);
          if (!d) return null;
          const src = link.source as SNode;
          return (
            <path
              key={lid(link)}
              d={d}
              fill="none"
              stroke={src.color}
              strokeWidth={Math.max(1, link.width ?? 1)}
              strokeOpacity={linkOpacity(link)}
              style={{ transition: "stroke-opacity 0.18s ease", cursor: "pointer" }}
              onMouseEnter={e => onLinkEnter(link, e)}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const x0 = n.x0 ?? 0, x1 = n.x1 ?? 0;
          const y0 = n.y0 ?? 0, y1 = n.y1 ?? 0;
          const w = x1 - x0, h = y1 - y0;
          const op = nodeOpacity(n);
          const isRight = x0 > VW - PAD.right - NODE_WIDTH - 20;

          return (
            <g key={n.id} style={{ cursor: "pointer" }} onMouseEnter={e => onNodeEnter(n, e)}>
              {/* Wider transparent hit area */}
              <rect x={x0 - 6} y={y0} width={w + 12} height={h} fill="transparent" />
              {/* Visible node */}
              <rect x={x0} y={y0} width={w} height={h} rx={3}
                fill={n.color} opacity={op}
                style={{ transition: "opacity 0.18s ease" }}
              />
              {/* Count (if tall enough) */}
              {h >= 28 && (
                <text x={x0 + w / 2} y={y0 + h / 2} dy="0.35em"
                  textAnchor="middle" fontSize={10} fontWeight="700" fill="white"
                  opacity={op} style={{ transition: "opacity 0.18s ease", pointerEvents: "none" }}>
                  {n.count}
                </text>
              )}
              {/* Label — right of node, except last column goes right too (PAD.right holds space) */}
              <text
                x={isRight ? x0 - 6 : x1 + 6}
                y={y0 + h / 2} dy="0.35em"
                textAnchor={isRight ? "end" : "start"}
                fontSize={11}
                fill={hoveredId === n.id ? n.color : "hsl(var(--foreground))"}
                fontWeight={hoveredId === n.id ? "600" : "400"}
                opacity={op}
                style={{ transition: "opacity 0.18s ease, fill 0.18s ease", pointerEvents: "none" }}
              >
                {n.label}
                {h < 28 && (
                  <tspan fontSize={10} fill="hsl(var(--muted-foreground))"> ({n.count})</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border bg-popover px-3 py-2 shadow-md"
          style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
        >
          <p className="text-sm font-medium">{tooltip.label}</p>
          <p className="text-xs text-muted-foreground">
            {tooltip.count} job{tooltip.count !== 1 ? "s" : ""} · {tooltip.pct}% of total
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 border-t pt-3 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums">{applyRate}%</p>
          <p className="text-xs text-muted-foreground">Application Rate</p>
          <p className="text-xs text-muted-foreground/70">{s.appliedEver} of {s.total} applied</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{interviewRate}%</p>
          <p className="text-xs text-muted-foreground">Interview Rate</p>
          <p className="text-xs text-muted-foreground/70">{s.interviewEver} of {s.appliedEver} interviewed</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{offerRate}%</p>
          <p className="text-xs text-muted-foreground">Offer Rate</p>
          <p className="text-xs text-muted-foreground/70">{s.offerCount} of {s.interviewEver} offers</p>
        </div>
      </div>
    </div>
  );
}
