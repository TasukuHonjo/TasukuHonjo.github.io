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
  const NUM_BUBBLES = 80;     // 常に維持する泡の数
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
      if (!b.floating && Math.sqrt(dx * dx + dy * dy) < b.r * 1.2) {
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

/* ===== Ice cubes random generation ===== */
document.addEventListener("DOMContentLoaded", () => {
  const NUM_ICE = 6;
  const MIN_SIZE = 350;
  const MAX_SIZE = 580;

  for (let i = 0; i < NUM_ICE; i++) {
    const ice = document.createElement("div");
    ice.classList.add("ice");

    const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE);
    ice.style.width = size + "px";
    ice.style.height = size + "px";

    ice.style.left = Math.random() * 80 + "%";
    ice.style.top = Math.random() * 70 + "%";

    const duration = 1.8 + Math.random() * 2.2;
    const delay = Math.random() * 6;
    ice.style.animationDuration = duration + "s";
    ice.style.animationDelay = delay + "s";

    document.body.appendChild(ice);
  }
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
