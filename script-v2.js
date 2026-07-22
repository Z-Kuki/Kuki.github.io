// script-v2.js
lucide.createIcons();

// =========================================
// 1. 导航栏滑动阴影效果 (全局有效)
// =========================================
const navEl = document.querySelector('.nav');
if (navEl) {
  const updateNavScroll = () => navEl.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateNavScroll);
  updateNavScroll(); // 页面加载时初始化一次
}

// =========================================
// 2. 滚动显现系统 (全局有效)
// =========================================
const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // 显现后停止监听，提升性能
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
revealElements.forEach(el => revealOnScroll.observe(el));

// =========================================
// 3. 核心产品分类筛选 (仅核心产品页/首页有效)
// =========================================
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.card[data-category]');
if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      productCards.forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
      });
    });
  });
}

// =========================================
// 4. 背景 Canvas 动画特效
// =========================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 4.1 首页 Hero 干扰波纹特效 (仅首页有效，增加安全校验)
const interferenceCanvas = document.getElementById('interference');
if (interferenceCanvas && !reduceMotion) {
  const ctx = interferenceCanvas.getContext('2d');
  let w, h, t = 0;
  
  const resizeInterference = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = interferenceCanvas.clientWidth;
    h = interferenceCanvas.clientHeight;
    interferenceCanvas.width = w * dpr;
    interferenceCanvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener('resize', resizeInterference);
  resizeInterference();

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    for (let x = 0; x < w; x += 30) {
      for (let y = 0; y < h; y += 30) {
        const v = Math.sin(Math.hypot(x - w*0.25, y - h*0.35) / 48 - t) + 
                  Math.sin(Math.hypot(x - w*0.75, y - h*0.65) / 48 - t);
        const amp = (v + 2) / 4;
        ctx.beginPath();
        ctx.arc(x, y, 1 + amp * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(2, 132, 199, ${0.04 + amp * 0.12})`;
        ctx.fill();
      }
    }
    t += 0.02;
    requestAnimationFrame(frame);
  };
  frame();
}

// 4.2 全局分子移动特效 (所有页面有效)
const molCanvas = document.getElementById('moleculeCanvas');
if (molCanvas && !reduceMotion) {
  const mctx = molCanvas.getContext('2d');
  let mw, mh, particles = [];
  
  const resizeMol = () => {
    mw = window.innerWidth;
    mh = window.innerHeight;
    molCanvas.width = mw;
    molCanvas.height = mh;
  };
  window.addEventListener('resize', resizeMol);
  resizeMol();

  // 初始化粒子
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * mw, y: Math.random() * mh,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 2 + 1
    });
  }

  const animateMol = () => {
    mctx.clearRect(0, 0, mw, mh);
    
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > mw) p.vx *= -1;
      if (p.y < 0 || p.y > mh) p.vy *= -1;
      mctx.beginPath();
      mctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      mctx.fillStyle = 'rgba(2, 132, 199, 0.6)';
      mctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 130) {
          mctx.beginPath();
          mctx.moveTo(particles[i].x, particles[i].y);
          mctx.lineTo(particles[j].x, particles[j].y);
          mctx.strokeStyle = `rgba(2, 132, 199, ${(1 - dist / 130) * 0.5})`;
          mctx.lineWidth = 0.8;
          mctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateMol);
  };
  animateMol();
}