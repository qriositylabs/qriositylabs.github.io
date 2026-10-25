/* Qriosity Labs website: mobile menu and scroll reveals on every page, contact form on contact.html. */
(function () {
  "use strict";

  // ---------- mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });

  // ---------- scroll reveals. The <head> script adds .reveal-ready when JS runs and motion is allowed.
  // Items fade up once as they enter the viewport; blueprint plates draw in. Items entering together
  // are staggered. Keep REVEAL_TARGETS in sync with the reveal selector list in css/site.css.
  var REVEAL_TARGETS = ".hero-grid > *, .page-hero .container > *, .section .container > h2, .section .container > p, " +
    ".area-head, .grid-3 > li, .entries > li, .rows > li, .steps > li, .table-wrap, .cta-grid > *, " +
    ".journey > li, .threats > li, .pgroup-head, .tech-grid > li";
  var root = document.documentElement;

  if (root.classList.contains("reveal-ready")) {
    var revealer = new IntersectionObserver(function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.setProperty("--d", Math.min(order++, 10) * 60 + "ms");
        el.classList.add(el.classList.contains("plate") ? "is-drawn" : "is-visible");
        revealer.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

    document.querySelectorAll(REVEAL_TARGETS + ", .plate").forEach(function (el) {
      revealer.observe(el);
    });
    root.classList.add("reveal-live");
  }

  // ---------- touch screens have no hover: a photo shows full colour while it sits in the middle of the screen
  if (window.matchMedia("(hover: none)").matches && "IntersectionObserver" in window) {
    var focusBand = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    }, { rootMargin: "-35% 0px -35% 0px" });

    document.querySelectorAll(".photo").forEach(function (photo) {
      focusBand.observe(photo);
    });
  }

  // ---------- contact form: validate, then open the visitor's email app with the details filled in.
  // The address comes from the form's mailto: action, which is also the fallback when JS is off.
  var form = document.getElementById("project-form");
  if (!form) return;

  var success = document.getElementById("form-success");
  var address = form.getAttribute("action").replace(/^mailto:/, "");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var rules = {
    name: function (v) { return v ? "" : "Please enter your name."; },
    email: function (v) {
      if (!v) return "Please enter your email address.";
      return emailPattern.test(v) ? "" : "Please enter a valid email address, like name@example.com.";
    },
    building: function (v) { return v ? "" : "Please tell us a little about what you're building."; }
  };

  // JS validation replaces the browser's built-in bubbles
  form.noValidate = true;

  function showError(field, message) {
    var error = document.getElementById(field.id + "-error");
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  Object.keys(rules).forEach(function (id) {
    form.elements[id].addEventListener("input", function () {
      showError(this, "");
      success.textContent = "";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstInvalid = null;
    Object.keys(rules).forEach(function (id) {
      var field = form.elements[id];
      var message = rules[id](field.value.trim());
      showError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      success.textContent = "";
      firstInvalid.focus();
      return;
    }

    var name = form.elements.name.value.trim();
    var body =
      "Name: " + name + "\r\n" +
      "Email: " + form.elements.email.value.trim() + "\r\n" +
      "Project size: " + form.elements.size.value + "\r\n\r\n" +
      form.elements.building.value.trim();
    window.location.href = "mailto:" + address +
      "?subject=" + encodeURIComponent("New project: " + name) +
      "&body=" + encodeURIComponent(body);
    success.textContent = "Your email app should open with your project details. If it doesn't, email us at " + address + ".";
  });
})();
