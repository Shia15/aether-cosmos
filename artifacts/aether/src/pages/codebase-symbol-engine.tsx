import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "wouter";

import imgJavaConcepts from "@assets/17AFCB8E-85D1-4F11-BA60-7BC42DA9FA11_1783095490513.JPG";
import imgJavaOperators from "@assets/0F94F671-1D04-4EED-BC72-05B77C27CA07_1783095490513.JPG";

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

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;
}

function fitCanvas(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 640;
  const h = cv.clientHeight || 280;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

const SYMBOLS = [
  "class","void","int","float","double","bool","char","string",
  "if","else","for","while","switch","return","new","import",
  "{}","()","[]","==","!=","&&","||","!","++","--","+=","-=","*=","/=","%=",
  "//","/* */","System.out","Scanner","String","Math","null","true","false",
];

function SymbolEngineCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    type Node = { x: number; y: number; vx: number; vy: number; sym: string; col: string; size: number; phase: number };
    let nodes: Node[] = [];
    const COLS = [CYAN, GOLD, VIOLET, GREEN, BLUE];
    let seeded = false;

    const seed = (w: number, h: number) => {
      nodes = SYMBOLS.map((s, i) => ({
        x: 20 + Math.random() * (w - 40),
        y: 20 + Math.random() * (h - 40),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        sym: s,
        col: COLS[i % COLS.length],
        size: 9 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2,
      }));
      seeded = true;
    };

    let lw = 0, lh = 0;
    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      if (!seeded || Math.abs(w - lw) > 40 || Math.abs(h - lh) > 40) { seed(w, h); lw = w; lh = h; }
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // draw connections for nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.strokeStyle = hexA(CYAN, 0.06 * (1 - d / 90));
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        n.x += n.vx + Math.sin(t * 0.7 + n.phase) * 0.2;
        n.y += n.vy + Math.cos(t * 0.5 + n.phase) * 0.18;
        n.x = ((n.x + w) % w);
        n.y = ((n.y + h) % h);
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.8 + n.phase);
        ctx.fillStyle = hexA(n.col, 0.85 * pulse);
        ctx.font = `${n.size}px 'Space Mono', monospace`;
        ctx.shadowColor = n.col;
        ctx.shadowBlur = 8 * pulse;
        ctx.fillText(n.sym, n.x, n.y);
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={cvRef} style={{ width: "100%", height: 260, display: "block", borderRadius: 10, border: `1px solid ${BORDER}` }} />
  );
}

const JAVA_TERMS = [
  { t: "Class", d: "A programmer-defined data type — the blueprint from which objects are created." },
  { t: "Method", d: "A named sequence of statements that may accept parameters and return a value." },
  { t: "Main Method", d: "The entry-point method called first when a Java application executes." },
  { t: "Statement", d: "A syntactical unit: a simple statement, compound statement, or block." },
  { t: "Argument", d: "A value supplied in a method call, or one of the values combined by an operator." },
  { t: "String", d: "A sequence of characters. One of Java's 8 primitive types (String = 1/8 primitive types)." },
  { t: "Scanner", d: "A text parser that retrieves numbers, words, or phrases from an input source." },
  { t: "System.out.print", d: "The standard output construct for writing to the console." },
  { t: "String Literal", d: "Text enclosed in double quotes — a compile-time constant string value." },
  { t: "Comment", d: "Text added by a programmer for clarity; ignored by the compiler." },
  { t: "Single-line Comment", d: "Begins with // — includes all subsequent text on that line." },
  { t: "Multi-line Comment", d: "Starts with /* and ends with */ — all text between markers is comment." },
  { t: "Whitespace", d: "Blank spaces (space and tab characters) between items in a statement, and blank lines between statements." },
  { t: "Syntax Error", d: "A mistake that violates a programming language's rules." },
  { t: "Compile-time Error", d: "A syntax error detected by the compiler before the program runs." },
  { t: "Logic Error / Bug", d: "Occurs while a program is running; can lead to incorrect results." },
];

