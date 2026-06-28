import { useEffect, useRef, useState, useCallback } from "react";
import { CodeFilesPanel } from "@/components/code-files-panel";

const BG    = "#020408";
const PANEL = "#08101A";
const BORDER= "#0E1E30";
const AU    = "#00FFB2";
const GOLD  = "#C8A030";
const CORAL = "#E05C4B";
const VIOL  = "#9B59B6";
const BLUE  = "#1A9FD4";
const DIM   = "#2A4060";
const TEXT  = "#B8C8D8";
const MUTED = "#445A70";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── module-level types ──────────────────────────────────────────────── */
type ProcStatus = "RUNNING" | "WAIT" | "IO" | "SLEEP" | "IDLE";
type ProcDef = { pid: number; name: string; module: string; baseCpu: number; baseMem: number; baseLat: number };
type ProcState = { cpu: number; mem: number; lat: number; status: ProcStatus };
type LogLine = { t: string; msg: string; col: string };

/* ── process catalogue ───────────────────────────────────────────────── */
const PROCS: ProcDef[] = [
  { pid:1001, name:"aether-kernel",       module:"AETHERKernel",   baseCpu:2,  baseMem:32,  baseLat:8   },
  { pid:1042, name:"knowledge-graph",     module:"KnowledgeGraph", baseCpu:18, baseMem:128, baseLat:45  },
  { pid:1067, name:"plasma-knots",        module:"PlasmaKnots",    baseCpu:34, baseMem:256, baseLat:82  },
  { pid:1089, name:"biomagnetism",        module:"Biomagnetism",   baseCpu:22, baseMem:192, baseLat:61  },
  { pid:1104, name:"quantum-gravity",     module:"QuantumGravity", baseCpu:41, baseMem:384, baseLat:112 },
  { pid:1118, name:"graphite-synthesis",  module:"GraphiteSynth",  baseCpu:15, baseMem:160, baseLat:38  },
  { pid:1203, name:"lunar-coherence",     module:"LunarCoherence", baseCpu:8,  baseMem:96,  baseLat:22  },
  { pid:1245, name:"substrate-synthesis", module:"SubstrateSynth", baseCpu:27, baseMem:224, baseLat:74  },
  { pid:1301, name:"morphogenetic-pc",    module:"MorphogeneticPC",baseCpu:55, baseMem:512, baseLat:145 },
  { pid:1388, name:"pde-simulator",       module:"PDESimulator",   baseCpu:67, baseMem:768, baseLat:198 },
  { pid:1421, name:"wireless-power",      module:"WirelessPower",  baseCpu:31, baseMem:210, baseLat:88  },
  { pid:1534, name:"equation-codex",      module:"EquationCodex",  baseCpu:7,  baseMem:72,  baseLat:18  },
  { pid:1601, name:"calm-engine",         module:"CalmEngine",     baseCpu:5,  baseMem:64,  baseLat:14  },
  { pid:1687, name:"social-deploy",       module:"SocialDeploy",   baseCpu:3,  baseMem:48,  baseLat:12  },
  { pid:1752, name:"knowledge-map",       module:"KnowledgeMap",   baseCpu:44, baseMem:640, baseLat:167 },
  { pid:1809, name:"aether-dashboard",    module:"AetherDashboard",baseCpu:12, baseMem:80,  baseLat:30  },
];

const N_CORES = 8;
const HISTORY = 80;

function nz(seed: number, t: number, amp: number) {
  return Math.sin(seed*0.71+t*0.13)*amp*0.45
       + Math.sin(seed*1.37+t*0.07)*amp*0.30
       + Math.sin(seed*2.09+t*0.23)*amp*0.15
       + (Math.random()-0.5)*amp*0.10;
}
function clamp(v:number,lo:number,hi:number){ return Math.max(lo,Math.min(hi,v)); }

const STATUS_SEQ: ProcStatus[][] = [
  ["RUNNING","RUNNING","RUNNING","RUNNING","WAIT","RUNNING","IO","RUNNING"],
  ["RUNNING","RUNNING","WAIT","RUNNING","RUNNING","IO","RUNNING","RUNNING"],
];

