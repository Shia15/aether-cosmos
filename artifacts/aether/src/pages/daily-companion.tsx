import { useState, useEffect, useRef } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const VOID="#05080F";
const S1="#0C1220";
const S2="#121A2C";
const ROSE="#E8637A";
const GOLD="#C4883A";
const FOREST="#3DB58A";
const VIO="#8B5CF6";
const LUNAR="#F0EBE3";
const MUTED="#6B7A8D";
const BDR="rgba(240,235,227,0.07)";
const TEXT="#DDD8D0";
const MONO="'Space Mono',monospace";
const SERIF="'Crimson Pro',Georgia,serif";

type Phase='men'|'fol'|'ovu'|'lut';
type Tab='home'|'cycle'|'meals'|'log'|'plan'|'cosmos';
type CosMode='cycle'|'schumann'|'lunar'|'water';

interface Seg{key:Phase;s:number;e:number;col:string;}
interface CosmoCurve{fn:(x:number)=>number;col:string;}
interface Chip{l:string;c:string;}
interface Meal{time:string;name:string;desc:string;chips:Chip[];}
interface MealPhase{col:string;meals:Meal[];ferment:string;snacks:string;avoid:string;}
interface SFItem{name:string;icon:string;why:string;phases:Phase[];col:string;}
interface PlanItem{t:string;title:string;d:string;col:string;tags:{l:string;c:string;}[];}

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeSegs(len:number):Seg[]{
  return[
    {key:'men',s:0,e:5,col:ROSE},
    {key:'fol',s:5,e:13,col:GOLD},
    {key:'ovu',s:13,e:16,col:LUNAR},
    {key:'lut',s:16,e:len,col:VIO},
  ];
}
function getDayPhase(d:number):Phase{
  if(d<=5) return 'men';
  if(d<=13) return 'fol';
  if(d<=16) return 'ovu';
  return 'lut';
}
function est(d:number,L:number):number{
  if(d<L*.5) return .15+.75*(d/(L*.5))*Math.pow(Math.sin(d/(L*.5)*Math.PI),1.2);
  return .5+.2*(1-(d-L*.5)/(L*.5));
}
function prog(d:number,L:number):number{
  if(d<L*.55) return .08;
  return .08+.8*Math.pow(Math.sin((d-L*.55)/(L*.45)*Math.PI),1.5);
}
function lhC(d:number,L:number):number{
  const pk=L*.52;
  return Math.abs(d-pk)<1.5?.9*Math.exp(-Math.pow(d-pk,2)/1.5):.06+.03*Math.sin(d/L*Math.PI*2);
}
function fshC(d:number,L:number):number{
  return .22*Math.exp(-Math.pow(d-L*.15,2)/4)+.15*Math.exp(-Math.pow(d-L*.52,2)/3)+.05;
}

// ── Phase data ────────────────────────────────────────────────────────────────
const PH:Record<Phase,{name:string;season:string;days:string;col:string;energy:number;icon:string;hormoneState:string;moodMode:string;sleepNeed:string;affirmation:string;insight:string;}>={
  men:{name:'Menstrual',season:'Winter',days:'1-5',col:ROSE,energy:25,icon:'🌑',
    hormoneState:'Low E+P',moodMode:'Inward',sleepNeed:'8h+',
    affirmation:'I am releasing what no longer serves me. Rest is my most radical act.',
    insight:'Your intuition is at its peak. The veil is thinnest during menstruation. Rest is not weakness -- it is the most intelligent biological response to what your body is doing. Honour it completely.'},
  fol:{name:'Follicular',season:'Spring',days:'6-13',col:GOLD,energy:65,icon:'🌱',
    hormoneState:'+Estrogen',moodMode:'Rising',sleepNeed:'7.5h',
    affirmation:'I am planting seeds of new possibility. My body is opening toward light.',
    insight:'Estrogen is climbing and so is your serotonin. This is your window for new ideas, new projects, new beginnings. Your hippocampus is growing new connections -- learn something today.'},
  ovu:{name:'Ovulatory',season:'Summer',days:'14-16',col:LUNAR,energy:95,icon:'☀️',
    hormoneState:'Peak LH',moodMode:'Radiant',sleepNeed:'7h',
    affirmation:'I am fully expressed. I radiate what I am. This is my full power moment.',
    insight:'You are at your biological apex. Highest verbal fluency, strongest leadership presence, peak physical performance. Schedule your most important work, conversations, and movement today.'},
  lut:{name:'Luteal',season:'Autumn',days:'17-28',col:VIO,energy:45,icon:'🍂',
    hormoneState:'+Prog.',moodMode:'Forensic',sleepNeed:'8-9h',
    affirmation:'I am integrating everything I have learned this cycle. What is complete, I release with gratitude.',
    insight:'Luteal clarity is forensic -- you see what is incomplete, what is wrong, what needs fixing. This is your editing and completion phase. Your irritability is a truth signal. Magnesium is critical right now.'},
};

