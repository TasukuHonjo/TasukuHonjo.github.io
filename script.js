/* Common script for all pages
   - IntersectionObserver for fade-in
   - Bubble effect (triggered by mouse/touch only)
   - Ice cubes floating
   - Accessibility helpers
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ===== Fade-in with IntersectionObserver ===== */
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

/* ===== Bubble system ===== */
(function () {
  const canvas = document.getElementById("bubbles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const bubbles = [];
  const NUM_BUBBLES = 40;     // 常に維持する泡の数
  const rand = (a, b) => Math.random() * (b - a) + a;

  function createBubble(x = rand(0, w), y = rand(0, h), r = rand(4, 12)) {
  return {
    x,
    y,
    r,
    floating: false,
    vx: rand(-0.2, 0.2),
    vy: rand(-1.2, -2.5),
    life: 0,
    ttl: rand(2000, 4000),
    split: false,
    canSplit: true,
    opacity: 0,         // フェードイン用
    fadeInTime: 800,
    fadeLife: 0,
    dying: false        // フェードアウト中かどうか
  };
}

  // ===== 初期泡配置 =====
  for (let i = 0; i < NUM_BUBBLES; i++) {
    bubbles.push(createBubble());
  }

  function update(dt) {
  const scale = dt * 0.08;
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];

    // ===== フェードイン処理 =====
    if (!b.floating && b.opacity < 1) {
      b.fadeLife += dt;
      b.opacity = Math.min(1, b.fadeLife / b.fadeInTime);
    }

    if (b.floating) {
      b.life += dt;
      b.x += b.vx * scale;
      b.y += b.vy * scale;

      // ===== 浮遊中に徐々に消えていく =====
      const lifeRatio = b.life / b.ttl;         // 0.0 → 1.0
      b.opacity = Math.max(0, 1 - lifeRatio);   // 徐々に透明に
      b.r *= 0.998;                             // 少しずつ縮む

      // 分裂処理（親泡のみ1回）
      if (b.canSplit && !b.split && lifeRatio > 0.3) {
        b.split = true;
        const num = Math.floor(rand(2, 4));
        for (let j = 0; j < num; j++) {
          const child = createBubble(
            b.x + rand(-6, 6),
            b.y + rand(-6, 6),
            b.r * rand(0.4, 0.7)
          );
          child.floating = true;
          child.canSplit = false;
          bubbles.push(child);
        }
      }

      // 完全に消えた or 画面外に出たら再生成
      if (b.y < -20 || b.opacity <= 0 || b.r < 0.5) {
        bubbles[i] = createBubble(rand(0, w), rand(0, h));
      }
    }
  }

  // 泡の数を一定に保つ
  if (bubbles.length > NUM_BUBBLES) {
    bubbles.splice(NUM_BUBBLES);
  }
}


  function draw() {
  ctx.clearRect(0, 0, w, h);
  for (let b of bubbles) {
    if (b.opacity <= 0) continue;
    const alpha = b.opacity;
    const grad = ctx.createRadialGradient(
      b.x - b.r * 0.3,
      b.y - b.r * 0.3,
      b.r * 0.1,
      b.x,
      b.y,
      b.r
    );
    grad.addColorStop(0, `rgba(255,255,255,${0.9 * alpha})`);
    grad.addColorStop(0.6, `rgba(235,245,250,${0.4 * alpha})`);
    grad.addColorStop(1, `rgba(200,220,230,${0.08 * alpha})`);

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

  // ===== マウスやタッチで触れた泡を浮上させる =====
  function checkCollision(x, y) {
    for (let b of bubbles) {
      const dx = b.x - x;
      const dy = b.y - y;
      if (!b.floating && dx*dx + dy*dy < (b.r * 2) ** 2) {
        b.floating = true;
        b.life = 0;
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
})();

function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

window.addEventListener("mousemove", (e) => {
  const pos = getCanvasPos(e, canvas);
  checkCollision(pos.x, pos.y);
});


/* ===== Ice cubes random generation ===== */
/* ===== Ice cubes: physics-driven motion ===== */
document.addEventListener("DOMContentLoaded", () => {
  const NUM_ICE = 10;
  const MIN_SIZE = 350;
  const MAX_SIZE = 580;

  if (window.innerWidth <= 768) {   // スマホ
    MIN_SIZE = 150;
    MAX_SIZE = 250;
  } else if (window.innerWidth <= 1200) { // タブレット
    MIN_SIZE = 250;
    MAX_SIZE = 400;
  }

  const INFLUENCE = 400;      // マウスの影響半径
  const PUSH_STRENGTH = 0.5;  // 押し出し強度
  const SPRING = 0.0005;      // 戻ろうとする力
  const FRICTION = 0.9;       // 摩擦
  const MAX_DISPLACEMENT = 1000;

  const ices = [];



// ----- 初期ランダム配置 -----
// 画面外に多少はみ出す許容範囲
const OFFSET_X = 200; // 左右
const OFFSET_Y = 150; // 上下

for (let i = 0; i < NUM_ICE; i++) {
  const el = document.createElement("div");
  el.classList.add("ice");
  el.style.willChange = "transform";
  el.style.transformOrigin = "center center";
  el.style.position = "fixed";

  const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE);

  let baseX, baseY;

  if (Math.random() < 0.3) {
    // ===== 30% は「必ずはみ出す」 =====
    // 画面外の上下左右いずれかに出す
    const side = Math.floor(Math.random() * 4); // 0=左,1=右,2=上,3=下
    switch (side) {
      case 0: // 左にはみ出す
        baseX = -Math.random() * OFFSET_X - size * 0.5;
        baseY = Math.random() * window.innerHeight;
        break;
      case 1: // 右にはみ出す
        baseX = window.innerWidth + Math.random() * OFFSET_X - size * 0.5;
        baseY = Math.random() * window.innerHeight;
        break;
      case 2: // 上にはみ出す
        baseX = Math.random() * window.innerWidth;
        baseY = -Math.random() * OFFSET_Y - size * 0.5;
        break;
      case 3: // 下にはみ出す
        baseX = Math.random() * window.innerWidth;
        baseY = window.innerHeight + Math.random() * OFFSET_Y - size * 0.5;
        break;
    }
  } else {
    // ===== 残り 70% は「普通に画面内」 =====
    baseX = Math.random() * (window.innerWidth - size);
    baseY = Math.random() * (window.innerHeight - size);
  }

  el.style.width = size + "px";
  el.style.height = size + "px";
  el.style.left = baseX + "px";
  el.style.top = baseY + "px";

  document.body.appendChild(el);

  ices.push({
    el,
    size,
    x: baseX,
    y: baseY,
    vx: 0,
    vy: 0,
    angle: (Math.random() - 0.5) * 4,
  });
}



  // ----- ポテンシャル法で重なりを離す -----
  const REPULSION = 20;   // 余白
  const ITERATIONS = 200; // 調整ループ回数
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < ices.length; i++) {
      for (let j = i + 1; j < ices.length; j++) {
        const a = ices[i];
        const b = ices[j];
        const dx = (b.x + b.size/2) - (a.x + a.size/2);
        const dy = (b.y + b.size/2) - (a.y + a.size/2);
        const dist = Math.hypot(dx, dy);
        const minDist = (a.size + b.size)/2 + REPULSION;

        if (dist < minDist && dist > 0.1) {
          // 重なっている場合は押し出す
          const overlap = (minDist - dist) / 2;
          const offsetX = (dx / dist) * overlap;
          const offsetY = (dy / dist) * overlap;

          a.x -= offsetX;
          a.y -= offsetY;
          b.x += offsetX;
          b.y += offsetY;

          // 画面外チェック
          a.x = Math.max(0, Math.min(window.innerWidth - a.size, a.x));
          a.y = Math.max(0, Math.min(window.innerHeight - a.size, a.y));
          b.x = Math.max(0, Math.min(window.innerWidth - b.size, b.x));
          b.y = Math.max(0, Math.min(window.innerHeight - b.size, b.y));
        }
      }
    }
  }

  // ----- transformに反映 -----
  ices.forEach((ice) => {
    ice.baseX = ice.x; 
    ice.baseY = ice.y; 
    ice.el.style.left = ice.x + "px";
    ice.el.style.top = ice.y + "px";
  });


  let mouseX = null;
  let mouseY = null;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouseX = null;
    mouseY = null;
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(32, now - last);
    last = now;

    for (let ice of ices) {
      // マウスから押し出し
      if (mouseX !== null && mouseY !== null) {
        const cx = ice.x + ice.size / 2;
        const cy = ice.y + ice.size / 2;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist < INFLUENCE && dist > 0.001) {
          const t = 1 - dist / INFLUENCE;
          const force = PUSH_STRENGTH * (t * t);
          ice.vx += (dx / dist) * force * (dt / 16);
          ice.vy += (dy / dist) * force * (dt / 16);
        }
      }

      // バネでベースに戻る力
      const rx = (ice.baseX - ice.x) * SPRING * (dt / 16);
      const ry = (ice.baseY - ice.y) * SPRING * (dt / 16);
      ice.vx += rx;
      ice.vy += ry;

      // 摩擦
      const fr = Math.pow(FRICTION, dt / 16);
      ice.vx *= fr;
      ice.vy *= fr;

      // 更新
      ice.x += ice.vx;
      ice.y += ice.vy;
      ice.angle += (ice.vx * 0.05 + ice.vy * 0.03);

      // 最大変位制御
      const dxBase = ice.x - ice.baseX;
      const dyBase = ice.y - ice.baseY;
      const disp = Math.hypot(dxBase, dyBase);
      if (disp > MAX_DISPLACEMENT) {
        const k = MAX_DISPLACEMENT / disp;
        ice.x = ice.baseX + dxBase * k;
        ice.y = ice.baseY + dyBase * k;
        ice.vx *= 0.5;
        ice.vy *= 0.5;
      }

      // transform 適用
      const tx = Math.round(ice.x - ice.baseX);
      const ty = Math.round(ice.y - ice.baseY);
      ice.el.style.transform = `translate(${tx}px, ${ty}px) rotate(${ice.angle.toFixed(2)}deg)`;
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener("resize", () => {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    ices.forEach((ice) => {
      ice.baseX = Math.min(Math.max(0, ice.baseX), Math.max(0, ww - ice.size));
      ice.baseY = Math.min(Math.max(0, ice.baseY), Math.max(0, wh - ice.size));
      ice.x = ice.baseX;
      ice.y = ice.baseY;
    });
  });
});


/* ===== Bubble effect for mobile/desktop ===== */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".bubble-container");

  function createBubble() {
    const bubble = document.createElement("span");
    bubble.classList.add("bubble");

    // ランダムなサイズ・位置・速度
    const size = Math.random() * 8 + 4; // 4〜12px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;

    const duration = Math.random() * 3 + 4; // 4〜7秒
    bubble.style.animationDuration = `${duration}s`;

    container.appendChild(bubble);

    // 上昇アニメが終わったら削除
    setTimeout(() => bubble.remove(), duration * 1000);
  }

  // 一定間隔で泡を生成
  setInterval(createBubble, 100);
});


/* ===== Accessibility: focus outlines for keyboard users ===== */
(function () {
  function handleFirstTab(e) {
    if (e.key === "Tab") {
      document.documentElement.classList.add("show-focus");
      window.removeEventListener("keydown", handleFirstTab);
    }
  }
  window.addEventListener("keydown", handleFirstTab);
})();


window.addEventListener("scroll", () => {
  const img = document.querySelector(".hero-name-image");
  const scrollY = window.scrollY;
  const fadeStart = 0;            // ページ先頭から
  const fadeEnd = window.innerHeight * 0.6; // 画面高さの6割くらいで消える

  let opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
  opacity = Math.max(0, Math.min(1, opacity));

  img.style.opacity = opacity;
});

const track = document.querySelector('.slider-track');
const dots = document.querySelectorAll('.slider-dots .dot');
let currentIndex = 0;

function updateSlider() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  dots.forEach(dot => dot.classList.remove('active'));
  dots[currentIndex].classList.add('active');
}

document.querySelector('.slider-btn.next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % track.children.length;
  updateSlider();
});

document.querySelector('.slider-btn.prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + track.children.length) % track.children.length;
  updateSlider();
});

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    currentIndex = index;
    updateSlider();
  });
});
