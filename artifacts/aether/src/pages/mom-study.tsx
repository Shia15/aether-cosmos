import { useEffect, useRef } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const card: React.CSSProperties = {
  background: "rgba(10,20,40,0.85)", border: `1px solid ${DIM}`, borderRadius: 10, padding: "20px 24px",
};

const sectionHead = (c: string): React.CSSProperties => ({
  background: "linear-gradient(90deg,rgba(14,26,48,0.95) 0%,rgba(14,26,48,0.4) 100%)",
  borderLeft: `4px solid ${c}`, borderRadius: 4, padding: "16px 22px", margin: "48px 0 10px",
});

const num = (c: string): React.CSSProperties => ({
  fontFamily: MONO, fontSize: "0.66em", letterSpacing: 4, color: c, textTransform: "uppercase", marginBottom: 3,
});

export default function MomStudyPage() {
  const scheduleRef = useRef<HTMLCanvasElement>(null);
  const pomodoroRef = useRef<HTMLCanvasElement>(null);

  // Daily schedule timeline
  useEffect(() => {
    const c = scheduleRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    const blocks = [
      { start: 4.5,  end: 5.0,  label: "WAKE UP", sub: "Hydrate, stretch, setup", color: GOLD },
      { start: 5.0,  end: 7.0,  label: "STUDY BLOCK", sub: "Complex coding -- Pomodoro x4", color: AURORA },
      { start: 7.0,  end: 8.0,  label: "FAMILY TIME", sub: "Morning routine + breakfast", color: "#9b5de5" },
      { start: 8.0,  end: 11.0, label: "CHILD AWAKE", sub: "Active engagement", color: "#607090" },
      { start: 11.0, end: 11.5, label: "NAP SYNC", sub: "Child naps -- you nap 20-30 min", color: "#38bdf8" },
      { start: 11.5, end: 12.0, label: "POST-NAP", sub: "Hydrate, stretch, journal", color: GOLD },
      { start: 12.0, end: 13.5, label: "STUDY WINDOW", sub: "Lighter tasks, review", color: AURORA },
      { start: 13.5, end: 18.0, label: "CHILD AWAKE", sub: "Afternoon engagement", color: "#607090" },
      { start: 18.0, end: 20.0, label: "WIND DOWN", sub: "No screens, sleep hygiene", color: "#4ade80" },
      { start: 20.0, end: 21.0, label: "SLEEP", sub: "Dark, cool, consistent", color: "#2a4060" },
    ];

    const startH = 4.0, endH = 21.0, span = endH - startH;
    const margin = 48;
    const barY = H / 2 - 22, barH = 44;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      blocks.forEach(b => {
        const x1 = margin + ((b.start - startH) / span) * (W - margin * 2);
        const x2 = margin + ((b.end - startH) / span) * (W - margin * 2);
        const bw = x2 - x1;
        const pulse = b.label === "STUDY BLOCK" || b.label === "STUDY WINDOW"
          ? 0.7 + 0.3 * Math.sin(t * 0.06) : 0.8;

        ctx!.fillStyle = b.color + Math.round(pulse * 50).toString(16).padStart(2, "0");
        ctx!.beginPath();
        ctx!.roundRect(x1, barY, bw - 2, barH, 3);
        ctx!.fill();
        ctx!.strokeStyle = b.color + Math.round(pulse * 180).toString(16).padStart(2, "0");
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.roundRect(x1, barY, bw - 2, barH, 3);
        ctx!.stroke();

        if (bw > 30) {
          ctx!.font = `bold 8px ${MONO}`;
          ctx!.fillStyle = b.color;
          ctx!.textAlign = "center";
          ctx!.fillText(b.label, x1 + bw / 2 - 1, barY + 14);
          if (bw > 55) {
            ctx!.font = `7px ${MONO}`;
            ctx!.fillStyle = b.color + "99";
            ctx!.fillText(b.sub, x1 + bw / 2 - 1, barY + 26);
          }
          ctx!.textAlign = "left";
        }
      });

      // Hour tick marks
      for (let h = 4; h <= 21; h++) {
        const x = margin + ((h - startH) / span) * (W - margin * 2);
        ctx!.strokeStyle = "#2a4060";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(x, barY + barH);
        ctx!.lineTo(x, barY + barH + 10);
        ctx!.stroke();
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = "#3a5070";
        ctx!.textAlign = "center";
        ctx!.fillText(`${h < 10 ? "0" + h : h}:00`, x, barY + barH + 22);
        ctx!.textAlign = "left";
      }

      // "Now" cursor
      const nowH = 5.0 + (t * 0.002 % span);
      const nowX = margin + ((nowH - startH) / span) * (W - margin * 2);
      ctx!.strokeStyle = "#f72585";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(nowX, barY - 8);
      ctx!.lineTo(nowX, barY + barH + 8);
      ctx!.stroke();

      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = AURORA;
      ctx!.textAlign = "left";
      ctx!.fillText("SYNCHRONIZED DAILY SCHEDULE -- Mom-Student Edition", margin, barY - 14);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pomodoro timer canvas
  useEffect(() => {
    const c = pomodoroRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const SESSION = 1500; // 25 min in "ticks" (slower for vis)
    const BREAK = 300;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const TOTAL_TICKS = SESSION + BREAK;
      const phase = t % TOTAL_TICKS;
      const isStudy = phase < SESSION;
      const progress = isStudy ? phase / SESSION : (phase - SESSION) / BREAK;
      const session = Math.floor(t / TOTAL_TICKS) + 1;
      const color = isStudy ? AURORA : GOLD;

      // Background ring
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
      ctx!.strokeStyle = DIM;
      ctx!.lineWidth = 12;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.stroke();

      // Progress arc
      const angle = progress * Math.PI * 2 - Math.PI / 2;
      const grd = ctx!.createConicalGradient ? null : null;
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 12;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, -Math.PI / 2, angle);
      ctx!.stroke();

      // Glow
      const glow = ctx!.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.1);
      glow.addColorStop(0, color + "11");
      glow.addColorStop(1, "transparent");
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx!.fill();

      // Center text
      ctx!.font = `bold 24px ${MONO}`;
      ctx!.fillStyle = color;
      ctx!.textAlign = "center";
      const minsLeft = isStudy
        ? Math.ceil((SESSION - phase) / 60)
        : Math.ceil((BREAK - (phase - SESSION)) / 60);
      ctx!.fillText(String(minsLeft).padStart(2, "0") + ":00", cx, cy + 8);

      ctx!.font = `9px ${MONO}`;
      ctx!.fillStyle = color + "88";
      ctx!.fillText(isStudy ? "STUDY BLOCK" : "BREAK", cx, cy + 24);

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#607090";
      ctx!.fillText("SESSION " + session + " of 4", cx, cy - 18);

      // 4 session dots
      for (let i = 0; i < 4; i++) {
        const dotAngle = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const dx = cx + (R + 22) * Math.cos(dotAngle);
        const dy = cy + (R + 22) * Math.sin(dotAngle);
        ctx!.beginPath();
        ctx!.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx!.fillStyle = i < session ? AURORA : DIM;
        ctx!.fill();
      }

      // Labels
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.fillText("POMODORO TIMER -- 25 min work / 5 min break", 10, 14);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f1a 35%,#050c1a 100%)", borderBottom: `2px solid ${GOLD}`, padding: "56px 56px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: `linear-gradient(90deg,${AURORA},${QUANT})`, color: "#000", fontFamily: MONO, fontSize: "0.7em", fontWeight: "bold", letterSpacing: 3, padding: "5px 18px", borderRadius: 20, marginBottom: 22, textTransform: "uppercase" }}>
          Mom-Student Strategy -- AETHER Life Framework
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.75em", color: "#fff", lineHeight: 1.3, maxWidth: 780, margin: "0 auto 12px" }}>
          Synchronized Nap & Study Strategy
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.05em", color: GOLD, fontStyle: "italic", fontWeight: "normal", maxWidth: 700, margin: "0 auto 18px" }}>
          Early Morning Productivity + Strategic Nap Synchronization + Pomodoro Sessions
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, fontFamily: MONO, fontSize: "0.76em", color: "#607090", borderTop: `1px solid ${DIM}`, paddingTop: 16 }}>
          <div>Framework: <span style={{ color: AURORA }}>Circadian Alignment</span></div>
          <div>Method: <span style={{ color: AURORA }}>Pomodoro + Power Nap</span></div>
          <div>Audience: <span style={{ color: AURORA }}>Parent-Learners</span></div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px 72px" }}>

        <div style={sectionHead(GOLD)}>
          <div style={num(GOLD)}>Schedule Overview</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Daily Timeline -- Synchronized</h2>
        </div>
        <canvas ref={scheduleRef} width={880} height={100} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", marginBottom: 8 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0" }}>
          <div style={sectionHead(AURORA)}>
            <div style={num(AURORA)}>04:30 -- 05:00 AM</div>
            <h3 style={{ fontSize: "1.05em", color: "#eef0ff", margin: 0 }}>Wake-Up Preparation</h3>
          </div>
          <div style={sectionHead(AURORA)}>
            <div style={num(AURORA)}>05:00 -- 07:00 AM</div>
            <h3 style={{ fontSize: "1.05em", color: "#eef0ff", margin: 0 }}>Focused Study Block</h3>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "14px 0 28px" }}>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: GOLD, marginBottom: 12 }}>Wake-Up Routine</h4>
            {["Gentle wake-up routine", "Prepare study materials", "Quick hydration + light stretching", "Set up study space"].map(it => (
              <div key={it} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                <span style={{ color: GOLD, fontFamily: MONO }}>--</span>
                <span style={{ fontSize: "0.86em", color: "#8aa0c0" }}>{it}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: AURORA, marginBottom: 12 }}>Study Block Protocol</h4>
            {["Highest cognitive function period", "Uninterrupted programming study", "Use noise-canceling headphones", "Focus on complex coding concepts", "Break into 25-minute Pomodoro sessions"].map(it => (
              <div key={it} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                <span style={{ color: AURORA, fontFamily: MONO }}>--</span>
                <span style={{ fontSize: "0.86em", color: "#8aa0c0" }}>{it}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "center", margin: "24px 0" }}>
          <canvas ref={pomodoroRef} width={300} height={300} style={{ borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14" }} />
          <div>
            <div style={sectionHead("#38bdf8")}>
              <div style={num("#38bdf8")}>Nap Synchronization</div>
              <h3 style={{ fontSize: "1.1em", color: "#eef0ff", margin: 0 }}>When Child Naps -- You Nap</h3>
            </div>
            {[
              ["Ideal nap length", "20-30 minutes", AURORA],
              ["Method", "Sleep tracking app or gentle alarm", GOLD],
              ["Key insight", "Prevents deep sleep cycle disruption", "#38bdf8"],
              ["Timing", "Synchronize exactly with child's nap onset", "#9b5de5"],
            ].map(([k, v, col]) => (
              <div key={k as string} style={{ display: "flex", gap: 14, marginBottom: 12, ...card, padding: "10px 16px", borderLeft: `3px solid ${col as string}`, margin: "8px 0" }}>
                <span style={{ fontFamily: MONO, fontSize: "0.72em", color: col as string, minWidth: 120 }}>{k}</span>
                <span style={{ fontSize: "0.86em", color: "#8aa0c0" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={sectionHead(QUANT)}>
          <div style={num(QUANT)}>Post-Nap Workflow</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Immediate 15-Minute Reset</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "14px 0" }}>
          {[
            { title: "Hydrate First", items: ["Cold water immediately", "Electrolytes if available", "Avoid caffeine spike"], color: "#4ade80" },
            { title: "Light Movement", items: ["2-min stretching routine", "Brief walk if possible", "Sun exposure -- wake signal"], color: AURORA },
            { title: "Brain Reset", items: ["5-min meditation", "Brief journaling", "Review session goals"], color: QUANT },
          ].map(s => (
            <div key={s.title} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <h4 style={{ fontFamily: MONO, fontSize: "0.78em", color: s.color, marginBottom: 10 }}>{s.title}</h4>
              {s.items.map(it => (
                <div key={it} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: s.color, fontFamily: MONO }}>--</span>
                  <span style={{ fontSize: "0.84em", color: "#7a90b0" }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={sectionHead(GOLD)}>
          <div style={num(GOLD)}>Energy Management</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Nutrition for Brain Power</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "14px 0" }}>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: GOLD, marginBottom: 10 }}>Nutrition Protocol</h4>
            {["Protein-rich breakfast", "Complex carbohydrates (oats, sweet potato)", "Hydration -- water before coffee", "Avoid heavy meals before study"].map(it => (
              <div key={it} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                <span style={{ color: GOLD, fontFamily: MONO }}>--</span>
                <span style={{ fontSize: "0.84em", color: "#8aa0c0" }}>{it}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: "#9b5de5", marginBottom: 10 }}>Supplement Considerations</h4>
            <div style={{ fontFamily: MONO, fontSize: "0.75em", color: "#607090", marginBottom: 8 }}>Consult healthcare provider first</div>
            {["B-complex vitamins (cognitive support)", "Vitamin D (especially if indoor learner)", "Omega-3 supplements (brain health)", "Magnesium glycinate (sleep quality)"].map(it => (
              <div key={it} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                <span style={{ color: "#9b5de5", fontFamily: MONO }}>--</span>
                <span style={{ fontSize: "0.84em", color: "#8aa0c0" }}>{it}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={sectionHead("#4ade80")}>
          <div style={num("#4ade80")}>Sleep Hygiene</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Protecting Your Recovery</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "14px 0" }}>
          {[
            { label: "Environment", val: "Dark, cool room (65-68F ideal)", color: "#4ade80" },
            { label: "Screen cutoff", val: "No screens 1hr before bed", color: AURORA },
            { label: "Blue light", val: "Blue-light blocking glasses after 7pm", color: GOLD },
            { label: "Wind-down", val: "Consistent 30-min bedtime ritual", color: "#38bdf8" },
            { label: "Schedule", val: "Same sleep/wake time daily (±30 min)", color: "#9b5de5" },
            { label: "Consistency", val: "Even weekends -- circadian anchor", color: "#f72585" },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: "14px 16px", borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: MONO, fontSize: "0.7em", color: s.color, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: "0.85em", color: "#8aa0c0" }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={sectionHead("#38bdf8")}>
          <div style={num("#38bdf8")}>Backup Study Strategies</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>When the Plan Doesn't Work</h2>
        </div>
        <div style={{ ...card, margin: "14px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["Podcasts during chores", "Coding/tech podcasts while doing dishes, laundry", "#38bdf8"],
              ["Audio coding tutorials", "YouTube/Udemy audio-focused content on earbuds", AURORA],
              ["Mobile coding apps", "Mimo, Sololearn, Grasshopper -- 5-min micro-sessions", GOLD],
              ["Short online tutorials", "15-min focused YouTube segments -- bookmark in advance", "#9b5de5"],
            ].map(([title, desc, col]) => (
              <div key={title as string} style={{ borderLeft: `3px solid ${col as string}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: "0.78em", color: col as string, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: "0.84em", color: "#607090" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, margin: "24px 0", borderLeft: `4px solid ${AURORA}`, background: "rgba(0,255,178,0.05)" }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.88em", color: AURORA, marginBottom: 14 }}>Mental Health Check-In</h3>
          <div style={{ fontSize: "1.0em", color: "#c0d4f0", fontStyle: "italic", borderLeft: `3px solid ${GOLD}`, paddingLeft: 16, marginBottom: 14 }}>
            "This is a marathon, not a sprint."
          </div>
          {["Celebrate small victories -- each completed Pomodoro counts", "Be adaptable -- some days won't go as planned, and that's OK", "Your effort matters -- imperfect progress beats perfect inaction", "Emergency plan: don't stress if it fails -- reschedule, don't cancel"].map(it => (
            <div key={it} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <span style={{ color: AURORA, fontFamily: MONO }}>--</span>
              <span style={{ fontSize: "0.88em", color: "#8aa0c0" }}>{it}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
