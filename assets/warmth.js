// Banyan · Direction C, warmth. Light motion: the hero settles, the billboard grows,
// the month list ticks itself off as you scroll, and the banker answers.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth <= 860;

  // Entrance
  requestAnimationFrame(() => document.body.classList.add("is-in"));

  // Meters fill once the billboard is in view
  const meters = $("[data-meters]");
  if (meters) {
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      $$("b[data-to]", meters).forEach((b, i) => {
        b.style.transition = reduce ? "none" : `width 1.6s cubic-bezier(.22,1,.36,1) ${0.2 + i * 0.25}s`;
        b.style.width = `${Number(b.dataset.to) * 100}%`;
      });
      o.disconnect();
    }, { threshold: 0.3 }).observe(meters.closest("figure"));
  }

  // The month list: each item is ticked off as the section scrolls past (sequentially on phones)
  const month = $("[data-month]");
  if (month) {
    const apps = $("[data-apps]", month), items = $$("[data-item]", month), left = $("[data-left]", month), done = $("[data-done]", month);
    const set = (n) => {
      items.forEach((li, i) => li.classList.toggle("done", i < n));
      left.textContent = `${n} of ${items.length}`;
      done.classList.toggle("on", n === items.length);
      if (apps) {
        $$("span", apps).forEach((a, i) => a.classList.toggle("gone", i < n));
        apps.classList.toggle("one", n === items.length);
      }
    };
    if (reduce) set(items.length);
    else {
      const onScroll = () => {
        if (mobile()) return;
        const r = month.getBoundingClientRect(), travel = month.offsetHeight - innerHeight;
        const p = Math.max(0, Math.min(1, -r.top / travel));
        set(Math.min(items.length, Math.floor(p * (items.length + 1.2))));
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting || !mobile()) return;
        let n = 0;
        const id = setInterval(() => { set(++n); if (n >= items.length) clearInterval(id); }, 650);
        o.disconnect();
      }, { threshold: 0.5 }).observe($(".list", month));
    }
  }

  // How it works: the steps play through on their own and drive the app card; hover or tap to pick one
  const steps = $("[data-steps]");
  if (steps) {
    const li = $$(".banker-points li", steps), screens = $$(".app-s", steps);
    const dwell = 4200;
    let cur = 0, timer = 0, started = false;
    steps.style.setProperty("--dwell", `${dwell}ms`);
    const show = (n) => {
      cur = (n + li.length) % li.length;
      li.forEach((x, i) => x.classList.toggle("on", i === cur));
      screens.forEach((x, i) => x.classList.toggle("on", i === cur));
    };
    const play = () => { clearTimeout(timer); if (!reduce) timer = setTimeout(() => { show(cur + 1); play(); }, dwell); };
    li.forEach((x, i) => {
      const b = $("button", x);
      b.addEventListener("click", () => { show(i); play(); });
      b.addEventListener("mouseenter", () => { if (!mobile()) { show(i); clearTimeout(timer); steps.classList.add("paused"); } });
    });
    $(".banker-points", steps).addEventListener("mouseleave", () => { steps.classList.remove("paused"); if (started) { show(cur); play(); } });
    show(0);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { started = true; show(0); play(); }
      else if (!e.isIntersecting && started) { started = false; clearTimeout(timer); }
    }, { threshold: 0.35 }).observe(steps);
  }

  // UI chips on the photos settle in as their card arrives
  const chips = $$("[data-chip]");
  if (chips.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.6 });
    chips.forEach((x) => io.observe(x));
  }

  // The live rate ticks a little, so it reads as live
  const rate = $("[data-rate]");
  if (rate && !reduce) {
    let r = 88.42;
    setInterval(() => { r = Math.max(88.3, Math.min(88.55, r + (Math.random() - 0.5) * 0.04)); rate.textContent = `₹${r.toFixed(2)}`; }, 2600);
  }

  // The three proofs rise in under the billboard
  const proofs = $$("[data-rise-in]");
  if (proofs.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.4 });
    proofs.forEach((x) => io.observe(x));
  }

  // GSAP for the scroll-scrubbed pieces, if it loaded
  const start = () => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    // The billboard grows to fill the frame as it arrives
    gsap.fromTo("[data-grow]", { scale: 0.88, borderRadius: 40 }, { scale: 1, borderRadius: 28, ease: "none", scrollTrigger: { trigger: "[data-grow]", start: "top 95%", end: "top 25%", scrub: true } });
    // Each stacked card dims a touch as the next one slides over it
    $$(".card").forEach((c, i, all) => {
      if (i === all.length - 1) return;
      gsap.fromTo(c, { scale: 1, filter: "brightness(1)" }, { scale: 0.96, filter: "brightness(0.86)", ease: "none", scrollTrigger: { trigger: all[i + 1], start: "top 85%", end: "top 20%", scrub: true } });
    });
  };
  const wait = (n = 0) => (window.gsap && window.ScrollTrigger ? start() : n < 60 && setTimeout(() => wait(n + 1), 50));
  wait();
})();
