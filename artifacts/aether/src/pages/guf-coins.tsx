import { useMemo, useState } from "react";

type Coin = {
  id: string;
  name: string;
  sub: string;
  faceA: (id: string) => string;
  faceB: (id: string) => string;
};

const coinData: Coin[] = [
  {
    id: "phi",
    name: "PHICOIN",
    sub: "The Grand Unified Framework",
    faceA: (id) => `
      <defs>
        <radialGradient id="ga${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#f5d67a"/><stop offset="45%" stop-color="#c9a84c"/><stop offset="100%" stop-color="#5a4010"/>
        </radialGradient>
        <filter id="gl${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#ga${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#f5d67a" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#0a0e1a" opacity="0.9"/>
      <path d="M130,40 L130,24 A106,106 0 0,1 191,66 Z" fill="#ef4444" opacity="0.8"/>
      <path d="M191,66 L203,52 A106,106 0 0,1 236,196 Z" fill="#4a9fd4" opacity="0.8"/>
      <path d="M236,196 L236,212 A106,106 0 0,1 88,217 Z" fill="#c9a84c" opacity="0.8"/>
      <path d="M88,217 L67,203 A106,106 0 0,1 68,68 Z" fill="#ec4899" opacity="0.8"/>
      <path d="M68,68 L68,54 A106,106 0 0,1 130,24 Z" fill="#22c55e" opacity="0.8"/>
      <circle cx="130" cy="130" r="38" fill="#050810"/>
      <circle cx="130" cy="130" r="38" fill="#0a0e18" stroke="#c9a84c" stroke-width="1"/>
      <text x="130" y="145" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#c9a84c" font-weight="bold" filter="url(#gl${id})">&#934;</text>
    `,
    faceB: (id) => `
      <defs>
        <radialGradient id="gb${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#4af5ef"/><stop offset="45%" stop-color="#1fd4c8"/><stop offset="100%" stop-color="#043a38"/>
        </radialGradient>
        <filter id="glb${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#gb${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#4af5ef" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#050d16" opacity="0.95"/>
      <g stroke="#1fd4c8" stroke-width="1" opacity="0.5">
        <line x1="130" y1="130" x2="130" y2="40"/>
        <line x1="130" y1="130" x2="60" y2="200"/>
        <line x1="130" y1="130" x2="135" y2="30"/>
        <line x1="130" y1="130" x2="205" y2="175"/>
      </g>
      <circle cx="130" cy="55" r="4" fill="#1fd4c8"/>
      <circle cx="195" cy="95" r="3.5" fill="#c9a84c"/>
      <circle cx="205" cy="165" r="3" fill="#8b5cf6"/>
      <circle cx="150" cy="205" r="3" fill="#ec4899"/>
      <circle cx="130" cy="130" r="38" fill="#050d16" stroke="#1fd4c8" stroke-width="1"/>
      <text x="130" y="145" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#1fd4c8" font-weight="bold" filter="url(#glb${id})">&#934;</text>
    `,
  },
  {
    id: "hlv",
    name: "HLV COIN",
    sub: "Helical Lattice Vacuum",
    faceA: (id) => `
      <defs>
        <radialGradient id="ga${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#c4a6f5"/><stop offset="45%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#2e1065"/>
        </radialGradient>
        <filter id="gl${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="cp${id}"><circle cx="130" cy="130" r="112"/></clipPath>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#ga${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#c4a6f5" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#120a1f"/>
      <g clip-path="url(#cp${id})">
        <path d="M130,20 C170,50 170,80 130,110 C90,140 90,170 130,200 C170,230 170,250 130,270"
              fill="none" stroke="#c4a6f5" stroke-width="2" opacity="0.85"/>
        <path d="M130,20 C90,50 90,80 130,110 C170,140 170,170 130,200 C90,230 90,250 130,270"
              fill="none" stroke="#1fd4c8" stroke-width="2" opacity="0.85"/>
        <circle cx="130" cy="130" r="34" fill="#08050f"/>
      </g>
      <circle cx="130" cy="130" r="36" fill="#0e081a" stroke="#8b5cf6" stroke-width="1"/>
      <text x="130" y="128" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="#c4a6f5" font-weight="bold" filter="url(#gl${id})">HLV</text>
      <text x="130" y="144" text-anchor="middle" font-family="monospace" font-size="7" fill="#1fd4c8">&#8711;&#215;v = &#969;</text>
    `,
    faceB: (id) => `
      <defs>
        <radialGradient id="gb${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#4af5ef"/><stop offset="45%" stop-color="#1fd4c8"/><stop offset="100%" stop-color="#043a38"/>
        </radialGradient>
        <filter id="glb${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#gb${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#4af5ef" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#050d16"/>
      <circle cx="130" cy="130" r="95" fill="none" stroke="#1fd4c8" stroke-width="0.8" opacity="0.35"/>
      <circle cx="130" cy="130" r="75" fill="none" stroke="#8b5cf6" stroke-width="0.8" opacity="0.4"/>
      <circle cx="130" cy="130" r="55" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.45"/>
      <circle cx="130" cy="40" r="4" fill="#1fd4c8"/>
      <circle cx="200" cy="105" r="3.5" fill="#8b5cf6"/>
      <circle cx="175" cy="195" r="3" fill="#c9a84c"/>
      <circle cx="80" cy="175" r="3" fill="#1fd4c8"/>
      <circle cx="130" cy="130" r="36" fill="#050d16" stroke="#1fd4c8" stroke-width="1"/>
      <text x="130" y="126" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#1fd4c8" font-weight="bold" filter="url(#glb${id})">EUGA</text>
      <text x="130" y="142" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#c4a6f5">CYCLE</text>
    `,
  },
  {
    id: "euga",
    name: "EUGACYCLE COIN",
    sub: "Nested Precessional Timing",
    faceA: (id) => `
      <defs>
        <radialGradient id="ga${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#a6e8f5"/><stop offset="45%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#062f45"/>
        </radialGradient>
        <filter id="gl${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="cp${id}"><circle cx="130" cy="130" r="112"/></clipPath>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#ga${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#a6e8f5" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#061a24"/>
      <g clip-path="url(#cp${id})" opacity="0.95">
        <circle cx="130" cy="130" r="95" fill="none" stroke="#a6e8f5" stroke-width="0.8" opacity="0.3"/>
        <circle cx="130" cy="130" r="75" fill="none" stroke="#ec4899" stroke-width="0.8" opacity="0.35"/>
        <circle cx="130" cy="130" r="55" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.4"/>
        <circle cx="130" cy="40" r="4" fill="#a6e8f5"/>
        <circle cx="205" cy="105" r="3.5" fill="#ec4899"/>
        <circle cx="175" cy="195" r="3" fill="#c9a84c"/>
        <circle cx="130" cy="130" r="34" fill="#030d13"/>
      </g>
      <circle cx="130" cy="130" r="36" fill="#061a24" stroke="#38bdf8" stroke-width="1"/>
      <text x="130" y="127" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#a6e8f5" font-weight="bold" filter="url(#gl${id})">EUGA</text>
      <text x="130" y="142" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#ec4899" font-weight="bold">CYCLE</text>
    `,
    faceB: (id) => `
      <defs>
        <radialGradient id="gb${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fbb6d3"/><stop offset="45%" stop-color="#ec4899"/><stop offset="100%" stop-color="#450f2e"/>
        </radialGradient>
        <filter id="glb${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="cpb${id}"><circle cx="130" cy="130" r="112"/></clipPath>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#gb${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#fbb6d3" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#1f0a16"/>
      <g clip-path="url(#cpb${id})">
        <rect x="100" y="75" width="45" height="45" fill="none" stroke="#fbb6d3" stroke-width="1.5" opacity="0.85" transform="rotate(15 122 97)"/>
        <path d="M155,75 A 35,35 0 0 1 190,110" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.85"/>
        <path d="M115,150 C140,163 140,180 115,193 C90,206 90,223 115,236"
              fill="none" stroke="#fbb6d3" stroke-width="1.5" opacity="0.85"/>
        <path d="M115,150 C90,163 90,180 115,193 C140,206 140,223 115,236"
              fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.7"/>
        <circle cx="130" cy="130" r="34" fill="#0f050b"/>
      </g>
      <circle cx="130" cy="130" r="36" fill="#1f0a16" stroke="#ec4899" stroke-width="1"/>
      <text x="130" y="126" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#fbb6d3" font-weight="bold" filter="url(#glb${id})">PTAH</text>
      <text x="130" y="141" text-anchor="middle" font-family="monospace" font-size="9" fill="#38bdf8">pt&#7717;</text>
    `,
  },
  {
    id: "src",
    name: "SRC COIN",
    sub: "Stacked Rings Conjecture",
    faceA: (id) => `
      <defs>
        <radialGradient id="ga${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fbbf6a"/><stop offset="45%" stop-color="#e08a2f"/><stop offset="100%" stop-color="#5c2c04"/>
        </radialGradient>
        <filter id="gl${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="cp${id}"><circle cx="130" cy="130" r="112"/></clipPath>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#ga${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#fbbf6a" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#1a1006"/>
      <g clip-path="url(#cp${id})">
        <ellipse cx="130" cy="130" rx="100" ry="28" fill="none" stroke="#fbbf6a" stroke-width="1.3" opacity="0.85"/>
        <ellipse cx="130" cy="130" rx="100" ry="28" fill="none" stroke="#5468e0" stroke-width="1.1" opacity="0.7" transform="rotate(36 130 130)"/>
        <ellipse cx="130" cy="130" rx="100" ry="28" fill="none" stroke="#fbbf6a" stroke-width="1.1" opacity="0.7" transform="rotate(72 130 130)"/>
        <ellipse cx="130" cy="130" rx="100" ry="28" fill="none" stroke="#5468e0" stroke-width="1.1" opacity="0.7" transform="rotate(108 130 130)"/>
        <ellipse cx="130" cy="130" rx="100" ry="28" fill="none" stroke="#fbbf6a" stroke-width="1.1" opacity="0.7" transform="rotate(144 130 130)"/>
        <circle cx="130" cy="130" r="34" fill="#0c0703"/>
      </g>
      <circle cx="130" cy="130" r="36" fill="#160e04" stroke="#e08a2f" stroke-width="1"/>
      <text x="130" y="128" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#fbbf6a" font-weight="bold" filter="url(#gl${id})">SRC</text>
      <text x="130" y="143" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#5468e0">5 AXIOMS</text>
    `,
    faceB: (id) => `
      <defs>
        <radialGradient id="gb${id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#9badfb"/><stop offset="45%" stop-color="#5468e0"/><stop offset="100%" stop-color="#161c4d"/>
        </radialGradient>
        <filter id="glb${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="cpb${id}"><circle cx="130" cy="130" r="112"/></clipPath>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#gb${id})"/>
      <circle cx="130" cy="130" r="126" fill="none" stroke="#9badfb" stroke-width="2" opacity="0.6"/>
      <circle cx="130" cy="130" r="112" fill="#0a0c1e"/>
      <g clip-path="url(#cpb${id})" opacity="0.9">
        <path d="M65,65 L195,65 L165,110 L95,110 Z" fill="none" stroke="#9badfb" stroke-width="1.2" opacity="0.8"/>
        <path d="M95,110 L165,110 L150,150 L110,150 Z" fill="none" stroke="#e08a2f" stroke-width="1.2" opacity="0.75"/>
        <path d="M110,150 L150,150 L138,185 L122,185 Z" fill="none" stroke="#9badfb" stroke-width="1.2" opacity="0.7"/>
        <path d="M122,185 L138,185 L132,205 L128,205 Z" fill="none" stroke="#e08a2f" stroke-width="1.2" opacity="0.65"/>
      </g>
      <circle cx="130" cy="130" r="36" fill="#0a0c1e" stroke="#5468e0" stroke-width="1"/>
      <text x="130" y="126" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#9badfb" font-weight="bold" filter="url(#glb${id})">500D</text>
      <text x="130" y="141" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#fbbf6a">PIPELINE</text>
    `,
  },
];

