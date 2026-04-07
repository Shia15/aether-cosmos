import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface ClassNode {
  id: string;
  name: string;
  agent?: string;
  agentColor: string;
  attrs: string[];
  methods?: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "class" | "data";
}

interface Relation {
  from: string;
  to: string;
  label: string;
  fromSide: "right" | "left" | "top" | "bottom";
  toSide:   "right" | "left" | "top" | "bottom";
  curve?: number;
}

const W = 1100;
const H  = 560;

const CLASSES: ClassNode[] = [
  // ── Row 1 ─────────────────────────────────
  {
    id: "memory-engine", name: "MemoryEngine", agent: "Mnēsis", agentColor: "#8047d4",
    attrs: ["+shortTerm: List", "+longTerm: Dict", "+semanticGraph: Statement"],
    methods: ["+store()"],
    x: 698, y: 20, w: 196, h: 108, kind: "class",
  },
  // ── Row 2 ─────────────────────────────────
  {
    id: "input-handler", name: "InputHandler", agent: "Caelus", agentColor: "#fb923c",
    attrs: ["+exactInput: String", "+parsedInput: String", "+confidence: Float"],
    x: 10, y: 170, w: 168, h: 90, kind: "class",
  },
  {
    id: "controller", name: "Controller", agent: "Vērus", agentColor: "#22c55e",
    attrs: [],
    methods: ["+route(intent: Intent)", "+manageTimers()", "+dispatchAction()"],
    x: 232, y: 170, w: 170, h: 88, kind: "class",
  },
  {
    id: "cognitive-logic", name: "CognitiveLogicUnit", agent: "Aletheia", agentColor: "#c9a84c",
    attrs: [],
    methods: ["+processIntent(intent: Intent)", "+decideAction(): Response"],
    x: 460, y: 130, w: 184, h: 88, kind: "class",
  },
  {
    id: "context", name: "Context", agentColor: "#94a3b8",
    attrs: ["+value: String", "+history: List"],
    x: 936, y: 170, w: 154, h: 72, kind: "data",
  },
  // ── Row 3 ─────────────────────────────────
  {
    id: "intent", name: "Intent", agentColor: "#64748b",
    attrs: ["type: String", "content: String", "eConfidence: Float"],
    x: 10, y: 336, w: 168, h: 80, kind: "data",
  },
  {
    id: "interface-renderer", name: "InterfaceRenderer", agent: "Reverie", agentColor: "#88c7ff",
    attrs: [],
    methods: ["+sendText(response: String)", "+playAudio(audioFile: String)"],
    x: 460, y: 320, w: 184, h: 80, kind: "class",
  },
  {
    id: "mood", name: "Mood", agentColor: "#a78bfa",
    attrs: ["+state: String", "+intensity: Float"],
    x: 710, y: 316, w: 152, h: 68, kind: "data",
  },
  {
    id: "response", name: "Response", agentColor: "#ec4899",
    attrs: ["+text: String", "+priority: List", "+emotionTag: String"],
    x: 936, y: 310, w: 154, h: 84, kind: "data",
  },
  // ── Row 4 ─────────────────────────────────
  {
    id: "emotion-system", name: "EmotionSystem", agent: "Inferaia", agentColor: "#e64522",
    attrs: ["+moodState: String"],
    methods: ["+evaluateContext(context): Mood"],
    x: 700, y: 444, w: 184, h: 84, kind: "class",
  },
];

// Helper: compute anchor point on a class node given a side
function anchor(n: ClassNode, side: Relation["fromSide"], offset = 0): [number, number] {
  const cx = n.x + n.w / 2;
  const cy = n.y + n.h / 2;
  switch (side) {
    case "right":  return [n.x + n.w, cy + offset];
    case "left":   return [n.x,       cy + offset];
    case "top":    return [cx + offset, n.y];
    case "bottom": return [cx + offset, n.y + n.h];
  }
}

