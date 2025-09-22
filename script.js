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
  const MAX = 600;
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
    for(let i=0;i<20;i++) spawn(e.clientX + rand(-18,18), e.clientY + rand(-18,18), true);
  });

  // occasional ambient bubbles from bottom (to simulate glass)
  setInterval(() => {
  const x = rand(window.innerWidth*0.25, window.innerWidth*0.75);
  const y = window.innerHeight - rand(36,140);
  spawn(x,y,false);
  }, 200); // ← 0.2秒ごとに湧く

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

/* ===== 氷のランダム生成 ===== */
document.addEventListener("DOMContentLoaded", () => {
  const NUM_ICE = 6; // 氷の数
  const MIN_SIZE = 350; // 氷の最小サイズ(px)
  const MAX_SIZE = 580; // 氷の最大サイズ(px)

  for (let i = 0; i < NUM_ICE; i++) {
    const ice = document.createElement("div");
    ice.classList.add("ice");

    // ランダムサイズ
    const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE);
    ice.style.width = size + "px";
    ice.style.height = size + "px";

    // ランダム位置（画面内に配置）
    const left = Math.random() * 80; // 0〜80% の範囲
    const top = Math.random() * 70;  // 0〜70% の範囲
    ice.style.left = left + "%";
    ice.style.top = top + "%";

    // ランダムアニメーション（速度＆ディレイ）
    // 修正版（速くする）
    const duration = 1.8 + Math.random() * 2.2; // 1.8〜4秒くらい
    const delay = Math.random() * 6;        // 0〜6秒
    ice.style.animationDuration = duration + "s";
    ice.style.animationDelay = delay + "s";

    document.body.appendChild(ice);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bubbles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const bubbles = [];
  const NUM_BUBBLES = 80; // 初期に静止して配置する泡の数
  const rand = (a, b) => Math.random() * (b - a) + a;

  // 泡を生成（静止状態）
  function createBubble(x = rand(0, w), y = rand(0, h), r = rand(4, 12)) {
  return {
    x,
    y,
    r,
    floating: false,     // 初期は静止
    vy: rand(-1.2, -2.5),
    vx: rand(-0.2, 0.2),
    life: 0,
    ttl: rand(2000, 4000),
    split: false,
    floatDelay: rand(2000, 8000) // ランダムで浮上開始するまでの待機時間(ms)
  };
}

// 初期配置
  for (let i = 0; i < NUM_BUBBLES; i++) {
    bubbles.push(createBubble());
  }

function update(dt) {
  const scale = dt * 0.08;
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];

    // 浮上していない泡 → 一定時間経つと自発的に浮上開始
    if (!b.floating) {
      b.life += dt;
      if (b.life > b.floatDelay) {
        b.floating = true;
        b.life = 0;
      }
    }

    if (b.floating) {
      b.life += dt;
      b.x += b.vx * scale;
      b.y += b.vy * scale;
      b.r *= 0.997;

      // 分裂処理
      if (!b.split && b.life > b.ttl * 0.3) {
        b.split = true;
        const num = Math.floor(rand(2, 4));
        for (let j = 0; j < num; j++) {
          const child = createBubble(
            b.x + rand(-6, 6),
            b.y + rand(-6, 6),
            b.r * rand(0.4, 0.7)
          );
          child.floating = true;
          bubbles.push(child);
        }
      }

      // 画面外に出たらリセット（新しいランダム位置に静止泡として再生成）
      if (b.y < -20 || b.r < 1) {
        bubbles[i] = createBubble(
          rand(0, w),
          h + rand(20, 100),
          rand(4, 12)
        );
      }
    }
  }
}



  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let b of bubbles) {
      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.3,
        b.y - b.r * 0.3,
        b.r * 0.1,
        b.x,
        b.y,
        b.r
      );
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.6, "rgba(235,245,250,0.4)");
      grad.addColorStop(1, "rgba(200,220,230,0.08)");

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = now - last;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // マウスが触れたら浮上フラグを立てる
  function checkCollision(x, y) {
    for (let b of bubbles) {
      const dx = b.x - x;
      const dy = b.y - y;
      if (!b.floating && Math.sqrt(dx * dx + dy * dy) < b.r * 1.2) {
        b.floating = true;
      }
    }
  }

  window.addEventListener("mousemove", (e) => checkCollision(e.clientX, e.clientY));
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) checkCollision(t.clientX, t.clientY);
  });
  window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });
});

