(function () {
  "use strict";

  const body = document.body;
  const root = document.documentElement;
  const navToggle = document.querySelector(".mobile-nav-toggle");
  const navLinks = [...document.querySelectorAll("#navbar .scrollto")];
  const themeToggle = document.querySelector(".theme-toggle");

  const closeMobileNav = () => {
    body.classList.remove("mobile-nav-active");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation");
    const icon = navToggle?.querySelector("i");
    icon?.classList.replace("bi-x", "bi-list");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = body.classList.toggle("mobile-nav-active");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    const icon = navToggle.querySelector("i");
    icon?.classList.toggle("bi-list", !isOpen);
    icon?.classList.toggle("bi-x", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      closeMobileNav();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.hash);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileNav();
  });

  const updateActiveLink = () => {
    const currentPosition = window.scrollY + window.innerHeight * 0.35;
    let activeSection = navLinks[0]?.hash;

    navLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section && currentPosition >= section.offsetTop) activeSection = link.hash;
    });

    navLinks.forEach((link) => {
      const isActive = link.hash === activeSection;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  let scrollScheduled = false;
  window.addEventListener("scroll", () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(() => {
      updateActiveLink();
      scrollScheduled = false;
    });
  }, { passive: true });
  updateActiveLink();

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const isDark = theme === "dark";
    themeToggle?.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle?.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    const themeIcon = themeToggle?.querySelector("i");
    themeIcon?.classList.toggle("bi-moon-stars", !isDark);
    themeIcon?.classList.toggle("bi-sun", isDark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#141b25" : "#f6f7f9");
  };

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let followsSystemTheme = root.dataset.themePreference !== "saved";

  systemTheme.addEventListener("change", (event) => {
    if (followsSystemTheme) applyTheme(event.matches ? "dark" : "light");
  });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    followsSystemTheme = false;
    root.dataset.themePreference = "saved";
    applyTheme(nextTheme);
    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
  });
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

  const typedElement = document.querySelector(".typed");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typedElement && window.Typed && !prefersReducedMotion) {
    const strings = typedElement.dataset.typedItems?.split(",").filter(Boolean);
    if (strings?.length) {
      new Typed(typedElement, {
        strings,
        loop: true,
        typeSpeed: 55,
        backSpeed: 30,
        backDelay: 1800
      });
    }
  } else if (typedElement) {
    typedElement.textContent = typedElement.dataset.typedItems?.split(",")[0] ?? "";
  }

  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const projectGrid = document.querySelector(".projects-grid");
  if (projectGrid && filterButtons.length) {
    const projects = [...projectGrid.querySelectorAll(".project-card")];
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((filter) => {
          const isActive = filter === button;
          filter.classList.toggle("filter-active", isActive);
          filter.setAttribute("aria-pressed", String(isActive));
        });
        const filter = button.dataset.filter ?? "*";
        projects.forEach((project) => {
          project.hidden = filter !== "*" && !project.matches(filter);
        });
      });
    });
  }

  if (document.querySelector(".portfolio-lightbox") && window.GLightbox) {
    GLightbox({ selector: ".portfolio-lightbox" });
  }

  if (window.AOS) {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      disable: prefersReducedMotion
    });
  }
})();