const RELATIONS: Relation[] = [
  { from: "input-handler",  to: "intent",           label: "creates",          fromSide: "bottom", toSide: "top",    curve:  0  },
  { from: "input-handler",  to: "controller",        label: "notifies",         fromSide: "right",  toSide: "left",   curve: -30 },
  { from: "controller",     to: "cognitive-logic",   label: "routes to",        fromSide: "right",  toSide: "left",   curve: -20 },
  { from: "controller",     to: "interface-renderer",label: "displays input",   fromSide: "bottom", toSide: "left",   curve:  0  },
  { from: "cognitive-logic",to: "memory-engine",     label: "manages memory",   fromSide: "top",    toSide: "bottom", curve:  0  },
  { from: "cognitive-logic",to: "interface-renderer",label: "provides response",fromSide: "bottom", toSide: "top",    curve:  0  },
  { from: "cognitive-logic",to: "response",          label: "generates",        fromSide: "right",  toSide: "left",   curve: -40 },
  { from: "memory-engine",  to: "context",           label: "stored in",        fromSide: "right",  toSide: "left",   curve: -20 },
  { from: "context",        to: "cognitive-logic",   label: "provides context", fromSide: "top",    toSide: "right",  curve:  0  },
  { from: "response",       to: "interface-renderer",label: "displays response",fromSide: "bottom", toSide: "right",  curve:  0  },
  { from: "interface-renderer",to: "mood",           label: "displays mood",    fromSide: "right",  toSide: "left",   curve: -20 },
  { from: "emotion-system", to: "mood",              label: "monitors",         fromSide: "top",    toSide: "bottom", curve:  0  },
  { from: "mood",           to: "emotion-system",    label: "affects",          fromSide: "bottom", toSide: "top",    curve: 28  },
  { from: "emotion-system", to: "interface-renderer",label: "provides mood",    fromSide: "left",   toSide: "bottom", curve:  0  },
  { from: "memory-engine",  to: "cognitive-logic",   label: "returns",          fromSide: "left",   toSide: "top",    curve: -30 },
];

function getNode(id: string) { return CLASSES.find(c => c.id === id)!; }

function ArrowHead({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  const len = 7, w = 4;
  const rad = (angle * Math.PI) / 180;
  const tip = [x, y];
  const base1 = [x - len * Math.cos(rad) + w * Math.sin(rad), y - len * Math.sin(rad) - w * Math.cos(rad)];
  const base2 = [x - len * Math.cos(rad) - w * Math.sin(rad), y - len * Math.sin(rad) + w * Math.cos(rad)];
  return (
    <polygon
      points={`${tip[0]},${tip[1]} ${base1[0]},${base1[1]} ${base2[0]},${base2[1]}`}
      fill={color} opacity="0.75"
    />
  );
}

// Build a cubic bezier between two anchor points
function buildPath(
  from: ClassNode, fromSide: Relation["fromSide"],
  to: ClassNode,   toSide: Relation["toSide"],
  curveOffset: number
): { d: string; endX: number; endY: number; endAngle: number; midX: number; midY: number } {
  const [x1, y1] = anchor(from, fromSide);
  const [x2, y2] = anchor(to, toSide);

  const pad = 24;
  let c1x = x1, c1y = y1, c2x = x2, c2y = y2;

  if (fromSide === "right")  c1x = x1 + pad;
  if (fromSide === "left")   c1x = x1 - pad;
  if (fromSide === "top")    c1y = y1 - pad;
  if (fromSide === "bottom") c1y = y1 + pad;

  if (toSide === "right")  c2x = x2 + pad;
  if (toSide === "left")   c2x = x2 - pad;
  if (toSide === "top")    c2y = y2 - pad;
  if (toSide === "bottom") c2y = y2 + pad;

  // Apply curve offset perpendicular to line direction
  if (curveOffset !== 0) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = -dy / len * curveOffset;
    const py = dx / len * curveOffset;
    c1x += px; c1y += py;
    c2x += px; c2y += py;
  }

  const d = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

  // Angle at the end point
  const ex = x2 - c2x, ey = y2 - c2y;
  const endAngle = Math.atan2(ey, ex) * (180 / Math.PI);

  // Mid point for label
  const t = 0.5;
  const bx = (1-t)*(1-t)*(1-t)*x1 + 3*(1-t)*(1-t)*t*c1x + 3*(1-t)*t*t*c2x + t*t*t*x2;
  const by = (1-t)*(1-t)*(1-t)*y1 + 3*(1-t)*(1-t)*t*c1y + 3*(1-t)*t*t*c2y + t*t*t*y2;

  return { d, endX: x2, endY: y2, endAngle, midX: bx, midY: by };
}

// ─── ClassCard SVG ────────────────────────────────────────────────────────────

