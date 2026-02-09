const stripTranslateBanner = () => {
  const bannerFrame = document.querySelector(
    ".goog-te-banner-frame, iframe.goog-te-banner-frame, .goog-te-banner"
  );
  if (bannerFrame) {
    bannerFrame.remove();
  }
  document.documentElement.style.top = "0px";
  if (document.body) {
    document.body.style.top = "0px";
  }
};

const runStripTranslateLoop = (durationMs = 60000) => {
  const start = Date.now();
  const interval = window.setInterval(() => {
    stripTranslateBanner();
    if (Date.now() - start > durationMs) {
      window.clearInterval(interval);
    }
  }, 500);
};

(() => {
  const widget = document.querySelector(".language-widget");
  if (!widget) return;

  const buttons = Array.from(widget.querySelectorAll("[data-lang]"));
  const defaultLang = "it";
  const storedLang =
    window.localStorage?.getItem("preferredLanguage") || defaultLang;

  const setActive = (lang) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.lang === lang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const setTranslateCookie = (lang) => {
    const value = `/it/${lang}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
  };

  const applyLangToSelect = (lang) => {
    const select = document.querySelector(
      "#google_translate_element select, .goog-te-combo"
    );
    if (!select) return false;
    select.value = lang;
    select.dispatchEvent(new Event("change"));
    return true;
  };

  const applyLanguage = (lang, { reloadIfNeeded = false } = {}) => {
    if (!lang) return;
    setActive(lang);
    if (window.localStorage) {
      window.localStorage.setItem("preferredLanguage", lang);
    }
    setTranslateCookie(lang);
    if (applyLangToSelect(lang)) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (applyLangToSelect(lang)) {
        window.clearInterval(timer);
        return;
      }
      if (tries > 20) {
        window.clearInterval(timer);
        if (reloadIfNeeded) {
          const lastReloaded = window.sessionStorage?.getItem("translateReloaded");
          if (lastReloaded !== lang) {
            window.sessionStorage?.setItem("translateReloaded", lang);
            window.location.reload();
          }
        }
      }
    }, 250);
    runStripTranslateLoop();
  };

  const closeWidget = () => {
    widget.classList.remove("is-open");
    widget.setAttribute("aria-expanded", "false");
  };

  const openWidget = () => {
    widget.classList.add("is-open");
    widget.setAttribute("aria-expanded", "true");
  };

  const toggleWidget = () => {
    if (widget.classList.contains("is-open")) {
      closeWidget();
    } else {
      openWidget();
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.contains("is-active");
      if (isActive) {
        if (window.matchMedia("(min-width: 900px)").matches) {
          return;
        }
        toggleWidget();
        return;
      }
      applyLanguage(button.dataset.lang, { reloadIfNeeded: true });
      runStripTranslateLoop();
      if (!window.matchMedia("(min-width: 900px)").matches) {
        closeWidget();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!widget.contains(event.target)) {
      closeWidget();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeWidget();
    }
  });

  widget.setAttribute("aria-expanded", "false");
  setActive(storedLang);
  window.__preferredLanguage = storedLang;
  window.__applyLanguage = applyLanguage;
  if (storedLang && storedLang !== defaultLang) {
    applyLanguage(storedLang);
  }
})();

window.googleTranslateElementInit = () => {
  if (!window.google || !window.google.translate) return;
  new window.google.translate.TranslateElement(
    {
      pageLanguage: "it",
      includedLanguages: "it,en,fr,de,es",
      autoDisplay: false,
    },
    "google_translate_element"
  );
  if (window.__preferredLanguage && window.__preferredLanguage !== "it") {
    if (typeof window.__applyLanguage === "function") {
      window.__applyLanguage(window.__preferredLanguage);
    }
  }
};

(() => {
  const observer = new MutationObserver(() => {
    stripTranslateBanner();
  });

  const root = document.documentElement;
  if (root) {
    observer.observe(root, { childList: true, subtree: true });
  }

  window.addEventListener("load", () => {
    stripTranslateBanner();
    runStripTranslateLoop();
  });
})();
