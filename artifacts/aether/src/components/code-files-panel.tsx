import { useState } from "react";

/* ── tokenizer ───────────────────────────────────────────────────────── */
const KW = new Set([
  "def","class","import","from","return","if","elif","else","for","while",
  "in","not","and","or","True","False","None","lambda","yield","pass",
  "raise","try","except","with","as","global","assert","del","is","print",
]);
type TT = "kw"|"comment"|"str"|"num"|"fn"|"op"|"type"|"dec"|"plain";
type Tok = { t: TT; s: string };

function tok(line: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === "#") { out.push({ t:"comment", s:line.slice(i) }); break; }
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      let j = i+1; while (j < line.length && line[j] !== q) j++; j++;
      out.push({ t:"str", s:line.slice(i,j) }); i=j; continue;
    }
    if (line[i] === "@") {
      let j=i+1; while (j<line.length && /\w/.test(line[j])) j++;
      out.push({ t:"dec", s:line.slice(i,j) }); i=j; continue;
    }
    if (/\d/.test(line[i]) || (line[i]==="." && /\d/.test(line[i+1]??""))) {
      let j=i; while (j<line.length && /[\d._eExXa-fA-F+\-]/.test(line[j])) j++;
      out.push({ t:"num", s:line.slice(i,j) }); i=j; continue;
    }
    if (/[a-zA-Z_]/.test(line[i])) {
      let j=i; while (j<line.length && /\w/.test(line[j])) j++;
      const w=line.slice(i,j);
      const isFn=line[j]==="(";
      const isType=/^[A-Z]/.test(w) && !KW.has(w);
      out.push({ t: KW.has(w)?"kw": isFn?"fn": isType?"type":"plain", s:w });
      i=j; continue;
    }
    out.push({ t:"op", s:line[i] }); i++;
  }
  return out;
}

const CLR: Record<TT,string> = {
  kw:"#B090F0", comment:"#415060", str:"#C8A030", num:"#00FFB2",
  fn:"#E07820", op:"#607080", type:"#40D0C0", dec:"#F06090", plain:"#B8C4D4",
};

function CodeLine({ n, line }: { n: number; line: string }) {
  const tokens = tok(line);
  return (
    <div style={{ display:"flex", paddingRight:24, minHeight:18 }}>
      <span style={{ minWidth:34, textAlign:"right", paddingRight:14, color:"#283848", userSelect:"none", flexShrink:0, fontSize:10, fontFamily:"JetBrains Mono,'DM Mono',ui-monospace,monospace", lineHeight:"inherit" }}>
        {n}
      </span>
      <span style={{ whiteSpace:"pre", fontFamily:"JetBrains Mono,'DM Mono',ui-monospace,monospace", fontSize:11, lineHeight:1.72 }}>
        {tokens.map((tk,j) => (
          <span key={j} style={{ color:CLR[tk.t], fontStyle:tk.t==="comment"?"italic":"normal" }}>{tk.s}</span>
        ))}
      </span>
    </div>
  );
}

/* ── public types ────────────────────────────────────────────────────── */
export interface CodeFile {
  id: string;
  name: string;
  icon: string;
  content: string;
}

/* ── panel ───────────────────────────────────────────────────────────── */
export function CodeFilesPanel({
  heading = "Simulation Code Files",
  accentColor = "#00FFB2",
  files,
}: {
  heading?: string;
  accentColor?: string;
  files: CodeFile[];
}) {
  const [active, setActive] = useState(files[0]?.id ?? "");
  const current = files.find(f => f.id === active) ?? files[0];
  const lines = (current?.content ?? "").split("\n");

  return (
    <div style={{ marginTop:40, borderTop:"1px solid #1C2D40", paddingTop:32 }}>
      <div style={{ marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:accentColor, boxShadow:`0 0 10px ${accentColor}`, flexShrink:0 }} />
        <div style={{ fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:accentColor, fontFamily:"'Space Mono',monospace", fontStyle:"italic" }}>
          {heading}
        </div>
      </div>

      <div style={{ border:"1px solid #1C2D40", borderRadius:10, overflow:"hidden", background:"rgba(5,7,15,0.97)", boxShadow:"0 30px 70px -30px rgba(0,0,0,0.8)" }}>
        {/* tab bar */}
        <div style={{ display:"flex", alignItems:"center", background:"rgba(8,10,22,0.98)", borderBottom:"1px solid #1C2D40", flexWrap:"wrap" }}>
          {files.map(f => {
            const isActive = f.id === active;
            return (
              <button key={f.id} onClick={() => setActive(f.id)}
                style={{ padding:"8px 16px", fontSize:10.5, background:isActive?"rgba(5,7,15,0.98)":"none", border:"none", borderBottom:`2px solid ${isActive ? accentColor : "transparent"}`, color:isActive ? accentColor : "#4A5568", cursor:"pointer", fontFamily:"JetBrains Mono,'DM Mono',ui-monospace,monospace", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
                <span style={{ fontSize:11 }}>{f.icon}</span>
                {f.name}
              </button>
            );
          })}
          <div style={{ marginLeft:"auto", padding:"0 14px", fontSize:9.5, color:"#283848", fontFamily:"JetBrains Mono,ui-monospace,monospace", whiteSpace:"nowrap" }}>
            .qg -- AETHER sim
          </div>
        </div>

        {/* two-col */}
        <div style={{ display:"grid", gridTemplateColumns:"160px minmax(0,1fr)" }}>
          {/* sidebar */}
          <div style={{ background:"rgba(8,10,20,0.95)", borderRight:"1px solid #1C2D40", padding:"10px 0" }}>
            <div style={{ padding:"2px 12px 8px", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:"#283848", fontFamily:"JetBrains Mono,ui-monospace,monospace" }}>files</div>
            {files.map(f => {
              const isActive = f.id === active;
              return (
                <button key={f.id} onClick={() => setActive(f.id)}
                  style={{ width:"100%", textAlign:"left", padding:"5px 12px 5px 10px", display:"flex", alignItems:"center", gap:7, background:isActive?`${accentColor}14`:"none", border:"none", cursor:"pointer", borderLeft:`2px solid ${isActive ? accentColor : "transparent"}` }}>
                  <span style={{ fontSize:10, color: isActive ? accentColor : "#283848", fontFamily:"JetBrains Mono,ui-monospace,monospace", minWidth:20 }}>{f.icon}</span>
                  <span style={{ fontSize:10, color:isActive ? accentColor : "#4A5568", fontFamily:"JetBrains Mono,ui-monospace,monospace", lineHeight:1.3 }}>{f.name}</span>
                </button>
              );
            })}
          </div>

          {/* editor */}
          <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:420, padding:"12px 0", background:"rgba(5,7,15,0.98)" }}>
            {lines.map((line, idx) => (
              <CodeLine key={idx} n={idx+1} line={line} />
            ))}
          </div>
        </div>

        {/* status bar */}
        <div style={{ display:"flex", gap:20, padding:"3px 14px", background:`${accentColor}14`, borderTop:"1px solid #1C2D40", fontSize:9, color:"#283848", fontFamily:"JetBrains Mono,ui-monospace,monospace" }}>
          <span style={{ color:accentColor }}>AETHER-SIM</span>
          <span>{current?.name}</span>
          <span>Ln {lines.length}</span>
          <span style={{ marginLeft:"auto" }}>UTF-8 · LF · .qg</span>
        </div>
      </div>
    </div>
  );
}
