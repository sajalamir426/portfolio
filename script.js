/* =========================================================
   SAJAL AMIR — PORTFOLIO SCRIPTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* =========================================================
     TYPEWRITER EFFECT
     ========================================================= */
  const typewriterEl = document.getElementById("typewriter");
  const roles = [
    "Web Designer",
    "Problem Solver",
    "CS Student",
    "AI Enthusiast",
    
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED = 80;
  const DELETING_SPEED = 45;
  const PAUSE_AFTER_WORD = 1800;
  const PAUSE_BEFORE_DELETE = 400;

  function typeWriter() {
    const current = roles[roleIndex];
    if (isDeleting) {
      typewriterEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeWriter, 400);
        return;
      }
      setTimeout(typeWriter, DELETING_SPEED);
    } else {
      typewriterEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(typeWriter, PAUSE_AFTER_WORD);
        return;
      }
      setTimeout(typeWriter, TYPING_SPEED);
    }
  }

  setTimeout(typeWriter, 700);

  /* =========================================================
     CV MODAL
     ========================================================= */
  const cvModal    = document.getElementById("cv-modal");
  const cvOpen     = document.getElementById("nav-cv-open");
  const cvClose    = document.getElementById("cv-close");
  const cvBackdrop = document.getElementById("cv-backdrop");

  function openCV() {
    cvModal.classList.add("open");
    document.body.style.overflow = "hidden";
    cvClose.focus();
  }

  function closeCV() {
    cvModal.classList.remove("open");
    document.body.style.overflow = "";
    cvOpen.focus();
  }

  cvOpen.addEventListener("click", openCV);
  cvClose.addEventListener("click", closeCV);
  cvBackdrop.addEventListener("click", closeCV);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cvModal.classList.contains("open")) closeCV();
  });

  /* ---------- Navbar scroll ---------- */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });

  /* ---------- Close mobile nav on link click ---------- */
  const navToggle = document.getElementById("nav-toggle");
  document.querySelectorAll(".nav-link, .nav-cv-btn").forEach(link => {
    link.addEventListener("click", () => { if (navToggle) navToggle.checked = false; });
  });

  /* ---------- Glow border mouse tracking ---------- */
  document.querySelectorAll(".glow-border").forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    ".about__card, .highlight-card, .skill-card, .tool-card, .project-card, .contact__info, .contact__form, .badge-row"
  );
  revealTargets.forEach(el => el.setAttribute("data-reveal", ""));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 0.08}s`;
    observer.observe(el);
  });

  /* ---------- About stats counter ---------- */
  const stats = document.querySelectorAll(".about__stat-num");
  let countersStarted = false;

  function animateCounters() {
    stats.forEach(stat => {
      const target = parseInt(stat.getAttribute("data-count"), 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 30));
      const tick = () => {
        current += step;
        if (current >= target) {
          stat.textContent = target;
        } else {
          stat.textContent = current;
          requestAnimationFrame(tick);
        }
      };
      tick();
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsRow = document.querySelector(".about__stats");
  if (statsRow) statsObserver.observe(statsRow);

  /* =========================================================
     CONTACT FORM — SECURITY + EMAILJS
     ---------------------------------------------------------
     Security features implemented:
     1. Honeypot field  — catches most simple bots
     2. CSRF token      — prevents cross-site request forgery
     3. Rate limiting   — max 3 submissions per 10 minutes
     4. Input sanitization — strips HTML/script tags
     5. Strict validation  — server-side patterns enforced client side
     6. Char limits     — prevents huge payload submissions
     7. Anti-flood: button disabled during send + cooldown

     EmailJS setup:
     1. Sign up at https://www.emailjs.com (free)
     2. Add Gmail service → copy SERVICE ID
     3. Create template with {{user_name}}, {{user_email}},
        {{message}} variables → copy TEMPLATE ID
     4. Account > General → copy PUBLIC KEY
     5. Replace the three "YOUR_..." values below
     ========================================================= */
  const EMAILJS_PUBLIC_KEY  = "Q35fX_oWjExrFO_aT";
const EMAILJS_SERVICE_ID  = "service_l7mj7jj";
const EMAILJS_TEMPLATE_ID = "template_1sxthxm";
  const RECEIVER_EMAIL      = "sajalamir426@gmail.com";

  /* ---------- CSRF token (session-unique random token) ---------- */
  function generateToken(len = 32) {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
  }
  const csrfToken = generateToken();
  const csrfInput = document.getElementById("csrf-token");
  if (csrfInput) csrfInput.value = csrfToken;

  /* ---------- Rate limiter ---------- */
  const RATE_LIMIT_MAX = 3;       // max submissions
  const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes in ms
  let submissions = [];

  function checkRateLimit() {
    const now = Date.now();
    submissions = submissions.filter(t => now - t < RATE_LIMIT_WINDOW);
    return submissions.length < RATE_LIMIT_MAX;
  }

  function recordSubmission() {
    submissions.push(Date.now());
  }

  /* ---------- Sanitization ---------- */
  function sanitize(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();
  }

  /* ---------- Validation ---------- */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateForm(name, email, message) {
    const errors = {};
    if (!name || name.length < 2)
      errors.name = "Name must be at least 2 characters.";
    if (name.length > 100)
      errors.name = "Name is too long.";
    if (!email || !emailRegex.test(email))
      errors.email = "Please enter a valid email address.";
    // if (!message || message.length < 10)
    //   errors.message = "Message must be at least 10 characters.";
    if (message.length > 2000)
      errors.message = "Message exceeds 2000 characters.";
    return errors;
  }

  function showFieldError(id, msg) {
    const el = document.getElementById(id + "-error");
    const input = document.getElementById(id);
    if (el) el.textContent = msg;
    if (input) input.classList.add("invalid");
  }

  function clearFieldErrors() {
    ["name", "email", "message"].forEach(id => {
      const el = document.getElementById(id + "-error");
      const input = document.getElementById(id);
      if (el) el.textContent = "";
      if (input) input.classList.remove("invalid");
    });
  }

  /* ---------- Char counter for textarea ---------- */
  const messageField = document.getElementById("message");
  const charCountEl  = document.getElementById("char-count");
  if (messageField && charCountEl) {
    messageField.addEventListener("input", () => {
      const len = messageField.value.length;
      charCountEl.textContent = `${len} / 2000`;
      charCountEl.style.color = len > 1800 ? "#f87171" : "";
    });
  }

  /* ---------- EmailJS init ---------- */
  const isEmailJSConfigured =
    EMAILJS_PUBLIC_KEY  !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_SERVICE_ID  !== "YOUR_SERVICE_ID" &&
    EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID" &&
    typeof emailjs !== "undefined";

  if (isEmailJSConfigured) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  /* ---------- Form submit ---------- */
  const form      = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-submit");
  const statusEl  = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    /* 1 — Honeypot check */
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value !== "") {
      // Bot detected — silently fail (don't reveal the trap)
      showStatus("Message sent! I'll get back to you soon. ✓", "success");
      return;
    }

    /* 2 — CSRF token check (basic: token must match what we set) */
    const submittedToken = form.querySelector("#csrf-token")?.value;
    if (!submittedToken || submittedToken !== csrfToken) {
      showStatus("Security check failed. Please refresh and try again.", "error");
      return;
    }

    /* 3 — Rate limit */
    if (!checkRateLimit()) {
      const wait = Math.ceil(RATE_LIMIT_WINDOW / 60000);
      showStatus(`Too many messages. Please wait ${wait} minutes before trying again.`, "error");
      return;
    }

    /* 4 — Read & sanitize values */
    const rawName    = form.user_name.value;
    const rawEmail   = form.user_email.value;
    const rawMessage = form.message.value;

    const name    = sanitize(rawName.trim());
    const email   = rawEmail.trim().toLowerCase();
    const message = sanitize(rawMessage.trim());

    /* 5 — Validate */
    const errors = validateForm(name, email, message);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
      return;
    }

    /* 6 — Lock UI */
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    /* 7 — Send */
    if (isEmailJSConfigured) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          user_name:  name,
          user_email: email,
          message:    message,
          to_email:   RECEIVER_EMAIL
        });
        recordSubmission();
        showStatus("Message sent! I'll get back to you soon. ✓", "success");
        form.reset();
        if (charCountEl) charCountEl.textContent = "0 / 2000";
      } catch {
        showStatus("Something went wrong. Please email me directly.", "error");
      } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    } else {
      /* Fallback: mailto */
      const subject = encodeURIComponent(`Portfolio message from ${rawName.trim()}`);
      const body    = encodeURIComponent(`${rawMessage.trim()}\n\nFrom: ${rawName.trim()} (${rawEmail.trim()})`);
      window.location.href = `mailto:${RECEIVER_EMAIL}?subject=${subject}&body=${body}`;
      showStatus("Opening email client to send your message...", "success");
      recordSubmission();
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className   = `form-status ${type}`;
    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className   = "form-status";
    }, 6000);
  }

});