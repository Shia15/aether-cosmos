import { useEffect, useRef } from "react";
import { Link } from "wouter";
import imgControlFlow from "@assets/8C6CC664-6AF5-4A6B-A175-ED5AFD0CA1DC_1783095490513.JPG";

const BG = "#04060d";
const PAN = "#0a0d1a";
const PAN2 = "#0d1020";
const BORDER = "#182038";
const TEXT = "#b8cce8";
const MUTED = "#5a6e8c";
const GOLD = "#ffb830";
const CYAN = "#3fd8d0";
const VIOLET = "#a87aff";
const GREEN = "#50d49a";
const BLUE = "#4ab0ff";
const ROSE = "#ff6699";

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;
}

function fitCanvas(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 640;
  const h = cv.clientHeight || 260;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/* ── Loop Iteration Visualizer ── */
function LoopCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef(1.0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let loopCount = 0;
    let lastTick = 0;

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      t += 0.025 * speedRef.current;
      const tick = Math.floor(t);
      if (tick !== lastTick) { loopCount = (loopCount + 1) % 12; lastTick = tick; }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const R = Math.min(w, h) * 0.36;

      // loop path circle
      ctx.strokeStyle = hexA(CYAN, 0.18);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      const N = 12;
      for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(ang) * R;
        const y = cy + Math.sin(ang) * R;
        const active = i === loopCount;
        const done = i < loopCount;
        const col = active ? GOLD : done ? GREEN : hexA(CYAN, 0.3);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, active ? 10 : 6, 0, Math.PI * 2);
        ctx.fill();
        if (active) {
          ctx.shadowColor = GOLD;
          ctx.shadowBlur = 18;
          ctx.fillStyle = GOLD;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = hexA(TEXT, 0.6);
        ctx.font = "10px monospace";
        ctx.fillText(`i=${i}`, x - 10, y + 24);
      }

      // centre: loop type label
      ctx.fillStyle = TEXT;
      ctx.font = "bold 15px monospace";
      const label = loopCount < 8 ? "for loop" : loopCount < 10 ? "while" : "exit";
      ctx.fillText(label, cx - 28, cy - 6);
      ctx.fillStyle = MUTED;
      ctx.font = "11px monospace";
      ctx.fillText(`iteration ${loopCount}`, cx - 34, cy + 12);

      // condition bar
      const cond = loopCount < 11;
      ctx.fillStyle = cond ? hexA(GREEN, 0.15) : hexA(ROSE, 0.15);
      ctx.strokeStyle = cond ? GREEN : ROSE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx - 60, h - 38, 120, 22, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = cond ? GREEN : ROSE;
      ctx.font = "11px monospace";
      ctx.fillText(cond ? "condition: true" : "exit loop", cx - 36, h - 22);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 260, display: "block", borderRadius: 10, border: `1px solid ${BORDER}` }} />
      <label style={{ display: "block", fontFamily: "monospace", fontSize: 11, color: MUTED, marginTop: 10 }}>
        Loop speed
        <input type="range" min={0.2} max={3} step={0.1} defaultValue={1.0}
          onChange={e => (speedRef.current = parseFloat(e.target.value))}
          style={{ marginLeft: 10, accentColor: CYAN, width: 120 }} />
      </label>
    </div>
  );
}

