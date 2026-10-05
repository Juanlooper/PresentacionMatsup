import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { ArrowRight, ArrowLeft, Play, Pause, RotateCcw, Check, ChevronDown, BookOpen, Activity, Layers, Maximize2, X, Download, ExternalLink } from 'lucide-react';
import { lessons } from './lessons.js';
import { sample, fmt } from './domain.js';

function MathText({ children, block = true }) {
  return <span className={block ? 'math display' : 'math'} dangerouslySetInnerHTML={{ __html: katex.renderToString(children, { displayMode: block, throwOnError: true, strict: 'ignore' }) }} />;
}
function Plot({ lesson, count = 12, selected = 0, components = false, onSelect }) {
  const values = Array.from({ length: count + 1 }, (_, k) => sample(lesson.id, k));
  const lo = Math.min(0, ...values), hi = Math.max(1, ...values), pad = (hi - lo) * .12;
  const py = v => 218 - (v - lo + pad) / (hi - lo + 2 * pad) * 182;
  const px = k => 48 + k * 530 / count, zero = py(0);
  return <svg className="plot" viewBox="0 0 620 265" role="img" aria-label={`Gráfica de ${lesson.id}: muestras desde k = 0 hasta ${count}`}>
    <title>Muestras discretas de {lesson.id}</title>
    {[lo, (lo + hi) / 2, hi].map((v, i) => <g key={i}><line x1="48" x2="580" y1={py(v)} y2={py(v)} className="gridline"/><text x="38" y={py(v)+4} textAnchor="end">{fmt(v)}</text></g>)}
    <line x1="48" x2="589" y1={zero} y2={zero} className="axis"/><line x1="48" x2="48" y1="20" y2="224" className="axis"/>
    <text x="20" y="20">{lesson.id === '1a' || lesson.id === '1f' ? 'xₖ' : 'yₖ'}</text><text x="595" y="249">k</text>
    {lesson.id === '1f' && <path className="wave-guide" d={Array.from({length:241},(_,i)=>{const k=i*count/240;return `${i?'L':'M'} ${px(k)} ${py(Math.sin(k*Math.PI/6))}`;}).join(' ')}/>}
    {lesson.id === '3d' && components && <>{values.map((_,k)=><g key={k} opacity=".55"><line x1={px(k)-5} x2={px(k)-5} y1={zero} y2={py((-1/3)**k)} stroke="#b79560" strokeWidth="2"/>{(k===2||k===3)&&<line x1={px(k)+5} x2={px(k)+5} y1={zero} y2={py(1)} stroke="#df977f" strokeWidth="5"/>}</g>)}</>}
    {values.map((v,k) => <g key={k} className={`sample ${selected===k?'selected':''}`} onClick={()=>onSelect?.(k)}>
      {selected===k&&<rect x={px(k)-11} y="20" width="22" height="205" rx="6" fill="#dce8d9"/>}
      <line className="stem" x1={px(k)} x2={px(k)} y1={zero} y2={py(v)} style={{animationDelay:`${k*30}ms`}}/>
      <circle cx={px(k)} cy={py(v)} r={selected===k?6:4} className="dot"/><circle cx={px(k)} cy={py(v)} r="13" fill="transparent"/>
      <text x={px(k)} y="247" textAnchor="middle">{k}</text>
    </g>)}
  </svg>;
}

