// script-v2.js
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

// ----- 滚动显现系统 -----
const revealElements = document.querySelectorAll('.reveal');
const revealOptions = {
  threshold: 0.08,
  rootMargin: "0px 0px -40px 0px"
};

const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('active');
    revealOnScroll.unobserve(entry.target);
  });
}, revealOptions);

revealElements.forEach(el => revealOnScroll.observe(el));

// ----- Canvas 浅色科技波纹特效 -----
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

const spacing = 30;
const wavelength = 48;
const speed = 0.02;
let t = 0;

function frame() {
  ctx.clearRect(0, 0, w, h);
  const sx1 = w * 0.25, sy1 = h * 0.35;
  const sx2 = w * 0.75, sy2 = h * 0.65;

  for (let x = 0; x < w; x += spacing) {
    for (let y = 0; y < h; y += spacing) {
      const d1 = Math.hypot(x - sx1, y - sy1);
      const d2 = Math.hypot(x - sx2, y - sy2);
      const v = Math.sin(d1 / wavelength - t) + Math.sin(d2 / wavelength - t);
      const amp = (v + 2) / 4;
      const r = 1 + amp * 1.5;
      const alpha = 0.04 + amp * 0.12;
      
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      
      // 使用科技浅蓝 (2, 132, 199) 进行渲染，完美融入白色背景
      ctx.fillStyle = `rgba(2, 132, 199, ${alpha})`;
      ctx.fill();
    }
  }
  if (!reduceMotion) {
    t += speed;
    requestAnimationFrame(frame);
  }
}
frame();
