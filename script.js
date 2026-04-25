(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    document.documentElement.classList.add("js-reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );
    $$(".reveal-on-scroll").forEach((el) => io.observe(el));
  } else {
    $$(".reveal-on-scroll").forEach((el) => el.classList.add("is-visible"));
  }

  const burger = $(".burger");
  const mobileNav = $(".mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });
    $$(".mobile-nav a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /** Эффект печати подзаголовка hero (аналог TextType + GSAP для курсора) */
  const HERO_SUBTITLE_PHRASES = [
    "Возрастные изменения — это естественно.\nНо вы не обязаны мириться со снижением качества жизни",
  ];
  const heroSubtitleEl = document.getElementById("heroSubtitle");
  const heroSubtitleTextEl = document.getElementById("heroSubtitleText");
  const heroSubtitleCursorEl = document.getElementById("heroSubtitleCursor");

  function initHeroSubtitleTypewriter() {
    if (!heroSubtitleEl || !heroSubtitleTextEl || !heroSubtitleCursorEl) return;

    const typingSpeed = 75;
    const pauseDuration = 1500;
    const deletingSpeed = 50;
    const initialDelay = 400;
    const loop = HERO_SUBTITLE_PHRASES.length > 1;
    const cursorBlinkDuration = 0.5;
    const startOnVisible = true;

    if (reduceMotion) {
      heroSubtitleEl.classList.add("hero-subtitle--no-motion");
      heroSubtitleTextEl.textContent = HERO_SUBTITLE_PHRASES[0] || "";
      return;
    }

    let cursorTween = null;
    if (typeof gsap !== "undefined") {
      gsap.set(heroSubtitleCursorEl, { opacity: 1 });
      cursorTween = gsap.to(heroSubtitleCursorEl, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    } else {
      heroSubtitleCursorEl.classList.add("hero-subtitle__cursor--css-blink");
    }

    let currentTextIndex = 0;
    let displayedText = "";
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId = 0;
    let started = false;

    function clearTypingTimeout() {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = 0;
    }

    function schedule(fn, delay) {
      clearTypingTimeout();
      timeoutId = window.setTimeout(fn, delay);
    }

    function tick() {
      const full = HERO_SUBTITLE_PHRASES[currentTextIndex] || "";

      if (isDeleting) {
        if (displayedText.length === 0) {
          isDeleting = false;
          if (!loop && currentTextIndex >= HERO_SUBTITLE_PHRASES.length - 1) {
            return;
          }
          currentTextIndex = (currentTextIndex + 1) % HERO_SUBTITLE_PHRASES.length;
          charIndex = 0;
          schedule(tick, pauseDuration);
        } else {
          displayedText = displayedText.slice(0, -1);
          heroSubtitleTextEl.textContent = displayedText;
          schedule(tick, deletingSpeed);
        }
        return;
      }

      if (charIndex < full.length) {
        displayedText += full.charAt(charIndex);
        charIndex += 1;
        heroSubtitleTextEl.textContent = displayedText;
        schedule(tick, typingSpeed);
        return;
      }

      if (HERO_SUBTITLE_PHRASES.length >= 1) {
        if (!loop && currentTextIndex === HERO_SUBTITLE_PHRASES.length - 1) {
          return;
        }
        schedule(() => {
          isDeleting = true;
          tick();
        }, pauseDuration);
      }
    }

    function startLoop() {
      if (started) return;
      started = true;
      schedule(tick, initialDelay);
    }

    if (startOnVisible && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            startLoop();
            io.disconnect();
          });
        },
        { threshold: 0.15 }
      );
      io.observe(heroSubtitleEl);
    } else {
      startLoop();
    }

    window.addEventListener(
      "pagehide",
      () => {
        clearTypingTimeout();
        if (cursorTween && typeof cursorTween.kill === "function") cursorTween.kill();
      },
      { once: true }
    );
  }

  initHeroSubtitleTypewriter();

  const MAKE_CONTACT_WEBHOOK =
    "https://hook.eu1.make.com/klftvhij43ghedghj6b839ftoldwgp47";

  const contactFormEl = document.getElementById("contactForm");
  const contactStatusEl = $("#contactStatus");
  const contactConsentEl = $("#contactConsent");
  const contactSubmitBtn = $("#contactSubmitBtn");

  function syncContactSubmitEnabled() {
    if (!contactSubmitBtn || !contactConsentEl) return;
    contactSubmitBtn.disabled = !contactConsentEl.checked;
  }

  if (contactFormEl) {
    const nameInput = contactFormEl.querySelector('[name="name"]');
    const contactInput = contactFormEl.querySelector('[name="contact"]');
    const goalInput = contactFormEl.querySelector('[name="goal"]');
    if (!nameInput || !contactInput || !goalInput) {
      console.error(
        'contactForm: нужны поля с name="name", name="contact" и name="goal"'
      );
    } else {
      contactFormEl.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = String(nameInput.value || "").trim();
        const contact = String(contactInput.value || "").trim();
        const goal = String(goalInput.value || "").trim();
        if (!name || !contact) return;

        if (contactSubmitBtn) contactSubmitBtn.disabled = true;
        try {
          const res = await fetch(MAKE_CONTACT_WEBHOOK, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, contact, goal }),
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          alert("Заявка отправлена");
          contactFormEl.reset();
          syncContactSubmitEnabled();
          if (contactStatusEl) contactStatusEl.textContent = "";
        } catch (err) {
          alert("Ошибка отправки");
          console.error(err);
          syncContactSubmitEnabled();
        }
      });
    }
  }

  if (contactConsentEl && contactSubmitBtn) {
    contactConsentEl.addEventListener("change", syncContactSubmitEnabled);
    syncContactSubmitEnabled();
  }
  if (contactFormEl && contactSubmitBtn) {
    contactFormEl.addEventListener("reset", () => {
      contactSubmitBtn.disabled = true;
    });
  }

  const faqAccordion = $("#faq-accordion");
  if (faqAccordion) {
    faqAccordion.querySelectorAll("details.faq-item").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        faqAccordion.querySelectorAll("details.faq-item").forEach((other) => {
          if (other !== details) other.removeAttribute("open");
        });
      });
    });
  }

  const consultFlowToggle = $("#consultFlowToggle");
  const consultFlowWrap = $("#consultFlowWrap");
  if (consultFlowToggle && consultFlowWrap) {
    consultFlowToggle.addEventListener("click", () => {
      const open = consultFlowWrap.classList.toggle("is-open");
      consultFlowToggle.setAttribute("aria-expanded", String(open));
      consultFlowWrap.setAttribute("aria-hidden", String(!open));
    });
  }

  function initAboutNoteGlow() {
    const card = document.querySelector(".about-card.about-card--note");
    if (!card) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover || reduceMotion) return;

    function setFromEvent(e) {
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      card.style.setProperty("--glow-x", `${((x / rect.width) * 100).toFixed(2)}%`);
      card.style.setProperty("--glow-y", `${((y / rect.height) * 100).toFixed(2)}%`);
    }

    card.addEventListener("pointerenter", (e) => {
      card.classList.add("is-glow-active");
      setFromEvent(e);
    });
    card.addEventListener("pointermove", (e) => {
      setFromEvent(e);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-glow-active");
    });
  }

  initAboutNoteGlow();

  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    a.addEventListener("click", (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
