// スクロールでフェードイン
document.addEventListener("scroll", () => {
  document.querySelectorAll(".fade-scroll").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  });
});

// マウス／タッチ座標
let pointer = { x: width/2, y: height/2 };

// マウス操作用フラグ
let enableMouse = window.innerWidth >= 768;

// マウス座標更新
if(enableMouse){
  window.addEventListener('mousemove', e => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
}

// タッチ操作の場合（スマホ）
else {
  window.addEventListener('touchmove', e => {
    const touch = e.touches[0]; // 最初の指
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
  }, {passive: false}); // デフォルトスクロール抑制しない
}

// アニメーション内の引き寄せ
for(let p of particles){
  p.x += p.dx;
  p.y += p.dy;
  if(p.x < 0 || p.x > width) p.dx *= -1;
  if(p.y < 0 || p.y > height) p.dy *= -1;

  // pointerに引き寄せ
  const dx = pointer.x - p.x;
  const dy = pointer.y - p.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist < 150){
    const force = (150 - dist) / 150;
    p.x += dx * 0.02 * force;
    p.y += dy * 0.02 * force;
  }
}

// リサイズ時も対応
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  enableMouse = window.innerWidth >= 768;
});