function Roc({ lesson }) {
  const [factor,setFactor]=useState(1.4);
  const scale=78/lesson.radius, z=factor*lesson.radius, inside=factor>1;
  return <div className="roc-panel">
    <svg viewBox="0 0 300 220" role="img" aria-label={`Plano complejo. La región de convergencia es |z| mayor que ${lesson.radius}.`}>
      <defs><pattern id={`hatch-${lesson.id}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><line x1="0" y1="0" x2="0" y2="9" stroke="#bcd0be" strokeWidth="2"/></pattern><mask id={`mask-${lesson.id}`}><rect width="300" height="220" fill="white"/><circle cx="145" cy="110" r="78" fill="black"/></mask></defs>
      <rect width="300" height="220" fill={`url(#hatch-${lesson.id})`} mask={`url(#mask-${lesson.id})`}/>
      <line x1="12" x2="281" y1="110" y2="110" className="axis"/><line x1="145" x2="145" y1="12" y2="208" className="axis"/>
      <circle cx="145" cy="110" r="78" fill="none" stroke="#577f68" strokeWidth="1.5" strokeDasharray="5 5"/>
      <text x="259" y="127">Re(z)</text><text x="154" y="20">Im(z)</text><text x="152" y="126">0</text><text x="174" y="62">r = {fmt(lesson.radius)}</text>
      {lesson.poles.map(([re,im],i)=><g key={i} transform={`translate(${145+re*scale},${110-im*scale})`}><path d="M-4-4L4 4M-4 4L4-4" stroke="#bc7059" strokeWidth="2.5"/></g>)}
      <circle cx={145+z*scale} cy="110" r="6" fill={inside?'#254f46':'#bc7059'} className="probe"/>
    </svg>
    <label className="slider-label" htmlFor={`roc-${lesson.id}`}>Prueba un z real <strong>z = {fmt(z)}</strong></label>
    <input id={`roc-${lesson.id}`} type="range" min="0" max="1.6" step="0.01" value={factor} onChange={e=>setFactor(+e.target.value)}/>
    <p className={`roc-state ${inside?'yes':'no'}`}>{inside?<Check size={14}/>:<X size={14}/>} {inside?'Dentro de la ROC: la serie converge.':Math.abs(factor-1)<1e-9?'En la frontera: no converge.':'Fuera de la ROC: la serie no converge.'}</p>
    <div className="legend"><span className="legend-hatch"/> Región de convergencia <span className="pole">×</span> Polo</div>
  </div>;
}

function RealCase({lesson}) {
  const [k,setK]=useState(0),[run,setRun]=useState(false);
  const max=lesson.id==='1f'?24:lesson.id==='4d'?8:10;
  useEffect(()=>{if(!run)return;const timer=setInterval(()=>setK(v=>{if(v>=max){setRun(false);return v;}return v+1;}),850);return()=>clearInterval(timer);},[run,max]);
  const value=sample(lesson.id,k)*lesson.caseScale;
  return <section className="case-section" id="aplicacion">
    <div className="section-heading"><div><span className="eyebrow">03 / DEL PAPEL AL MUNDO</span><h2>{lesson.caseTitle}</h2></div><span className="pill pale">Ampliación didáctica</span></div>
    <div className="case-grid"><div className="case-copy"><p>{lesson.caseText}</p><MathText>{lesson.caseEq}</MathText><p className="small-note">{lesson.caseMeaning}</p></div>
    <div className="simulation"><div className="simulation-top"><span>SIMULACIÓN DEL MODELO</span><span className="live-dot"/> <span>k = {k}</span></div>
      <svg viewBox="0 0 450 190" className="case-svg" role="img" aria-label={`${lesson.caseLabel}, muestra ${k}: ${fmt(value)} ${lesson.caseUnit}`}>
        {lesson.caseKind==='tank'&&<><path d="M145 35V157Q145 167 155 167H295Q305 167 305 157V35" fill="#fff" stroke="#729084" strokeWidth="3"/><rect x="149" y={164-116*sample('1a',k)} width="152" height={116*sample('1a',k)} rx="2" fill="#92b8a0" className="liquid"/><path d="M120 65H145M305 65H333" stroke="#729084" strokeWidth="3"/><text x="105" y="32">Disolvente limpio</text><text x="220" y="185" textAnchor="middle">Volumen constante</text>{[0,1,2].map(i=><circle key={i} cx={167+i*47} cy="146" r="3" fill="#edf4e8"/>)}</>}
        {lesson.caseKind==='sensor'&&<><line x1="50" x2="400" y1="152" y2="152" stroke="#bfc8ba" strokeWidth="2"/><path d="M78 70v75M83 70v75" stroke="#729084" strokeWidth="3"/><path d={`M85 105L100 105L110 90L125 120L140 90L155 120L170 90L185 120L200 105L${245+value*60} 105`} stroke="#729084" strokeWidth="3" fill="none" className="spring"/><g style={{transform:`translateX(${value*60}px)`}} className="moving-block"><rect x="245" y="77" width="65" height="65" rx="10" fill="#92b8a0"/><circle cx="265" cy="148" r="5" fill="#254f46"/><circle cx="292" cy="148" r="5" fill="#254f46"/><text x="277" y="115" textAnchor="middle" fill="#254f46">sensor</text></g><line x1="277" x2="277" y1="39" y2="157" stroke="#b79560" strokeDasharray="4 4"/><text x="275" y="180" textAnchor="middle">Posición de equilibrio</text></>}
        {lesson.caseKind==='filter'&&<><path d="M60 96H115M185 96H255M325 96H389M220 52V136M220 52H254M220 136H254" stroke="#729084" strokeWidth="2" fill="none"/><rect x="115" y="76" width="70" height="40" rx="9" fill="#dce8d9"/><text x="150" y="100" textAnchor="middle">(−⅓)ᵏ</text>{[2,3].map((m,i)=><g key={m}><rect x="255" y={i?117:32} width="70" height="40" rx="9" fill={k===m?'#db9a7e':'#e9ebdf'} className="delay-block"/><text x="290" y={i?142:57} textAnchor="middle">δₖ,{m}</text></g>)}<circle cx="350" cy="96" r="17" fill="#254f46"/><text x="350" y="101" textAnchor="middle" fill="#fff">+</text><text x="50" y="66">δₖ,₀</text><text x="395" y="100">hₖ</text><text x="225" y="178" textAnchor="middle">Una respuesta + dos retardos</text></>}
        {lesson.caseKind==='control'&&<><rect x="43" y="59" width="135" height="76" rx="12" fill="#dce8d9"/><text x="110" y="90" textAnchor="middle">Memoria: 3 muestras</text><text x="110" y="116" textAnchor="middle">−1 · +5 · −3</text><path d="M178 96H225" stroke="#729084" strokeWidth="3"/><line x1="300" x2="300" y1="40" y2="151" stroke="#b79560" strokeDasharray="4 4"/><g className="moving-block" style={{transform:`translateX(${Math.sign(value)*Math.min(85,Math.log2(1+Math.abs(value))*12)}px)`}}><rect x="283" y="77" width="34" height="40" rx="8" fill={value<0?'#d99b86':'#92b8a0'}/><path d={value<0?'M291 97h16M291 97l5-5M291 97l5 5':'M291 97h16M307 97l-5-5M307 97l-5 5'} stroke="#254f46" fill="none" strokeWidth="2"/></g><text x="300" y="180" textAnchor="middle">Error alrededor de cero</text></>}
      </svg>
      <div className="readout"><span>{lesson.caseLabel}</span><strong key={k} className="value-flash">{fmt(value)} <small>{lesson.caseUnit}</small></strong></div>
      <div className="simulation-controls"><button className="icon-button" aria-label={run?'Pausar simulación':'Reproducir simulación'} onClick={()=>{if(k===max)setK(0);setRun(!run);}}>{run?<Pause size={17}/>:<Play size={17}/>}</button><input aria-label="Muestra de la simulación" type="range" min="0" max={max} step="1" value={k} onChange={e=>{setRun(false);setK(+e.target.value);}}/><button className="icon-button" aria-label="Reiniciar simulación" onClick={()=>{setK(0);setRun(false);}}><RotateCcw size={16}/></button></div>
      <div className="sample-strip">{Array.from({length:Math.min(6,max+1)},(_,i)=><button key={i} className={k===i?'chosen':''} onClick={()=>{setK(i);setRun(false);}}><span>k = {i}</span>{fmt(sample(lesson.id,i)*lesson.caseScale)}</button>)}</div>
    </div></div>
  </section>;
}

function Lesson({ lesson }) {
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[all,setAll]=useState(false),[n,setN]=useState(lesson.id==='4d'?8:12),[point,setPoint]=useState(0),[components,setComponents]=useState(false);
  const [visited,setVisited]=useState(new Set([0]));
  const [resultForm,setResultForm]=useState(0);
  const indexRef=useRef(null);
  const current=lesson.steps[step];
  useEffect(()=>{setVisited(v=>new Set([...v,step]));},[step]);
  useEffect(()=>{
    const index=indexRef.current, button=index?.querySelector('button.active');
    if(!button)return;
    const parent=index.getBoundingClientRect(), item=button.getBoundingClientRect();
    if(item.top<parent.top+30)index.scrollTop-=parent.top+30-item.top;
    else if(item.bottom>parent.bottom-15)index.scrollTop+=item.bottom-parent.bottom+15;
  },[step,all]);
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setStep(v=>{if(v>=lesson.steps.length-1){setPlaying(false);return v;}return v+1;}),7000);return()=>clearInterval(timer);},[playing,lesson.steps.length]);
  function move(v){setStep(v);setPlaying(false);}
  const complete=visited.size===lesson.steps.length;
  return <>
    <section className="lesson-intro" id="resolver"><div><span className="eyebrow">EJERCICIO {lesson.id.toUpperCase()} / {lesson.type.toUpperCase()}</span><h2>{lesson.name}</h2><p>{lesson.intro}</p></div><span className="pill"><span className="tiny-dot"/>{lesson.tag}</span></section>
    <div className="problem-card"><div className="problem-label">ENUNCIADO ORIGINAL <span>Trabajo en equipo Nº 2 · UTP</span></div><MathText>{lesson.problem}</MathText>{lesson.initial&&<MathText>{lesson.initial}</MathText>}<p>{lesson.task}</p></div>
    <section className="resolution"><div className="section-heading"><div><span className="eyebrow">01 / ENTENDER CADA CAMBIO</span><h2>Una idea a la vez.</h2></div><button className="text-button" onClick={()=>{setAll(!all);setPlaying(false);}}><BookOpen size={16}/>{all?'Volver al recorrido':'Ver resolución completa'}<ChevronDown size={15}/></button></div>
      <div className="solver-grid"><aside className="step-index" ref={indexRef}><div className="index-top">EL RECORRIDO <span>{lesson.steps.length} pasos</span></div>{lesson.steps.map((s,i)=><button key={i} onClick={()=>{move(i);setAll(false);}} className={i===step?'active':''} aria-current={i===step?'step':undefined}><span className={`step-number ${visited.has(i)?'seen':''}`}>{visited.has(i)&&i!==step?<Check size={12}/>:String(i+1).padStart(2,'0')}</span><span>{s.title}</span>{i===step&&<ArrowRight size={14}/>}</button>)}<div className="index-foot"><span className="progress-track"><i style={{width:`${visited.size/lesson.steps.length*100}%`}}/></span><small>{visited.size} de {lesson.steps.length} pasos visitados</small></div></aside>
      <div className="step-content">{all?<div className="all-steps">{lesson.steps.map((s,i)=><article key={i}><span className="eyebrow">PASO {String(i+1).padStart(2,'0')}</span><h3>{s.title}</h3><MathText>{s.eq}</MathText><p>{s.text}</p><div className="change-note"><Activity size={16}/><span>{s.change}</span></div></article>)}</div>:<>
        <div className="step-top"><span className="eyebrow">PASO {String(step+1).padStart(2,'0')} <span className="muted">/ {lesson.steps.length}</span></span><button className="text-button" onClick={()=>{if(step===lesson.steps.length-1)setStep(0);setPlaying(!playing);}}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pausar':'Reproducir pasos'}</button></div>
        <article key={step} className="animated-step" aria-live="polite"><h3>{current.title}</h3><div className="equation-stage">{step>0&&<div className="before"><span>VENIMOS DE</span><MathText>{lesson.steps[step-1].eq}</MathText></div>}<div className="after"><span>{step===0?'PUNTO DE PARTIDA':'AHORA'}</span><MathText>{current.eq}</MathText></div></div><p className="step-explanation">{current.text}</p><div className="change-note"><Activity size={18}/><div><strong>¿Qué cambió?</strong><p>{current.change}</p></div></div></article>
        <div className="step-controls"><button disabled={step===0} onClick={()=>move(step-1)} className="secondary"><ArrowLeft size={16}/> Anterior</button><span>{step+1} / {lesson.steps.length}</span><button disabled={step===lesson.steps.length-1} onClick={()=>move(step+1)} className="primary">Siguiente <ArrowRight size={16}/></button></div><p className="play-hint">{playing?'Avance automático cada 7 segundos. Pausa para leer con calma.':'Puedes volver a cualquier paso o abrir la resolución completa.'}</p>
      </>}</div></div>
      <div className="answer-card"><div><span className="answer-check"><Check size={19}/></span><span className="eyebrow">RESULTADO VERIFICADO</span>{complete&&<span className="pill pale">Recorrido completo</span>}</div>
        {lesson.resultForms ? <>
          <div className="answer-options" role="group" aria-label="Elegir presentación del resultado">{lesson.resultForms.map((form,i)=><button key={form.label} type="button" aria-pressed={resultForm===i} className={resultForm===i?'active':''} onClick={()=>setResultForm(i)}>{form.label}</button>)}</div>
          <div key={resultForm} className="answer-body animated-step" aria-live="polite"><MathText>{lesson.resultForms[resultForm].eq}</MathText><p>{lesson.resultForms[resultForm].note}</p></div>
          <p className="answer-equivalence"><strong>Ambas representaciones son equivalentes.</strong> Al evaluar la fórmula general en k = 0, 1, 2, 3, 4 y 5, se obtienen los valores de las primeras muestras.</p>
        </> : <MathText>{lesson.result}</MathText>}
      </div>
    </section>
    <section className="visual-section" id="graficas"><div className="section-heading"><div><span className="eyebrow">02 / VER LA MATEMÁTICA</span><h2>De la fórmula a la forma.</h2></div><span className="pill pale">Gráficas interactivas</span></div><div className="visual-grid"><div className="chart-card"><div className="card-title"><h3>La sucesión en el tiempo</h3><span>MUESTRAS DISCRETAS</span></div><Plot lesson={lesson} count={n} selected={point} components={components} onSelect={setPoint}/><div className="chart-readout"><span>Muestra seleccionada <strong>k = {point}</strong></span><MathText block={false}>{`${lesson.id==='1a'||lesson.id==='1f'?'x':'y'}_{${point}}=${fmt(sample(lesson.id,point))}`}</MathText></div><label className="slider-label" htmlFor="samples">Número de muestras <strong>0 a {n}</strong></label><input id="samples" type="range" min="4" max={lesson.id==='4d'?12:24} value={n} onChange={e=>{setN(+e.target.value);setPoint(v=>Math.min(v,+e.target.value));}}/>{lesson.id==='3d'&&<label className="checkbox-label"><input type="checkbox" checked={components} onChange={e=>setComponents(e.target.checked)}/> Mostrar componentes: exponencial e impulsos</label>}<p className="small-note">{lesson.graphNote} Selecciona un tallo o una muestra de la tabla.</p><div className="value-table"><table><caption>Valores numéricos de las muestras</caption><thead><tr><th>k</th>{Array.from({length:n+1},(_,i)=><th key={i}><button onClick={()=>setPoint(i)} className={i===point?'selected-cell':''}>{i}</button></th>)}</tr></thead><tbody><tr><th>{lesson.id==='1a'||lesson.id==='1f'?'xₖ':'yₖ'}</th>{Array.from({length:n+1},(_,i)=><td key={i}>{fmt(sample(lesson.id,i))}</td>)}</tr></tbody></table></div></div><div className="roc-card"><div className="card-title"><h3>El plano complejo</h3><span>REGIÓN DE CONVERGENCIA</span></div><Roc lesson={lesson}/><MathText>{`|z|>${lesson.radius===1/3?'\\frac13':lesson.radius}`}</MathText><p className="small-note">La zona rayada es el exterior del círculo. La frontera discontinua se excluye. La ROC describe dónde converge la serie, no el crecimiento temporal de la señal.</p></div></div></section>
    <RealCase lesson={lesson}/>
  </>;
}