// ── Meals data ────────────────────────────────────────────────────────────────
const MEALS:Record<Phase,MealPhase>={
  men:{col:ROSE,meals:[
    {time:'Morning Brunch · 10am',name:'Iron Moon Bowl',desc:'Lentils + wilted spinach + soft-boiled egg + lemon tahini. Flaxseed for lignans. Kombucha alongside.',chips:[{l:'Iron',c:ROSE},{l:'Mg',c:VIO},{l:'Omega-3',c:FOREST}]},
    {time:'Midday · 1pm',name:'Warming Ginger Soup',desc:'Bone broth or miso + root veg + ginger + turmeric + chickpeas. Anti-inflammatory cascade.',chips:[{l:'Anti-inflam',c:GOLD},{l:'Gut Repair',c:FOREST}]},
    {time:'Evening · 6pm',name:'Omega Nourish Plate',desc:'Wild salmon + roasted sweet potato + cooked dark greens + olive oil. Prostaglandin ratio correction.',chips:[{l:'Omega-3',c:FOREST},{l:'B12',c:GOLD}]},
  ],ferment:'Kombucha x2 daily minimum. Kefir with brunch. Serotonin is lowest this phase -- seed the gut first.',snacks:'Dark chocolate 85%+ + pumpkin seeds · Raspberry leaf tea · Golden milk with ginger',avoid:'Coffee excess · High-sodium foods · Sugar spikes'},
  fol:{col:GOLD,meals:[
    {time:'Morning Brunch · 9:30am',name:'Spring Emergence Bowl',desc:'2 eggs + avocado + fermented sourdough + sauerkraut + blueberries. Choline for brain building.',chips:[{l:'Choline',c:GOLD},{l:'BDNF',c:VIO},{l:'Probiotics',c:FOREST}]},
    {time:'Midday · 1pm',name:'Rainbow Power Salad',desc:'5+ colors: arugula, beet, orange segments, pumpkin seeds, grilled chicken or tempeh, olive oil + ACV.',chips:[{l:'Polyphenols',c:FOREST},{l:'Protein',c:GOLD}]},
    {time:'Evening · 7pm',name:'Cruciferous Detox Dinner',desc:'Broccoli + brown rice + miso-glazed salmon. DIM supports estrogen clearance via liver.',chips:[{l:'DIM',c:FOREST},{l:'DHA',c:GOLD}]},
  ],ferment:'3 sources daily: yogurt + kombucha + kefir or kimchi. Estrogen-microbiome axis is most active.',snacks:'Goji + walnuts · Yogurt + spirulina · Kefir smoothie with berries',avoid:'Refined sugar (FSH disruption) · Alcohol (estrogen metabolism interference)'},
  ovu:{col:LUNAR,meals:[
    {time:'Morning Brunch · 9am',name:'Peak Performance Plate',desc:'Smoked salmon + avocado + poached eggs + sourdough + arugula + citrus squeeze.',chips:[{l:'DHA',c:FOREST},{l:'Vitamin C',c:GOLD},{l:'Folate',c:ROSE}]},
    {time:'Midday · 12:30pm',name:'Living Foods Bowl',desc:'Raw or lightly cooked -- sashimi, massaged kale, fermented veg, sprouted seeds, lemon-tahini.',chips:[{l:'Enzymes',c:FOREST},{l:'Zinc',c:VIO}]},
    {time:'Evening · 6:30pm',name:'Antioxidant Abundance',desc:'Acai base + blueberries + pomegranate + dark leafy greens + grilled fish.',chips:[{l:'Antioxidants',c:ROSE},{l:'Resveratrol',c:VIO}]},
  ],ferment:'Peak absorption window. All 3 fermented sources today. Gut microbiome most receptive -- seed it fully.',snacks:'Fresh fruit + nut butter · Maca + cacao smoothie · Acai bowl with goji',avoid:'Excess alcohol (LH receptor sensitivity)'},
  lut:{col:VIO,meals:[
    {time:'Morning Brunch · 9:30am',name:'Serotonin Foundation',desc:'Oats + banana + pumpkin seeds + almond butter + cinnamon. Complex carbs for tryptophan pathway.',chips:[{l:'Tryptophan',c:VIO},{l:'Magnesium',c:GOLD},{l:'B6',c:FOREST}]},
    {time:'Midday · 1pm',name:'Grounding Root Plate',desc:'Roasted sweet potato + chickpeas + tahini + cooked kale + turmeric. Blood sugar stabilizing.',chips:[{l:'B6',c:VIO},{l:'Complex Carb',c:GOLD}]},
    {time:'Evening · 6pm',name:'Progesterone Support Dinner',desc:'Miso soup + baked salmon + roasted root veg + cooked greens. Zinc + selenium support.',chips:[{l:'Zinc',c:VIO},{l:'Selenium',c:FOREST}]},
  ],ferment:'Gut motility slows -- fermented foods critical. Kombucha + ginger for digestive support.',snacks:'Dark chocolate + pumpkin seeds (Mg) · Cherry juice + magnesium · Chasteberry tea',avoid:'Caffeine after noon · Refined sugar · Alcohol'},
};

// ── Superfoods ────────────────────────────────────────────────────────────────
const SF:SFItem[]=[
  {name:'Kombucha',icon:'🍵',why:'Seeds gut microbiome daily. 90% of serotonin is gut-produced -- this is your mood in a jar.',phases:['men','fol','ovu','lut'],col:FOREST},
  {name:'Kefir',icon:'🥛',why:'Lactobacillus + Bifidobacterium. SCFA production strengthens gut lining = your immune barrier.',phases:['fol','ovu','lut'],col:GOLD},
  {name:'Maca Root',icon:'🌱',why:'HPA axis adaptogen. Modulates cortisol, supports progesterone. Most critical in luteal + menstrual.',phases:['men','lut'],col:VIO},
  {name:'Goji Berry',icon:'🔴',why:'Zeaxanthin + polysaccharides. Mitochondrial antioxidant loading. Peak in follicular + ovulatory.',phases:['fol','ovu'],col:ROSE},
  {name:'Kimchi',icon:'🥒',why:'Lactic acid fermentation. Electrolytes + Lactobacillus. Bitter-fermented = double signal.',phases:['men','fol','ovu','lut'],col:FOREST},
  {name:'Ginger',icon:'🫚',why:'Gingerols inhibit NF-kB. Reduces prostaglandin cramping. Critical in menstrual + luteal.',phases:['men','lut'],col:GOLD},
  {name:'Spirulina',icon:'💚',why:'Complete protein + iron + B12. Post-menstrual iron repletion. Chlorophyll = liver support.',phases:['men','fol'],col:FOREST},
  {name:'Dark Choc',icon:'🍫',why:'Magnesium + flavonoids. BDNF upregulation. Luteal Mg emergency. Best at 85%+.',phases:['men','fol','lut'],col:VIO},
];

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS:Record<Phase,PlanItem[]>={
  men:[
    {t:'8:30a',title:'Slow Wake',d:'No alarm if possible. Let cortisol rise naturally. Gentle light near a window.',col:ROSE,tags:[{l:'🌑 Rest',c:ROSE}]},
    {t:'9:00a',title:'Warm Mineral Morning',d:'Warm water + sea salt + lemon + ginger. Raspberry leaf tea. Mineral preparation.',col:ROSE,tags:[{l:'💧 Hydrate',c:FOREST}]},
    {t:'10:00a',title:'Iron Moon Brunch',d:'Lentils + dark greens + egg + kombucha. Iron repletion with vitamin C co-factor.',col:ROSE,tags:[{l:'🍽 Iron',c:GOLD}]},
    {t:'11:30a',title:'Gentle Movement',d:'10-20 min slow yoga or walking. Blood flow without depletion.',col:ROSE,tags:[{l:'🧘 Yin',c:VIO}]},
    {t:'1:00p',title:'Visionary Deep Work',d:'Menstrual = highest right-brain access. Journaling, creative synthesis, big-picture thinking.',col:ROSE,tags:[{l:'✨ Intuition',c:ROSE}]},
    {t:'3:00p',title:'Magnesium Snack',d:'Dark chocolate 85%+ + pumpkin seeds. Blood sugar stability critical.',col:ROSE,tags:[{l:'🍫 Mg',c:GOLD}]},
    {t:'6:00p',title:'Warming Dinner',d:'Cooked foods only. Omega-3 fish or quality protein. Ginger + turmeric anti-inflammatory.',col:ROSE,tags:[{l:'🫚 Anti-inflam',c:FOREST}]},
    {t:'9:30p',title:'Sleep',d:'8+ hours. Uterine repair. Prostaglandin clearance. Complete darkness.',col:ROSE,tags:[{l:'🌙 8hrs+',c:VIO}]},
  ],
  fol:[
    {t:'8:00a',title:'Energy Wake + Light',d:'Morning sun 10 min. Cortisol building with estrogen. Body temperature higher, mind sharper.',col:GOLD,tags:[{l:'☀️ Rising',c:GOLD}]},
    {t:'9:00a',title:'Activated Brunch',d:'Eggs + greens + fermented food. Berries for BDNF. Spirulina if post-menstrual iron low.',col:GOLD,tags:[{l:'🌱 Build',c:GOLD}]},
    {t:'10:30a',title:'Peak Focus Work',d:'Verbal and analytical intelligence climbing. Complex problems, writing, strategy, new learning.',col:GOLD,tags:[{l:'🧠 Sharp',c:GOLD}]},
    {t:'12:30p',title:'Strength Training',d:'Estrogen protects muscle tissue. Performance-building window. Push appropriately.',col:GOLD,tags:[{l:'💪 Build',c:FOREST}]},
    {t:'2:00p',title:'Rainbow Lunch',d:'5+ colors. Cruciferous for estrogen detox. Legumes for prebiotic fiber.',col:GOLD,tags:[{l:'🌈 Rainbow',c:FOREST}]},
    {t:'4:00p',title:'Creative + Social',d:'Charm and communication rising. Difficult conversations, new initiatives.',col:GOLD,tags:[{l:'💫 Magnetic',c:GOLD}]},
    {t:'7:00p',title:'Light Dinner',d:'Lighter than menstrual. Third fermented serving. Bitter greens.',col:GOLD,tags:[{l:'🥗 Light',c:FOREST}]},
    {t:'10:00p',title:'Sleep',d:'7.5-8hrs. Energy is higher -- wind-down takes longer. Journaling recommended.',col:GOLD,tags:[{l:'🌙 7.5h',c:VIO}]},
  ],
  ovu:[
    {t:'8:00a',title:'Solar Rise',d:'Morning sun + cold splash. Cortisol + estrogen synergy. Highest energy window of the month.',col:LUNAR,tags:[{l:'☀️ Peak',c:GOLD}]},
    {t:'9:00a',title:'Peak Performance Brunch',d:'Smoked salmon + avocado + poached eggs + arugula. DHA + folate + vitamin C at full power.',col:LUNAR,tags:[{l:'🍽 Power',c:FOREST}]},
    {t:'10:00a',title:'Most Important Work',d:'Verbal fluency and analytical intelligence at annual peak. Present, negotiate, create, lead.',col:LUNAR,tags:[{l:'✨ Apex',c:GOLD}]},
    {t:'12:30p',title:'Hard Conversations',d:'Communication at peak. Your presence is most magnetic. Difficult meetings, pitches, interviews.',col:LUNAR,tags:[{l:'💬 Magnetic',c:GOLD}]},
    {t:'2:00p',title:'High Intensity Training',d:'Estrogen protects muscle at peak. HIIT, strength, sprint work. Performance PR window.',col:LUNAR,tags:[{l:'💪 HIIT',c:FOREST}]},
    {t:'4:30p',title:'Living Foods Lunch',d:'Raw or lightly cooked: sashimi, massaged kale, sprouted seeds, fermented veg.',col:LUNAR,tags:[{l:'🥗 Raw',c:FOREST}]},
    {t:'7:00p',title:'Antioxidant Dinner',d:'Acai, blueberries, pomegranate, dark greens, grilled fish. Protect mitochondria at full output.',col:LUNAR,tags:[{l:'🫐 Protect',c:VIO}]},
    {t:'10:00p',title:'Sleep',d:'7 hours minimum. Recovery is compressed -- efficiency is high. Deep darkness.',col:LUNAR,tags:[{l:'🌙 7h',c:VIO}]},
  ],
  lut:[
    {t:'8:30a',title:'Gentle Rise',d:'No rush. Progesterone makes mornings heavier. Warm water + maca + ginger. Let cortisol climb slowly.',col:VIO,tags:[{l:'🍂 Ease',c:VIO}]},
    {t:'9:30a',title:'Serotonin Foundation',d:'Oats + banana + pumpkin seeds + almond butter. Complex carbs for tryptophan. Do not skip this.',col:VIO,tags:[{l:'🥣 Serotonin',c:GOLD}]},
    {t:'10:30a',title:'Completion Work',d:'Luteal clarity is forensic. Edit, complete unfinished work, review decisions. Not new starts.',col:VIO,tags:[{l:'✏️ Forensic',c:VIO}]},
    {t:'1:00p',title:'Grounding Root Lunch',d:'Sweet potato + chickpeas + tahini + cooked kale + turmeric. Blood sugar stable = mood stable.',col:VIO,tags:[{l:'🍠 Ground',c:GOLD}]},
    {t:'2:30p',title:'Moderate Movement',d:'Pilates, cycling, swimming, hiking. Avoid HIIT. Progesterone supports connective tissue -- load gently.',col:VIO,tags:[{l:'🧘 Moderate',c:FOREST}]},
    {t:'4:30p',title:'Magnesium Snack',d:'Dark chocolate 85%+ + pumpkin seeds. Magnesium depletion in luteal = cramping, anxiety, insomnia.',col:VIO,tags:[{l:'🍫 Mg',c:GOLD}]},
    {t:'6:00p',title:'Progesterone Dinner',d:'Miso soup + baked salmon + roasted root veg + cooked greens. Zinc + selenium + B6.',col:VIO,tags:[{l:'🍽 Support',c:FOREST}]},
    {t:'9:30p',title:'Sleep',d:'8-9 hours. Your most important sleep of the cycle. Uterine preparation begins. Complete darkness.',col:VIO,tags:[{l:'🌙 8-9h',c:VIO}]},
  ],
};

