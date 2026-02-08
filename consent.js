(() => {
  const CONSENT_KEY = "sb_consent_v2";
  const banner = document.querySelector(".consent-banner");
  if (!banner) {
    return;
  }

  const acceptButton = banner.querySelector("[data-consent-accept]");
  const rejectButton = banner.querySelector("[data-consent-reject]");

  const consentGranted = {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };

  const consentDenied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };

  const applyConsent = (state) => {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", state);
    }
  };

  const saveChoice = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // Ignore storage errors (private mode, disabled storage).
    }
  };

  const getChoice = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  };

  const showBanner = () => {
    banner.classList.remove("is-hidden");
  };

  const hideBanner = () => {
    banner.classList.add("is-hidden");
  };

  const choice = getChoice();
  if (choice === "granted") {
    applyConsent(consentGranted);
    hideBanner();
  } else if (choice === "denied") {
    applyConsent(consentDenied);
    hideBanner();
  } else {
    showBanner();
  }

  if (acceptButton) {
    acceptButton.addEventListener("click", () => {
      applyConsent(consentGranted);
      saveChoice("granted");
      hideBanner();
    });
  }

  if (rejectButton) {
    rejectButton.addEventListener("click", () => {
      applyConsent(consentDenied);
      saveChoice("denied");
      hideBanner();
    });
  }
})();