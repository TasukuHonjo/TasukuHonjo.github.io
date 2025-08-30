// ===== スクロールでフェードイン =====
const sections =  document.querySelectorAll(".fade-scroll, .fade-left, .fade-right");
function showOnScroll() {
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.classList.add("visible");
    }
  });
}
window.addEventListener("scroll", showOnScroll);
showOnScroll();

// ===== ネオン文字色アニメ =====
const title = document.querySelector("header h1");
let hue = 0;
function animateHue() {
  hue = (hue + 1) % 360;
  title.style.color = `hsl(${hue}, 100%, 60%)`;
  requestAnimationFrame(animateHue);
}
animateHue();

// ===== パーティクル =====
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const particles = [];
const particleCount = 100;
function random(min, max) { return Math.random() * (max - min) + min; }

// パーティクル初期化
for (let i = 0; i < particleCount; i++) {
  particles.push({
    x: random(0, width),
    y: random(0, height),
    r: random(1, 3),
    dx: random(-0.5, 0.5),
    dy: random(-0.5, 0.5)
  });
}

// pointer座標
let pointer = { x: width / 2, y: height / 2 };
let enablePointer = window.innerWidth >= 768;

// マウス座標更新
if (enablePointer) {
  window.addEventListener('mousemove', e => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
} else {
  // スマホタッチ
  window.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
  }, { passive: true });
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  // パーティクル更新
  for (let p of particles) {
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > width) p.dx *= -1;
    if (p.y < 0 || p.y > height) p.dy *= -1;

    // pointer引き寄せ
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const force = (150 - dist) / 150;
      p.x += dx * 0.02 * force;
      p.y += dy * 0.02 * force;
    }
  }

  // パーティクル同士の線
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,255,255,${1 - dist / 120})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // パーティクル描画
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(106, 255, 255, 1)';
    ctx.fill();
  }

  requestAnimationFrame(animate);
}
animate();

// リサイズ対応
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  enablePointer = window.innerWidth >= 768;
  pointer = { x: width / 2, y: height / 2 };
});

