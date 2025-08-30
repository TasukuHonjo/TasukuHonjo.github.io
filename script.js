// スクロールでフェードイン
document.addEventListener("scroll", () => {
  document.querySelectorAll(".fade-scroll").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  });
});

// マウス座標（デフォルトは画面中央）
let mouse = { x: width/2, y: height/2 };

// 画面幅が768px以上のときのみマウスイベント登録
let enableMouse = window.innerWidth >= 768;

if(enableMouse){
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
}

// アニメーション内でのマウス引き寄せ部分
for(let p of particles){
  p.x += p.dx;
  p.y += p.dy;
  if(p.x < 0 || p.x > width) p.dx *= -1;
  if(p.y < 0 || p.y > height) p.dy *= -1;

  // マウス引き寄せは有効な場合のみ
  if(enableMouse){
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if(dist < 150){
      const force = (150 - dist) / 150;
      p.x += dx * 0.02 * force;
      p.y += dy * 0.02 * force;
    }
  }
}

// リサイズ時もマウス有効判定を更新
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  enableMouse = window.innerWidth >= 768;
});
