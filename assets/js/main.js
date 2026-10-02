/* CREST Twin Agriculture — interactions */
(() => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.75);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    const toggle = (open) => {
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open);
    };
    btn.addEventListener('click', () => toggle(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // year
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();

/* ------------------------------------------------------------
   Hero: a procedurally generated tree, half "real", half "twin".
   Left of the scan plane: dense organic points.
   Right of the scan plane: cyan point cloud + reconstructed skeleton.
   ------------------------------------------------------------ */
(() => {
  const cv = document.getElementById('twin-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = 1;

  // seeded RNG so the tree is identical on every visit
  let seed = 20261001;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const rr = (a, b) => a + (b - a) * rnd();

  const segs = [];   // skeleton: [x1,y1,z1,x2,y2,z2,depth]
  const pts = [];    // surface points: [x,y,z,type] type 0=bark 1=leaf 2=fruit
  const ground = []; // field rows

  const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  function grow(p, d, len, rad, depth) {
    const q = [p[0] + d[0] * len, p[1] + d[1] * len, p[2] + d[2] * len];
    segs.push([...p, ...q, depth]);
    // bark samples on a cylinder
    const up = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = norm(cross(d, up)), v = norm(cross(d, u));
    const n = Math.max(8, Math.floor(len * rad * 2600));
    for (let i = 0; i < n; i++) {
      const t = rnd(), a = rnd() * Math.PI * 2, r = rad * (1 - t * 0.25);
      pts.push([
        p[0] + d[0] * len * t + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r,
        p[1] + d[1] * len * t + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r,
        p[2] + d[2] * len * t + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r, 0]);
    }
    if (depth >= 6 || rad < 0.012) {
      // leaf cluster
      const k = 40;
      for (let i = 0; i < k; i++) {
        const a = rnd() * Math.PI * 2, b = Math.acos(rr(-1, 1)), r = Math.cbrt(rnd()) * 0.16;
        pts.push([q[0] + r * Math.sin(b) * Math.cos(a), q[1] + r * Math.cos(b) * 0.7, q[2] + r * Math.sin(b) * Math.sin(a), 1]);
      }
      if (rnd() < 0.18) pts.push([q[0], q[1] - 0.08, q[2], 2]);
      return;
    }
    const kids = depth < 1 ? 3 : (rnd() < 0.35 ? 3 : 2);
    const base = rnd() * Math.PI * 2;
    for (let i = 0; i < kids; i++) {
      const ang = base + (i / kids) * Math.PI * 2 + rr(-0.4, 0.4);
      const spread = rr(0.45, 0.7);
      const side = [Math.cos(ang), 0, Math.sin(ang)];
      let nd = norm([d[0] * Math.cos(spread) + side[0] * Math.sin(spread),
                     d[1] * Math.cos(spread) + 0.12,
                     d[2] * Math.cos(spread) + side[2] * Math.sin(spread)]);
      grow(q, nd, len * rr(0.64, 0.76), rad * 0.68, depth + 1);
    }
  }
  // trunk
  grow([0, -1.15, 0], [0, 1, 0], 0.7, 0.06, 0);

  // field rows (ground plane)
  for (let row = -7; row <= 7; row++) {
    for (let i = 0; i < 70; i++) {
      const x = -4.2 + i * 0.12 + rr(-0.02, 0.02);
      const z = row * 0.42 + rr(-0.04, 0.04);
      if (Math.hypot(x, z) < 0.5) continue;
      ground.push([x, -1.15 + rr(0, 0.04) + (i % 7 === 0 ? 0.06 : 0), z]);
    }
  }

  let rotY = 0.5, tgtTilt = 0.18, tilt = 0.18, mx = 0;
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  window.addEventListener('resize', resize);
  resize();
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / W - 0.5);
    tgtTilt = 0.18 + (e.clientY / H - 0.5) * 0.18;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);

  const proj = (x, y, z, cx, cy, s, cr, sr, ct, st) => {
    const X = x * cr - z * sr, Z0 = x * sr + z * cr;
    const Y = y * ct - Z0 * st, Z = y * st + Z0 * ct;
    const f = 4.2 / (4.2 + Z);
    return [cx + X * s * f, cy - Y * s * f, f, Z];
  };

  let t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(50, now - t0); t0 = now;
    if (!reduce) rotY += dt * 0.00009 + mx * dt * 0.00025;
    tilt += (tgtTilt - tilt) * 0.04;

    ctx.clearRect(0, 0, W, H);
    const mobile = W < 760;
    const cx = mobile ? W * 0.5 : W * 0.66;
    const cy = mobile ? H * 0.4 : H * 0.5;
    const s = Math.min(W, H) * (mobile ? 0.34 : 0.34);
    const split = cx + Math.sin(now * 0.00025) * s * 0.25; // scan plane wanders slightly
    const cr = Math.cos(rotY), sr = Math.sin(rotY), ct = Math.cos(tilt), st = Math.sin(tilt);

    // ground
    for (const g of ground) {
      const p = proj(g[0], g[1], g[2], cx, cy, s, Math.cos(rotY * 0.25), Math.sin(rotY * 0.25), ct, st);
      if (p[2] <= 0) continue;
      const twin = p[0] > split;
      const a = Math.max(0, Math.min(1, (p[2] - 0.55) * 1.4)) * 0.55;
      ctx.fillStyle = twin ? `rgba(79,214,201,${a})` : `rgba(143,209,106,${a * 0.8})`;
      const r = twin ? 1.1 : 1.3;
      ctx.fillRect(p[0], p[1], r, r);
    }

    // skeleton (twin side only)
    ctx.lineWidth = 1;
    for (const sg of segs) {
      const a = proj(sg[0], sg[1], sg[2], cx, cy, s, cr, sr, ct, st);
      const b = proj(sg[3], sg[4], sg[5], cx, cy, s, cr, sr, ct, st);
      if (a[0] < split && b[0] < split) continue;
      let ax = a[0], ay = a[1], bx = b[0], by = b[1];
      if (ax < split) { const k = (split - ax) / (bx - ax); ax = split; ay = ay + (by - ay) * k; }
      if (bx < split) { const k = (split - bx) / (ax - bx); bx = split; by = by + (ay - by) * k; }
      ctx.strokeStyle = `rgba(79,214,201,${0.75 - sg[6] * 0.07})`;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = 'rgba(201,242,122,.9)';
      if (b[0] >= split) ctx.fillRect(b[0] - 1.5, b[1] - 1.5, 3, 3);
    }

    // surface points
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i];
      const p = proj(q[0], q[1], q[2], cx, cy, s, cr, sr, ct, st);
      const twin = p[0] > split;
      const depthA = Math.max(0.15, Math.min(1, (p[2] - 0.6) * 1.6));
      if (twin) {
        if (i % 3) continue; // sparser sampled cloud
        ctx.fillStyle = q[3] === 2 ? `rgba(255,190,120,${depthA})` : `rgba(79,214,201,${depthA * 0.75})`;
        ctx.fillRect(p[0], p[1], 1.4, 1.4);
      } else {
        if (q[3] === 0) ctx.fillStyle = `rgba(214,200,170,${depthA * 0.55})`;
        else if (q[3] === 1) ctx.fillStyle = `rgba(143,209,106,${depthA * 0.7})`;
        else ctx.fillStyle = `rgba(255,150,90,${depthA})`;
        const r = q[3] === 2 ? 4 : (q[3] === 1 ? 2.1 : 1.6);
        ctx.fillRect(p[0] - r / 2, p[1] - r / 2, r, r);
      }
    }

    // scan plane
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, 'rgba(79,214,201,0)');
    grd.addColorStop(0.5, 'rgba(79,214,201,.55)');
    grd.addColorStop(1, 'rgba(79,214,201,0)');
    ctx.fillStyle = grd; ctx.fillRect(split, 0, 1, H);
    const glow = ctx.createLinearGradient(split - 60, 0, split, 0);
    glow.addColorStop(0, 'rgba(79,214,201,0)'); glow.addColorStop(1, 'rgba(79,214,201,.07)');
    ctx.fillStyle = glow; ctx.fillRect(split - 60, 0, 60, H);
  }
  requestAnimationFrame(frame);
})();
