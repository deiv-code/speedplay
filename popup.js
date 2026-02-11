const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const customSpeed = document.getElementById("customSpeed");
const applyCustom = document.getElementById("applyCustom");
const status = document.getElementById("status");
const presetBtns = document.querySelectorAll(".preset-btn");

function updateDisplay(speed) {
  speedValue.textContent = `${speed}x`;
  speedSlider.value = Math.min(speed, 10);

  presetBtns.forEach((btn) => {
    btn.classList.toggle("active", parseFloat(btn.dataset.speed) === speed);
  });
}

async function setSpeed(speed) {
  speed = Math.max(0.1, Math.min(16, parseFloat(speed)));
  speed = Math.round(speed * 100) / 100;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url || !tab.url.includes("youtube.com")) {
      status.textContent = "Not on a YouTube page";
      status.className = "status error";
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (s) => {
        const video = document.querySelector("video");
        if (video) {
          video.playbackRate = s;
          window.__speedplay_rate = s;
        }
      },
      args: [speed],
    });

    updateDisplay(speed);
    status.textContent = `Speed set to ${speed}x`;
    status.className = "status connected";
  } catch (err) {
    status.textContent = "Error: reload the YouTube page";
    status.className = "status error";
  }
}

// Get current speed from active tab on popup open
async function init() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url || !tab.url.includes("youtube.com")) {
      status.textContent = "Navigate to YouTube to use SpeedPlay";
      status.className = "status";
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const video = document.querySelector("video");
        return video ? video.playbackRate : 1;
      },
    });

    if (results && results[0]) {
      const currentSpeed = results[0].result || 1;
      updateDisplay(currentSpeed);
      status.textContent = `Connected — ${currentSpeed}x`;
      status.className = "status connected";
    }
  } catch {
    status.textContent = "Reload YouTube page, then reopen";
    status.className = "status error";
  }
}

speedSlider.addEventListener("input", () => {
  const speed = parseFloat(speedSlider.value);
  setSpeed(speed);
});

presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setSpeed(parseFloat(btn.dataset.speed));
  });
});

applyCustom.addEventListener("click", () => {
  if (customSpeed.value) {
    setSpeed(parseFloat(customSpeed.value));
  }
});

customSpeed.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && customSpeed.value) {
    setSpeed(parseFloat(customSpeed.value));
  }
});

init();
