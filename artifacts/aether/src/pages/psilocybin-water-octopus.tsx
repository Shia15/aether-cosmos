import React, { useEffect, useRef } from "react";

const V = {
  bg:     "#04060E",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  vio:    "#9966FF",
  amb:    "#FF9933",
  rose:   "#FF6699",
  plasma: "#FF4477",
  green:  "#44CC77",
  cyan:   "#22DDFF",
  teal:   "#00CCBB",
  copper: "#B87333",
  cobalt: "#2244CC",
  ice:    "#AADDFF",
  dim:    "#2A3850",
  ink:    "#B8CCE8",
  mono:   "'Space Mono',monospace" as const,
  serif:  "'Crimson Pro',serif"    as const,
  disp:   "'Cinzel',serif"         as const,
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Psilocybin Filter Theory + Carbon Egg (C70 + Indole)
   ───────────────────────────────────────────────────────────────────────── */
function PsilocybinFilterCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 360, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const CYCLE = 1100;
    let frame = 0, raf = 0;

    /* filter membrane */
    const MEM_Y = CH * 0.50;
    /* DMN nodes (above filter = suppression layer) */
    const DMN = [
      { x:CW*0.16, y:CH*0.28 }, { x:CW*0.28, y:CH*0.18 }, { x:CW*0.42, y:CH*0.22 },
      { x:CW*0.56, y:CH*0.18 }, { x:CW*0.68, y:CH*0.28 }, { x:CW*0.60, y:CH*0.38 },
      { x:CW*0.30, y:CH*0.38 },
    ];

    /* signal particles below filter (raw data) */
    type SP = { x:number; y:number; vx:number; vy:number; col:string; alpha:number; passed:boolean };
    const pool: SP[] = [];
    let spawnTick = 0;

    /* psilocybin molecules incoming */
    type PM = { x:number; y:number; vy:number; alpha:number };
    const pMols: PM[] = [];

    /* draw indole ring skeleton at top-right */
    const drawIndole = (cx:number, cy:number, scale:number, col:string, alpha:number) => {
      ctx.strokeStyle = col + Math.round(alpha * 200).toString(16).padStart(2,"0");
      ctx.lineWidth = 1.2 * scale;
      /* benzene ring (6-membered) */
      const hex: [number,number][] = [];
      for (let k = 0; k < 6; k++) {
        const a = (k/6)*Math.PI*2 - Math.PI/2;
        hex.push([cx + Math.cos(a)*16*scale, cy + Math.sin(a)*16*scale]);
      }
      ctx.beginPath();
      hex.forEach(([hx,hy],i) => i===0 ? ctx.moveTo(hx,hy) : ctx.lineTo(hx,hy));
      ctx.closePath(); ctx.stroke();
      /* alternate bond markers */
      for (let k = 0; k < 3; k++) {
        const [ax,ay] = hex[k*2], [bx,by] = hex[k*2+1];
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
      }
      /* pyrrole ring (5-membered, fused) */
      const pyr: [number,number][] = [];
      const fuseA = hex[0], fuseB = hex[1];
      pyr.push(fuseA, fuseB);
      for (let k = 0; k < 3; k++) {
        const a = (-0.18 + (k/2)*0.7)*Math.PI - Math.PI*0.28;
        pyr.push([fuseA[0] + Math.cos(a)*14*scale, fuseA[1] + Math.sin(a)*14*scale]);
      }
      ctx.beginPath(); ctx.moveTo(pyr[0][0],pyr[0][1]);
      pyr.forEach(([px,py]) => ctx.lineTo(px,py));
      ctx.closePath(); ctx.stroke();
      /* N label */
      ctx.fillStyle = col + Math.round(alpha * 200).toString(16).padStart(2,"0");
      ctx.font = `${7*scale}px ${V.mono}`;
      ctx.fillText("N", pyr[3][0]-4, pyr[3][1]+4);
      /* ethylamine tail */
      const tail0 = hex[2];
      ctx.beginPath();
      ctx.moveTo(tail0[0], tail0[1]);
      ctx.lineTo(tail0[0]+12*scale, tail0[1]+8*scale);
      ctx.lineTo(tail0[0]+12*scale, tail0[1]+20*scale);
      ctx.stroke();
      ctx.font = `${5.5*scale}px ${V.mono}`;
      ctx.fillText("N(CH₃)₂", tail0[0]+14*scale, tail0[1]+24*scale);
      /* OPO₃ tail */
      const tail1 = hex[4];
      ctx.beginPath();
      ctx.moveTo(tail1[0], tail1[1]);
      ctx.lineTo(tail1[0]-4*scale, tail1[1]-14*scale);
      ctx.stroke();
      ctx.fillText("OPO₃", tail1[0]-18*scale, tail1[1]-17*scale);
    };

    /* draw C70 egg silhouette */
    const drawEgg = (cx:number, cy:number, a:number, b:number, col:string, alpha:number) => {
      /* prolate ellipse */
      ctx.strokeStyle = col + Math.round(alpha * 80).toString(16).padStart(2,"0");
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI*2); ctx.stroke();
      /* surface bonds (simplified hex/pent pattern) */
      for (let lat = -75; lat <= 75; lat += 25) {
        const latr = lat * Math.PI/180;
        const ry   = b * Math.sin(latr);
        const rx   = a * Math.cos(latr);
        for (let lng = 0; lng < 360; lng += 30) {
          const lngr = lng * Math.PI/180;
          const nx = cx + rx * Math.cos(lngr);
          const ny = cy + ry * Math.cos(latr);
          const nx2 = cx + rx * Math.cos(lngr + 30*Math.PI/180);
          const ny2 = cy + ry * Math.cos(latr);
          ctx.strokeStyle = col + Math.round(alpha * 50).toString(16).padStart(2,"0");
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx2, ny2); ctx.stroke();
        }
      }
      ctx.fillStyle = col + Math.round(alpha * 20).toString(16).padStart(2,"0");
      ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI*2); ctx.fill();
    };

    const draw = () => {
      frame = (frame + 1) % CYCLE;

      /* psilocybin filter phase */
      const filterPhase =
        frame < 300 ? 0 :
        frame < 500 ? (frame - 300) / 200 :
        frame < 750 ? 1 :
        Math.max(0, 1 - (frame - 750) / 260);
      const filterOpen = filterPhase;           /* 0=closed, 1=open */
      const entropy    = filterOpen * 0.85;

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* C70 egg background */
      drawEgg(CW * 0.85, CH * 0.50, 52, 68, V.vio, 0.6);
      ctx.fillStyle = V.vio + "18"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("C₇₀ CARBON EGG", CW*0.85 - 38, CH*0.50 + 80);

      /* indole schematic */
      drawIndole(CW * 0.14, CH * 0.82, 0.85, V.gold, 0.75);
      ctx.fillStyle = V.gold + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("PSILOCYBIN", CW*0.14 - 26, CH*0.82 + 50);
      ctx.fillText("INDOLE RING", CW*0.14 - 26, CH*0.82 + 58);

      /* ── FILTER MEMBRANE ── */
      const openW = filterOpen * CW * 0.38 + 8;
      const memCol = filterOpen > 0.5 ? V.aurora : V.blue;
      /* left segment */
      ctx.fillStyle = memCol + "55";
      ctx.fillRect(0, MEM_Y - 5, CW/2 - openW/2, 10);
      /* right segment */
      ctx.fillStyle = memCol + "55";
      ctx.fillRect(CW/2 + openW/2, MEM_Y - 5, CW/2 - openW/2, 10);
      /* opening glow */
      if (filterOpen > 0.05) {
        const g = ctx.createRadialGradient(CW/2, MEM_Y, 0, CW/2, MEM_Y, openW);
        g.addColorStop(0, V.aurora + "44"); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(CW/2-openW, MEM_Y-20, openW*2, 40);
      }
      /* FILTER label */
      ctx.fillStyle = memCol + "99"; ctx.font = `6.5px ${V.mono}`;
      const flbl = `DMN REDUCING VALVE  ${filterOpen < 0.1 ? "CLOSED" : filterOpen > 0.8 ? "OPEN" : "WIDENING"}`;
      ctx.fillText(flbl, 10, MEM_Y - 10);

      /* ── DMN NODES (above filter) ── */
      DMN.forEach((n, i) => {
        const act = filterOpen > 0 ? Math.max(0.2, 1 - filterOpen * 0.85 + Math.sin(frame*0.03+i)*0.1) : 0.7;
        const col = filterOpen > 0.6 ? V.plasma : V.blue;
        ctx.strokeStyle = col + Math.round(act * 200).toString(16).padStart(2,"0");
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = col + Math.round(act * 60).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI*2); ctx.fill();
        /* inhibition arcs */
        if (act > 0.4) {
          ctx.strokeStyle = col + Math.round(act * 100).toString(16).padStart(2,"0");
          ctx.lineWidth = 0.5;
          for (let k = 0; k < 3; k++) {
            const aa = (frame * 0.01 + k/3 * Math.PI*2);
            const r = 14 + k*5;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, aa, aa + Math.PI * 0.7);
            ctx.stroke();
          }
        }
      });

      /* DMN connections */
      for (let i = 0; i < DMN.length - 1; i++) {
        const a = DMN[i], b = DMN[(i+1) % DMN.length];
        ctx.strokeStyle = `rgba(68,136,255,0.12)`;
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      /* ── SIGNAL PARTICLES (below filter = raw sensory data) ── */
      if (++spawnTick >= 2 && pool.length < 120) {
        spawnTick = 0;
        const cols = [V.rose, V.vio, V.gold, V.cyan, V.green];
        pool.push({
          x: Math.random() * CW, y: CH * 0.95 + Math.random() * 20,
          vx: (Math.random()-0.5)*0.8, vy: -(0.8 + Math.random()*1.2),
          col: cols[Math.floor(Math.random()*cols.length)],
          alpha: 0.5+Math.random()*0.5, passed: false,
        });
      }

      for (let pi = pool.length-1; pi >= 0; pi--) {
        const p = pool[pi];
        p.x += p.vx + (Math.random()-0.5)*entropy*1.5;
        p.y += p.vy; p.alpha -= 0.007;

        /* check if hits filter membrane */
        if (!p.passed && Math.abs(p.y - MEM_Y) < 6) {
          const atOpening = Math.abs(p.x - CW/2) < openW/2;
          if (!atOpening) {
            /* scatter off membrane */
            p.vy = Math.abs(p.vy) * 0.6;
            p.vx += (Math.random()-0.5)*2;
            p.alpha -= 0.15;
          } else {
            p.passed = true;
          }
        }

        if (p.alpha <= 0 || p.y < 0) { pool.splice(pi, 1); continue; }
        const aHex = Math.round(p.alpha * 255).toString(16).padStart(2,"0");
        const r = p.passed ? 2.5 : 1.8;
        ctx.fillStyle = (p.passed ? V.aurora : p.col) + aHex;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
      }

      /* psilocybin molecules arriving */
      if (frame > 260 && frame < 700 && frame % 14 === 0 && pMols.length < 20) {
        pMols.push({ x: CW*0.3+Math.random()*CW*0.4, y: CH, vy: -(0.5+Math.random()*0.4), alpha:0.8 });
      }
      for (let i = pMols.length-1; i >= 0; i--) {
        const m = pMols[i];
        m.y += m.vy; m.alpha -= 0.005;
        if (m.alpha <= 0 || m.y < MEM_Y) { pMols.splice(i, 1); continue; }
        ctx.strokeStyle = V.gold + Math.round(m.alpha * 200).toString(16).padStart(2,"0");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 5, 0, Math.PI*2);
        ctx.moveTo(m.x - 3, m.y - 7); ctx.lineTo(m.x + 3, m.y - 7);
        ctx.moveTo(m.x, m.y - 7); ctx.lineTo(m.x, m.y - 11);
        ctx.stroke();
      }

      /* entropy bar */
      const eBar = entropy;
      ctx.fillStyle = V.dim + "44"; ctx.fillRect(CW-130, 14, 100, 5);
      ctx.fillStyle = eBar > 0.6 ? V.plasma : eBar > 0.3 ? V.amb : V.blue;
      ctx.fillRect(CW-130, 14, 100*eBar, 5);
      ctx.fillStyle = V.ink + "88"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("ENTROPY", CW-130, 11);

      /* labels */
      ctx.fillStyle = V.cyan + "88"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("RAW SENSORY DATA", 10, CH-10);
      ctx.fillStyle = filterOpen > 0.3 ? V.aurora + "BB" : V.blue + "55"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("CONSCIOUS SIGNAL", 10, MEM_Y - 24);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"360px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Water Quasi-Molecule · H₂O Octopus + H-Bond Network
   ───────────────────────────────────────────────────────────────────────── */
function WaterOctopusCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 300, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;

    /* central water molecule */
    const OCX = CW * 0.35, OCY = CH * 0.52;
    const OH_LEN = 52, LP_LEN = 68;

    /* H positions (below, at 104.5° spread) */
    const H1 = { x: OCX + Math.cos((200)*Math.PI/180)*OH_LEN, y: OCY + Math.sin((200)*Math.PI/180)*OH_LEN };
    const H2 = { x: OCX + Math.cos((340)*Math.PI/180)*OH_LEN, y: OCY + Math.sin((340)*Math.PI/180)*OH_LEN };
    /* lone pair directions (above) */
    const LP1 = { x: OCX + Math.cos((110)*Math.PI/180)*LP_LEN, y: OCY + Math.sin((110)*Math.PI/180)*LP_LEN };
    const LP2 = { x: OCX + Math.cos((70)*Math.PI/180)*LP_LEN,  y: OCY + Math.sin((70)*Math.PI/180)*LP_LEN  };

    /* neighboring water molecules (tetrahedral coordination) */
    type NW = { ox:number; oy:number; hAngle1:number; hAngle2:number; hbondPhase:number };
    const NEIGHBORS: NW[] = [
      /* H-bond donors to central lone pairs */
      { ox:OCX+Math.cos(110*Math.PI/180)*130, oy:OCY+Math.sin(110*Math.PI/180)*130, hAngle1:280, hAngle2:330, hbondPhase:0 },
      { ox:OCX+Math.cos(70*Math.PI/180)*130,  oy:OCY+Math.sin(70*Math.PI/180)*130,  hAngle1:210, hAngle2:250, hbondPhase:0.4 },
      /* H-bond acceptors from central H's */
      { ox:H1.x + Math.cos(200*Math.PI/180)*90, oy:H1.y + Math.sin(200*Math.PI/180)*90, hAngle1:20, hAngle2:60, hbondPhase:0.7 },
      { ox:H2.x + Math.cos(340*Math.PI/180)*90, oy:H2.y + Math.sin(340*Math.PI/180)*90, hAngle1:120, hAngle2:160, hbondPhase:1.1 },
    ];

    /* H-bond particles */
    type HBP = { t:number; fromX:number; fromY:number; toX:number; toY:number; active:boolean; alpha:number };
    const hbParticles: HBP[] = NEIGHBORS.map((n, i) => ({
      t:i*0.25, fromX:0, fromY:0, toX:0, toY:0, active:true, alpha:1,
    }));

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* cluster background glow */
      const cg = ctx.createRadialGradient(OCX, OCY, 0, OCX, OCY, 180);
      cg.addColorStop(0, "rgba(34,221,255,0.04)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg; ctx.fillRect(0, 0, CW, CH);

      /* ── NEIGHBOR WATER MOLECULES ── */
      NEIGHBORS.forEach((n, i) => {
        const hbPhase = (frame * 0.018 + n.hbondPhase) % (Math.PI * 2);
        const hbStrength = 0.5 + 0.5 * Math.sin(hbPhase);

        /* H-bond dashes from/to central */
        let hbFromX:number, hbFromY:number, hbToX:number, hbToY:number;
        if (i < 2) {
          /* donor to central LP */
          const lp = i === 0 ? LP1 : LP2;
          const nh = { x: n.ox + Math.cos(n.hAngle1*Math.PI/180)*42, y: n.oy + Math.sin(n.hAngle1*Math.PI/180)*42 };
          hbFromX = nh.x; hbFromY = nh.y; hbToX = lp.x; hbToY = lp.y;
        } else {
          const h = i === 2 ? H1 : H2;
          const nlp = { x: n.ox + Math.cos(n.hAngle2*Math.PI/180)*50, y: n.oy + Math.sin(n.hAngle2*Math.PI/180)*50 };
          hbFromX = h.x; hbFromY = h.y; hbToX = nlp.x; hbToY = nlp.y;
        }
        /* H-bond dashed line */
        ctx.strokeStyle = `rgba(34,221,255,${0.15 + hbStrength*0.45})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(hbFromX, hbFromY); ctx.lineTo(hbToX, hbToY); ctx.stroke();
        ctx.setLineDash([]);

        /* H-bond particle */
        hbParticles[i].t = (hbParticles[i].t + 0.012) % 1;
        const pt = hbParticles[i].t;
        const px = hbFromX + (hbToX - hbFromX) * pt;
        const py = hbFromY + (hbToY - hbFromY) * pt;
        ctx.fillStyle = `rgba(34,221,255,${hbStrength * 0.9})`;
        ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI*2); ctx.fill();

        /* neighbor O atom */
        const og = ctx.createRadialGradient(n.ox, n.oy, 0, n.ox, n.oy, 14);
        og.addColorStop(0, "rgba(34,221,255,0.4)"); og.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = og; ctx.beginPath(); ctx.arc(n.ox, n.oy, 14, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#336688";
        ctx.beginPath(); ctx.arc(n.ox, n.oy, 9, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = V.cyan + "88"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(n.ox, n.oy, 9, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = V.cyan; ctx.font = `bold 7px ${V.mono}`;
        ctx.fillText("O", n.ox - 4, n.oy + 3);

        /* neighbor H atoms */
        [n.hAngle1, n.hAngle2].forEach(ha => {
          const hx = n.ox + Math.cos(ha*Math.PI/180)*30;
          const hy = n.oy + Math.sin(ha*Math.PI/180)*30;
          ctx.strokeStyle = n.ox + ""; // reset
          ctx.strokeStyle = `${V.ice}44`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(n.ox, n.oy); ctx.lineTo(hx, hy); ctx.stroke();
          ctx.fillStyle = "#AACCEE";
          ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = V.bg; ctx.font = `bold 6px ${V.mono}`;
          ctx.fillText("H", hx-3, hy+2);
        });
      });

      /* ── CENTRAL H₂O OCTOPUS ── */
      /* O-H bonds */
      [H1, H2].forEach(h => {
        const lg = ctx.createLinearGradient(OCX, OCY, h.x, h.y);
        lg.addColorStop(0, V.cyan + "CC"); lg.addColorStop(1, V.ice + "88");
        ctx.strokeStyle = lg; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(OCX, OCY); ctx.lineTo(h.x, h.y); ctx.stroke();
      });

      /* lone pair lobes */
      [LP1, LP2].forEach((lp, i) => {
        const breathe = 1 + 0.08 * Math.sin(frame * 0.028 + i * Math.PI);
        const dx = lp.x - OCX, dy = lp.y - OCY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const lox = OCX + dx/dist * LP_LEN * breathe;
        const loy = OCY + dy/dist * LP_LEN * breathe;
        const lpg = ctx.createRadialGradient(lox, loy, 0, lox, loy, 22 * breathe);
        lpg.addColorStop(0, `rgba(153,102,255,0.55)`);
        lpg.addColorStop(0.5, `rgba(153,102,255,0.18)`);
        lpg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = lpg; ctx.beginPath(); ctx.arc(lox, loy, 22*breathe, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = V.vio + "66"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(lox, loy, 16*breathe, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = V.vio + "99"; ctx.font = `6px ${V.mono}`;
        ctx.fillText("LP", lox - 7, loy + 2);
        /* line from O to LP */
        ctx.strokeStyle = V.vio + "44"; ctx.lineWidth = 1;
        ctx.setLineDash([3,4]);
        ctx.beginPath(); ctx.moveTo(OCX, OCY); ctx.lineTo(lox, loy); ctx.stroke();
        ctx.setLineDash([]);
      });

      /* O atom (octopus body) */
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.022);
      const OR = 22;
      const og = ctx.createRadialGradient(OCX, OCY, 0, OCX, OCY, OR*2.5);
      og.addColorStop(0, "rgba(0,204,187,0.5)");
      og.addColorStop(0.4, "rgba(68,136,255,0.2)");
      og.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(OCX, OCY, OR*2.5, 0, Math.PI*2); ctx.fill();
      const bodyG = ctx.createRadialGradient(OCX-4, OCY-4, 0, OCX, OCY, OR);
      bodyG.addColorStop(0, "#336688");
      bodyG.addColorStop(0.5, "#1A3355");
      bodyG.addColorStop(1, "#0D1A2A");
      ctx.fillStyle = bodyG; ctx.beginPath(); ctx.arc(OCX, OCY, OR, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = V.cyan + Math.round(180 + pulse*75).toString(16).padStart(2,"0");
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(OCX, OCY, OR, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = V.aurora; ctx.font = `bold 10px ${V.mono}`;
      ctx.fillText("O", OCX - 6, OCY + 4);

      /* H atoms */
      [H1, H2].forEach(h => {
        ctx.fillStyle = "#CCDDEE";
        ctx.beginPath(); ctx.arc(h.x, h.y, 10, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = V.ice + "AA"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(h.x, h.y, 10, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = V.bg; ctx.font = `bold 8px ${V.mono}`;
        ctx.fillText("H", h.x-5, h.y+3);
      });

      /* angle annotation */
      ctx.strokeStyle = V.gold + "55"; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(OCX, OCY, 30, (200-180)*Math.PI/180, (340-180)*Math.PI/180, false);
      ctx.stroke();
      ctx.fillStyle = V.gold + "AA"; ctx.font = `7.5px ${V.mono}`;
      ctx.fillText("104.5°", OCX+22, OCY+22);

      /* right panel — theoretical description */
      const PX = CW * 0.60;
      ctx.fillStyle = V.ink + "44"; ctx.font = `6.5px ${V.mono}`;
      const lines = [
        "H₂O QUASI-OCTOPUS",
        "─────────────────────",
        "2 O-H covalent bonds  →  arms",
        "2 lone-pair lobes      →  tentacles",
        "4 H-bond sites         →  anchor points",
        "",
        "TETRAHEDRAL ANGLE: ~109.5°",
        "O-H BOND LENGTH: 0.96 Å",
        "H-O-H ANGLE: 104.5°",
        "",
        "Each H₂O can bond to 4 neighbors:",
        "2 as donor (via H)",
        "2 as acceptor (via LP)",
        "",
        "Liquid water = dynamic quasi-network",
        "H-bond lifetime: ~1-10 ps",
        "Cluster size: (H₂O)₄ → (H₂O)₂₀",
      ];
      lines.forEach((l, i) => {
        ctx.fillStyle = i < 2 ? V.aurora + "CC" : V.ink + "55";
        if (l.startsWith("4 H-bond") || l.startsWith("TETRAHEDRAL") || l.startsWith("H-bond lifetime")) {
          ctx.fillStyle = V.gold + "AA";
        }
        ctx.fillText(l, PX, 30 + i * 16);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"300px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Blue Blood vs Red Blood · Octopus Agentic Architecture
   ───────────────────────────────────────────────────────────────────────── */
function BlueBloodCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 440, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;
    const SPLIT = CW * 0.5;

    /* oxygenation cycle */
    const OXY_CYCLE = 600;

    /* octopus arm layout (8 arms from center) */
    const OCT_CX = CW * 0.26, OCT_CY = CH * 0.68;
    const OCT_R  = 32;
    const ARM_LEN = 88;
    /* 8 arms + ganglia nodes along each arm */
    const ARMS = Array.from({length: 8}, (_, i) => {
      const baseAngle = (i / 8) * Math.PI * 2 + Math.PI * 0.12;
      const curve = (Math.random() - 0.5) * 0.4;
      return {
        angle: baseAngle, curve,
        ganglia: Array.from({length: 4}, (__, g) => ({
          t: 0.2 + g * 0.22,
          phase: Math.random() * Math.PI * 2,
        })),
      };
    });

    /* vertebrate neural layout */
    const VERT_CX = CW * 0.76, VERT_CY = CH * 0.68;

    /* blue ring positions on octopus mantle */
    const BLUE_RINGS = Array.from({length: 10}, (_, i) => ({
      dx: (Math.random() - 0.5) * OCT_R * 2.4,
      dy: (Math.random() - 0.5) * OCT_R * 1.6,
      r:  4 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
    }));

    const getArmPoint = (arm: typeof ARMS[0], t: number) => {
      const endX = OCT_CX + Math.cos(arm.angle) * ARM_LEN;
      const endY = OCT_CY + Math.sin(arm.angle) * ARM_LEN;
      const cpX = OCT_CX + Math.cos(arm.angle + arm.curve * 0.5) * ARM_LEN * 0.6;
      const cpY = OCT_CY + Math.sin(arm.angle + arm.curve * 0.5) * ARM_LEN * 0.6;
      const mt = 1 - t;
      return {
        x: mt*mt*OCT_CX + 2*mt*t*cpX + t*t*endX,
        y: mt*mt*OCT_CY + 2*mt*t*cpY + t*t*endY,
      };
    };

    const draw = () => {
      frame++;
      const oxyPhase = (frame % OXY_CYCLE) / OXY_CYCLE;
      const oxygenated = 0.5 + 0.5 * Math.sin(oxyPhase * Math.PI * 2);

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* vertical divider */
      ctx.strokeStyle = V.dim + "66"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(SPLIT, 0); ctx.lineTo(SPLIT, CH); ctx.stroke();
      ctx.setLineDash([]);

      /* column headers */
      ctx.fillStyle = V.cobalt + "DD"; ctx.font = `bold 7.5px ${V.mono}`;
      ctx.fillText("HAEMOCYANIN  ·  OCTOPUS", 14, 16);
      ctx.fillStyle = "#CC2222DD"; ctx.font = `bold 7.5px ${V.mono}`;
      ctx.fillText("HAEMOGLOBIN  ·  VERTEBRATE", SPLIT + 14, 16);

      /* ═══════════ LEFT PANEL — HAEMOCYANIN + OCTOPUS ═══════════ */

      /* haemocyanin molecular diagram (top left) */
      const HCY = CH * 0.22;
      const CU1X = SPLIT * 0.32, CU2X = SPLIT * 0.62, CUCY = HCY;
      const cuCol = oxygenated > 0.5 ? V.cobalt : V.copper;

      /* Cu-Cu bridge */
      ctx.strokeStyle = cuCol + "88"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(CU1X, CUCY); ctx.lineTo(CU2X, CUCY); ctx.stroke();

      /* O₂ bridge when oxygenated */
      if (oxygenated > 0.2) {
        const o2x = (CU1X + CU2X) / 2, o2y = CUCY - 18;
        const alpha = oxygenated;
        /* lines to Cu */
        ctx.strokeStyle = V.cobalt + Math.round(alpha * 180).toString(16).padStart(2,"0");
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(CU1X, CUCY); ctx.lineTo(o2x-6, o2y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CU2X, CUCY); ctx.lineTo(o2x+6, o2y); ctx.stroke();
        /* O₂ nodes */
        ctx.fillStyle = `rgba(0,150,255,${alpha * 0.8})`;
        ctx.beginPath(); ctx.arc(o2x-6, o2y, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(o2x+6, o2y, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = V.ice; ctx.font = `6px ${V.mono}`;
        ctx.fillText("O₂", o2x-8, o2y-8);
      }

      /* Cu atoms */
      [CU1X, CU2X].forEach(cx => {
        const g = ctx.createRadialGradient(cx, CUCY, 0, cx, CUCY, 18);
        const c = oxygenated > 0.5 ? "68,136,255" : "184,115,51";
        g.addColorStop(0, `rgba(${c},0.6)`); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, CUCY, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = oxygenated > 0.5 ? V.cobalt : V.copper;
        ctx.beginPath(); ctx.arc(cx, CUCY, 11, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = V.ink; ctx.font = `bold 8px ${V.mono}`;
        ctx.fillText("Cu", cx-8, CUCY+3);
      });
      ctx.fillStyle = oxygenated > 0.5 ? V.cobalt + "CC" : V.copper + "AA";
      ctx.font = `6.5px ${V.mono}`;
      const hcState = oxygenated > 0.5 ? "OXYHAEMOCYANIN  ·  BLUE" : "DEOXYHAEMOCYANIN  ·  COLOURLESS";
      ctx.fillText(hcState, SPLIT*0.5 - ctx.measureText(hcState).width/2, HCY + 36);
      ctx.fillStyle = V.dim + "BB"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("Cu(I) + O₂ → Cu(II)·O₂·Cu(II)", SPLIT*0.5 - 64, HCY + 48);

      /* haemocyanin glow when oxygenated */
      if (oxygenated > 0.3) {
        const bg = ctx.createRadialGradient(SPLIT*0.47, HCY, 0, SPLIT*0.47, HCY, 60);
        bg.addColorStop(0, `rgba(34,68,204,${oxygenated*0.15})`);
        bg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bg; ctx.fillRect(0, HCY-60, SPLIT, 120);
      }

      /* OCTOPUS BODY */
      /* mantle (elliptical body) */
      const mantleG = ctx.createRadialGradient(OCT_CX, OCT_CY - OCT_R*0.3, 0, OCT_CX, OCT_CY, OCT_R*1.4);
      mantleG.addColorStop(0, oxygenated > 0.4 ? "#223366" : "#331122");
      mantleG.addColorStop(1, V.bg + "EE");
      ctx.fillStyle = mantleG;
      ctx.beginPath(); ctx.ellipse(OCT_CX, OCT_CY - OCT_R*0.5, OCT_R, OCT_R*0.85, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = oxygenated > 0.5 ? V.cobalt + "AA" : V.dim + "88"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(OCT_CX, OCT_CY - OCT_R*0.5, OCT_R, OCT_R*0.85, 0, 0, Math.PI*2); ctx.stroke();

      /* blue iridescent rings */
      BLUE_RINGS.forEach(ring => {
        const flash = 0.5 + 0.5 * Math.sin(frame * 0.12 + ring.phase);
        if (flash > 0.35) {
          const rx = OCT_CX + ring.dx, ry = OCT_CY - OCT_R*0.5 + ring.dy;
          ctx.strokeStyle = `rgba(34,221,255,${flash * 0.85})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(rx, ry, ring.r, 0, Math.PI*2); ctx.stroke();
          ctx.strokeStyle = `rgba(153,102,255,${flash * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(rx, ry, ring.r + 4, 0, Math.PI*2); ctx.stroke();
        }
      });

      /* ARMS */
      ARMS.forEach((arm, ai) => {
        /* arm tube */
        const endP = getArmPoint(arm, 1.0);
        const cpP  = getArmPoint(arm, 0.5);
        ctx.strokeStyle = oxygenated > 0.4 ? V.cobalt + "88" : V.dim + "66";
        ctx.lineWidth = 4 - ai % 2;
        ctx.beginPath();
        ctx.moveTo(OCT_CX, OCT_CY);
        ctx.quadraticCurveTo(cpP.x * 1.1, cpP.y, endP.x, endP.y);
        ctx.stroke();

        /* ganglia nodes */
        arm.ganglia.forEach(g => {
          const gp = getArmPoint(arm, g.t);
          const act = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.02 + g.phase));
          const gc  = oxygenated > 0.4 ? V.cobalt : V.rose;
          ctx.fillStyle = gc + Math.round(act * 200).toString(16).padStart(2,"0");
          ctx.beginPath(); ctx.arc(gp.x, gp.y, 4 + act * 2.5, 0, Math.PI*2); ctx.fill();
        });
      });

      /* central brain (small) */
      ctx.fillStyle = V.bg;
      ctx.beginPath(); ctx.arc(OCT_CX, OCT_CY, 10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = V.cobalt + "AA"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(OCT_CX, OCT_CY, 10, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = V.cobalt + "CC"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("BRAIN", OCT_CX - 10, OCT_CY + 20);

      /* labels */
      ctx.fillStyle = V.cobalt + "CC"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("500M NEURONS", OCT_CX - 38, CH - 30);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("2/3 IN ARMS · DISTRIBUTED", OCT_CX - 46, CH - 18);

      /* ═══════════ RIGHT PANEL — HAEMOGLOBIN + VERTEBRATE ═══════════ */

      /* haemoglobin molecular diagram (top right) */
      const HBCX = SPLIT + (CW - SPLIT) * 0.47, HBCY = HCY;
      const FECOLOR = "#DD3333";
      const feR = 13;
      /* porphyrin ring — 4 N atoms + meso carbons */
      const NPOS = Array.from({length:4}, (_, i) => ({
        x: HBCX + Math.cos((i/4)*Math.PI*2 + Math.PI/4)*22,
        y: HBCY + Math.sin((i/4)*Math.PI*2 + Math.PI/4)*22,
      }));
      /* meso carbons between N */
      const MESO = Array.from({length:4}, (_, i) => ({
        x: HBCX + Math.cos((i/4+0.125)*Math.PI*2 + Math.PI/4)*30,
        y: HBCY + Math.sin((i/4+0.125)*Math.PI*2 + Math.PI/4)*30,
      }));
      /* draw ring */
      ctx.strokeStyle = FECOLOR + "88"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(NPOS[0].x, NPOS[0].y);
      for (let k = 0; k < 8; k++) {
        const p = k%2===0 ? NPOS[k/2] : MESO[Math.floor(k/2)];
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath(); ctx.stroke();
      /* N atoms */
      NPOS.forEach(n => {
        ctx.fillStyle = FECOLOR + "44"; ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#FF6666"; ctx.font = `6px ${V.mono}`;
        ctx.fillText("N", n.x-4, n.y+2);
        /* N→Fe bond */
        ctx.strokeStyle = FECOLOR + "66"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(HBCX, HBCY); ctx.stroke();
      });
      /* Fe atom */
      const feg = ctx.createRadialGradient(HBCX, HBCY, 0, HBCX, HBCY, feR*2.5);
      feg.addColorStop(0, `rgba(220,50,50,${0.4+oxygenated*0.3})`);
      feg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = feg; ctx.beginPath(); ctx.arc(HBCX, HBCY, feR*2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = FECOLOR; ctx.beginPath(); ctx.arc(HBCX, HBCY, feR, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = V.ink; ctx.font = `bold 9px ${V.mono}`;
      ctx.fillText("Fe", HBCX-8, HBCY+4);
      /* O₂ above Fe */
      if (oxygenated > 0.2) {
        ctx.fillStyle = `rgba(255,100,100,${oxygenated*0.85})`;
        ctx.beginPath(); ctx.arc(HBCX-5, HBCY-22, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(HBCX+5, HBCY-22, 5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = `rgba(255,80,80,${oxygenated*0.7})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(HBCX-5, HBCY-22); ctx.lineTo(HBCX+5, HBCY-22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(HBCX, HBCY-feR); ctx.lineTo(HBCX, HBCY-17); ctx.stroke();
        ctx.fillStyle = "#FF8888"; ctx.font = `6px ${V.mono}`;
        ctx.fillText("O₂", HBCX-8, HBCY-28);
      }
      ctx.fillStyle = "#CC3333AA"; ctx.font = `6.5px ${V.mono}`;
      const hbState = oxygenated > 0.5 ? "OXYHAEMOGLOBIN  ·  RED" : "DEOXYHAEMOGLOBIN  ·  DARK";
      ctx.fillText(hbState, HBCX - ctx.measureText(hbState).width/2, HCY + 36);
      ctx.fillStyle = V.dim + "BB"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("Fe²⁺ + O₂ → Fe²⁺·O₂ (oxy)", HBCX - 60, HCY + 48);

      /* VERTEBRATE neural map */
      const VCBX = VERT_CX, VCBY = VERT_CY - 20;
      const BRAIN_R = 28;
      /* brain (large) */
      const bgg = ctx.createRadialGradient(VCBX, VCBY - BRAIN_R*0.5, 0, VCBX, VCBY, BRAIN_R*2);
      bgg.addColorStop(0, "rgba(220,50,50,0.25)"); bgg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bgg; ctx.beginPath(); ctx.arc(VCBX, VCBY, BRAIN_R*2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#331111"; ctx.beginPath(); ctx.arc(VCBX, VCBY, BRAIN_R, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = FECOLOR + "CC"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(VCBX, VCBY, BRAIN_R, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = "#FF8888"; ctx.font = `bold 8px ${V.mono}`;
      ctx.fillText("BRAIN", VCBX - 18, VCBY + 4);

      /* spinal cord */
      ctx.strokeStyle = FECOLOR + "55"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(VCBX, VCBY + BRAIN_R); ctx.lineTo(VCBX, VCBY + BRAIN_R + 75); ctx.stroke();
      /* peripheral nerves */
      for (let k = 0; k < 5; k++) {
        const sy = VCBY + BRAIN_R + 12 + k * 14;
        const dir = k % 2 === 0 ? 1 : -1;
        ctx.strokeStyle = FECOLOR + "33"; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(VCBX, sy);
        ctx.lineTo(VCBX + dir * 45, sy + 12);
        ctx.stroke();
        ctx.fillStyle = "#FF6666"; ctx.beginPath(); ctx.arc(VCBX + dir*45, sy+12, 4, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = "#CC3333CC"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("86B NEURONS", VERT_CX - 30, CH - 30);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("CENTRALISED · HIERARCHICAL", VERT_CX - 44, CH - 18);

      /* oxygenation cycle label */
      ctx.fillStyle = V.dim + "99"; ctx.font = `6.5px ${V.mono}`;
      const pct = Math.round(oxygenated * 100);
      ctx.fillText(`O₂ SATURATION  ${pct}%`, SPLIT/2 - 40, CH - 55);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"440px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function PsilocybinWaterOctopusPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge = (t:string, col=V.aurora) => (
    <span key={t} style={{ fontFamily:V.mono, fontSize:"0.52rem", color:col, border:`1px solid ${col}44`,
      borderRadius:3, padding:"2px 8px", letterSpacing:2, marginRight:6, marginBottom:5, display:"inline-block" }}>{t}</span>
  );
  const sec = (n:string, title:string, col:string, body:React.ReactNode) => (
    <section style={{ marginBottom:52 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:col, letterSpacing:3, marginBottom:5 }}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      </div>
      <h2 style={{ fontFamily:V.disp, fontSize:"clamp(0.95rem,2.4vw,1.45rem)", color:col,
        margin:"0 0 18px", letterSpacing:"0.06em", fontWeight:400 }}>{title}</h2>
      {body}
    </section>
  );
  const P = (t:string) => (
    <p style={{ fontFamily:V.serif, fontSize:"clamp(0.88rem,1.7vw,1.02rem)", lineHeight:1.78,
      color:V.ink, margin:"0 0 13px", opacity:0.9 }}>{t}</p>
  );
  const cards = (items:{h:string;col:string;d:string}[]) => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginTop:12 }}>
      {items.map(c => (
        <div key={c.h} style={{ background:`${c.col}0C`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.h}</div>
          <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>

      {/* header */}
      <div style={{ marginBottom:42 }}>
        {[badge("LIVE SIMULATION"), badge("PSILOCYBIN FILTER",V.gold), badge("CARBON EGG  C₇₀",V.vio), badge("H₂O OCTOPUS",V.cyan), badge("BLUE BLOOD",V.cobalt), badge("HAEMOCYANIN vs HAEMOGLOBIN",V.rose)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.7rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          PSILOCYBIN · WATER OCTOPUS · BLUE BLOOD
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          FILTER THEORY · C₇₀ CARBON EGG · H₂O QUASI-MOLECULE · HAEMOCYANIN · AGENTIC ARCHITECTURE
        </p>
        {P("Three radically different systems — a psychedelic molecule, a water cluster, and a cephalopod nervous system — share a common architectural logic: distributed processing through a quasi-network that privileges local agency over central control. Psilocybin removes a filter. Water forms a dynamic quasi-solid through 4-armed hydrogen bonding. Octopi route 2/3 of their neurons into their arms, making each arm a semi-autonomous agent. The connecting thread is not chemistry but topology: the 4-arm motif appears at every scale from H₂O to the octopus body plan.")}
        {P("Carbon takes egg form at C₇₀ — the first fullerene with a non-spherical (prolate) geometry. The indole ring system inside psilocybin is itself a fused carbon egg: a rigid aromatic shell around a nitrogen that inserts into the serotonin receptor like a key into a lock. Blue blood uses copper where red blood uses iron — a single atomic substitution that changes the oxygen-binding geometry from square-planar (haemoglobin) to bridged binuclear (haemocyanin), and the blood colour from red to blue.")}
      </div>

      {/* S1 — Psilocybin */}
      {sec("01","Psilocybin Filter Theory · Carbon Egg · DMN Suppression",V.gold,<>
        {P("Aldous Huxley proposed in 1954 that the brain functions as a 'reducing valve' — its primary job is to suppress the overwhelming richness of incoming experience into a manageable trickle. Robin Carhart-Harris extended this into the Entropic Brain Hypothesis (2014): the Default Mode Network (DMN) is the valve mechanism, enforcing high-level narrative coherence by suppressing lower-level, primary-consciousness signals. Psilocybin reduces DMN connectivity, increases entropy in neural signals, and temporarily re-opens the valve.")}
        {P("The carbon geometry of psilocybin is critical: the indole ring — two fused aromatic rings (benzene + pyrrole) — mimics serotonin's shape closely enough to bind 5-HT₂A receptors. C₇₀ fullerene is the same geometry at nanoscale: a prolate carbon egg with 12 pentagons and 25 hexagons. The filter opening and carbon egg below animate the psilocybin effect on the DMN membrane.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <PsilocybinFilterCanvas />
        </div>
        {cards([
          { h:"DMN SUPPRESSION",     col:V.vio,    d:"Default Mode Network activity decreases ~40% under psilocybin. The narrative 'self' quiets, allowing primary sensory signals to reach consciousness." },
          { h:"ENTROPIC BRAIN",      col:V.gold,   d:"Neural signal entropy increases — more simultaneous brain states, less predictable firing. Creativity, boundary dissolution, and synesthesia emerge from high-entropy states." },
          { h:"C₇₀ CARBON EGG",     col:V.aurora, d:"70-carbon prolate spheroid (aspect ratio 1.28:1). First fullerene to break spherical symmetry. Identical topology to a rugby ball — 12 pentagons, 25 hexagons." },
          { h:"INDOLE RING",         col:V.rose,   d:"Rigid fused 5+6 aromatic carbon system. Present in serotonin, DMT, psilocybin, melatonin, tryptophan. The molecular key that opens consciousness receptors." },
        ])}
      </>)}

      {/* S2 — H₂O Octopus */}
      {sec("02","H₂O Quasi-Molecule · The Water Octopus",V.cyan,<>
        {P("The water molecule is not a simple bent triatomic. It has four functional arms: two O-H bond arms (electron donors to hydrogen bonds) and two lone-pair lobes (electron acceptors from hydrogen bonds). This makes it tetrahedral — like a 4-armed octopus — and allows each molecule to participate in exactly 4 hydrogen bonds in liquid water. The H-bond network is quasi-molecular: clusters of (H₂O)₄ to (H₂O)₂₀ form, persist for 1-10 picoseconds, and dissolve, creating a constantly reorganizing network.")}
        {P("This quasi-network is what makes water anomalous: high specific heat, surface tension, density maximum at 4°C, universal solvent behavior. The lone pairs (LP) are the 'tentacles' — longer-ranged, more directional, and responsible for the tetrahedral ice structure. In liquid water the LP-H bond angle fluctuates around 104.5°, breaking the perfect tetrahedron and creating the dynamic disorder that allows life to operate in liquid rather than solid water.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <WaterOctopusCanvas />
        </div>
        {cards([
          { h:"4-ARM GEOMETRY",      col:V.cyan,   d:"2 O-H bonds + 2 lone pairs. Each arm can form one hydrogen bond. Tetrahedral coordination (109.5° ideal, 104.5° real) creates the self-organizing network." },
          { h:"H-BOND LIFETIME",     col:V.aurora, d:"~1-10 picoseconds in liquid water. Each molecule changes bonding partner millions of times per microsecond — a dynamic network, not a static structure." },
          { h:"QUASI-SOLID CLUSTER", col:V.vio,    d:"At any instant, local ice-like (H₂O)₄ tetrahedra exist. These flickering clusters give water its anomalous properties — especially high heat capacity and surface tension." },
          { h:"LONE PAIR TOPOLOGY",  col:V.gold,   d:"The LP lobes extend 0.85 Å further than the O-H bonds. This asymmetry is why water is such a good proton acceptor and why it dissolves ionic compounds so effectively." },
        ])}
      </>)}

      {/* S3 — Blue Blood */}
      {sec("03","Blue Blood · Haemocyanin vs Haemoglobin · Distributed Agentic Architecture",V.cobalt,<>
        {P("All octopi have blue blood. The pigment is haemocyanin — not a porphyrin but a binuclear copper protein. Two copper atoms (Cu) sit adjacent, bridged by a peroxo O₂²⁻ ion when oxygenated. This bridge geometry is square-pyramidal rather than the square-planar of haemoglobin's iron-porphyrin, and it is far more efficient at cold temperatures and low O₂ pressures — which is why copper-based blood evolved in molluscs and arthropods living in cold, low-oxygen water.")}
        {P("The blue-ringed octopus adds another layer: its iridescent rings flash within milliseconds via active muscular control of iridophore cells — structural colour, not pigment. The octopus nervous system is the defining example of organic distributed agentic architecture: 500 million neurons, but only ~50 million in the central brain. The remaining 300M are in the arms. Each arm has its own ganglionic ring that runs local motor programs independently — the arm can taste, touch, and reach even when severed from the body.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <BlueBloodCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:12 }}>
          <div style={{ background:`${V.cobalt}08`, border:`1px solid ${V.cobalt}33`, borderRadius:8, padding:"14px 16px" }}>
            <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:V.cobalt, letterSpacing:2, marginBottom:10 }}>HAEMOCYANIN · COPPER</div>
            {[
              "Metal centre: Cu(I) / Cu(II)",
              "Binuclear bridged site: CuA-O₂-CuB",
              "Oxygenated colour: BLUE",
              "Deoxygenated: colourless",
              "O₂ affinity: high at low T, low O₂",
              "Structure: dissolved in plasma (no cell)",
              "Molecular weight: 450 kDa – 13 MDa",
            ].map(l => (
              <div key={l} style={{ fontFamily:V.mono, fontSize:"0.62rem", color:V.ice, marginBottom:5, paddingLeft:8,
                borderLeft:`2px solid ${V.cobalt}55` }}>{l}</div>
            ))}
          </div>
          <div style={{ background:"#CC222208", border:"1px solid #CC222233", borderRadius:8, padding:"14px 16px" }}>
            <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:"#FF6666", letterSpacing:2, marginBottom:10 }}>HAEMOGLOBIN · IRON</div>
            {[
              "Metal centre: Fe(II)",
              "Square-planar porphyrin (heme) ring",
              "Oxygenated colour: RED (oxymyoglobin)",
              "Deoxygenated: DARK RED (deoxyHb)",
              "O₂ affinity: cooperative (sigmoid curve)",
              "Structure: inside red blood cells",
              "Molecular weight: 64.5 kDa (tetramer)",
            ].map(l => (
              <div key={l} style={{ fontFamily:V.mono, fontSize:"0.62rem", color:V.ice, marginBottom:5, paddingLeft:8,
                borderLeft:"2px solid #CC222255" }}>{l}</div>
            ))}
          </div>
        </div>
      </>)}

      {/* S4 — Agentic architecture */}
      {sec("04","Organic Agentic Architecture · Why the Octopus Matters",V.teal,<>
        {P("The octopus is not a centralized intelligence with remote limbs. It is a distributed intelligence — a colony of semi-autonomous ganglionic processors coordinated (not commanded) by a central brain. Each arm solves local problems: navigating a crevice, gripping prey, tasting texture. The central brain sets goals and resolves conflicts but does not micromanage execution. This is the architecture of agentic systems: local autonomy + sparse global coordination.")}
        {P("The psilocybin connection: both systems achieve emergent complexity by reducing central control. The DMN (the octopus brain equivalent in human consciousness) normally enforces top-down narrative suppression. Psilocybin loosens this, allowing the 'arm ganglia' of the cortex — primary sensory areas, limbic areas, default suppressed regions — to operate with more local autonomy, producing the characteristic expanded, unfiltered experience.")}
        {cards([
          { h:"CENTRAL BRAIN (12%)", col:V.teal,   d:"~50M neurons. Sets goals, coordinates arms, handles learning. Does NOT run motor programs. The octopus equivalent of a CEO who sets OKRs, not a controller who issues every move." },
          { h:"ARM GANGLIA (66%)",   col:V.cobalt, d:"~300M neurons distributed across 8 arms. Each runs local motor control, chemosensory analysis, and reflexive grasping. Arms solve problems autonomously." },
          { h:"BLUE RINGS · SIGNAL", col:V.aurora, d:"~60 iridescent rings flash under muscular control via iridophore cells. Structural interference colour (like a CD), not chemical pigment. Signal speed: <1 ms." },
          { h:"PSILOCYBIN PARALLEL", col:V.gold,   d:"Reduced DMN = reduced central suppression. Sensory cortices (the 'arm ganglia') fire more independently. Same architecture: loosened hierarchy → emergent complexity." },
        ])}
      </>)}

    </div>
  );
}
