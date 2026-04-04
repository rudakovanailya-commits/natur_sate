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

  const CONTACT_WEBHOOK_URL =
    "https://hook.eu1.make.com/klftvhij43ghedghj6b839ftoldwgp47";

  const contactFormEl = $("#contactForm");
  const contactStatusEl = $("#contactStatus");
  const contactConsentEl = $("#contactConsent");
  const contactSubmitBtn = $("#contactSubmitBtn");

  function syncContactSubmitEnabled() {
    if (!contactSubmitBtn || !contactConsentEl) return;
    contactSubmitBtn.disabled = !contactConsentEl.checked;
  }

  if (contactFormEl && contactStatusEl) {
    contactFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const src = new FormData(contactFormEl);
      const name = String(src.get("name") || "").trim();
      const contact = String(src.get("contact") || "").trim();
      const goal = String(src.get("goal") || "").trim();
      if (!name || !contact) return;

      if (contactSubmitBtn) contactSubmitBtn.disabled = true;
      try {
        await fetch(CONTACT_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            contact: contact,
            goal: goal,
          }),
        });
        contactStatusEl.textContent = "Заявка отправлена";
        contactFormEl.reset();
        syncContactSubmitEnabled();
      } catch {
        contactStatusEl.textContent = "Не удалось отправить заявку";
        syncContactSubmitEnabled();
      }
    });
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

  const GENTLE_HINTS = [
    "Сегодня добавьте к одному приёму пищи что-то сытное по белку — без пересчёта, просто заметьте, как потом ощущается аппетит через пару часов.",
    "Попробуйте один приём пищи есть без экрана — только еда, стол, дыхание. Даже пять минут внимания к вкусу уже меняют тон.",
    "Перед ужином — стакан воды и пауза на три вдоха. Не «чтобы съесть меньше», а чтобы услышать, голод ли это или усталость.",
    "Соберите тарелку по простому шаблону: половина овощей или салата, четверть белка, четверть того, что даёт энергию (крупа, картофель, хлеб — как вам привычнее).",
    "Если день был плотным, не наказывайте себя «нулём» на вечер — выберите один спокойный приём: тёплое, понятное, без драмы.",
    "Запланируйте один перекус заранее (йогурт, орехи, фрукт — что любите), чтобы не ловить себя на «что попало» в 16:00.",
    "На сегодня — правило «достаточно сна важнее идеального ужина»: если вырубило, разрешите себе простой ужин без самообвинений.",
    "Выберите один напиток с сахаром и честно решите: оставить его осознанно или заменить на что-то без сахара — без морали, только выбор.",
    "Десять минут дневного света или свежего воздуха до обеда — опора для ритма и аппетита, особенно если работа из дома.",
    "Сегодня без новых правил: просто отметьте, в какой момент дня вы чаще всего злитесь на еду или на тело — это уже полезная информация.",
    "Если тянет на сладкое вечером — добавьте к нему источник белка или жира (творог, орехи, кефир): не «запрет», а мягкое выравнивание.",
    "Один раз в день скажите вслух или про себя: «Я кормлю себя, а не наказываю» — и посмотрите, что отзывается в теле.",
  ];

  const gentleDraw = $("#gentleHintDraw");
  const gentleAgain = $("#gentleHintAgain");
  const gentleResult = $("#gentleHintResult");
  const gentleSlot = $("#gentleHintSlot");
  let lastHint = "";

  function pickGentleHint() {
    const pool = GENTLE_HINTS.filter((h) => h !== lastHint);
    const next = pool[Math.floor(Math.random() * pool.length)];
    lastHint = next;
    return next;
  }

  function showGentleHint(text) {
    if (!gentleResult) return;
    gentleResult.textContent = text;
    gentleResult.classList.add("playful-hint__result--visible");
    if (gentleAgain) gentleAgain.hidden = false;
  }

  function runGentleDraw() {
    if (!gentleDraw || !gentleResult) return;
    gentleDraw.disabled = true;
    if (gentleAgain) gentleAgain.disabled = true;
    gentleResult.classList.remove("playful-hint__result--visible");
    gentleResult.textContent = "";

    const finalText = pickGentleHint();

    if (reduceMotion) {
      showGentleHint(finalText);
      gentleDraw.disabled = false;
      if (gentleAgain) gentleAgain.disabled = false;
      return;
    }

    const words = ["собираем ориентир…", "ещё чуть-чуть…", "готово"];
    let i = 0;
    if (gentleSlot) gentleSlot.textContent = words[0];
    const tick = window.setInterval(() => {
      i += 1;
      if (gentleSlot && i < words.length) gentleSlot.textContent = words[i];
    }, 220);

    window.setTimeout(() => {
      window.clearInterval(tick);
      if (gentleSlot) gentleSlot.textContent = "";
      showGentleHint(finalText);
      gentleDraw.disabled = false;
      if (gentleAgain) gentleAgain.disabled = false;
    }, 700);
  }

  if (gentleDraw) {
    gentleDraw.addEventListener("click", runGentleDraw);
  }
  if (gentleAgain) {
    gentleAgain.addEventListener("click", runGentleDraw);
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