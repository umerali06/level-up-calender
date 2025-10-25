
/* =====================
  Utility: format USD
===================== */
const fmtUSD = (v) => {
  const a = Math.abs(v);
  const r = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (a >= 1e9) return '$' + r(v / 1e9) + 'B';
  if (a >= 1e6) return '$' + r(v / 1e6) + 'M';
  if (a >= 1e3) return '$' + r(v / 1e3) + 'K';
  return '$' + r(v);
};

/* =====================
  Liquidity + Buybacks
===================== */
(() => {
  const TOKEN='0x1510211E6DC81F5724A1BecA33C5AC70Dcca6CE0';
  const API=(window.lucrarRestBase||(location.origin+'/wp-json'))+'/lucrar/v1/liquidity/'+TOKEN+'/?mode=pairhalf&_='+Date.now();

  const $liq = document.getElementById('lcr-liquidity');
  const fb = () => {
    const f = parseFloat($liq?.dataset.fallback || '0');
    if ($liq) $liq.textContent = fmtUSD(f);
  };
  (async () => {
    try {
      const res = await fetch(API, { cache:'no-store', credentials:'same-origin' });
      if (!res.ok) return fb();
      const j = await res.json();
      if (typeof j?.liquidityUSD === 'number') $liq.textContent = fmtUSD(j.liquidityUSD);
      else fb();
    } catch(e) { fb(); }
  })();

  const $bb=document.getElementById('buybacks-count');
  if($bb){
    const monthsSince=f=>{const d=new Date(f),n=new Date();return (n.getFullYear()-d.getFullYear())*12+(n.getMonth()-d.getMonth())+1};
    const m=monthsSince('2025-09-01');
    const isEN = document.documentElement.lang?.toLowerCase().startsWith('en');
    $bb.textContent=isEN ? `Company buybacks: ${m} ${m===1?'time':'times'}` : `Recompras da empresa: ${m} ${m===1?'vez':'vezes'}`;
  }
})();