const LOG_FN: ((p:ProcDef,lat:number,tick:number)=>string)[] = [
  (p,lat)    => `[${p.module}] coherence field updated -- ${lat}ms`,
  (p,lat)    => `[scheduler] PID ${p.pid} quantum expired -- preempt +${lat}ms`,
  (p,lat)    => `[${p.module}] tensor kernel: 1024 blocks @ ${lat}us/block`,
  (p,lat)    => `[cache] PID ${p.pid} L2 miss ${(Math.random()*14).toFixed(1)}% lag +${lat}ms`,
  (p,lat,tk) => `[IPC] ${p.module} -> AETHERKernel: SYNC seq=${tk} delay=${lat}us`,
  (p,lat)    => `[memory] PID ${p.pid} heap alloc ${Math.floor(Math.random()*512+64)}KB done ${lat}ms`,
  (p)        => `[${p.module}] crystallization step: C=${(0.6+Math.random()*0.35).toFixed(3)}`,
];

/* ── CPU core history canvas ─────────────────────────────────────────── */
function CpuCanvas({ hist }: { hist: number[][] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const COLORS = [AU, BLUE, GOLD, VIOL, CORAL, "#2EC09A", "#D4A020", "#7060D0"];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const coreH = Math.floor(H / N_CORES) - 2;

    function draw() {
      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, W, H);

      for (let c = 0; c < N_CORES; c++) {
        const y0 = c * (coreH + 2);
        const data = hist[c] ?? [];
        const col = COLORS[c];

        ctx.fillStyle = `${col}18`;
        ctx.fillRect(0, y0, W, coreH);

        if (data.length < 2) continue;
        const step = W / HISTORY;

        ctx.beginPath();
        ctx.moveTo(0, y0 + coreH);
        for (let i = 0; i < data.length; i++) {
          const x = i * step;
          const y = y0 + coreH - (data[i] / 100) * coreH;
          if (i === 0) ctx.moveTo(x, y0 + coreH);
          ctx.lineTo(x, y);
        }
        ctx.lineTo((data.length-1)*step, y0 + coreH);
        ctx.closePath();
        ctx.fillStyle = `${col}28`;
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = i * step;
          const y = y0 + coreH - (data[i] / 100) * coreH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const cur = data[data.length-1] ?? 0;
        ctx.fillStyle = col;
        ctx.font = `9px ${mono}`;
        ctx.fillText(`C${c} ${cur.toFixed(0)}%`, 4, y0 + coreH - 4);
      }
      raf.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [hist]);

  return <canvas ref={ref} width={900} height={N_CORES * 32} style={{ width:"100%", height:"auto", display:"block", borderRadius:4 }} />;
}

