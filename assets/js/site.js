"use strict";

/* Cursor */
  (function(){
    const dot=document.getElementById('cDot'),ring=document.getElementById('cRing');
    if(!dot||!ring)return;
    let mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove',e=>{
      mx=e.clientX;my=e.clientY;
      dot.style.transform=`translate(${mx}px,${my}px)`;
    });
    (function loop(){
      rx+=(mx-rx)*.12;ry+=(my-ry)*.12;
      ring.style.transform=`translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,[role="button"],.fcard,.uc-card,.how-step').forEach(el=>{
      el.addEventListener('mouseenter',()=>document.body.classList.add('c-hover'));
      el.addEventListener('mouseleave',()=>document.body.classList.remove('c-hover'));
    });
  })();



/* Navbar scroll */
(function () {
  const nav = document.getElementById("nav");
  let t = false;
  window.addEventListener(
    "scroll",
    () => {
      if (t) return;
      t = true;
      requestAnimationFrame(() => {
        nav.classList.toggle("scrolled", window.scrollY > 40);
        t = false;
      });
    },
    { passive: true },
  );
})();



/* Scroll reveal */
(function () {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [
          ...entry.target.parentElement.querySelectorAll(".reveal:not(.vis)"),
        ];
        const idx = siblings.indexOf(entry.target);
        setTimeout(
          () => entry.target.classList.add("vis"),
          Math.min(idx * 70, 300),
        );
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
})();

/* Stat counters */
(function () {
  const bar = document.querySelector(".s-stats");
  if (!bar) return;
  function run(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (target === 0) {
      el.textContent = "0" + suffix;
      return;
    }
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / 1400, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const obs = new IntersectionObserver(
    (e) => {
      if (!e[0].isIntersecting) return;
      bar.querySelectorAll("[data-count]").forEach(run);
      obs.disconnect();
    },
    { threshold: 0.3 },
  );
  obs.observe(bar);
})();

/* Tab switcher */
function switchTab(type) {
  document.querySelectorAll(".tab-btn").forEach((b) => {
    const a = b.id === "tb-" + type;
    b.classList.toggle("active", a);
    b.setAttribute("aria-selected", String(a));
  });
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.toggle("active", p.id === "p-" + type));
}

/* 3D tilt on feature cards */
(function () {
  document.querySelectorAll(".fcard").forEach((c) => {
    c.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
      c.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`;
    });
    c.addEventListener("mouseleave", () => (c.style.transform = ""));
  });
})();

/* MAP */
/* Set MAP_LIVE = true and fill LOCATIONS when real machines are deployed.
     To add a location: copy the LOCATIONS entry pattern and add a matching
     .location-card in the HTML with onclick="focusLocation(<index>)".       */
var MAP_LIVE = false;
var svMap = null;
var svMarkers = [];

var LOCATIONS = [
  {
    lat: 13.0827,
    lng: 80.2707,
    name: "Chennai Pilot Gym",
    addr: "Chennai, Tamil Nadu, India",
    badge: "HQ / Pilot",
  },
  /*  ADD LOCATIONS HERE
    ,{
      lat: 0.0000,
      lng: 0.0000,
      name: 'Gym Name',
      addr: 'Full address',
      badge: 'Live'
    }
   */
];

