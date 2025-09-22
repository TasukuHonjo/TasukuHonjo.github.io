/* Common script for all pages
   - IntersectionObserver for fade-in
   - Bubble effect on pointer
   - Small accessibility helpers
*/

/* ===== Fade-in with IntersectionObserver ===== */
document.addEventListener('DOMContentLoaded', () => {
  const selectors = '.fade-scroll, .fade-left';
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(selectors).forEach(el => io.observe(el));
});

/* ===== Bubble effect (lightweight) ===== */
(function(){
  const canvas = document.getElementById('bubbles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const bubbles = [];
  const MAX = 180;
  const rand = (a,b)=> Math.random()*(b-a)+a;
  let lastSpawn = 0;

  function spawn(x,y,source=true){
    if(bubbles.length > MAX) return;
    const count = source ? Math.floor(rand(1,4)) : 1;
    for(let i=0;i<count;i++){
      bubbles.push({
        x: x + rand(-10,10),
        y: y + rand(-8,8),
        r: rand(2,7),
        vx: rand(-0.25,0.25),
        vy: rand(-0.8,-1.8) * (0.9 + Math.random()*0.6),
        life: 0,
        ttl: rand(1200,3000)
      });
    }
  }

  function update(dt){
    for(let i=bubbles.length-1;i>=0;i--){
      const b = bubbles[i];
      b.life += dt;
      b.vx += Math.sin((b.life + i)*0.01)*0.002;
      b.x += b.vx * (dt*0.06);
      b.y += b.vy * (dt*0.06);
      b.r *= 0.999;
      if(b.life > b.ttl || b.r < 0.5 || b.y < -20){
        bubbles.splice(i,1);
      }
    }
  }

  let last = performance.now();
  function loop(now){
    const dt = now - last;
    last = now;
    ctx.clearRect(0,0,w,h);
    update(dt);
    for(const b of bubbles){
      const alpha = 1 - (b.life / b.ttl);
      const grad = ctx.createRadialGradient(b.x - b.r*0.25, b.y - b.r*0.25, b.r*0.1, b.x, b.y, b.r);
      grad.addColorStop(0, `rgba(255,255,255,${0.9*alpha})`);
      grad.addColorStop(0.6, `rgba(240,245,250,${0.35*alpha})`);
      grad.addColorStop(1, `rgba(200,220,230,${0.06*alpha})`);
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(b.x,b.y,Math.max(b.r,0.4),0,Math.PI*2);
      ctx.fill();
      // small highlight
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.5*alpha})`;
      ctx.arc(b.x - b.r*0.45, b.y - b.r*0.45, Math.max(b.r*0.28,0.4), 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // pointer handlers
  function onMove(x,y){
    const now = performance.now();
    if(now - lastSpawn > 40){
      spawn(x,y,true);
      lastSpawn = now;
    }
  }
  window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if(t) onMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('click', e => {
    for(let i=0;i<6;i++) spawn(e.clientX + rand(-12,12), e.clientY + rand(-12,12), true);
  });

  // occasional ambient bubbles from bottom (to simulate glass)
  setInterval(()=> {
    const x = rand(window.innerWidth*0.3, window.innerWidth*0.7);
    const y = window.innerHeight - rand(30,120);
    spawn(x,y,false);
  }, 1400);

  window.addEventListener('resize', ()=>{
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });
})();

/* ===== Small accessibility: focus outlines for keyboard users ===== */
(function(){
  function handleFirstTab(e){
    if(e.key === 'Tab'){
      document.documentElement.classList.add('show-focus');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();
