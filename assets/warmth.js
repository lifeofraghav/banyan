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
    const items = $$("[data-item]", month), left = $("[data-left]", month), done = $("[data-done]", month);
    const set = (n) => {
      items.forEach((li, i) => li.classList.toggle("done", i < n));
      left.textContent = `${n} of ${items.length}`;
      done.classList.toggle("on", n === items.length);
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

  // How it works: hover or tap a step and the picture follows; it walks itself until someone touches it
  const steps = $("[data-steps]");
  if (steps) {
    const li = $$("li", steps), shots = $$(".bs");
    let cur = 0, timer = null, touched = false;
    const go = (i) => { cur = i; li.forEach((x, k) => x.classList.toggle("on", k === i)); shots.forEach((x, k) => x.classList.toggle("on", k === i)); };
    li.forEach((x, i) => {
      x.addEventListener("mouseenter", () => { touched = true; clearInterval(timer); go(i); });
      $("button", x).addEventListener("click", () => { touched = true; clearInterval(timer); go(i); });
    });
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting && !touched && !reduce) timer = setInterval(() => go((cur + 1) % li.length), 2800);
    }, { threshold: 0.35 }).observe(steps);
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
    // Hero: the photo drifts and settles as you leave it
    // The billboard grows to fill the frame as it arrives
    gsap.fromTo("[data-grow] img", { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-grow]", start: "top 95%", end: "top 25%", scrub: true } });
    // Each stacked card dims a touch as the next one slides over it
    $$(".card").forEach((c, i, all) => {
      if (i === all.length - 1) return;
      gsap.fromTo(c, { scale: 1, filter: "brightness(1)" }, { scale: 0.96, filter: "brightness(0.86)", ease: "none", scrollTrigger: { trigger: all[i + 1], start: "top 85%", end: "top 20%", scrub: true } });
    });
  };
  const wait = (n = 0) => (window.gsap && window.ScrollTrigger ? start() : n < 60 && setTimeout(() => wait(n + 1), 50));
  wait();
})();