function initMap() {
  if (svMap || typeof L === "undefined") return;

  svMap = L.map("sv-map", {
    center: [LOCATIONS[0].lat, LOCATIONS[0].lng],
    zoom: 13,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(svMap);

  /* Custom marker using brand lime colour */
  var markerHtml = [
    '<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;',
    "background:#bcf272;border:3px solid #83cd1d;",
    "transform:rotate(-45deg);",
    'box-shadow:0 4px 16px rgba(188,242,114,.45)">',
    "</div>",
  ].join("");

  var markerIcon = L.divIcon({
    html: markerHtml,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

  LOCATIONS.forEach(function (loc, i) {
    var marker = L.marker([loc.lat, loc.lng], { icon: markerIcon })
      .addTo(svMap)
      .bindPopup(
        '<strong style="color:#1b1d1a;font-family:Poppins,sans-serif;font-size:.85rem">' +
          loc.name +
          "</strong>" +
          '<br><span style="color:#444;font-size:.78rem">' +
          loc.addr +
          "</span>",
      );
    svMarkers.push(marker);
  });

  /* Open popup for first location on load */
  if (svMarkers.length) svMarkers[0].openPopup();
}

/* Lazy-init map only when live and section comes into view */
(function () {
  if (!MAP_LIVE) return;
  var mapEl = document.getElementById("sv-map");
  if (!mapEl) return;
  var obs = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting) return;
      initMap();
      obs.disconnect();
    },
    { threshold: 0.1 },
  );
  obs.observe(mapEl);
})();

function focusLocation(idx) {
  if (!svMap || idx >= LOCATIONS.length) return;
  var loc = LOCATIONS[idx];
  svMap.flyTo([loc.lat, loc.lng], 15, { duration: 1 });
  if (svMarkers[idx]) svMarkers[idx].openPopup();

  /* Highlight active card */
  document.querySelectorAll(".location-card").forEach(function (c, i) {
    c.classList.toggle("active", i === idx);
  });
}

/* CTA form Formspree delivery to smartshakevending@gmail.com */
document
  .getElementById("ctaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const nameInp = document.getElementById("cta-name");
    const emailInp = document.getElementById("cta-email");
    const phoneInp = document.getElementById("cta-phone");
    const cityInp = document.getElementById("cta-city");
    const descInp = document.getElementById("cta-desc");
    const btn = this.querySelector("button");
    const fields = [
      { el: nameInp, ok: () => nameInp.value.trim() },
      { el: emailInp, ok: () => /\S+@\S+\.\S+/.test(emailInp.value) },
      {
        el: phoneInp,
        ok: () => /^[\d\s\+\-\(\)]{7,}$/.test(phoneInp.value.trim()),
      },
      { el: cityInp, ok: () => cityInp.value.trim() },
      { el: descInp, ok: () => descInp.value.trim() },
    ];
    let firstBad = null;
    fields.forEach((f) => {
      if (!f.ok()) {
        f.el.style.borderColor = "rgba(255,120,120,.8)";
        firstBad = firstBad || f.el;
      } else f.el.style.borderColor = "";
    });
    if (firstBad) {
      firstBad.focus();
      setTimeout(
        () => fields.forEach((f) => (f.el.style.borderColor = "")),
        2500,
      );
      return;
    }
    const orig = btn.textContent;
    btn.textContent = "Sending";
    btn.disabled = true;

    // --- Google Forms config: replace these with your own ---
    const GOOGLE_FORM_ACTION_URL =
      "https://docs.google.com/forms/d/e/1FAIpQLSdYluQOIlMMBtzaWR3gOQY2mG4RqNG15AbX_DI8xoDM1Fmq8g/formResponse";
    const ENTRY_IDS = {
      name: "entry.2095650914",
      email: "entry.737276005",
      phone: "entry.1384059881",
      city: "entry.899611248",
      description: "entry.1278971034",
    };
    // ----------------------------------------------------------

    try {
      const formData = new URLSearchParams();
      formData.append(ENTRY_IDS.name, nameInp.value.trim());
      formData.append(ENTRY_IDS.email, emailInp.value.trim());
      formData.append(ENTRY_IDS.phone, phoneInp.value.trim());
      formData.append(ENTRY_IDS.city, cityInp.value.trim());
      formData.append(ENTRY_IDS.description, descInp.value.trim());

      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors", // Google Forms doesn't return a readable response
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      // With no-cors we can't read res.ok/status, so if fetch didn't throw,
      // we treat it as success (this is the standard pattern for Forms).
      btn.textContent = "You're on the list!";
      btn.style.cssText =
        "background:var(--lime);color:var(--dark);pointer-events:none";
      [nameInp, emailInp, phoneInp, cityInp, descInp].forEach(
        (el) => (el.value = ""),
      );
    } catch {
      btn.textContent = "Try again";
      btn.disabled = false;
      btn.style.cssText =
        "background:rgba(255,62,27,.2);border-color:var(--red);color:#fff";
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.cssText = "";
      }, 3500);
    }
  });

(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const blobs = hero.querySelectorAll('.blob');
  const obs = new IntersectionObserver(([entry]) => {
    blobs.forEach(b => {
      b.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });
  }, { threshold: 0 });
  obs.observe(hero);
})();

/* Low-power device detection */
(function () {
  const isLowEnd =
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  if (isLowEnd) {
    document.documentElement.classList.add("low-power");
    const machine = document.querySelector(".hero-bg-machine");
    if (machine) {
      machine.classList.add("low-power");
    }
    const chips = document.querySelectorAll(".chip")
    if (chips.length) {
      chips.forEach(chip => chip.classList.add("low-power"));
    }
  }
})();
/* Cursor (skipped entirely in low-power mode) */
(function () {
  if (document.documentElement.classList.contains("low-power")) return;

  const dot = document.getElementById("cDot"),
    ring = document.getElementById("cRing");
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document
    .querySelectorAll('a,button,[role="button"],.fcard,.uc-card,.how-step')
    .forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("c-hover"),
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("c-hover"),
      );
    });
})();

/* Pause hero blobs when hero is off-screen */
(function () {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const blobs = hero.querySelectorAll(".blob");
  if (!blobs.length) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      blobs.forEach((b) => {
        b.style.animationPlayState = entry.isIntersecting
          ? "running"
          : "paused";
      });
    },
    { threshold: 0 },
  );
  obs.observe(hero);
})();

/* Pause marquee when off-screen */
(function () {
  const marquee = document.querySelector(".marquee-content");
  if (!marquee) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      marquee.style.animationPlayState = entry.isIntersecting
        ? "running"
        : "paused";
    },
    { threshold: 0 },
  );
  obs.observe(marquee);
})();

/* Pause map coming-soon rings/pin when off-screen */
(function () {
  const mapCs = document.querySelector(".map-cs");
  if (!mapCs) return;
  const animated = mapCs.querySelectorAll(
    ".map-cs-ring, .map-cs-pinicon",
  );
  if (!animated.length) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      animated.forEach((el) => {
        el.style.animationPlayState = entry.isIntersecting
          ? "running"
          : "paused";
      });
    },
    { threshold: 0 },
  );
  obs.observe(mapCs);
})();