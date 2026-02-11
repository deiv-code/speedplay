(() => {
  // Avoid double-injection
  if (window.__speedplay_loaded) return;
  window.__speedplay_loaded = true;

  const SPEED_STEP = 0.5;
  const MIN_SPEED = 0.1;
  const MAX_SPEED = 16;
  const BADGE_TIMEOUT = 1200;

  let badgeEl = null;
  let badgeTimer = null;

  function getVideo() {
    return document.querySelector("video");
  }

  // Prevent YouTube from resetting playbackRate
  function lockSpeed(video, rate) {
    video.playbackRate = rate;
    window.__speedplay_rate = rate;
  }

  // Create the on-screen speed badge
  function createBadge() {
    if (badgeEl) return badgeEl;
    badgeEl = document.createElement("div");
    badgeEl.id = "speedplay-badge";
    document.body.appendChild(badgeEl);
    return badgeEl;
  }

  function showBadge(speed) {
    const badge = createBadge();
    badge.textContent = `${speed}x`;
    badge.classList.add("visible");

    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => {
      badge.classList.remove("visible");
    }, BADGE_TIMEOUT);
  }

  function changeSpeed(delta) {
    const video = getVideo();
    if (!video) return;

    let newSpeed = video.playbackRate + delta;
    newSpeed = Math.round(newSpeed * 100) / 100;
    newSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));

    lockSpeed(video, newSpeed);
    showBadge(newSpeed);
  }

  // Keyboard shortcuts — D to speed up, S to slow down
  document.addEventListener("keydown", (e) => {
    // Don't trigger in input fields, search bar, etc.
    const tag = e.target.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      e.target.isContentEditable ||
      e.target.id === "search"
    ) {
      return;
    }

    if (e.key === "d" || e.key === "D") {
      e.stopPropagation();
      changeSpeed(SPEED_STEP);
    } else if (e.key === "s" || e.key === "S") {
      e.stopPropagation();
      changeSpeed(-SPEED_STEP);
    }
  });

  // Watch for YouTube's attempts to reset the speed back to <=2x
  // YouTube's player internally clamps speed. We override it via the raw HTMLVideoElement.
  function interceptSpeedResets() {
    const video = getVideo();
    if (!video) return;

    const desc = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      "playbackRate"
    );
    if (!desc || !desc.set) return;

    const originalSet = desc.set;

    Object.defineProperty(video, "playbackRate", {
      get() {
        return desc.get.call(this);
      },
      set(val) {
        // If we've set a custom rate and YouTube tries to clamp it, keep ours
        if (window.__speedplay_rate && val !== window.__speedplay_rate) {
          // Allow resets to 1x (user clicked normal speed) and our own sets
          if (val === 1 || val === window.__speedplay_rate) {
            window.__speedplay_rate = val;
            originalSet.call(this, val);
          } else {
            // YouTube trying to clamp — override with our speed
            originalSet.call(this, window.__speedplay_rate);
          }
        } else {
          window.__speedplay_rate = val;
          originalSet.call(this, val);
        }
      },
      configurable: true,
    });
  }

  // Re-apply speed when navigating between videos (SPA navigation)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // Small delay for YouTube to load the new video element
      setTimeout(() => {
        const video = getVideo();
        if (video && window.__speedplay_rate) {
          video.playbackRate = window.__speedplay_rate;
          interceptSpeedResets();
        }
      }, 1000);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Init on first load
  function init() {
    const video = getVideo();
    if (video) {
      interceptSpeedResets();
      if (window.__speedplay_rate) {
        video.playbackRate = window.__speedplay_rate;
      }
    } else {
      // Video not yet in DOM, wait for it
      setTimeout(init, 500);
    }
  }

  init();
})();