/* =====================
  Downline Arrow (unchanged)
===================== */
(() => {
  function bootArrow(){
    const section=document.getElementById('level-up-company-section');
    const stats=document.getElementById('stats-frame');
    const tpl=section?.querySelector('#downline-template');
    if(!section||!stats||!tpl)return;

    const END_SELECTOR='#arrow-end';
    const DEFAULT_EDGE='top';
    const DEFAULT_OFFSET=0;
    const MIN_LEN=8;
    const FB_PARENT='#owner-section';
    const FB_EDGE='bottom';
    const FB_OFFSET=160;

    let box=document.getElementById('downline-global');
    if(!box){box=tpl.cloneNode(true);box.id='downline-global';box.removeAttribute('aria-hidden');document.body.appendChild(box)}

    const svg=box.querySelector('#downSVG');
    const shaft=box.querySelector('#downShaft');
    const headFill=box.querySelector('#downHeadFill');

    const gv=(n,fb)=>{const v=parseFloat(getComputedStyle(section).getPropertyValue(n));return Number.isFinite(v)?v:fb};
    const gc=(n,fb)=>{const v=getComputedStyle(section).getPropertyValue(n).trim();return v||fb};
    const absTop=el=>(window.scrollY||window.pageYOffset||0)+el.getBoundingClientRect().top;
    const centerX=r=>r.left+r.width/2+(window.scrollX||0);
    const clamp01=v=>Math.max(0,Math.min(1,v));

    let startY=0,endY=0,H=0,pathLen=0,endEl=null;

    function getEndCandidate(){
      if(endEl){
        const top=absTop(endEl);
        const rect=endEl.getBoundingClientRect();
        const edge=(endEl.dataset.edge||DEFAULT_EDGE).toLowerCase();
        const extra=parseFloat(endEl.dataset.offset||DEFAULT_OFFSET)||0;
        const pos=edge==='center'?top+rect.height/2:edge==='bottom'?top+rect.height:top;
        return pos+extra
      }
      const fb=document.querySelector(FB_PARENT);
      if(fb){
        const top=absTop(fb);
        const rect=fb.getBoundingClientRect();
        const pos=(FB_EDGE==='bottom'?top+rect.height:top);
        return pos+FB_OFFSET
      }
      return startY+(gv('--down-length',1200)||1200)
    }

    function recalc(){
      const sr=stats.getBoundingClientRect();
      const stroke=gv('--down-stroke',9),headSz=gv('--down-head',22),shiftX=gv('--down-x',0),accent=gc('--accent','#EFD7A0');
      shaft.style.stroke=accent;headFill.style.fill=accent;

      startY=absTop(stats)+sr.height-12;

      const docH=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
      const maxEnd=docH-24;

      const candidate=getEndCandidate();
      endY=Math.min(Math.max(candidate,startY+MIN_LEN),maxEnd);
      H=endY-startY;

      const cx=centerX(sr)+shiftX,w=Math.max(18,gv('--down-stroke',9)*2.5);
      Object.assign(box.style,{position:'absolute',left:cx+'px',top:startY+'px',width:w+'px',height:H+'px',transform:'translateX(-50%)',pointerEvents:'none',zIndex:9999});

      svg.setAttribute('height',H);
      svg.setAttribute('viewBox',`0 0 40 ${Math.max(100,Math.ceil(H))}`);

      const apexY=Math.max(6,headSz),baseY=Math.min(H-6,apexY+headSz*0.95),halfW=Math.min(12,headSz*0.6);
      headFill.setAttribute('d',`M20,${apexY} L${20+halfW},${baseY} L${20-halfW},${baseY} Z`);

      const shaftTop=baseY+2,shaftBottom=Math.max(shaftTop,H-2);
      shaft.setAttribute('d',`M20,${shaftTop} L20,${shaftBottom}`);
      shaft.style.strokeWidth=gv('--down-stroke',9)+'px';

      pathLen=shaft.getTotalLength();
      shaft.style.strokeDasharray=pathLen;
      shaft.style.strokeDashoffset=pathLen;

      update()
    }

    function update(){
      const trig=Math.min(1,Math.max(0,parseFloat(getComputedStyle(section).getPropertyValue('--down-trigger'))||0.22));
      const viewAnchor=window.scrollY+window.innerHeight*trig;
      const p=clamp01((viewAnchor-startY)/Math.max(1,(endY-startY)));
      shaft.style.strokeDashoffset=pathLen*(1-p)
    }

    function watchEnd(){
      const tryGet=()=>{const el=document.querySelector(END_SELECTOR);if(el!==endEl){endEl=el;recalc()}};
      tryGet();
      const mo=new MutationObserver(tryGet);
      mo.observe(document.documentElement,{childList:true,subtree:true});
      [...document.images].forEach(img=>{if(!img.complete)img.addEventListener('load',()=>setTimeout(recalc,50),{once:true,passive:true})})
    }

    watchEnd();
    recalc();

    if(document.fonts){document.fonts.ready.then(()=>setTimeout(recalc,50));document.fonts.addEventListener?.('loadingdone',()=>setTimeout(recalc,50))}

    window.addEventListener('resize',recalc,{passive:true});
    window.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
    window.addEventListener('load',()=>setTimeout(recalc,120));
    new ResizeObserver(()=>setTimeout(recalc,50)).observe(document.body)
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',bootArrow)}else{bootArrow()}
})();


/* =====================
  Shared Modal (game/events/calendly)
===================== */
(() => {
  let modal, dialog, body;

  function injectModalOnce(){
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'st-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="st-backdrop" data-close></div>
      <div class="st-dialog" role="document">
        <button class="st-close" type="button" data-close aria-label="Close">×</button>
        <div class="st-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    dialog = modal.querySelector('.st-dialog');
    body = modal.querySelector('.st-body');
  }

  function openModal(extraClass){
    injectModalOnce();
    dialog.className = 'st-dialog'; // reset
    if (extraClass) dialog.classList.add(extraClass);
    modal.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow='hidden';
  }

  function closeModal(){
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow='';
    if (body) body.innerHTML = '';
  }

  // Close interactions
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close], .st-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Public openers (game/events are placeholders for parity)
  function openGame(){
    injectModalOnce();
    body.innerHTML = `<iframe src="about:blank" style="width:100%;height:100%;border:0" allowfullscreen loading="lazy" title="Game"></iframe>`;
    openModal();
  }
  function openGallery(){
    injectModalOnce();
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%">
        <img src="https://staging.lucrar.pt/wp-content/uploads/2025/09/ChatGPT-Image-26_06_2025-00_31_59.png" alt="" style="width:100%;height:auto;display:block">
        <img src="https://staging.lucrar.pt/wp-content/uploads/2025/09/ChatGPT-Image-26_06_2025-00_27_35.png" alt="" style="width:100%;height:auto;display:block">
        <img src="https://staging.lucrar.pt/wp-content/uploads/2025/09/ChatGPT-Image-26_06_2025-00_48_39.png" alt="" style="width:100%;height:auto;display:block">
      </div>`;
    openModal();
  }

  // Calendly helpers
  function ensureCalendly(cb){
    if(!document.querySelector('link[href*="assets.calendly.com/assets/external/widget.css"]')){
      const l=document.createElement('link'); l.rel='stylesheet';
      l.href='https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(l);
    }
    const ready = () => (window.Calendly && typeof window.Calendly.initInlineWidget==='function');
    if(ready()){ cb(); return; }
    if(!document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')){
      const s=document.createElement('script');
      s.src='https://assets.calendly.com/assets/external/widget.js';
      s.async=true; s.onload=cb; document.head.appendChild(s);
    } else {
      const t = setInterval(()=>{ if (ready()) { clearInterval(t); cb(); } }, 50);
    }
  }
  function openCalendly(url){
    injectModalOnce();
    body.innerHTML = '<div id="st-calendly"></div>';
    const mount = body.querySelector('#st-calendly');
    ensureCalendly(() => {
      window.Calendly.initInlineWidget({ url, parentElement: mount });
    });
    openModal('st-dialog--calendly');
  }

  // Delegate clicks for data-action links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-action]');
    if (!link) return;
    e.preventDefault();
    const action = link.getAttribute('data-action');
    if (action === 'game') openGame();
    else if (action === 'events') openGallery();
    else if (action === 'calendly') {
      const cal = link.getAttribute('data-cal') || 'https://calendly.com/workolic01/30min';
      openCalendly(cal);
    }
  });

  // Robust handler for SVG textPath anchors (.lluc-open-cal or data-action="calendly")
  document.addEventListener('click', (e) => {
    const curve = e.target.closest('.contact-curve');
    if (!curve) return;
    const a = e.target.closest('a');
    if (!a) return;
    if (a.matches('.lluc-open-cal, [data-action="calendly"]')) {
      e.preventDefault();
      const cal = a.getAttribute('data-cal') || 'https://calendly.com/workolic01/30min';
      openCalendly(cal);
    }
  });

})();