const NOTE_TERMS = [
  { t: "Do-While Loop", d: "Like a while loop, but executes the body at least once before checking the condition." },
  { t: "Enhanced For Loop (for-each)", d: "AKA for(each) — iterates through every element of an array or collection without an index variable. Best for reading all elements effortlessly." },
];

const OPERATORS = [
  { sym: "%", name: "Modulo Operator", desc: "Returns the remainder of a division operation" },
  { sym: "char", name: "Character Data Type", desc: "Stores a single character (letter, digit, or symbol)" },
  { sym: "++", name: "Increment Operator", desc: "Increases a variable's value by 1" },
  { sym: "==", name: "Equality Operator", desc: "Compares two values for equality" },
  { sym: "&&", name: "Logical AND", desc: "Returns true if both conditions are true" },
  { sym: "||", name: "Logical OR", desc: "Returns true if at least one condition is true" },
  { sym: "!", name: "Logical NOT", desc: "Reverses the logical state of its operand" },
  { sym: "!=", name: "Not Equal To", desc: "Checks if two values are not equal" },
  { sym: ">=", name: "Greater Than or Equal To", desc: "Checks if left operand is >= right operand" },
  { sym: "<=", name: "Less Than or Equal To", desc: "Checks if left operand is <= right operand" },
  { sym: "+=", name: "Addition Assignment", desc: "Adds right operand to left operand and assigns result" },
  { sym: "-=", name: "Subtraction Assignment", desc: "Subtracts right operand from left and assigns result" },
  { sym: "*=", name: "Multiplication Assignment", desc: "Multiplies left operand by right and assigns result" },
  { sym: "/=", name: "Division Assignment", desc: "Divides left operand by right and assigns result" },
  { sym: "if", name: "Conditional Statement", desc: "Executes code block if condition is true" },
  { sym: "else", name: "Alternative Condition", desc: "Executes alternative code block if 'if' condition is false" },
  { sym: "switch", name: "Multiple Condition Handling", desc: "Executes one case from multiple conditions" },
  { sym: "for", name: "Loop", desc: "Executes block multiple times based on condition" },
  { sym: "while", name: "While Loop", desc: "Repeats code while condition remains true" },
  { sym: "int", name: "Integer Data Type", desc: "Stores whole numbers" },
  { sym: "float", name: "Floating Point Type", desc: "Stores decimal numbers" },
  { sym: "double", name: "Double Precision Floating Point", desc: "Stores large decimal numbers" },
  { sym: "bool", name: "Boolean Type", desc: "Stores true or false values" },
  { sym: "string", name: "String Type", desc: "Stores text data" },
];

const AETHER_NOTES = [
  { t: "Code as coherence field", d: "Every token in a program is a symbol with a defined role in a grammar — an operator, a type, a name. The compiler's job is to prove coherence: that every symbol resolves, every type checks, every path terminates safely. This is not so different from what AETHER calls 'field verification' across a coherence domain." },
  { t: "The symbol engine", d: "A running program is a symbol engine: raw text tokens are transformed through parse, type-check, compile, link, and execute into a deterministic sequence of machine operations. Each stage is a phase transition — just as AETHER's five-phase loop maps Sense → Deliver → Activate → Feedback → Learn, the compiler maps Source → AST → IR → Bytecode → Machine." },
  { t: "Integration across layers", d: "The integration challenge in software is the same as in biology: how do signals at one level (character bytes → tokens → AST nodes → semantics → machine instructions) compose without information loss? AETHER's multi-scale integration answer applies here too — structure in the representation replaces parameter explosion in the mapping." },
];

function Box({ children }: { children: ReactNode }) {
  return <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>{children}</div>;
}

function H2({ label, n }: { label: string; n: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: CYAN }}>{n}</span>
      <h2 style={{ margin: 0, fontSize: 19, color: TEXT, fontWeight: 600 }}>{label}</h2>
    </div>
  );
}

