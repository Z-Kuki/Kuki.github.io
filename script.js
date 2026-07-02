// script.js
// 初始化 Lucide 图标
lucide.createIcons();

// ----- 分类筛选功能 -----
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.card[data-category]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    productCards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ----- 滚动动画 (Intersection Observer) -----
const revealElements = document.querySelectorAll('.reveal');
const revealOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('active');
    revealOnScroll.unobserve(entry.target);
  });
}, revealOptions);

revealElements.forEach(el => revealOnScroll.observe(el));

// ----- Canvas 波纹特效 -----
const canvas = document.getElementById('interference');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let w, h, dpr;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const spacing = 28;
const wavelength = 50;
const speed = 0.025;
let t = 0;
let raf;

function frame() {
  ctx.clearRect(0, 0, w, h);
  const sx1 = w * 0.3, sy1 = h * 0.4;
  const sx2 = w * 0.7, sy2 = h * 0.6;

  for (let x = 0; x < w; x += spacing) {
    for (let y = 0; y < h; y += spacing) {
      const d1 = Math.hypot(x - sx1, y - sy1);
      const d2 = Math.hypot(x - sx2, y - sy2);
      const v = Math.sin(d1 / wavelength - t) + Math.sin(d2 / wavelength - t);
      const amp = (v + 2) / 4;
      const r = 1 + amp * 2;
      const alpha = 0.05 + amp * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      const isWarm = (x / w) > 0.6;
      ctx.fillStyle = isWarm ? `rgba(238, 76, 44, ${alpha * 0.8})` : `rgba(0,119,182,${alpha})`;
      ctx.fill();
    }
  }
  if (!reduceMotion) {
    t += speed;
    raf = requestAnimationFrame(frame);
  }
}
frame();