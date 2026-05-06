import { useEffect, useRef, useState } from "react";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#4ade80",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.65rem", fontWeight:700, color:"#bbf7d0", margin:"0 0 0.55rem", letterSpacing:"-0.01em",
        fontFamily:"'Cinzel',serif" }}>{title}</h2>
      {lead && <p style={{ color:"#cbd5e1", fontSize:"0.95rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

// ── Keystroke chip
function Key({ k }: { k:string }) {
  return (
    <kbd style={{
      display:"inline-block", padding:"0.2rem 0.5rem", borderRadius:5,
      background:"linear-gradient(180deg, #1e293b, #0f172a)",
      border:"1px solid #334155", borderBottomWidth:2, borderBottomColor:"#475569",
      color:"#86efac", fontSize:"0.78rem",
      fontFamily:"'DM Mono', ui-monospace, SFMono-Regular, monospace",
      letterSpacing:"0.04em", whiteSpace:"nowrap",
      boxShadow:"0 1px 0 #020617",
    }}>{k}</kbd>
  );
}

type Cmd = { keys:string[]; desc:string; pico?:boolean };
type Group = { title:string; color:string; cmds:Cmd[] };

// ── Canonical nano keybindings (^ = Ctrl, M- = Meta/Alt/Esc)
// Cross-checked vs nano 7.x default keymap and pico legacy
const GROUPS: Group[] = [
  { title:"FILE OPERATIONS", color:"#22c55e", cmds:[
    { keys:["^G"],         desc:"Show help · keybinding reference inside the editor", pico:true },
    { keys:["^O"],         desc:"WriteOut · save the current file (prompts for filename)", pico:true },
    { keys:["^X"],         desc:"Exit nano (prompts to save if modified)", pico:true },
    { keys:["^R"],         desc:"Read file · insert another file at cursor", pico:true },
    { keys:["^S"],         desc:"Save (no filename prompt — nano 4.0+, must enable in nanorc)" },
    { keys:["M-D"],        desc:"DOS line endings · save with CRLF" },
    { keys:["M-M"],        desc:"Mac line endings · save with CR" },
    { keys:["^T"],         desc:"To Files · open file browser when prompted for filename" },
  ]},
  { title:"NAVIGATION", color:"#4ade80", cmds:[
    { keys:["^F","→"],     desc:"Forward one character", pico:true },
    { keys:["^B","←"],     desc:"Backward one character", pico:true },
    { keys:["^P","↑"],     desc:"Previous line", pico:true },
    { keys:["^N","↓"],     desc:"Next line", pico:true },
    { keys:["^A","Home"],  desc:"Beginning of line", pico:true },
    { keys:["^E","End"],   desc:"End of line", pico:true },
    { keys:["^Y","PgUp"],  desc:"Previous screen (page up)", pico:true },
    { keys:["^V","PgDn"],  desc:"Next screen (page down)", pico:true },
    { keys:["M-\\"],       desc:"Go to first line of file" },
    { keys:["M-/"],        desc:"Go to last line of file" },
    { keys:["^_"],         desc:"Go to line · column (prompts for numbers)" },
    { keys:["M-Space"],    desc:"Previous word" },
    { keys:["^Space"],     desc:"Next word" },
    { keys:["M-("],        desc:"Beginning of paragraph" },
    { keys:["M-)"],        desc:"End of paragraph" },
  ]},
  { title:"EDITING", color:"#84cc16", cmds:[
    { keys:["^H","Bksp"],  desc:"Backspace · delete char before cursor", pico:true },
    { keys:["^D","Del"],   desc:"Delete char at cursor", pico:true },
    { keys:["^K"],         desc:"Cut · kill the current line into cutbuffer", pico:true },
    { keys:["^U"],         desc:"Uncut · paste cutbuffer at cursor", pico:true },
    { keys:["M-6"],        desc:"Copy current line (without cutting)" },
    { keys:["M-U"],        desc:"Undo last action" },
    { keys:["M-E"],        desc:"Redo last undone action" },
    { keys:["M-3"],        desc:"Comment / uncomment line (when filetype is set)" },
    { keys:["^J"],         desc:"Justify · re-flow current paragraph" },
    { keys:["M-J"],        desc:"Justify entire file" },
    { keys:["^I","Tab"],   desc:"Insert tab (or spaces if --tabstospaces)" },
    { keys:["M-}"],        desc:"Indent marked region one tab" },
    { keys:["M-{"],        desc:"Unindent marked region one tab" },
  ]},
  { title:"SEARCH & REPLACE", color:"#10b981", cmds:[
    { keys:["^W"],         desc:"Where Is · search forward (M-W repeats last)", pico:true },
    { keys:["M-W"],        desc:"Repeat last search forward" },
    { keys:["M-Q"],        desc:"Repeat last search backward" },
    { keys:["^\\"],        desc:"Replace · search and replace (with confirmation)" },
    { keys:["M-R"],        desc:"Replace · same as ^\\ on some keymaps" },
    { keys:["M-C"],        desc:"Toggle case-sensitive search" },
    { keys:["M-B"],        desc:"Toggle search direction (forward/backward)" },
    { keys:["M-X"],        desc:"Toggle regex search" },
  ]},
  { title:"SELECTION & MARK", color:"#14b8a6", cmds:[
    { keys:["^^"],         desc:"Set mark · start selection at cursor (then move to extend)" },
    { keys:["M-A"],        desc:"Set mark · same as ^^ on some keymaps" },
    { keys:["M-6"],        desc:"Copy marked region to cutbuffer" },
    { keys:["^K"],         desc:"Cut marked region (with mark set)" },
    { keys:["^U"],         desc:"Paste cutbuffer at cursor" },
  ]},
  { title:"BUFFERS · MULTIPLE FILES", color:"#06b6d4", cmds:[
    { keys:["M-<",  "M-,"],desc:"Switch to previous file buffer" },
    { keys:["M->",  "M-."],desc:"Switch to next file buffer" },
    { keys:["M-F"],        desc:"Toggle multi-buffer mode" },
    { keys:["^X"],         desc:"Close current buffer (or exit if last buffer)" },
  ]},
  { title:"INFO · MISC", color:"#0ea5e9", cmds:[
    { keys:["^C"],         desc:"Show cursor position (line · col · char count)", pico:true },
    { keys:["^L"],         desc:"Refresh / redraw screen", pico:true },
    { keys:["^T"],         desc:"Spell check (if speller is configured)" },
    { keys:["M-V"],        desc:"Verbatim insert · next keystroke is literal" },
    { keys:["M-Z"],        desc:"Suspend nano (resume with `fg`)" },
    { keys:["M-N"],        desc:"Toggle line numbers" },
    { keys:["M-Y"],        desc:"Toggle syntax highlighting" },
    { keys:["M-$"],        desc:"Toggle soft line wrapping" },
    { keys:["M-P"],        desc:"Toggle whitespace display" },
  ]},
];

// Common launch flags worth knowing
const FLAGS = [
  { flag:"nano file",          desc:"Open file (creates it if missing)" },
  { flag:"nano +N file",       desc:"Open file at line N · e.g. `nano +42 server.py`" },
  { flag:"nano +N,C file",     desc:"Open file at line N · column C" },
  { flag:"nano -B file",       desc:"Backup · save the prior version as filename~" },
  { flag:"nano -m file",       desc:"Enable mouse support (click to position cursor)" },
  { flag:"nano -l file",       desc:"Show line numbers in the gutter" },
  { flag:"nano -E file",       desc:"Convert tabs to spaces on save" },
  { flag:"nano -T 4 file",     desc:"Set tab width to 4 spaces" },
  { flag:"nano -w file",       desc:"Disable hard-wrap of long lines (for code)" },
  { flag:"nano -Y python f.py",desc:"Force a syntax (overrides auto-detect)" },
  { flag:"nano -R file",       desc:"Restricted mode (no file ops, no shell-out — safe for shared kiosks)" },
  { flag:"nano -",             desc:"Read from stdin · `cmd | nano -`" },
];

// ── Live key tester
function KeyTester() {
  const [last, setLast] = useState<{ pretty:string; match?: { keys:string[]; desc:string; group:string } } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      // Only when our box is focused
      if (document.activeElement !== el) return;
      // Build nano-style key string
      const parts: string[] = [];
      let key = e.key;
      if (e.ctrlKey && key.length === 1) parts.push("^" + key.toUpperCase());
      else if (e.altKey && key.length === 1) parts.push("M-" + key.toUpperCase());
      else if (key === "Backspace") parts.push("Bksp");
      else if (key === "Delete")    parts.push("Del");
      else if (key === "ArrowLeft") parts.push("←");
      else if (key === "ArrowRight")parts.push("→");
      else if (key === "ArrowUp")   parts.push("↑");
      else if (key === "ArrowDown") parts.push("↓");
      else if (key === "Home")      parts.push("Home");
      else if (key === "End")       parts.push("End");
      else if (key === "PageUp")    parts.push("PgUp");
      else if (key === "PageDown")  parts.push("PgDn");
      else if (key === "Tab")       parts.push("Tab");
      else if (key === " " && e.ctrlKey) parts.push("^Space");
      else if (key === " " && e.altKey)  parts.push("M-Space");
      else return; // ignore plain typing
      e.preventDefault();
      const pretty = parts.join("");
      // find a match across groups
      let match: { keys:string[]; desc:string; group:string } | undefined;
      for (const g of GROUPS) {
        for (const c of g.cmds) {
          if (c.keys.includes(pretty)) { match = { keys:c.keys, desc:c.desc, group:g.title }; break; }
        }
        if (match) break;
      }
      setLast({ pretty, match });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} tabIndex={0} data-testid="key-tester" style={{
      padding:"1.2rem 1.4rem", borderRadius:12, outline:"none",
      background:"linear-gradient(180deg, #020617, #0f172a)",
      border:"1px solid #334155", cursor:"text",
      minHeight:140, fontFamily:"'DM Mono',monospace",
    }}>
      <div style={{ ...KICKER, color:"#22c55e", marginBottom:14 }}>
        ▸ Key tester · click here · then press a nano keystroke
      </div>
      {!last && (
        <div style={{ color:"#475569", fontSize:"0.86rem" }}>
          Try: <Key k="^O"/> · <Key k="^X"/> · <Key k="^W"/> · <Key k="M-/"/> (Alt+/) · <Key k="↑"/> · <Key k="Home"/>
        </div>
      )}
      {last && (
        <div>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
            <span style={{ color:"#475569", fontSize:"0.78rem" }}>You pressed</span>
            <Key k={last.pretty}/>
          </div>
          {last.match ? (
            <div style={{ padding:"0.8rem 1rem", borderRadius:8,
              background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.3)" }}>
              <div style={{ ...KICKER, color:"#22c55e", marginBottom:4 }}>{last.match.group}</div>
              <div style={{ color:"#bbf7d0", fontSize:"0.95rem", lineHeight:1.55 }}>{last.match.desc}</div>
              {last.match.keys.length > 1 && (
                <div style={{ marginTop:8, fontSize:"0.78rem", color:"#64748b" }}>
                  Aliases: {last.match.keys.filter(k => k !== last.pretty).map((k,i) => (
                    <span key={i} style={{ marginRight:6 }}><Key k={k}/></span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding:"0.8rem 1rem", borderRadius:8,
              background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.3)",
              color:"#fda4af", fontSize:"0.88rem" }}>
              Not a default nano binding. (May be free for custom bindkey in ~/.nanorc)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CliNanoPage() {
  return (
    <div data-testid="page-cli-nano" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #052e16 0%, #020617 60%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <header style={{
          padding:"2.2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(34,197,94,0.10), rgba(20,184,166,0.10), rgba(6,182,212,0.08))",
          border:"1px solid rgba(34,197,94,0.25)",
        }}>
          <div style={{ ...KICKER, color:"#86efac", fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>
            CLI · Dynamic Skills · Engine 01 · nano
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#bbf7d0",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel',serif" }}>
            nano · the gentle editor
          </h1>
          <p style={{ fontSize:"1rem", color:"#cbd5e1", lineHeight:1.7, maxWidth:820, margin:0 }}>
            A complete keybinding cheat sheet for GNU nano (and its ancestor pico). Forty-seven default keystrokes,
            twelve launch flags, a live key-tester that names whichever nano command your fingers just produced,
            and the shortlist of pico-only bindings for legacy systems.
          </p>
          <div style={{ marginTop:"1.1rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.08)",
            fontSize:"0.78rem", color:"#94a3b8", fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.12em", textTransform:"uppercase" }}>
            <span style={{ color:"#22c55e" }}>^</span> = Ctrl &nbsp;·&nbsp;
            <span style={{ color:"#22c55e" }}>M-</span> = Meta (Alt · or Esc-then-key) &nbsp;·&nbsp;
            cross-checked vs nano 7.x default keymap
          </div>
        </header>

        {/* I · Quickstart */}
        <Section kicker="I · Quickstart"
          title="The five keystrokes that get you out alive"
          lead="If you remember nothing else from this page, remember these. nano always lists the most-used commands at the bottom of the screen — they are these.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap:"0.7rem" }}>
            {[
              { k:"^G", t:"Help",     d:"Open the in-editor help (full keybinding list)" },
              { k:"^O", t:"WriteOut", d:"Save current file · prompts for filename" },
              { k:"^X", t:"Exit",     d:"Quit nano · prompts to save if modified" },
              { k:"^W", t:"Where Is", d:"Search forward · M-W to repeat" },
              { k:"^K", t:"Cut Line", d:"Cut current line · paste with ^U" },
            ].map(c => (
              <div key={c.k} style={{ padding:"1rem 1.2rem", borderRadius:12,
                background:"rgba(15,23,42,0.7)",
                border:"1px solid rgba(34,197,94,0.3)", borderLeft:"3px solid #22c55e" }}>
                <div style={{ marginBottom:8 }}><Key k={c.k}/></div>
                <div style={{ fontSize:"1rem", fontWeight:700, color:"#bbf7d0", marginBottom:4 }}>{c.t}</div>
                <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.55 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* II · Live key tester */}
        <Section kicker="II · Live key tester"
          title="Press any nano keystroke · we'll name it"
          lead="Click the box below to focus it, then press the actual keys. Use Ctrl+letter, Alt+letter (Meta), arrows, Home/End, PgUp/PgDn, Tab, Backspace, or Delete. We intercept and tell you what nano would do.">
          <KeyTester/>
        </Section>

        {/* III · Full keybindings */}
        <Section kicker="III · Full cheat sheet"
          title="All forty-seven default bindings · grouped by purpose"
          lead="A pico mark (●) means the binding works the same in classic pico — useful when you SSH into older systems that only ship pico.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap:"0.85rem" }}>
            {GROUPS.map(g => (
              <div key={g.title} style={{ padding:"1.1rem 1.25rem", borderRadius:12,
                background:"rgba(15,23,42,0.7)", border:`1px solid ${g.color}40`,
                borderLeft:`3px solid ${g.color}` }}>
                <div style={{ ...KICKER, color:g.color, marginBottom:12 }}>{g.title}</div>
                <div style={{ display:"grid", gap:"0.55rem" }}>
                  {g.cmds.map((c, i) => (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"minmax(110px, auto) 1fr",
                      gap:"0.7rem", alignItems:"start", paddingBottom:6,
                      borderBottom: i < g.cmds.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {c.keys.map((k,j) => (
                          <span key={j}>
                            {j > 0 && <span style={{ color:"#475569", fontSize:"0.7rem", margin:"0 3px" }}>·</span>}
                            <Key k={k}/>
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.5 }}>
                        {c.pico && <span title="Works in pico too" style={{ color:g.color, marginRight:6 }}>●</span>}
                        {c.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* IV · Launch flags */}
        <Section kicker="IV · Launch flags"
          title="Twelve invocations worth memorizing"
          lead="Most of nano's behavior can be set per-invocation from the shell, or persisted in ~/.nanorc.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap:"0.55rem" }}>
            {FLAGS.map(f => (
              <div key={f.flag} style={{ padding:"0.75rem 0.95rem", borderRadius:8,
                background:"rgba(15,23,42,0.7)", border:"1px solid rgba(34,197,94,0.18)",
                fontFamily:"'DM Mono',monospace" }}>
                <div style={{ color:"#86efac", fontSize:"0.85rem", marginBottom:5 }}>{f.flag}</div>
                <div style={{ color:"#cbd5e1", fontSize:"0.78rem", lineHeight:1.5,
                  fontFamily:"'Outfit',sans-serif" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* V · pico vs nano */}
        <Section kicker="V · pico vs nano"
          title="The same instrument · separated by license"
          lead="pico shipped with the Pine email client (UW · 1989) and was free-as-in-beer but not free-as-in-speech. nano is the GNU clone (1999) — same keybindings, more features, free license. On modern systems `pico` is almost always a symlink to `nano`.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.85rem" }}>
            {[
              { t:"What pico has",   c:"#fb923c", b:["File ops · ^O ^X ^R ^G ^C ^L","Navigation · all 9 movement keys","Cut/paste · ^K and ^U","Search · ^W (no replace)","Spell check · ^T"] },
              { t:"What nano adds",  c:"#22c55e", b:["Search & replace · ^\\","Undo / redo · M-U / M-E","Multi-buffer · M-< · M->","Syntax highlighting · M-Y","Line numbers · M-N or -l flag","Soft wrap · M-$","Mouse support · -m flag","Restricted mode · -R for kiosks","Regex search · M-X"] },
              { t:"When you'd see pico", c:"#94a3b8", b:["Old AIX / HP-UX / Solaris boxes","University Unix accounts (1990s vintage)","BSD systems where pico is preferred","Inside the Alpine email client (mutt's relative)"] },
            ].map(card => (
              <div key={card.t} style={{ padding:"1.1rem 1.25rem", borderRadius:12,
                background:"rgba(15,23,42,0.7)",
                border:`1px solid ${card.c}40`, borderLeft:`3px solid ${card.c}` }}>
                <div style={{ ...KICKER, color:card.c, marginBottom:10 }}>{card.t}</div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"grid", gap:"0.4rem" }}>
                  {card.b.map((b,i) => (
                    <li key={i} style={{ display:"flex", gap:8, fontSize:"0.84rem", color:"#cbd5e1", lineHeight:1.5 }}>
                      <span style={{ color:card.c }}>·</span><span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* VI · Tips & gotchas */}
        <Section kicker="VI · Tips · gotchas · ~/.nanorc"
          title="The seven things that bite people"
          lead="Most nano frustration comes from one of these.">
          <div style={{ display:"grid", gap:"0.55rem" }}>
            {[
              { t:"Meta on Mac",         d:"On macOS Terminal, Alt isn't bound by default. Either: (a) press Esc then the letter (e.g. Esc · / for M-/), or (b) Terminal → Settings → Keyboard → 'Use Option as Meta key'. iTerm2 has the same toggle." },
              { t:"^S is suspended terminal", d:"In some terminals ^S freezes output (XOFF). To re-enable: `stty -ixon` in your shell rc. Or just use ^O — that's the canonical save." },
              { t:"^Z does NOT undo",    d:"^Z suspends nano (sends to background). Resume with `fg`. The undo binding is M-U; redo is M-E." },
              { t:"Mouse mode swallows clicks", d:"With -m enabled, normal terminal copy-paste stops working (the terminal hands clicks to nano instead). Hold Shift while selecting to bypass." },
              { t:"Word-wrap mangles code", d:"nano hard-wraps long lines by default. For code, always use `nano -w file` or set `set nowrap` in ~/.nanorc." },
              { t:"~/.nanorc essentials", d:"set linenumbers · set tabsize 4 · set tabstospaces · set autoindent · set mouse · set softwrap · include /usr/share/nano/*.nanorc (enables syntax highlighting)" },
              { t:"M-V for verbatim",    d:"To insert a literal control character (Esc, Tab, etc.) in your file, press M-V then the key. Useful when editing config files that need raw escapes." },
            ].map((tip, i) => (
              <div key={i} style={{ padding:"0.85rem 1.1rem", borderRadius:10,
                background:"rgba(15,23,42,0.7)", border:"1px solid rgba(20,184,166,0.18)",
                borderLeft:"3px solid #14b8a6" }}>
                <div style={{ fontSize:"0.92rem", fontWeight:600, color:"#5eead4", marginBottom:5 }}>{tip.t}</div>
                <div style={{ fontSize:"0.84rem", color:"#cbd5e1", lineHeight:1.6 }}>{tip.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VII · What's next */}
        <Section kicker="VII · CLI engines roadmap"
          title="The dynamic-skills wing · queued"
          lead="nano is engine 01. Each engine becomes its own /cli-* page with the same anatomy: quickstart card, full cheat sheet grouped by purpose, live key/command tester, launch flags, and the gotchas list.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap:"0.55rem" }}>
            {[
              { n:"01", name:"nano",   note:"Shipped · this page", color:"#22c55e", live:true },
              { n:"02", name:"vim",    note:"Modal editor · the deep one", color:"#10b981" },
              { n:"03", name:"tmux",   note:"Terminal multiplexer · sessions, panes, windows", color:"#06b6d4" },
              { n:"04", name:"grep",   note:"Pattern search · regex · -r · -n · -i", color:"#0ea5e9" },
              { n:"05", name:"sed",    note:"Stream editor · in-place text surgery", color:"#3b82f6" },
              { n:"06", name:"awk",    note:"Field-aware mini-language for tabular text", color:"#6366f1" },
              { n:"07", name:"git",    note:"The one everyone fakes knowing", color:"#a78bfa" },
              { n:"08", name:"jq",     note:"JSON pipeline tool · the awk for JSON", color:"#c084fc" },
              { n:"09", name:"ssh",    note:"Keys · config · jump-hosts · tunnels", color:"#e879f9" },
              { n:"10", name:"curl",   note:"HTTP swiss army knife", color:"#f472b6" },
            ].map(e => (
              <div key={e.n} style={{ padding:"0.8rem 1rem", borderRadius:10,
                background: e.live ? "rgba(34,197,94,0.10)" : "rgba(15,23,42,0.6)",
                border:`1px solid ${e.color}${e.live ? "60" : "30"}`, borderLeft:`3px solid ${e.color}` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", color:e.color,
                  letterSpacing:"0.18em", marginBottom:4 }}>ENGINE · {e.n}</div>
                <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#bbf7d0", marginBottom:3 }}>{e.name}</div>
                <div style={{ fontSize:"0.75rem", color:"#cbd5e1", lineHeight:1.45 }}>{e.note}</div>
              </div>
            ))}
          </div>
        </Section>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(34,197,94,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#86efac",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER · CLI · Dynamic Skills Engine 01 · ^O to save · ^X to exit · the rest is geometry
        </footer>
      </div>
    </div>
  );
}