// ── Cosmos resonance items ────────────────────────────────────────────────────
const RESONANCE=[
  {icon:'☀️',name:'Sun · Circadian Anchor',freq:'528 Hz · DNA repair frequency',desc:'10 min morning sunlight before 10am anchors cortisol, sets melatonin timing, and regulates the menstrual clock via the suprachiasmatic nucleus.'},
  {icon:'🌕',name:'Moon · Cycle Mirror',freq:'29.5 day orbital cycle',desc:'New moon and menstruation. Full moon and ovulation. Ancestral entrainment. Your 27-day cycle is the moon expressed in biology.'},
  {icon:'🌊',name:'Ocean · Iodine Origin',freq:'30,000x iodine in seaweed',desc:'Seaweed -- iodine -- T3/T4 -- mitochondria -- ATP -- neural coherence -- cycle energy. Your body runs on ocean mineral chemistry.'},
  {icon:'🌍',name:'Schumann · Earth Heartbeat',freq:'7.83 Hz · alpha brainwave match',desc:'Grounding (bare feet on earth) measurably reduces cortisol, inflammation, and improves sleep architecture -- all modulating cycle regularity.'},
  {icon:'🎵',name:'Sound · Vagus Activation',freq:'432 Hz · cellular resonance',desc:'Humming, singing, chanting activate the vagus nerve -- throat to gut to uterus. Reduces inflammatory tone. Supports hormonal coherence.'},
  {icon:'🌬️',name:'Air · Breath Architecture',freq:'Nitric oxide · nasal breathing',desc:'Nasal breathing produces nitric oxide -- vasodilator improving uterine blood flow. Extended exhale in luteal directly modulates prostaglandin cramping.'},
];

// ── Home particle canvas ──────────────────────────────────────────────────────
function HomeCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    let W=0,H=0;
    const pts=Array.from({length:28},()=>({
      x:Math.random()*1200,y:Math.random()*500,
      vx:(Math.random()-.5)*.14,vy:(Math.random()-.5)*.14,
      r:Math.random()*1.3+.3,
      col:[ROSE,GOLD,VIO,FOREST][Math.floor(Math.random()*4)],
      a:Math.random()*.16+.04,
    }));
    function resize(){W=c.width=c.offsetWidth||390;H=c.height=c.offsetHeight||220;}
    resize();
    window.addEventListener('resize',resize);
    function tick(){
      if(!W||!H){rafRef.current=requestAnimationFrame(tick);return;}
      ctx.clearRect(0,0,W,H);
      for(const p of pts){
        const sx=((p.x%W)+W)%W,sy=((p.y%H)+H)%H;
        if(p.r>0.01){
          ctx.beginPath();ctx.arc(sx,sy,p.r,0,Math.PI*2);
          ctx.fillStyle=p.col;ctx.globalAlpha=p.a;ctx.fill();ctx.globalAlpha=1;
        }
        p.x+=p.vx;p.y+=p.vy;
      }
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener('resize',resize);};
  },[]);
  return<canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.5}}/>;
}

