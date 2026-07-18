/*═══════════════════════════════════════════════════════════════════
  PWA Service Worker Registration
  Enables offline access + "Add to Home Screen" on mobile
═══════════════════════════════════════════════════════════════════*/

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("AETHER SW registered:", registration.scope);

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available — prompt reload
                if (window.confirm("AETHER update available. Reload now?")) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });
    });
  }
}