function ClassCard({ node, isSelected, isRelated, hasSelection, onClick }: {
  node: ClassNode;
  isSelected: boolean;
  isRelated: boolean;
  hasSelection: boolean;
  onClick: () => void;
}) {
  const dim = hasSelection && !isSelected && !isRelated;
  const alpha = dim ? "20" : isSelected ? "ff" : "aa";
  const fillAlpha = dim ? "04" : isSelected ? "18" : "0a";

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Glow */}
      {isSelected && (
        <rect x={node.x - 4} y={node.y - 4} width={node.w + 8} height={node.h + 8}
          rx="10" fill={node.agentColor} fillOpacity="0.08" />
      )}
      {/* Card body */}
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="6"
        fill={`#0d1117`}
        stroke={node.agentColor + alpha}
        strokeWidth={isSelected ? 1.5 : 0.7}
        style={{ transition: "all 0.25s" }}
      />
      {/* Header bar */}
      <rect x={node.x} y={node.y} width={node.w} height={22} rx="6"
        fill={node.agentColor + fillAlpha}
        style={{ transition: "all 0.25s" }}
      />
      <rect x={node.x} y={node.y + 14} width={node.w} height={8} fill={node.agentColor + fillAlpha} />

      {/* Stereotyp / kind */}
      {node.kind === "data" && (
        <text x={node.x + node.w / 2} y={node.y + 9}
          textAnchor="middle" fill={node.agentColor + "80"} fontSize="6" fontFamily="monospace">
          «data»
        </text>
      )}

      {/* Class name */}
      <text x={node.x + node.w / 2} y={node.kind === "data" ? node.y + 18 : node.y + 14}
        textAnchor="middle" fill={node.agentColor + alpha} fontSize="8.5"
        fontFamily="monospace" fontWeight="bold" style={{ userSelect: "none" }}>
        {node.name}
      </text>

      {/* Agent badge */}
      {node.agent && (
        <text x={node.x + node.w - 4} y={node.y + 14}
          textAnchor="end" fill={node.agentColor + "60"} fontSize="5.5"
          fontFamily="monospace" style={{ userSelect: "none" }}>
          {node.agent}
        </text>
      )}

      {/* Divider */}
      <line x1={node.x} y1={node.y + 24} x2={node.x + node.w} y2={node.y + 24}
        stroke={node.agentColor + "30"} strokeWidth="0.5" />

      {/* Attributes */}
      {node.attrs.map((a, i) => (
        <text key={i} x={node.x + 5} y={node.y + 34 + i * 11}
          fill={dim ? "#334155" : "#94a3b8"} fontSize="6.5" fontFamily="monospace"
          style={{ userSelect: "none" }}>
          {a}
        </text>
      ))}

      {/* Methods separator */}
      {node.methods && node.attrs.length > 0 && (
        <line
          x1={node.x} y1={node.y + 24 + node.attrs.length * 11 + 4}
          x2={node.x + node.w} y2={node.y + 24 + node.attrs.length * 11 + 4}
          stroke={node.agentColor + "20"} strokeWidth="0.5" strokeDasharray="2 2"
        />
      )}

      {/* Methods */}
      {node.methods?.map((m, i) => {
        const topOffset = node.attrs.length > 0 ? node.attrs.length * 11 + 10 : 0;
        return (
          <text key={i} x={node.x + 5}
            y={node.y + 34 + topOffset + i * 11}
            fill={dim ? "#334155" : node.agentColor + "90"} fontSize="6.5"
            fontFamily="monospace" style={{ userSelect: "none" }}>
            {m}
          </text>
        );
      })}
    </g>
  );
}

// ─── Full diagram component ───────────────────────────────────────────────────