export default function App(){
  const [id,setId]=useState(()=>lessons.some(l=>`#${l.id}`===location.hash)?location.hash.slice(1):'1a');
  const [theory,setTheory]=useState(false),[presentation,setPresentation]=useState(false);
  const lesson=lessons.find(l=>l.id===id);
  useEffect(()=>{function hash(){const next=location.hash.slice(1);if(lessons.some(l=>l.id===next))setId(next);}window.addEventListener('hashchange',hash);return()=>window.removeEventListener('hashchange',hash);},[]);
  useEffect(()=>{function keys(e){if(e.key==='Escape')setPresentation(false);}window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);},[]);
  function select(next){setId(next);history.replaceState(null,'',`#${next}`);}
  return <div className={presentation?'app presentation':'app'}>
    <header className="site-header"><a href="#" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}} className="brand"><span className="brand-icon">Z</span><span>el dominio <b>z.</b></span></a><div className="header-meta"><span>MATEMÁTICAS SUPERIORES</span><span className="divider"/> GRUPO 01</div><button className="text-button" onClick={()=>setPresentation(!presentation)}>{presentation?<X size={17}/>:<Maximize2 size={16}/>}<span>{presentation?'Salir':'Modo exposición'}</span></button></header>
    <main>
      <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="tiny-dot"/> UNA EXPLORACIÓN PASO A PASO</span><h1>Del tiempo<br/>al <em>dominio z.</em></h1><p>Cuatro problemas. Cada transformación explicada.<br className="desktop-break"/> Una forma de ver lo que las ecuaciones cuentan.</p><a className="primary hero-cta" href="#resolver">Comenzar el recorrido <ArrowRight size={18}/></a><span className="hero-sub">1a · 1f · 3d · 4d <span> / </span> Trabajo en equipo Nº 2</span></div><div className="hero-art"><span className="art-top">TIEMPO DISCRETO → DOMINIO COMPLEJO</span><svg viewBox="0 0 500 310" aria-label="Ilustración de muestras de una señal y su transformación al plano complejo" role="img"><defs><pattern id="heroGrid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#aab8a8"/></pattern></defs><rect width="500" height="310" fill="url(#heroGrid)"/><ellipse cx="355" cy="146" rx="92" ry="92" fill="#dce7d7" fillOpacity=".55" stroke="#90a68e" strokeDasharray="5 7"/><line x1="236" x2="474" y1="146" y2="146" stroke="#a2b19d"/><line x1="355" x2="355" y1="30" y2="259" stroke="#a2b19d"/><circle cx="355" cy="146" r="52" fill="none" stroke="#729084"/><path d="M394 99l9 9m-9 0l9-9M394 185l9 9m-9 0l9-9" stroke="#c87d61" strokeWidth="2.5"/><circle className="orbit-dot" cx="355" cy="94" r="6" fill="#254f46"/><text x="443" y="172">Re</text><text x="366" y="39">Im</text><path d="M170 156Q209 82 259 118" fill="none" stroke="#729084" strokeWidth="1.5" strokeDasharray="5 5"/><path d="M249 111l10 7-10 3" fill="none" stroke="#729084"/><line x1="20" x2="204" y1="239" y2="239" stroke="#a2b19d"/>{[1,.7,.5,.35,.25,.17,.12].map((v,i)=><g key={i} className="hero-stem" style={{animationDelay:`${i*.1}s`}}><line x1={38+i*23} x2={38+i*23} y1="239" y2={239-v*109} stroke="#527963" strokeWidth="2"/><circle cx={38+i*23} cy={239-v*109} r="4" fill="#527963"/></g>)}<text x="40" y="271">xₖ</text><text x="182" y="271">k</text><text x="192" y="95" className="hero-z">Z</text></svg><div className="art-bottom"><span>UNA SEÑAL, DOS PERSPECTIVAS</span><span>k → z</span></div></div></section>
      <div className="context-bar"><span><Check size={16}/> Enunciados originales conservados</span><span><Layers size={16}/> {lessons.reduce((n,l)=>n+l.steps.length,0)} pasos desarrollados</span><button onClick={()=>setTheory(!theory)}><BookOpen size={16}/> Antes de empezar <ChevronDown size={14} className={theory?'rotate':''}/></button></div>
      {theory&&<section className="theory"><span className="eyebrow">BASES PARA SEGUIR EL RECORRIDO</span><h2>¿Qué hace la transformada Z?</h2><p>Convierte una sucesión de muestras en una función de la variable compleja z. Aquí usamos la transformada unilateral: k empieza en cero. Las señales se consideran cero antes de k = 0.</p><div className="theory-grid"><div><h3>La definición</h3><MathText>{String.raw`X(z)=\sum_{k=0}^{\infty}x_kz^{-k}`}</MathText><p>Cada muestra xₖ multiplica una potencia z⁻ᵏ. La ROC es el conjunto de z para el que esta suma converge.</p></div><div><h3>La herramienta esencial</h3><MathText>{String.raw`\sum_{k=0}^{\infty}r^k=\frac1{1-r},\quad |r|<1`}</MathText><p>De ella obtenemos aᵏ ↔ z/(z−a), con |z| &gt; |a|. Linealidad permite transformar e invertir término a término.</p></div><div><h3>Lo que conviene recordar</h3><p>z⁻ᵐ representa un impulso en k = m. Adelantar una sucesión requiere restar sus valores iniciales. En el plano complejo, |z| es la distancia al origen, no sólo la parte real.</p><a href="https://mathworld.wolfram.com/Z-Transform.html" target="_blank" rel="noreferrer">Consultar definición y propiedades <ExternalLink size={13}/></a></div></div></section>}
      <nav className="lesson-tabs" aria-label="Seleccionar ejercicio">{lessons.map((l,i)=><button key={l.id} onClick={()=>select(l.id)} className={id===l.id?'active':''} aria-current={id===l.id?'page':undefined}><span className="tab-num">{l.id}</span><span><strong>{l.type}</strong><small>{l.tag}</small></span><span className="tab-order">0{i+1}</span></button>)}</nav>
      <Lesson key={id} lesson={lesson}/>
      <section className="next-lesson"><span>CONTINÚA EXPLORANDO</span>{lessons.filter(l=>l.id!==id).map(l=><button key={l.id} onClick={()=>{select(l.id);document.querySelector('.lesson-tabs').scrollIntoView({behavior:'smooth',block:'start'});}}>{l.id} <span>{l.tag}</span><ArrowRight size={15}/></button>)}</section>
      <section className="sources"><div><h3>Sobre este recorrido</h3><p>Enunciados: trabajo grupal de la Universidad Tecnológica de Panamá. 1a sigue la resolución manuscrita adjunta; 4d desarrolla el PDF de resolución. Los ejemplos de aplicación y las simulaciones son ampliaciones didácticas. Se mantiene la convención unilateral en los cuatro problemas.</p></div><div><h3>Material de referencia</h3><a href="/fuentes/trabajo-grupal.pdf" target="_blank" rel="noreferrer"><Download size={14}/> Trabajo grupal original</a><a href="/fuentes/problema-4d.pdf" target="_blank" rel="noreferrer"><Download size={14}/> Resolución original de 4d</a><a href="https://mathworld.wolfram.com/Z-Transform.html" target="_blank" rel="noreferrer"><ExternalLink size={14}/> Definición y propiedades · MathWorld</a></div></section>
      <section className="credits-section" id="creditos" aria-labelledby="credits-title">
        <span className="eyebrow">CRÉDITOS / GRUPO 01</span>
        <h2 id="credits-title">MATSU Problemas</h2>
        <dl className="credits-grid">
          <div><dt>1a</dt><dd>Nicole Cáceres</dd></div>
          <div><dt>1f</dt><dd>Alejandra Falcón y Adrien Delgado</dd></div>
          <div><dt>3d</dt><dd>Juan Rodriguez y Miguel Oliver</dd></div>
          <div><dt>4d</dt><dd>Yazir Peña, Ailyn Montengro y Brandol Perez</dd></div>
        </dl>
      </section>
      <section className="closing-section" id="cierre">
        <span className="eyebrow">CIERRE / GRUPO 01</span>
        <h2>Gracias por su atención.</h2>
        <video className="closing-video" controls playsInline preload="metadata" aria-label="Video de cierre de la presentación">
          <source src="/videos/cierre-presentacion.mp4" type="video/mp4" />
          Tu navegador no puede reproducir este video. <a href="/videos/cierre-presentacion.mp4">Abrir el video de cierre</a>.
        </video>
      </section>
    </main><footer><span className="brand">el dominio <b>z.</b></span><span>GRUPO 01 · TRANSFORMADA Z · OCTUBRE 2026</span><button className="text-button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Volver arriba ↑</button></footer>
  </div>;
}