/* ── kernel log ──────────────────────────────────────────────────────── */
function KernelLog({ lines }: { lines: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div ref={ref} style={{ fontFamily:mono, fontSize:10, lineHeight:1.7, overflowY:"auto", maxHeight:160, padding:"8px 12px", background:"rgba(0,0,0,0.5)", border:`1px solid ${BORDER}`, borderRadius:6 }}>
      {lines.map((l,i) => (
        <div key={i}>
          <span style={{ color:DIM }}>{l.t} </span>
          <span style={{ color:l.col }}>{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ── status badge ────────────────────────────────────────────────────── */
function StatusBadge({ s }: { s: ProcStatus }) {
  const c = s==="RUNNING"?AU : s==="IO"?GOLD : s==="WAIT"?BLUE : s==="SLEEP"?MUTED : DIM;
  return <span style={{ fontFamily:mono, fontSize:9, color:c, background:`${c}18`, border:`1px solid ${c}40`, borderRadius:3, padding:"1px 5px" }}>{s}</span>;
}

/* ── CPU bar ─────────────────────────────────────────────────────────── */
function CpuBar({ v, col }: { v: number; col: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      <div style={{ width:60, height:8, background:`${col}18`, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${v}%`, background:col, borderRadius:3 }} />
      </div>
      <span style={{ fontFamily:mono, fontSize:9, color:col, minWidth:28 }}>{v.toFixed(0)}%</span>
    </div>
  );
}

/* ── code files ──────────────────────────────────────────────────────── */
const PROC_CODE_FILES = [
  {
    id:"scheduler", name:"aether_scheduler.qg", icon:"Sc",
    content:`# AETHER-OS -- Process Scheduler (Round-Robin + Priority)
# All AETHER simulation pages run as kernel-scheduled processes.
# Scheduler quantum: 200ms -- process yields or is preempted after quantum.
# Priority classes: KERNEL(0) > PHYSICS(1) > RENDER(2) > IO(3)

from aether.kernel import Scheduler, ProcessTable, KernelLock

QUANTUM_MS = 200       # scheduler quantum [ms]
N_CORES    = 8         # logical CPU cores
CACHE_L1   = 32768     # 32KB per core L1 cache
CACHE_L2   = 262144    # 256KB per core L2 cache (shared among 2)

class AETHERProcess:
    def __init__(self, pid, name, priority=2):
        self.pid      = pid
        self.name     = name
        self.priority = priority    # 0=KERNEL 1=PHYSICS 2=RENDER 3=IO
        self.state    = "READY"     # READY | RUNNING | WAITING | IO | SLEEP
        self.cpu_pct  = 0.0
        self.mem_kb   = 0
        self.quantum  = QUANTUM_MS

    def run(self, dt_ms):
        """Execute for dt_ms, return True if still needs CPU."""
        self.quantum -= dt_ms
        if self.quantum <= 0:
            self.state = "READY"
            self.quantum = QUANTUM_MS
            return False    # yielded
        return True

class RoundRobinScheduler:
    """
    Round-robin scheduler with priority queues.
    High-priority processes (low number) always preempt lower-priority.
    Physics simulations get PHYSICS(1) -- preempt rendering but not kernel.
    """
    def __init__(self, n_cores=N_CORES):
        self.cores   = [None] * n_cores
        self.queues  = {0:[], 1:[], 2:[], 3:[]}  # priority -> process list

    def enqueue(self, process):
        self.queues[process.priority].append(process)

    def schedule(self):
        """Assign processes to free cores, highest priority first."""
        for priority in sorted(self.queues.keys()):
            for proc in self.queues[priority]:
                free = next((i for i,c in enumerate(self.cores) if c is None), None)
                if free is not None:
                    self.cores[free] = proc
                    proc.state = "RUNNING"

# Processing delay arises when:
# 1. All 8 cores busy -> new process waits in READY queue (scheduling delay)
# 2. Cache miss -> L2 fetch adds 4-12 cycles latency per access
# 3. IPC calls -> AETHERKernel sync adds 8-45us depending on lock contention
# 4. IO wait -> process blocks on network/disk, frees core, re-enqueued on completion`,
  },
  {
    id:"ipc", name:"inter_process_comm.qg", icon:"IP",
    content:`# AETHER-OS -- Inter-Process Communication Layer
# Processes communicate via shared memory segments + message queues.
# AETHERKernel mediates all cross-process state synchronisation.

import queue, threading, time
from aether.kernel import SharedMemory, MessageQueue, Semaphore

class AETHERMessage:
    """Single IPC message between AETHER processes."""
    def __init__(self, src_pid, dst_pid, msg_type, payload, seq):
        self.src     = src_pid
        self.dst     = dst_pid
        self.mtype   = msg_type   # "SYNC"|"DATA"|"EVENT"|"QUERY"|"ACK"
        self.payload = payload
        self.seq     = seq
        self.ts      = time.monotonic_ns()

class AETHERMessageBus:
    """
    Central message broker. All processes publish/subscribe here.
    Ring buffer: 4096 slots, 64-byte messages, lock-free SPSC per channel.
    Round-trip latency: 8-45us depending on contention.
    """
    def __init__(self):
        self.channels = {}    # pid -> queue.SimpleQueue
        self.lock     = threading.Lock()

    def register(self, pid):
        with self.lock:
            self.channels[pid] = queue.SimpleQueue()

    def send(self, msg):
        ch = self.channels.get(msg.dst)
        if ch is not None:
            ch.put_nowait(msg)

    def recv(self, pid, timeout_ms=10):
        ch = self.channels.get(pid)
        try:
            return ch.get(timeout=timeout_ms/1000)
        except queue.Empty:
            return None

class CoherenceSync:
    """
    AETHER-specific IPC: synchronises C(x,t) coherence fields across processes.
    Each simulation page publishes its C-field slice; kernel merges + rebroadcasts.
    Merge strategy: weighted average by process priority + field confidence.
    """
    def __init__(self, bus):
        self.bus   = bus
        self.cache = {}   # pid -> (C_field, timestamp, confidence)

    def publish(self, pid, C_field, confidence=1.0):
        msg = AETHERMessage(pid, 1001, "DATA", {"C": C_field, "conf": confidence}, seq=0)
        self.bus.send(msg)
        self.cache[pid] = (C_field, time.monotonic(), confidence)

    def merge(self):
        """Weighted merge of all C-field slices -> global coherence estimate."""
        total_weight = sum(c for _,_,c in self.cache.values())
        if total_weight == 0:
            return 0.0
        return sum(C*conf for C,_,conf in self.cache.values()) / total_weight`,
  },
  {
    id:"latency", name:"processing_latency.qg", icon:"Dt",
    content:`# AETHER-OS -- Processing Delay Analysis
# Models the sources of latency in the shared compute substrate.
# Four main delay components: scheduling, memory, IPC, physics.

import numpy as np
from aether.profiler import Histogram, Trace

# Latency budget for a single AETHER simulation tick (target: <200ms total)
LATENCY_BUDGET = {
    "scheduling":   8,    # [ms] queue + context switch
    "memory":      12,    # [ms] cache miss + TLB shootdown
    "ipc":          5,    # [ms] AETHERKernel sync round-trip
    "physics":    140,    # [ms] numerical integration (most expensive)
    "rendering":   25,    # [ms] WebGL / canvas draw call
    "overhead":    10,    # [ms] GC pause + miscellaneous
}
TOTAL_BUDGET = sum(LATENCY_BUDGET.values())  # = 200ms

def scheduling_delay(n_ready, n_cores, quantum_ms):
    """
    Expected queue wait time when n_ready processes compete for n_cores.
    E[wait] = quantum * max(0, floor(n_ready / n_cores) - 1)
    """
    if n_ready <= n_cores:
        return 0.0
    return quantum_ms * (n_ready // n_cores - 1)

def cache_miss_penalty(working_set_kb, cache_l2_kb, mem_latency_ns=60):
    """
    When working set > L2 cache: fraction of accesses -> main memory.
    Penalty per miss: ~60ns DRAM latency @ 3GHz = 180 cycles.
    miss_rate ~ (working_set - l2) / working_set  (simplified LRU model)
    """
    if working_set_kb <= cache_l2_kb:
        return 0.0
    miss_rate = (working_set_kb - cache_l2_kb) / working_set_kb
    return miss_rate * mem_latency_ns * 1e-6  # convert ns to ms

def physics_latency(grid_n, dt, order=4):
    """
    Time to advance physics grid by one step.
    Finite-difference stencil: O(N * order) flops per step.
    At 3 GFLOPS/core (realistic with cache pressure):
    t = N * order / 3e9 seconds
    """
    flops = grid_n * order
    return flops / 3e9 * 1e3  # ms

class DelayProfiler:
    """Runtime latency profiler for AETHER processes."""
    def __init__(self, pid, name):
        self.pid  = pid
        self.name = name
        self.hist = Histogram(buckets=[1,5,10,20,50,100,200,500])

    def record(self, total_ms, components):
        self.hist.add(total_ms)
        overhead = total_ms - sum(components.values())
        return {"total": total_ms, **components, "overhead": overhead}

    def p99(self):
        """99th percentile latency -- tail latency budget."""
        return self.hist.percentile(99)`,
  },
  {
    id:"coherence", name:"coherence_pipeline.qg", icon:"Cp",
    content:`# AETHER-OS -- Coherence Field Computation Pipeline
# All simulation pages feed C(x,t) slices into this shared pipeline.
# Pipeline stages: ingest -> normalise -> merge -> crystallise -> broadcast.

from aether.kernel import CoherenceField, CrystallizationEngine
import numpy as np

PIPELINE_STAGES = ["INGEST","NORMALISE","MERGE","CRYSTALLISE","BROADCAST"]

class CoherencePipeline:
    """
    5-stage pipeline processing C(x,t) contributions from all processes.
    Each stage runs on a dedicated core to maximise throughput.
    Stage latency target: 40ms each -> total 200ms pipeline depth.
    """
    def __init__(self, n_processes):
        self.n   = n_processes
        self.buf = [None] * 5     # double-buffered per stage
        self.C_global = 0.0

    def ingest(self, raw_fields):
        """
        Stage 1: collect C-field slices from all n processes.
        Waits up to 40ms for all processes; late data discarded.
        Returns list of (pid, C_slice, confidence, latency_ms) tuples.
        """
        ingested = []
        for pid, field in raw_fields.items():
            C_slice    = np.mean(field["C"])          # scalar summary
            confidence = field.get("confidence", 0.8)
            latency    = field.get("latency_ms", 0)
            ingested.append((pid, C_slice, confidence, latency))
        return ingested

    def normalise(self, ingested):
        """
        Stage 2: normalise each C-slice to [0,1] and weight by confidence.
        Reject slices where C < 0.1 (incoherent -- treated as noise).
        """
        return [(pid, np.clip(C,0,1), conf, lat)
                for pid, C, conf, lat in ingested if C >= 0.1]

    def merge(self, normalised):
        """
        Stage 3: weighted average merge.
        C_merged = sum(C_i * conf_i) / sum(conf_i)
        Latency-weighted: processes with higher latency get lower weight.
        """
        total_w = sum(conf / (1 + lat/100) for _,_,conf,lat in normalised)
        if total_w < 1e-9:
            return 0.0
        return sum(C*conf/(1+lat/100) for _,C,conf,lat in normalised) / total_w

    def crystallise(self, C_merged, prev_C, alpha=0.15):
        """
        Stage 4: Crystallization Model integration step.
        C_next = C_prev + alpha * (C_target - C_prev)
        Exponential approach to target -- prevents abrupt jumps.
        """
        return prev_C + alpha * (C_merged - prev_C)

    def broadcast(self, C_final):
        """Stage 5: push updated global C to all subscribed processes."""
        self.C_global = C_final
        return C_final`,
  },
];

/* ── main page ───────────────────────────────────────────────────────── */
export default function ProcessingDelayPage() {
  const [tick, setTick] = useState(0);
  const [procStates, setProcStates] = useState<ProcState[]>(() =>
    PROCS.map(p => ({ cpu: p.baseCpu, mem: p.baseMem, lat: p.baseLat, status: "RUNNING" as ProcStatus }))
  );
  const [coreHist, setCoreHist] = useState<number[][]>(() => Array.from({length:N_CORES},()=>[]));
  const [log, setLog] = useState<LogLine[]>([]);
  const tickRef = useRef(0);

  const makeLogLine = useCallback((t: number): LogLine => {
    const pidx = Math.floor(Math.random() * PROCS.length);
    const p = PROCS[pidx];
    const lat = Math.round(procStates[pidx]?.lat ?? p.baseLat);
    const fn = LOG_FN[Math.floor(Math.random() * LOG_FN.length)];
    const msg = fn(p, lat, t);
    const col = [AU, GOLD, BLUE, CORAL, VIOL, TEXT][Math.floor(Math.random()*6)];
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}.${String(now.getMilliseconds()).padStart(3,"0")}`;
    return { t: ts, msg, col };
  }, [procStates]);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      const t = tickRef.current;

      setProcStates(prev => prev.map((ps, i) => {
        const p = PROCS[i];
        const cpu = clamp(p.baseCpu + nz(p.pid, t, p.baseCpu * 0.6), 0, 99);
        const mem = clamp(p.baseMem + nz(p.pid+100, t, 20), p.baseMem * 0.8, p.baseMem * 1.4);
        const lat = clamp(p.baseLat + nz(p.pid+200, t, p.baseLat * 0.4), 1, p.baseLat * 3);
        const statuses: ProcStatus[] = cpu > 60 ? ["RUNNING","RUNNING","IO"] : cpu > 30 ? ["RUNNING","WAIT","RUNNING"] : ["RUNNING","SLEEP","RUNNING","IDLE"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return { cpu, mem, lat, status };
      }));

      setCoreHist(prev => {
        const next = prev.map((h, c) => {
          const load = clamp(30 + nz(c*100, t, 40), 0, 100);
          const arr = [...h, load];
          return arr.length > HISTORY ? arr.slice(arr.length - HISTORY) : arr;
        });
        return next;
      });

      setTick(t);
      if (t % 3 === 0) {
        setLog(prev => {
          const line = makeLogLine(t);
          const next = [...prev, line];
          return next.length > 60 ? next.slice(next.length - 60) : next;
        });
      }
    }, 250);
    return () => clearInterval(id);
  }, [makeLogLine]);

  const totalCpu = procStates.reduce((s,p) => s + p.cpu, 0);
  const totalMem = procStates.reduce((s,p) => s + p.mem, 0);
  const avgLat   = procStates.reduce((s,p) => s + p.lat, 0) / procStates.length;
  const running  = procStates.filter(p => p.status === "RUNNING").length;

  const cpuColor = (v: number) => v > 80 ? CORAL : v > 50 ? GOLD : AU;

  return (
    <div style={{ background:BG, minHeight:"100vh", padding:"48px 24px", color:TEXT }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>

        {/* header */}
        <div style={{ marginBottom:36, borderBottom:`1px solid ${BORDER}`, paddingBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:9, letterSpacing:"0.5em", color:AU, marginBottom:10, textTransform:"uppercase" }}>
            AETHER COMPUTE SUBSTRATE MONITOR
          </div>
          <div style={{ fontFamily:serif, fontSize:28, color:AU, marginBottom:10 }}>Processing Delay</div>
          <div style={{ fontFamily:body, fontSize:16, color:MUTED, lineHeight:1.7 }}>
            All AETHER simulation modules run as concurrent processes on the shared compute substrate.
            This monitor tracks CPU core activity, process states, IPC latency, and the coherence field pipeline
            in real time -- showing the processing delay each module incurs when the machine is fully loaded.
          </div>
        </div>

        {/* top stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            { label:"TOTAL CPU", val:`${Math.min(totalCpu/PROCS.length,99).toFixed(1)}%`, col:cpuColor(totalCpu/PROCS.length) },
            { label:"TOTAL MEM", val:`${(totalMem/1024).toFixed(1)} GB`, col:BLUE },
            { label:"AVG LATENCY", val:`${avgLat.toFixed(0)} ms`, col:GOLD },
            { label:"RUNNING", val:`${running} / ${PROCS.length}`, col:AU },
          ].map(s => (
            <div key={s.label} style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:MUTED, letterSpacing:"0.3em", marginBottom:6 }}>{s.label}</div>
              <div style={{ fontFamily:mono, fontSize:20, color:s.col }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* CPU core history */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 18px", marginBottom:22 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:12, textTransform:"uppercase" }}>
            CPU CORE ACTIVITY -- {N_CORES} cores -- tick {tick}
          </div>
          <CpuCanvas hist={coreHist} />
        </div>

        {/* process table */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 0", marginBottom:22, overflowX:"auto" }}>
          <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", margin:"0 18px 12px", textTransform:"uppercase" }}>
            PROCESS TABLE
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:10 }}>
            <thead>
              <tr>
                {["PID","PROCESS NAME","MODULE","CPU","MEM (MB)","LATENCY","STATUS"].map(h => (
                  <th key={h} style={{ textAlign:"left", color:MUTED, padding:"4px 12px", borderBottom:`1px solid ${BORDER}`, fontWeight:"normal" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROCS.map((p, i) => {
                const ps = procStates[i];
                if (!ps) return null;
                const cc = cpuColor(ps.cpu);
                return (
                  <tr key={p.pid} style={{ background: i%2===0?"transparent":`${AU}06` }}>
                    <td style={{ padding:"5px 12px", color:DIM }}>{p.pid}</td>
                    <td style={{ padding:"5px 12px", color:TEXT }}>{p.name}</td>
                    <td style={{ padding:"5px 12px", color:MUTED }}>{p.module}</td>
                    <td style={{ padding:"5px 12px" }}><CpuBar v={ps.cpu} col={cc} /></td>
                    <td style={{ padding:"5px 12px", color:BLUE }}>{ps.mem.toFixed(0)}</td>
                    <td style={{ padding:"5px 12px", color:ps.lat>100?CORAL:GOLD }}>{ps.lat.toFixed(0)} ms</td>
                    <td style={{ padding:"5px 12px" }}><StatusBadge s={ps.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* kernel log */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 18px", marginBottom:32 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:10, textTransform:"uppercase" }}>
            KERNEL EVENT LOG
          </div>
          <KernelLog lines={log} />
        </div>

        {/* insight */}
        <div style={{ marginTop:40, padding:"22px 24px", background:"#ffffff04", border:`1px solid ${AU}18`, borderRadius:10, textAlign:"center" }}>
          <div style={{ fontFamily:serif, fontSize:15, color:AU, marginBottom:8 }}>PROCESSING DELAY AS SIGNAL</div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:17, color:GOLD, lineHeight:1.8, marginBottom:14 }}>
            "Every millisecond of delay is the machine telling you what it values.<br />
            The queue is not a failure -- it is priority made visible in time."
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:DIM, lineHeight:2 }}>
            latency = scheduling_delay + cache_miss_penalty + ipc_cost + physics_time + render_time
          </div>
          <div style={{ fontFamily:mono, fontSize:9, color:`${DIM}80`, marginTop:14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce
          </div>
        </div>

        <CodeFilesPanel
          heading="Compute Substrate Simulation Files"
          accentColor={AU}
          files={PROC_CODE_FILES}
        />
      </div>
    </div>
  );
}