const STAR_COLORS = ["#4a9fd4", "#1fd4c8", "#c9a84c", "#8b5cf6", "#fff"];

const STYLE = `
.gcg-scene { width:260px; height:260px; perspective:1400px; cursor:pointer; }
.gcg-flipper { position:relative; width:100%; height:100%;
  transition:transform 0.9s cubic-bezier(.4,.2,.2,1); transform-style:preserve-3d; }
.gcg-scene:hover .gcg-flipper { transform:scale(1.03); }
.gcg-scene.gcg-flipped .gcg-flipper { transform:rotateY(180deg); }
.gcg-scene.gcg-flipped:hover .gcg-flipper { transform:rotateY(180deg) scale(1.03); }
.gcg-face { position:absolute; width:100%; height:100%; backface-visibility:hidden;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  box-shadow:0 15px 35px rgba(0,0,0,0.6); }
.gcg-face.gcg-back { transform:rotateY(180deg); }
.gcg-face svg { width:100%; height:100%; }
@keyframes gcg-twinkle { 0%,100% { opacity:0.15; } 50% { opacity:0.6; } }
`;

export default function GufCoinsPage() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        cx: `${Math.random() * 100}%`,
        cy: `${Math.random() * 100}%`,
        r: (Math.random() * 1.3 + 0.4).toFixed(1),
        fill: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        dur: `${2 + Math.random() * 3}s`,
        delay: `${Math.random() * 3}s`,
      })),
    [],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 20%, #0a1220 0%, #010810 70%)",
        color: "#cbd5e1",
        fontFamily: "'Georgia', serif",
        padding: "40px 20px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{STYLE}</style>

      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} style={{ animation: `gcg-twinkle ${s.dur} ease-in-out infinite`, animationDelay: s.delay }} />
        ))}
      </svg>

      <div style={{ textAlign: "center", marginBottom: 8, position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontFamily: "Arial, sans-serif", fontWeight: 900, letterSpacing: "6px", fontSize: 22,
            background: "linear-gradient(90deg, #c9a84c, #1fd4c8, #8b5cf6, #e08a2f)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}
        >
          Φ · GRAND UNIFIED FRAMEWORK
        </h1>
        <p style={{ fontFamily: "Arial, sans-serif", letterSpacing: "3px", fontSize: 11, color: "#556677", marginTop: 8 }}>
          NUMISMATIC COLLECTION · SHIA MILLER · @StrategicProce · 2026
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40, marginTop: 50, perspective: "1400px", position: "relative", zIndex: 1 }}>
        {coinData.map((coin) => (
          <div key={coin.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              className={`gcg-scene${flipped[coin.id] ? " gcg-flipped" : ""}`}
              onClick={() => setFlipped((f) => ({ ...f, [coin.id]: !f[coin.id] }))}
            >
              <div className="gcg-flipper">
                <div className="gcg-face gcg-front">
                  <svg viewBox="0 0 260 260" dangerouslySetInnerHTML={{ __html: coin.faceA(coin.id + "A") }} />
                </div>
                <div className="gcg-face gcg-back">
                  <svg viewBox="0 0 260 260" dangerouslySetInnerHTML={{ __html: coin.faceB(coin.id + "B") }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 22, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
              <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "3px" }}>{coin.name}</div>
              <div style={{ fontSize: 10, color: "#556677", letterSpacing: "1.5px", marginTop: 6, textTransform: "uppercase" }}>{coin.sub}</div>
              <div style={{ fontSize: 9, color: "#3a4a5c", marginTop: 10, letterSpacing: "1px" }}>click to flip</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 70, fontFamily: "Arial, sans-serif", fontSize: 10, letterSpacing: "2px", color: "#2a3a4c", position: "relative", zIndex: 1 }}>
        TAP ANY COIN TO FLIP · STRATEGIC PROCESS LAB
      </div>
    </div>
  );
}