export default function CodebaseSymbolEnginePage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, padding: "40px 20px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · Codebase Creation · Symbol Engine
        </div>
        <h1 style={{ fontSize: 32, margin: "0 0 10px", fontWeight: 700, background: `linear-gradient(90deg,${CYAN},${VIOLET},${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Codebase Creation · Symbol Engine · Dynamics & Integration
        </h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, maxWidth: 740, margin: "0 0 28px" }}>
          A programming reference and conceptual framework mapping Java's symbol grammar onto AETHER's coherence architecture. Code is a coherence field: the compiler verifies that every symbol resolves, every type checks, every path is safe. The canvas below renders the symbol space as a living field.
        </p>

        <section style={{ marginBottom: 28 }}>
          <H2 n="I" label="Symbol Engine · Live Field" />
          <Box>
            <SymbolEngineCanvas />
            <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, marginTop: 10 }}>
              Java operators, types, and control tokens drifting through the coherence field — connected when proximity implies semantic relationship.
            </p>
          </Box>
        </section>

        <section style={{ marginBottom: 28 }}>
          <H2 n="II" label="Java Programming Concepts · Source Reference" />
          <Box>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
              <figure style={{ margin: 0 }}>
                <img src={imgJavaConcepts} alt="Java Programming Concepts reference sheet" loading="lazy" style={{ width: "100%", borderRadius: 8, border: `1px solid ${BORDER}` }} />
                <figcaption style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                  Java Programming Concepts — Class through Logic Error / Bug, with student annotations: Do-While Loop, Enhanced For Loop (for-each), best for looping through arrays and collections effortlessly.
                </figcaption>
              </figure>
              <figure style={{ margin: 0 }}>
                <img src={imgJavaOperators} alt="Programming Operators and Data Types reference sheet" loading="lazy" style={{ width: "100%", borderRadius: 8, border: `1px solid ${BORDER}` }} />
                <figcaption style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                  Programming Operators and Data Types — modulo through string type, 25 symbols with name and description.
                </figcaption>
              </figure>
            </div>
          </Box>
        </section>

        <section style={{ marginBottom: 28 }}>
          <H2 n="III" label="Java Concepts · Interactive Reference" />
          <Box>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10, marginBottom: 16 }}>
              {JAVA_TERMS.map(t => (
                <div key={t.t} style={{ background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 12.5, color: CYAN, marginBottom: 4 }}>{t.t}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{t.d}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: GOLD, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Sticky-note additions</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
                {NOTE_TERMS.map(t => (
                  <div key={t.t} style={{ background: hexA(GOLD, 0.06), border: `1px solid ${hexA(GOLD, 0.25)}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 12.5, color: GOLD, marginBottom: 4 }}>{t.t}</div>
                    <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{t.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </Box>
        </section>

        <section style={{ marginBottom: 28 }}>
          <H2 n="IV" label="Operators & Data Types · Interactive Reference" />
          <Box>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Symbol", "Name", "Description"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${BORDER}`, color: CYAN, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OPERATORS.map((op, i) => (
                    <tr key={op.sym} style={{ background: i % 2 === 0 ? PAN2 : "transparent" }}>
                      <td style={{ padding: "7px 10px", color: GOLD, fontFamily: "monospace", fontSize: 13 }}>{op.sym}</td>
                      <td style={{ padding: "7px 10px", color: VIOLET }}>{op.name}</td>
                      <td style={{ padding: "7px 10px", color: MUTED }}>{op.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
        </section>

        <section style={{ marginBottom: 28 }}>
          <H2 n="V" label="AETHER Frame · Code as Coherence" />
          <Box>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
              {AETHER_NOTES.map(n => (
                <div key={n.t} style={{ background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 14, color: CYAN, fontWeight: 600, marginBottom: 6 }}>{n.t}</div>
                  <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>{n.d}</div>
                </div>
              ))}
            </div>
          </Box>
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 30, paddingTop: 20, borderTop: `1px solid ${BORDER}`, fontFamily: "monospace", fontSize: 12 }}>
          <Link href="/java-control-flow" style={{ color: CYAN, textDecoration: "none" }}>→ Java Control Flow</Link>
          <Link href="/equation-codex" style={{ color: VIOLET, textDecoration: "none" }}>→ Equation Codex</Link>
          <Link href="/symbol-atlas" style={{ color: GREEN, textDecoration: "none" }}>→ Symbol Atlas</Link>
          <Link href="/graph-map" style={{ color: MUTED, textDecoration: "none" }}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