export default function MariClassDiagram() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNode = selectedId ? getNode(selectedId) : null;

  // Build related set for the selected node
  const relatedIds = new Set<string>();
  if (selectedId) {
    RELATIONS.forEach(r => {
      if (r.from === selectedId) relatedIds.add(r.to);
      if (r.to === selectedId) relatedIds.add(r.from);
    });
  }

  const hasSelection = selectedId !== null;

  return (
    <div className="space-y-4">
      {/* SVG Canvas */}
      <div className="relative rounded-xl border overflow-hidden"
        style={{ borderColor: "#1e293b", background: "radial-gradient(ellipse at 50% 0%, #0a0814 0%, #0d1117 100%)" }}>

        {/* Title bar */}
        <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
          <span className="font-mono text-[9px] text-muted-foreground/30 tracking-[0.25em] uppercase">
            MARI_ClassDiagram
          </span>
          {selectedNode && (
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border"
              style={{ borderColor: `${selectedNode.agentColor}40`, color: selectedNode.agentColor }}>
              {selectedNode.name}
            </span>
          )}
        </div>
        <button
          onClick={() => setSelectedId(null)}
          className="absolute top-3 right-4 font-mono text-[9px] text-muted-foreground/30 hover:text-muted-foreground/60 z-10 tracking-widest"
        >
          {selectedId ? "CLEAR" : "CLICK TO INSPECT"}
        </button>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 520 }}>

          {/* Relation paths */}
          {RELATIONS.map((rel, i) => {
            const fromNode = getNode(rel.from);
            const toNode   = getNode(rel.to);
            if (!fromNode || !toNode) return null;
            const { d, endX, endY, endAngle, midX, midY } = buildPath(
              fromNode, rel.fromSide, toNode, rel.toSide, rel.curve ?? 0
            );
            const isActive = hasSelection && (selectedId === rel.from || selectedId === rel.to);
            const isDim    = hasSelection && !isActive;
            const color    = isActive ? fromNode.agentColor : "#334155";

            return (
              <g key={i}>
                <path d={d} fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 1.2 : 0.6}
                  strokeOpacity={isDim ? 0.2 : isActive ? 0.9 : 0.45}
                  strokeDasharray={isActive ? "none" : "3 4"}
                  style={{ transition: "all 0.3s" }}
                />
                <ArrowHead x={endX} y={endY} angle={endAngle} color={color} />

                {/* Label */}
                <text x={midX} y={midY - 4}
                  textAnchor="middle" fill={color}
                  fontSize="5.5" fontFamily="monospace"
                  opacity={isDim ? 0.1 : isActive ? 1 : 0.6}
                  style={{ transition: "opacity 0.3s", userSelect: "none" }}>
                  {rel.label}
                </text>
              </g>
            );
          })}

          {/* Class cards */}
          {CLASSES.map(node => (
            <ClassCard key={node.id} node={node}
              isSelected={selectedId === node.id}
              isRelated={relatedIds.has(node.id)}
              hasSelection={hasSelection}
              onClick={() => setSelectedId(selectedId === node.id ? null : node.id)} />
          ))}
        </svg>
      </div>

      {/* Selected class detail */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div key={selectedNode.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border p-5 grid grid-cols-1 md:grid-cols-3 gap-5"
            style={{ borderColor: `${selectedNode.agentColor}25`, background: `${selectedNode.agentColor}06` }}>

            {/* Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold tracking-widest" style={{ color: selectedNode.agentColor }}>
                  {selectedNode.name}
                </span>
                {selectedNode.agent && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                    style={{ borderColor: `${selectedNode.agentColor}40`, color: selectedNode.agentColor }}>
                    {selectedNode.agent}
                  </span>
                )}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                {selectedNode.kind === "class" ? "Class Module" : "Data Structure"}
              </div>
              {selectedNode.attrs.length > 0 && (
                <div className="space-y-1">
                  <div className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest">Attributes</div>
                  {selectedNode.attrs.map(a => (
                    <div key={a} className="font-mono text-[10px]" style={{ color: `${selectedNode.agentColor}80` }}>{a}</div>
                  ))}
                </div>
              )}
              {selectedNode.methods && selectedNode.methods.length > 0 && (
                <div className="space-y-1">
                  <div className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest">Methods</div>
                  {selectedNode.methods.map(m => (
                    <div key={m} className="font-mono text-[10px]" style={{ color: `${selectedNode.agentColor}90` }}>{m}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing relations */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest mb-2">Sends to</div>
              {RELATIONS.filter(r => r.from === selectedNode.id).map(r => {
                const target = getNode(r.to);
                return (
                  <button key={r.to} onClick={() => setSelectedId(r.to)}
                    className="w-full text-left rounded border px-3 py-1.5 flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ borderColor: `${target.agentColor}30`, background: `${target.agentColor}08` }}>
                    <span className="font-mono text-[8px] text-muted-foreground/40 shrink-0 w-20">{r.label}</span>
                    <span className="font-mono text-[9px] font-bold" style={{ color: target.agentColor }}>{target.name}</span>
                  </button>
                );
              })}
              {RELATIONS.filter(r => r.from === selectedNode.id).length === 0 && (
                <div className="font-mono text-[9px] text-muted-foreground/20">No outgoing relations</div>
              )}
            </div>

            {/* Incoming relations */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest mb-2">Receives from</div>
              {RELATIONS.filter(r => r.to === selectedNode.id).map(r => {
                const source = getNode(r.from);
                return (
                  <button key={r.from} onClick={() => setSelectedId(r.from)}
                    className="w-full text-left rounded border px-3 py-1.5 flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ borderColor: `${source.agentColor}30`, background: `${source.agentColor}08` }}>
                    <span className="font-mono text-[9px] font-bold" style={{ color: source.agentColor }}>{source.name}</span>
                    <span className="font-mono text-[8px] text-muted-foreground/40 shrink-0">→ {r.label}</span>
                  </button>
                );
              })}
              {RELATIONS.filter(r => r.to === selectedNode.id).length === 0 && (
                <div className="font-mono text-[9px] text-muted-foreground/20">No incoming relations</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
