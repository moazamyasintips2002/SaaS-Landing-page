/**
 * Cadence landing page interactions.
 * Plain ES2015+ JavaScript, no dependencies, progressive enhancement only.
 */
(function () {
  "use strict";

  var doc = document;
  var THEME_KEY = "cadence-theme";
  var DESKTOP_QUERY = "(min-width: 720px)";

  /* ---------- Theme ------------------------------------------------------ */

  var root = doc.documentElement;
  var themeToggle = doc.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (!themeToggle) return;
    var isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  function readStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* storage unavailable (private mode) — theme still applies for this visit */
    }
  }

  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(readStoredTheme() || (prefersDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------- Sticky header shadow -------------------------------------- */

  var header = doc.getElementById("siteHeader");
  var scrollQueued = false;

  function syncHeader() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
    scrollQueued = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(syncHeader);
    },
    { passive: true }
  );
  syncHeader();

  /* ---------- Mobile navigation ----------------------------------------- */

  var nav = doc.getElementById("primaryNav");
  var navToggle = doc.getElementById("navToggle");

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    doc.body.classList.toggle("nav-open", open);
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    window.matchMedia(DESKTOP_QUERY).addEventListener("change", function (event) {
      if (event.matches) setNav(false);
    });
  }

  /* ---------- Pricing: monthly / annual billing ------------------------- */

  var billingInputs = doc.querySelectorAll('input[name="billing"]');
  var billingStatus = doc.getElementById("billingStatus");
  var priceNodes = doc.querySelectorAll("[data-monthly]");

  function applyBilling(period, animate) {
    priceNodes.forEach(function (node) {
      var value = node.getAttribute("data-" + period);
      if (value === null) return;

      var priceRow = node.classList.contains("price-value") ? node.closest(".plan-price") : null;

      node.textContent = value;

      if (priceRow && animate) {
        priceRow.classList.remove("is-bumping");
        // Force a reflow so the animation restarts on every toggle.
        void priceRow.offsetWidth;
        priceRow.classList.add("is-bumping");
      }
    });

    if (billingStatus) {
      billingStatus.textContent =
        period === "annual"
          ? "Showing annual prices: 20% off the monthly rate, billed once a year."
          : "Showing monthly prices.";
    }
  }

  if (billingInputs.length) {
    billingInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.checked) applyBilling(input.value, true);
      });
    });
    applyBilling("monthly", false);
  }

  /* ---------- Contact form ----------------------------------------------- */

  var form = doc.getElementById("contactForm");
  var statusNode = doc.getElementById("formStatus");
  var submitBtn = doc.getElementById("submitBtn");
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    name: [
      {
        test: function (value) {
          return value.trim().length >= 2;
        },
        message: "Please enter your full name."
      }
    ],
    email: [
      {
        test: function (value) {
          return value.trim().length > 0;
        },
        message: "Please enter your work email."
      },
      {
        test: function (value) {
          return EMAIL_PATTERN.test(value.trim());
        },
        message: "That email address does not look quite right."
      }
    ],
    company: [
      {
        test: function (value) {
          return value.trim().length >= 2;
        },
        message: "Please add your company name."
      }
    ],
    teamSize: [
      {
        test: function (value) {
          return value !== "";
        },
        message: "Please choose a team size."
      }
    ],
    message: [
      {
        test: function (value) {
          return value.trim().length >= 10;
        },
        message: "Add a little more detail so we can help (10+ characters)."
      }
    ],
    consent: [
      {
        test: function (_value, field) {
          return field.checked;
        },
        message: "Please accept the privacy terms to continue."
      }
    ]
  };

  if (form) {
    var statusStyles = { base: "form-status", success: "form-status is-success", error: "form-status is-error" };

    function errorNode(field) {
      return doc.getElementById("err-" + field.id);
    }

    function setStatus(message, style) {
      if (!statusNode) return;
      statusNode.textContent = message;
      statusNode.className = statusStyles[style] || statusStyles.base;
    }

    function showError(field, message) {
      var node = errorNode(field);
      var wrapper = field.closest(".field");
      if (wrapper) wrapper.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      if (node) {
        node.textContent = message;
        node.hidden = false;
      }
    }

    function clearError(field) {
      var node = errorNode(field);
      var wrapper = field.closest(".field");
      if (wrapper) wrapper.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
      if (node) {
        node.textContent = "";
        node.hidden = true;
      }
    }

    function validateField(field) {
      var checks = rules[field.id];
      if (!checks) return true;

      for (var i = 0; i < checks.length; i += 1) {
        if (!checks[i].test(field.type === "checkbox" ? "" : field.value, field)) {
          showError(field, checks[i].message);
          return false;
        }
      }

      clearError(field);
      return true;
    }

    // Re-validate fields the user has already touched, so errors clear as they fix them.
    form.addEventListener("input", function (event) {
      var field = event.target;
      if (field && field.id && field.hasAttribute("aria-invalid")) validateField(field);
    });

    form.addEventListener("change", function (event) {
      var field = event.target;
      if (field && field.id && (field.tagName === "SELECT" || field.type === "checkbox")) {
        if (field.value !== "" || field.checked) validateField(field);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      Object.keys(rules).forEach(function (id) {
        var field = doc.getElementById(id);
        if (!field) return;
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        setStatus("Please fix the highlighted fields and try again.", "error");
        firstInvalid.focus();
        return;
      }

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      setStatus("Sending your request…", "base");

      /**
       * Demo-only: no backend is wired up. Swap the timeout for a real call, e.g.
       *
       * fetch("/api/contact", {
       *   method: "POST",
       *   headers: { "Content-Type": "application/json" },
       *   body: JSON.stringify(payload)
       * })
       *   .then(function () { ... })
       *   .catch(function () { setStatus("Something went wrong — email sales@cadence.example instead.", "error"); });
       */
      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Request a demo";
        }
        var firstName = String(payload.name || "").trim().split(" ")[0];
        setStatus(
          "Thanks" + (firstName ? ", " + firstName : "") + "! Your request is with our team — expect a reply within one business day.",
          "success"
        );
        form.reset();
      }, 900);
    });
  }

  /* ---------- Scroll reveal --------------------------------------------- */

  var revealNodes = doc.querySelectorAll(".reveal");

  if (revealNodes.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );

      revealNodes.forEach(function (node, index) {
        node.style.transitionDelay = (index % 3) * 70 + "ms";
        revealObserver.observe(node);
      });
    } else {
      revealNodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
    }
  }

  /* ---------- Footer year ----------------------------------------------- */

  var yearNode = doc.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
})();