// ── Phase ring canvas ─────────────────────────────────────────────────────────
function PhaseRing({cDay,cLen,cPhase}:{cDay:number;cLen:number;cPhase:Phase}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  const st=useRef({cDay,cLen,cPhase});
  useEffect(()=>{st.current={cDay,cLen,cPhase};},[cDay,cLen,cPhase]);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    function draw(){
      const{cDay:day,cLen:len,cPhase:phase}=st.current;
      const W=340,H=116,cx=W/2,cy=H/2,R=46;
      const segs=makeSegs(len);
      ctx.clearRect(0,0,W,H);
      segs.forEach(seg=>{
        const sa=(seg.s/len)*Math.PI*2-Math.PI/2;
        const ea=(seg.e/len)*Math.PI*2-Math.PI/2;
        const act=seg.key===phase;
        if(isFinite(sa)&&isFinite(ea)){
          ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,sa,ea);ctx.closePath();
          ctx.fillStyle=seg.col+(act?'28':'0E');ctx.fill();
          ctx.strokeStyle=seg.col+(act?'99':'22');ctx.lineWidth=act?2:1;ctx.stroke();
          const ma=(sa+ea)/2;
          ctx.font=(act?'bold ':'')+'7px '+MONO;
          ctx.fillStyle=seg.col+(act?'FF':'55');
          ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(seg.key.toUpperCase(),cx+Math.cos(ma)*R*.7,cy+Math.sin(ma)*R*.7);
        }
      });
      for(let d=1;d<=len;d++){
        const a=(d/len)*Math.PI*2-Math.PI/2;
        const isT=d===day;
        const seg=segs.find(s=>d>s.s&&d<=s.e);
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(a)*(R-4),cy+Math.sin(a)*(R-4));
        ctx.lineTo(cx+Math.cos(a)*(R+3),cy+Math.sin(a)*(R+3));
        ctx.strokeStyle=(seg?.col||'#666')+(isT?'FF':'28');
        ctx.lineWidth=isT?2:1;ctx.stroke();
        if(isT){
          ctx.beginPath();ctx.arc(cx+Math.cos(a)*(R+8),cy+Math.sin(a)*(R+8),3,0,Math.PI*2);
          ctx.fillStyle=seg?.col||'#fff';ctx.fill();
        }
      }
      ctx.beginPath();ctx.arc(cx,cy,7,0,Math.PI*2);
      ctx.fillStyle=PH[phase].col+'50';ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,3.5,0,Math.PI*2);
      ctx.fillStyle=PH[phase].col;ctx.fill();
      rafRef.current=requestAnimationFrame(draw);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return<canvas ref={ref} width={340} height={116} style={{display:'block',width:'100%',maxWidth:340,margin:'0 auto'}}/>;
}