const TERMS = [
  { t: "If-Else", col: CYAN, d: "An if-else branch has two branches: the first executes if an expression is true, else the other executes." },
  { t: "Relational Operator", col: BLUE, d: "An operator that compares two values, yielding a Boolean result. (Greater-than or equal-to.)" },
  { t: "Logical Operator", col: VIOLET, d: "Treats operands as being true or false and evaluates to true or false." },
  { t: "Switch", col: GOLD, d: "A switch statement can represent multi-branch behavior involving a variable being compared to constant values." },
  { t: "Loop", col: GREEN, d: "A program construct that repeatedly executes a block of statements while the loop's expression is true." },
  { t: "Iteration", col: CYAN, d: "Each execution of the loop body is called an iteration." },
  { t: "While Loop", col: BLUE, d: "A while loop is a program construct that repeatedly executes a list of sub-statements while the loop's expression evaluates to true." },
  { t: "For Loop", col: VIOLET, d: "A for loop has three parts at the top: a loop variable initialization, a loop expression, and a loop variable update." },
  { t: "Infinite Loop", col: ROSE, d: "A loop that never stops iterating." },
  { t: "Sentinel Value", col: GOLD, d: "A special value indicating the end of a list." },
  { t: "indexOf()", col: GREEN, d: "The indexOf() method is used to find a string or character inside a string." },
  { t: "lastIndexOf()", col: CYAN, d: "Returns the index of the last occurrence of a substring in a string." },
  { t: "substring()", col: BLUE, d: "The substring() method is used to get a portion of a string." },
  { t: "equals()", col: VIOLET, d: "The equals() method returns true if two strings are equal." },
];

const CODE_EXAMPLES = [
  { label: "for loop", code: `for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}` },
  { label: "while loop", code: `int i = 0;\nwhile (i < 10) {\n    System.out.println(i);\n    i++;\n}` },
  { label: "if-else", code: `if (x > 0) {\n    System.out.println("positive");\n} else {\n    System.out.println("non-positive");\n}` },
  { label: "switch", code: `switch (day) {\n    case 1: System.out.println("Mon"); break;\n    case 2: System.out.println("Tue"); break;\n    default: System.out.println("Other");\n}` },
];

export default function JavaControlFlowPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, padding: "40px 20px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>AETHER · Codebase · Java Control Flow</div>
        <h1 style={{ fontSize: 30, margin: "0 0 10px", fontWeight: 700, background: `linear-gradient(90deg,${CYAN},${VIOLET})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Java Control Flow · Loops · String Methods
        </h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, maxWidth: 740, margin: "0 0 24px" }}>
          Control flow is the language of iteration: if-else, switch, for, while, and the string-method vocabulary (indexOf / substring / equals). These are the instruments that give a program its dynamics — directing execution rather than just computing values.
        </p>

        <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>I · Loop Iteration Visualizer</div>
          <LoopCanvas />
        </div>

        <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>II · Source Reference</div>
          <figure style={{ margin: 0 }}>
            <img src={imgControlFlow} alt="Java control flow and string methods reference sheet" loading="lazy"
              style={{ width: "100%", maxWidth: 540, borderRadius: 8, border: `1px solid ${BORDER}`, display: "block", margin: "0 auto" }} />
            <figcaption style={{ fontSize: 11, color: MUTED, marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
              Java Control Flow reference — If-Else · Relational/Logical Operators · Switch · Loop · Iteration · While/For Loop · Infinite Loop · Sentinel Value · indexOf() · lastIndexOf() · substring() · equals()
            </figcaption>
          </figure>
        </div>

        <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>III · Interactive Reference Cards</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
            {TERMS.map(t => (
              <div key={t.t} style={{ background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 12.5, color: t.col, marginBottom: 4 }}>{t.t}</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{t.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>IV · Code Examples</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
            {CODE_EXAMPLES.map(ex => (
              <div key={ex.label} style={{ background: "#060810", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: GOLD, marginBottom: 8, textTransform: "uppercase" }}>{ex.label}</div>
                <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12, color: TEXT, lineHeight: 1.7, whiteSpace: "pre", overflowX: "auto" }}>{ex.code}</pre>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BORDER}`, fontFamily: "monospace", fontSize: 12 }}>
          <Link href="/codebase-symbol-engine" style={{ color: CYAN, textDecoration: "none" }}>→ Codebase Symbol Engine</Link>
          <Link href="/equation-codex" style={{ color: VIOLET, textDecoration: "none" }}>→ Equation Codex</Link>
          <Link href="/" style={{ color: MUTED, textDecoration: "none" }}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
