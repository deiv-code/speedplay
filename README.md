# SpeedPlay

A Chrome extension that removes YouTube's 2x playback speed limit, letting you watch videos at 3x, 4x, 5x, or any custom speed up to 16x.

## Install

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this folder
4. Go to any YouTube video

## Usage

### Popup

Click the extension icon in your toolbar to open the control panel:

- **Preset buttons** — Quick access to 1x, 1.5x, 2x, 3x, 4x, 5x, 8x, and 10x
- **Slider** — Drag to set speed from 0.25x to 10x
- **Custom input** — Type any value up to 16x and click Set

### Keyboard Shortcuts

While on a YouTube video (not typing in a text field):

| Key | Action |
|-----|--------|
| `D` | Increase speed by 0.5x |
| `S` | Decrease speed by 0.5x |

A badge briefly appears on-screen showing the new speed.

### Speed Persistence

Your chosen speed carries over when navigating between videos on YouTube. The extension also prevents YouTube from resetting your speed back to its default 2x cap.