// ── Hormone canvas ────────────────────────────────────────────────────────────
function HormoneCanvas({cDay,cLen,hasCStart}:{cDay:number;cLen:number;hasCStart:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  const tRef=useRef(0);
  const st=useRef({cDay,cLen,hasCStart});
  useEffect(()=>{st.current={cDay,cLen,hasCStart};},[cDay,cLen,hasCStart]);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    function draw(){
      const{cDay:day,cLen:len,hasCStart:hc}=st.current;
      const W=c.offsetWidth||340;
      c.width=W;c.height=150;
      ctx.fillStyle=S2;ctx.fillRect(0,0,W,150);
      tRef.current+=.015;
      const t=tRef.current;
      makeSegs(len).forEach(seg=>{
        const x1=(seg.s/len)*W,x2=(seg.e/len)*W;
        ctx.fillStyle=seg.col+'0A';ctx.fillRect(x1,0,x2-x1,150);
      });
      if(hc){
        const tx=(day/len)*W;
        ctx.strokeStyle='rgba(232,99,122,.5)';ctx.lineWidth=1.5;
        ctx.setLineDash([3,3]);ctx.beginPath();
        ctx.moveTo(tx,0);ctx.lineTo(tx,150);ctx.stroke();
        ctx.setLineDash([]);
      }
      const curves:[((d:number,L:number)=>number),string][]=[
        [est,ROSE],[prog,VIO],[lhC,GOLD],[fshC,FOREST]
      ];
      curves.forEach(([fn,col])=>{
        ctx.beginPath();
        for(let i=0;i<W;i++){
          const d=(i/W)*len;
          const n=.015*(Math.sin(t*2+d*.3)+Math.sin(t*1.1+d*.5)*.4);
          const y=140-(fn(d,len)+n)*120;
          i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);
        }
        ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.globalAlpha=.85;ctx.stroke();ctx.globalAlpha=1;
      });
      rafRef.current=requestAnimationFrame(draw);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return<canvas ref={ref} style={{display:'block',width:'100%',height:150}}/>;
}

// ── Cosmos waveform canvas ────────────────────────────────────────────────────
function CosmosCanvas({cLen,mode}:{cLen:number;mode:CosMode}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  const tRef=useRef(0);
  const st=useRef({cLen,mode});
  useEffect(()=>{st.current={cLen,mode};},[cLen,mode]);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    function draw(){
      const{cLen:len,mode:m}=st.current;
      const W=c.offsetWidth||340;
      c.width=W;c.height=170;
      ctx.fillStyle=S2;ctx.fillRect(0,0,W,170);
      tRef.current+=.013;
      const t=tRef.current;
      const cfgs:Record<CosMode,CosmoCurve[]>={
        cycle:[{fn:x=>est(x*len,len),col:ROSE},{fn:x=>prog(x*len,len),col:VIO}],
        schumann:[{fn:x=>(.5+.4*Math.sin(x*len*7.83*.12)),col:FOREST},{fn:x=>(.5+.3*Math.sin(x*len*14.3*.08)),col:GOLD}],
        lunar:[{fn:x=>(.5+.45*Math.sin(x*Math.PI*2)),col:LUNAR},{fn:x=>est(x*len,len),col:ROSE}],
        water:[{fn:x=>(.5+.4*Math.sin(x*len*.8+t*.5)),col:'#00E5CC'},{fn:x=>(.4+.35*Math.sin(x*len*1.3+t*.3)),col:VIO},{fn:x=>(.6+.3*Math.sin(x*len*.5+t*.7)),col:FOREST}],
      };
      (cfgs[m]||cfgs.cycle).forEach(cv=>{
        ctx.beginPath();
        for(let i=0;i<W;i++){
          const x=i/W;
          const n=.018*(Math.sin(t*1.4+x*10)+Math.sin(t*.7+x*7)*.4);
          const y=160-(cv.fn(x)+n)*130;
          i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);
        }
        ctx.strokeStyle=cv.col;ctx.lineWidth=2;ctx.globalAlpha=.85;ctx.stroke();ctx.globalAlpha=1;
      });
      rafRef.current=requestAnimationFrame(draw);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return<canvas ref={ref} style={{display:'block',width:'100%',height:170}}/>;
}

// ── Shared micro-components ───────────────────────────────────────────────────
function Tag({l,c}:{l:string;c:string}){
  return(
    <span style={{display:'inline-block',padding:'2px 7px',borderRadius:6,fontSize:'.64rem',fontFamily:MONO,background:c+'18',color:c,border:`1px solid ${c}28`}}>{l}</span>
  );
}
function ChipBadge({l,c}:{l:string;c:string}){
  return(
    <span style={{display:'inline-block',padding:'2px 8px',borderRadius:8,fontFamily:MONO,fontSize:'7px',letterSpacing:'.06em',background:c+'18',color:c,border:`1px solid ${c}30`}}>{l}</span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DailyCompanion(){
  const [tab,setTab]=useState<Tab>('home');
  const [cStart,setCStart]=useState<Date|null>(null);
  const [cLen,setCLen]=useState(27);
  const [cDay,setCDay]=useState(9);
  const [cPhase,setCPhase]=useState<Phase>('fol');
  const [dateStr,setDateStr]=useState('');
  const [lenStr,setLenStr]=useState('27');
  const [mealPhase,setMealPhase]=useState<Phase>('men');
  const [dayPhase,setDayPhase]=useState<Phase>('men');
  const [sfSel,setSfSel]=useState<number|null>(null);
  const [slE,setSlE]=useState(6);
  const [slC,setSlC]=useState(6);
  const [slS,setSlS]=useState(7);
  const [slG,setSlG]=useState(7);
  const [moods,setMoods]=useState<string[]>([]);
  const [flowVal,setFlowVal]=useState(0);
  const [bodyReading,setBodyReading]=useState('');
  const [cosMode,setCosMode]=useState<CosMode>('cycle');
  const [wcVal,setWcVal]=useState(0);
  const wcStarted=useRef(false);

  useEffect(()=>{
    const d=new Date(); d.setDate(d.getDate()-8);
    const ds=d.toISOString().split('T')[0];
    setDateStr(ds);
    const diff=Math.floor((Date.now()-d.getTime())/86400000);
    const day=((diff%27)+27)%27+1;
    const phase=getDayPhase(day);
    setCStart(d);setCDay(day);setCPhase(phase);setMealPhase(phase);setDayPhase(phase);
  },[]);

  useEffect(()=>{
    if(tab!=='cosmos'||wcStarted.current) return;
    wcStarted.current=true;
    const T=1000000000;
    const start=performance.now();
    const DUR=3200;
    let raf=0;
    let interval=0;
    function tick(){
      const p=Math.min((performance.now()-start)/DUR,1);
      setWcVal(Math.round((1-Math.pow(1-p,4))*T));
      if(p<1) raf=requestAnimationFrame(tick);
      else interval=window.setInterval(()=>setWcVal(T+Math.round((Math.random()-.5)*12000000)),320);
    }
    raf=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(raf);clearInterval(interval);};
  },[tab]);

  function syncCycle(){
    if(!dateStr) return;
    const start=new Date(dateStr);
    const l=Math.max(21,Math.min(35,parseInt(lenStr)||27));
    const diff=Math.floor((Date.now()-start.getTime())/86400000);
    const day=((diff%l)+l)%l+1;
    const phase=getDayPhase(day);
    setCStart(start);setCLen(l);setCDay(day);setCPhase(phase);
    setMealPhase(phase);setDayPhase(phase);setLenStr(String(l));
  }

  function toggleMood(m:string){
    setMoods(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m]);
  }

  function runLog(){
    const ph=PH[cPhase];
    const ins:string[]=[];
    if(slE<5) ins.push('Low energy ('+slE+'/10) in '+ph.name+' phase -- check iodine, selenium, and magnesium. T3 insufficiency is the most common cause of phase-amplified fatigue.');
    if(slC<5) ins.push('Mental fog ('+slC+'/10) -- often reflects gut dysbiosis or blood sugar instability. Increase fermented foods, remove refined sugar for 72 hours.');
    if(slS<7) ins.push('Sleep ('+slS+'/10) below threshold -- magnesium glycinate before bed, complete darkness, no screens from 9pm.');
    if(slG<6) ins.push('Gut discomfort ('+slG+'/10) -- bone broth + fermented foods + remove emulsifiers for 5 days.');
    if(moods.includes('Anxious')) ins.push('Anxiety in '+ph.name+': likely magnesium depletion or progesterone shift. Ashwagandha, magnesium, extended-exhale breathing.');
    if(moods.includes('Irritable')) ins.push('Irritability is a truth signal -- the body is flagging something out of alignment. In luteal: often B6 deficiency. Other phases: sleep debt or gut dysbiosis.');
    if(moods.some(m=>m==='Creative'||m==='Visionary')) ins.push('Creative and visionary states are most potent in menstrual and late follicular. If you feel this now, act on it immediately.');
    if(ins.length===0) ins.push('Your readings are coherent for '+ph.name+' phase. Energy '+slE+'/10, Clarity '+slC+'/10. Continue your protocol and log again in 3 days.');
    const parts=[ph.icon+' '+ph.name+' -- Day '+cDay,''].concat(ins.map(i=>'-- '+i));
    if(moods.length) parts.push('','Emotional weather: '+moods.join(', '));
    if(flowVal>0) parts.push('Flow: '+['None','Spotting','Light','Medium','Heavy'][flowVal]);
    setBodyReading(parts.join('\n'));
  }

  const ph=PH[cPhase];
  const h=new Date().getHours();
  const greeting=h<12?'Good morning':h<17?'Good afternoon':'Good evening';

  const NAV:[Tab,string,string][]=[
    ['home','🌑','Today'],
    ['cycle','🔄','Cycle'],
    ['meals','🥗','Nourish'],
    ['log','📓','Log'],
    ['plan','📅','Plan'],
    ['cosmos','🌊','Cosmos'],
  ];

  const card={background:S1,border:`1px solid ${BDR}`,borderRadius:14,padding:16,marginBottom:12};
  const lbl={fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase' as const,color:MUTED,marginBottom:10};
  const inp={width:'100%',padding:'10px 13px',borderRadius:10,border:`1px solid ${BDR}`,background:S2,color:LUNAR,fontFamily:SERIF,fontSize:'.88rem',outline:'none',marginBottom:10,boxSizing:'border-box' as const};

  return(
    <div style={{background:VOID,minHeight:'100vh',display:'flex',flexDirection:'column',fontFamily:'system-ui,sans-serif',fontSize:15,lineHeight:1.65,color:TEXT,maxWidth:480,margin:'0 auto'}}>
      <div style={{flex:1,paddingBottom:84,overflowX:'hidden'}}>

        {/* ── HOME ─────────────────────────────────────────────────── */}
        {tab==='home'&&(
          <div>
            <div style={{position:'relative',overflow:'hidden',padding:'48px 22px 24px',minHeight:220,background:`linear-gradient(180deg,${S2} 0%,${VOID} 100%)`}}>
              <HomeCanvas/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontFamily:SERIF,fontSize:'.95rem',fontStyle:'italic',color:MUTED,marginBottom:3}}>{greeting}</div>
                <div style={{fontFamily:SERIF,fontSize:'2.5rem',fontWeight:300,lineHeight:1,color:ph.col}}>{ph.name}</div>
                <div style={{fontFamily:MONO,fontSize:'.68rem',letterSpacing:'.12em',color:MUTED,marginTop:2}}>Day {cDay} · {ph.season} Season · {cLen}-day cycle</div>
                <div style={{fontFamily:SERIF,fontSize:'.9rem',fontStyle:'italic',color:TEXT,marginTop:10,lineHeight:1.5,opacity:.85}}>"{ph.affirmation}"</div>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'center',padding:'6px 22px 14px'}}>
              <PhaseRing cDay={cDay} cLen={cLen} cPhase={cPhase}/>
            </div>
            <div style={{display:'flex',gap:8,padding:'0 22px',marginBottom:14}}>
              {([['energy',`${ph.energy}%`,ph.col],['hormones',ph.hormoneState,VIO],['mood',ph.moodMode,MUTED],['sleep',ph.sleepNeed,FOREST]] as [string,string,string][]).map(([lbl,val,col])=>(
                <div key={lbl} style={{flex:1,background:S1,border:`1px solid ${BDR}`,borderRadius:11,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontFamily:MONO,fontSize:'1.05rem',fontWeight:700,marginBottom:1,color:col}}>{val}</div>
                  <div style={{fontFamily:MONO,fontSize:'6.5px',letterSpacing:'.12em',textTransform:'uppercase',color:MUTED}}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:6,overflowX:'auto',padding:'0 22px 2px',marginBottom:14}}>
              {([["📅 Today's Plan",'plan'],[' 🥗 Phase Meals','meals'],['📓 Log Today','log'],['🌊 Planetary','cosmos']] as [string,Tab][]).map(([label,t])=>(
                <button key={t} onClick={()=>setTab(t)} style={{flexShrink:0,padding:'6px 12px',borderRadius:18,border:`1px solid ${BDR}`,background:S1,color:t==='cosmos'?VIO:MUTED,fontSize:'.73rem',cursor:'pointer'}}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{padding:'0 22px',marginBottom:16}}>
              <div style={card}>
                <div style={lbl}>Today's AETHER Insight</div>
                <div style={{fontFamily:SERIF,fontSize:'.95rem',fontStyle:'italic',color:TEXT,lineHeight:1.6}}>{ph.insight}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── CYCLE ────────────────────────────────────────────────── */}
        {tab==='cycle'&&(
          <div>
            <div style={{padding:'50px 22px 18px'}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.2em',textTransform:'uppercase',color:ROSE,marginBottom:8}}>Your Cycle</div>
              <div style={{fontFamily:SERIF,fontSize:'1.95rem',fontWeight:300,lineHeight:1.1}}>Your body's <em style={{color:ROSE}}>inner calendar</em></div>
              <div style={{fontSize:'.8rem',color:MUTED,marginTop:6,lineHeight:1.5}}>Set your cycle start date. Phase, meals, energy, and daily rhythm self-compute.</div>
            </div>
            <div style={{padding:'0 22px',marginBottom:16}}>
              <label style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.14em',textTransform:'uppercase',color:MUTED,display:'block',marginBottom:4}}>Last Period Start Date</label>
              <input type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)} style={inp}/>
              <label style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.14em',textTransform:'uppercase',color:MUTED,display:'block',marginBottom:4}}>Cycle Length (days)</label>
              <input type="number" value={lenStr} onChange={e=>setLenStr(e.target.value)} min={21} max={35} style={inp}/>
              <button onClick={syncCycle} style={{width:'100%',padding:12,borderRadius:11,background:`linear-gradient(135deg,rgba(232,99,122,.18),rgba(139,92,246,.12))`,border:`1px solid ${ROSE}`,color:ROSE,fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase',cursor:'pointer',marginBottom:14}}>
                Sync My Cycle
              </button>
            </div>
            <div style={{padding:'0 22px',marginBottom:16}}>
              <div style={{background:S1,border:`1px solid ${BDR}`,borderRadius:13,overflow:'hidden',marginBottom:14}}>
                <div style={{padding:'11px 15px',borderBottom:`1px solid ${BDR}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.15em',textTransform:'uppercase',color:ROSE}}>Hormonal Waveform · Full Cycle</span>
                  <span style={{fontFamily:MONO,fontSize:'9px',color:MUTED}}>Day {cDay}</span>
                </div>
                <HormoneCanvas cDay={cDay} cLen={cLen} hasCStart={cStart!==null}/>
                <div style={{padding:'8px 15px',display:'flex',gap:10,flexWrap:'wrap',borderTop:`1px solid ${BDR}`}}>
                  {([['Estrogen',ROSE],['Progesterone',VIO],['LH',GOLD],['FSH',FOREST]] as [string,string][]).map(([name,col])=>(
                    <div key={name} style={{display:'flex',alignItems:'center',gap:4,fontSize:'.65rem',color:MUTED,fontFamily:MONO}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:col}}/>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
              {(Object.entries(PH) as [Phase,typeof PH[Phase]][]).map(([k,p])=>(
                <div key={k} style={{borderRadius:13,padding:15,marginBottom:9,border:`1px solid ${k===cPhase?p.col+'50':BDR}`,background:k===cPhase?p.col+'06':'transparent',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:p.col}}/>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                    <div style={{fontFamily:SERIF,fontSize:'1.1rem',color:p.col}}>{p.icon} {p.name}</div>
                    <span style={{fontFamily:MONO,fontSize:'7px',letterSpacing:'.08em',textTransform:'uppercase',padding:'2px 7px',borderRadius:7,background:p.col+'18',color:p.col,border:`1px solid ${p.col}30`}}>Days {p.days}</span>
                  </div>
                  <div style={{fontFamily:MONO,fontSize:'7px',letterSpacing:'.1em',textTransform:'uppercase',color:MUTED,marginBottom:5}}>{p.season} · {p.energy}% Energy</div>
                  <div style={{fontSize:'.76rem',color:MUTED,lineHeight:1.45}}>{p.hormoneState} · {p.moodMode} · Sleep {p.sleepNeed}</div>
                  <div style={{marginTop:9,height:3,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:2,width:`${p.energy}%`,background:p.col,transition:'width 1.2s cubic-bezier(.16,1,.3,1)'}}/>
                  </div>
                  <div style={{marginTop:8,fontFamily:SERIF,fontSize:'.82rem',fontStyle:'italic',color:p.col,opacity:.8}}>"{p.affirmation}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MEALS ────────────────────────────────────────────────── */}
        {tab==='meals'&&(
          <div>
            <div style={{padding:'50px 22px 18px'}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.2em',textTransform:'uppercase',color:ROSE,marginBottom:8}}>Phase Nutrition</div>
              <div style={{fontFamily:SERIF,fontSize:'1.95rem',fontWeight:300,lineHeight:1.1}}>Food as <em style={{color:ROSE}}>hormonal signal</em></div>
              <div style={{fontSize:'.8rem',color:MUTED,marginTop:6}}>Meals, fermentation, and root magic -- precisely timed to your cycle phase.</div>
            </div>
            <div style={{display:'flex',gap:5,overflowX:'auto',padding:'0 22px',marginBottom:14}}>
              {(Object.entries(PH) as [Phase,typeof PH[Phase]][]).map(([k,p])=>(
                <button key={k} onClick={()=>setMealPhase(k)} style={{flexShrink:0,padding:'5px 12px',borderRadius:14,border:`1px solid ${mealPhase===k?p.col:BDR}`,background:mealPhase===k?p.col+'12':'transparent',color:mealPhase===k?p.col:MUTED,fontFamily:MONO,fontSize:'7px',letterSpacing:'.09em',textTransform:'uppercase',cursor:'pointer'}}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
            {MEALS[mealPhase].meals.map(m=>(
              <div key={m.name} style={{padding:'0 22px',marginBottom:12}}>
                <div style={{fontFamily:MONO,fontSize:'7.5px',letterSpacing:'.14em',textTransform:'uppercase',color:MUTED,marginBottom:5}}>{m.time}</div>
                <div style={{background:S1,border:`1px solid ${MEALS[mealPhase].col}25`,borderRadius:12,padding:14}}>
                  <div style={{fontFamily:SERIF,fontSize:'1.15rem',color:LUNAR,marginBottom:4}}>{m.name}</div>
                  <div style={{fontSize:'.76rem',color:MUTED,marginBottom:9,lineHeight:1.5}}>{m.desc}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {m.chips.map(c=><ChipBadge key={c.l} l={c.l} c={c.c}/>)}
                  </div>
                </div>
              </div>
            ))}
            <div style={{margin:'0 22px 14px',background:`linear-gradient(135deg,rgba(61,181,138,.09),rgba(196,136,58,.05))`,border:'1px solid rgba(61,181,138,.18)',borderRadius:11,padding:'12px 15px'}}>
              <div style={{fontFamily:MONO,fontSize:'7.5px',letterSpacing:'.14em',textTransform:'uppercase',color:FOREST,marginBottom:4}}>Fermentation Protocol</div>
              <div style={{fontSize:'.76rem',color:MUTED,lineHeight:1.45}}>{MEALS[mealPhase].ferment}</div>
            </div>
            <div style={{padding:'0 22px',marginBottom:14}}>
              <div style={{...card,borderColor:MEALS[mealPhase].col+'20'}}>
                <div style={lbl}>Snacks + Extras</div>
                <div style={{fontSize:'.75rem',color:MUTED,marginBottom:8}}>{MEALS[mealPhase].snacks}</div>
                <div style={{fontSize:'.75rem',color:MUTED}}><strong style={{color:ROSE}}>Avoid:</strong> {MEALS[mealPhase].avoid}</div>
              </div>
            </div>
            <div style={{padding:'0 22px 8px'}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase',color:MUTED,marginBottom:9}}>Root Magic · Superfood Stack</div>
            </div>
            <div style={{display:'flex',gap:7,overflowX:'auto',padding:'0 22px',marginBottom:8}}>
              {SF.map((s,i)=>(
                <div key={s.name} onClick={()=>setSfSel(sfSel===i?null:i)} style={{flexShrink:0,background:S1,border:`1px solid ${sfSel===i?s.col:BDR}`,borderRadius:18,padding:'7px 12px',display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                  <span style={{fontSize:18}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:'.7rem',fontWeight:500,color:TEXT}}>{s.name}</div>
                    <div style={{fontFamily:MONO,fontSize:'6px',letterSpacing:'.08em',color:MUTED,textTransform:'uppercase'}}>{s.phases.map(p=>PH[p].icon).join('')}</div>
                  </div>
                </div>
              ))}
            </div>
            {sfSel!==null&&(
              <div style={{padding:'0 22px 14px'}}>
                <div style={{...card,borderColor:SF[sfSel].col+'35'}}>
                  <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:7}}>
                    <span style={{fontSize:22}}>{SF[sfSel].icon}</span>
                    <div>
                      <div style={{fontWeight:600,color:TEXT,fontSize:'.85rem'}}>{SF[sfSel].name}</div>
                      <div style={{fontFamily:MONO,fontSize:'7px',color:MUTED,textTransform:'uppercase',letterSpacing:'.1em'}}>Best: {SF[sfSel].phases.map(p=>PH[p].name).join(' · ')}</div>
                    </div>
                  </div>
                  <div style={{fontSize:'.76rem',color:MUTED,lineHeight:1.5}}>{SF[sfSel].why}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOG ──────────────────────────────────────────────────── */}
        {tab==='log'&&(
          <div>
            <div style={{padding:'50px 22px 18px'}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.2em',textTransform:'uppercase',color:ROSE,marginBottom:8}}>Body Intelligence Log</div>
              <div style={{fontFamily:SERIF,fontSize:'1.95rem',fontWeight:300,lineHeight:1.1}}>How are you <em style={{color:ROSE}}>today?</em></div>
              <div style={{fontSize:'.8rem',color:MUTED,marginTop:6}}>Log your energy, mood, and flow. The system returns a personalized hormonal insight.</div>
            </div>
            <div style={{padding:'0 22px',marginBottom:14}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase',color:MUTED,marginBottom:9}}>Energy & Physical</div>
              {([['Physical Energy',slE,setSlE],['Mental Clarity',slC,setSlC],['Sleep Quality',slS,setSlS],['Gut Comfort',slG,setSlG]] as [string,number,(v:number)=>void][]).map(([name,val,setter])=>(
                <div key={name} style={{marginBottom:11}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:'.78rem',color:TEXT}}>{name}</span>
                    <span style={{fontFamily:MONO,fontSize:'.78rem',color:ROSE}}>{val}</span>
                  </div>
                  <input type="range" min={1} max={10} value={val} onChange={e=>setter(+e.target.value)} style={{WebkitAppearance:'none',width:'100%',height:4,borderRadius:2,background:'rgba(255,255,255,.08)',outline:'none',cursor:'pointer'}}/>
                </div>
              ))}
            </div>
            <div style={{padding:'0 22px',marginBottom:14}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase',color:MUTED,marginBottom:9}}>Emotional Weather</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                {['Grounded 🌍','Creative 💫','Anxious 🌊','Tender 🌹','Focused 🔬','Withdrawn 🌑','Expansive ☀️','Irritable 🌋','Sensual 🌺','Visionary 🔭'].map(m=>(
                  <button key={m} onClick={()=>toggleMood(m.split(' ')[0])} style={{padding:'5px 11px',borderRadius:14,border:`1px solid ${moods.includes(m.split(' ')[0])?ROSE:BDR}`,background:moods.includes(m.split(' ')[0])?'rgba(232,99,122,0.12)':'transparent',color:moods.includes(m.split(' ')[0])?ROSE:MUTED,fontSize:'.73rem',cursor:'pointer'}}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{padding:'0 22px',marginBottom:14}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase',color:MUTED,marginBottom:9}}>Flow Intensity</div>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:14}}>
                <div style={{display:'flex',gap:5}}>
                  {[0,1,2,3,4].map(v=>(
                    <div key={v} onClick={()=>setFlowVal(v)} style={{width:26,height:26,borderRadius:'50%',border:`2px solid ${flowVal===v?ROSE:BDR}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,background:`rgba(232,99,122,${v*.2})`,boxShadow:flowVal===v?'0 0 8px rgba(232,99,122,.35)':'none'}}>
                      {v===0?'○':''}
                    </div>
                  ))}
                </div>
                <span style={{fontSize:'.73rem',color:MUTED}}>{['None','Spotting','Light','Medium','Heavy'][flowVal]}</span>
              </div>
            </div>
            <button onClick={runLog} style={{width:'calc(100% - 44px)',margin:'0 22px 16px',display:'block',padding:12,borderRadius:11,background:`linear-gradient(135deg,rgba(232,99,122,.18),rgba(139,92,246,.12))`,border:`1px solid ${ROSE}`,color:ROSE,fontFamily:MONO,fontSize:'8px',letterSpacing:'.16em',textTransform:'uppercase',cursor:'pointer'}}>
              Synthesize Body Reading
            </button>
            {bodyReading&&(
              <div style={{margin:'0 22px 16px',padding:15,background:S2,border:`1px solid ${BDR}`,borderRadius:12}}>
                <div style={{fontFamily:MONO,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:FOREST,marginBottom:7}}>AETHER Body Reading</div>
                <div style={{fontFamily:SERIF,fontSize:'.92rem',fontStyle:'italic',color:TEXT,lineHeight:1.6}}>
                  {bodyReading.split('\n').map((line,i)=>(
                    <div key={i} style={{marginBottom:line===''?4:0}}>{line||'\u00A0'}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PLAN ─────────────────────────────────────────────────── */}
        {tab==='plan'&&(
          <div>
            <div style={{padding:'50px 22px 18px'}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.2em',textTransform:'uppercase',color:ROSE,marginBottom:8}}>Daily Rhythm</div>
              <div style={{fontFamily:SERIF,fontSize:'1.95rem',fontWeight:300,lineHeight:1.1}}>Your <em style={{color:ROSE}}>perfect day</em><br/>by phase</div>
              <div style={{fontSize:'.8rem',color:MUTED,marginTop:6}}>Late-rise rhythm built in. Every slot is phase-specific. Your body's intelligence, scheduled.</div>
            </div>
            <div style={{display:'flex',gap:5,overflowX:'auto',padding:'0 22px',marginBottom:14}}>
              {(Object.entries(PH) as [Phase,typeof PH[Phase]][]).map(([k,p])=>(
                <button key={k} onClick={()=>setDayPhase(k)} style={{flexShrink:0,padding:'5px 12px',borderRadius:14,border:`1px solid ${dayPhase===k?p.col:BDR}`,background:dayPhase===k?p.col+'12':'transparent',color:dayPhase===k?p.col:MUTED,fontFamily:MONO,fontSize:'7px',letterSpacing:'.09em',textTransform:'uppercase',cursor:'pointer'}}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
            <div style={{padding:'0 22px',position:'relative'}}>
              <div style={{position:'absolute',left:34,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${PH[dayPhase].col},${VIO},transparent)`,opacity:.5}}/>
              {PLANS[dayPhase].map(s=>(
                <div key={s.t} style={{display:'flex',gap:11,padding:'9px 0',position:'relative'}}>
                  <div style={{fontFamily:MONO,fontSize:'7.5px',color:MUTED,width:22,flexShrink:0,paddingTop:3,textAlign:'right'}}>{s.t}</div>
                  <div style={{width:9,height:9,borderRadius:'50%',flexShrink:0,marginTop:4,border:`2px solid ${s.col}`,background:s.col+'30',zIndex:1}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:'.8rem',color:TEXT,marginBottom:2}}>{s.title}</div>
                    <div style={{fontSize:'.73rem',color:MUTED,lineHeight:1.4}}>{s.d}</div>
                    <div style={{marginTop:5,display:'flex',gap:4,flexWrap:'wrap'}}>
                      {s.tags.map(t=><Tag key={t.l} l={t.l} c={t.c}/>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COSMOS ───────────────────────────────────────────────── */}
        {tab==='cosmos'&&(
          <div>
            <div style={{padding:'50px 22px 18px'}}>
              <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.2em',textTransform:'uppercase',color:ROSE,marginBottom:8}}>Planetary Resonance</div>
              <div style={{fontFamily:SERIF,fontSize:'1.95rem',fontWeight:300,lineHeight:1.1}}>
                You are<br/><em style={{color:ROSE}}>the Earth.</em><br/>
                <strong style={{fontWeight:600,color:LUNAR}}>Your cycle<br/>is the Moon.</strong>
              </div>
              <div style={{fontSize:'.8rem',color:MUTED,marginTop:6,lineHeight:1.5}}>Sun · Moon · Ocean · Schumann · Sound · Vibration. You are not in nature -- you are nature.</div>
            </div>
            <div style={{margin:'0 22px 14px',background:`linear-gradient(135deg,rgba(0,229,204,.06),rgba(139,92,246,.04))`,border:'1px solid rgba(0,229,204,.12)',borderRadius:13,padding:14,textAlign:'center'}}>
              <div style={{fontFamily:MONO,fontSize:'7px',letterSpacing:'.18em',textTransform:'uppercase',color:MUTED,marginBottom:5}}>H\u2082O Reactions / Second -- Right Now</div>
              <div style={{fontFamily:MONO,fontSize:'1.35rem',fontWeight:700,color:'#00E5CC',textShadow:'0 0 18px rgba(0,229,204,.3)'}}>{wcVal.toLocaleString()}</div>
              <div style={{fontFamily:MONO,fontSize:'6.5px',letterSpacing:'.1em',color:MUTED,marginTop:3,textTransform:'uppercase'}}>{'\u2248'} 1 billion per cell per second</div>
            </div>
            <div style={{margin:'0 22px 14px',background:S1,border:`1px solid ${BDR}`,borderRadius:13,overflow:'hidden'}}>
              <div style={{padding:'11px 15px',borderBottom:`1px solid ${BDR}`}}>
                <div style={{fontFamily:MONO,fontSize:'8px',letterSpacing:'.15em',textTransform:'uppercase',color:ROSE}}>Hormonal + Planetary Waveform</div>
              </div>
              <CosmosCanvas cLen={cLen} mode={cosMode}/>
              <div style={{padding:'9px 15px',borderTop:`1px solid ${BDR}`,display:'flex',gap:5,flexWrap:'wrap'}}>
                {(['cycle','schumann','lunar','water'] as CosMode[]).map(m=>(
                  <button key={m} onClick={()=>setCosMode(m)} style={{padding:'4px 9px',borderRadius:10,border:`1px solid ${cosMode===m?ROSE:BDR}`,background:cosMode===m?'rgba(232,99,122,0.12)':'transparent',color:cosMode===m?ROSE:MUTED,fontFamily:MONO,fontSize:'7px',letterSpacing:'.09em',textTransform:'uppercase',cursor:'pointer'}}>
                    {m==='schumann'?'Schumann 7.83Hz':m.charAt(0).toUpperCase()+m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {RESONANCE.map(r=>(
              <div key={r.name} style={{margin:'0 22px 10px',background:S1,border:`1px solid ${BDR}`,borderRadius:12,padding:'13px 15px',display:'flex',gap:12,alignItems:'flex-start'}}>
                <div style={{fontSize:22,flexShrink:0}}>{r.icon}</div>
                <div>
                  <div style={{fontFamily:SERIF,fontSize:'1rem',color:LUNAR,marginBottom:2}}>{r.name}</div>
                  <div style={{fontFamily:MONO,fontSize:'7px',letterSpacing:'.1em',textTransform:'uppercase',color:MUTED,marginBottom:4}}>{r.freq}</div>
                  <div style={{fontSize:'.73rem',color:MUTED,lineHeight:1.45}}>{r.desc}</div>
                </div>
              </div>
            ))}
            <div style={{height:16}}/>
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav style={{position:'sticky',bottom:0,flexShrink:0,background:'rgba(5,8,15,0.94)',backdropFilter:'blur(24px)',borderTop:`1px solid ${BDR}`,display:'flex',zIndex:200,padding:'8px 0 10px'}}>
        {NAV.map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'5px 2px',cursor:'pointer',border:'none',background:'none'}}>
            <div style={{fontSize:19,lineHeight:1,transform:tab===id?'scale(1.15)':'scale(1)',transition:'transform .2s'}}>{icon}</div>
            <div style={{fontFamily:MONO,fontSize:'7px',letterSpacing:'.1em',textTransform:'uppercase',color:tab===id?ROSE:MUTED,transition:'color .2s'}}>{label}</div>
            <div style={{width:3,height:3,borderRadius:'50%',background:ROSE,opacity:tab===id?1:0,transition:'opacity .2s',marginTop:1}}/>
          </button>
        ))}
      </nav>
    </div>
  );
}

