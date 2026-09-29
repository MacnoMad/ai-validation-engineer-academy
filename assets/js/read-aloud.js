/* ============================================================
   "Listen to this lesson" — reads page content aloud using the
   browser's native SpeechSynthesis API. No plugins, no installs,
   no network calls. Pauses (does not talk over) interactive labs
   and the end-of-lesson quiz — it announces them, then stops and
   waits for you to press play again.
   Opt-in: only runs on pages with <body data-readable="true">.
   ============================================================ */

const ReadAloud = (() => {
  const SKIP_SELECTOR = "table, .meta-row, .kw-list, .session-nav, .progress-bar, script, style, button, input, .stat-row";
  const TEXT_SELECTOR = "h1, h2, h3, p, li";

  function buildSegments(root) {
    const segments = [];

    function pushText(text, opts = {}) {
      const t = (text || "").replace(/\s+/g, " ").trim();
      if (t) segments.push({ type: "text", text: t, chapter: !!opts.chapter, chapterLabel: opts.chapterLabel });
    }

    function walk(node) {
      Array.from(node.children).forEach((el) => {
        if (el.classList.contains("lab")) {
          const title = el.querySelector(".lab-title");
          pushText(`Coming up: an interactive lab${title ? " — " + title.textContent.trim() : ""}. I'll pause here so you can try it hands-on — press play again when you're ready to continue.`);
          segments.push({ type: "pause" });
          return;
        }
        if (el.id === "quiz-mount") {
          pushText("Coming up: this lesson's quiz. I'll pause here — answer the questions on screen, then press play to continue.");
          segments.push({ type: "pause" });
          return;
        }
        if (el.matches(SKIP_SELECTOR)) return;
        // h2 marks the start of each numbered section ("1. ...", "2. ...") — the
        // Next chapter button jumps forward to the next one of these.
        if (el.matches("h1, h2, h3")) {
          pushText(el.textContent, { chapter: el.tagName === "H2", chapterLabel: el.textContent.trim() });
          return;
        }
        if (el.matches("p, li")) { pushText(el.textContent); return; }
        if (el.classList.contains("card") || el.classList.contains("callout")) {
          pushText(el.textContent);
          return;
        }
        if (el.children.length) walk(el);
        else pushText(el.textContent);
      });
    }

    walk(root);
    return segments;
  }

  function init() {
    if (document.body.dataset.readable !== "true") return;
    if (!("speechSynthesis" in window)) return;

    const root = document.querySelector("main.page");
    if (!root) return;

    const segments = buildSegments(root);
    if (!segments.length) return;

    let idx = 0;
    let speaking = false;
    let rate = 1;
    const RATES = [1, 1.25, 1.5, 0.85];

    // ---- Floating widget: a small speaker icon that starts reading immediately and
    // keeps going in the background — the controls panel is optional and can be
    // collapsed at any time without stopping playback. ----
    const widget = document.createElement("div");
    widget.className = "read-aloud-widget";
    widget.innerHTML = `
      <div class="ra-controls" id="ra-controls" hidden>
        <button class="ra-btn" id="ra-restart" type="button" title="Restart this lesson from the beginning">↺</button>
        <button class="ra-btn" id="ra-next-chapter" type="button" title="Skip to the next section">⏭</button>
        <button class="ra-btn ra-speed" id="ra-speed" type="button" title="Playback speed">1×</button>
        <span class="ra-status" id="ra-status">Ready</span>
        <button class="ra-btn ra-collapse" id="ra-collapse" type="button" title="Hide controls (keeps playing)">✕</button>
      </div>
      <button class="ra-icon" id="ra-toggle" type="button" title="Listen to this lesson" aria-label="Listen to this lesson — text to speech">🔊</button>`;
    document.body.appendChild(widget);

    const els = {
      toggleBtn: document.getElementById("ra-toggle"),
      controls: document.getElementById("ra-controls"),
      collapse: document.getElementById("ra-collapse"),
      restart: document.getElementById("ra-restart"),
      nextChapter: document.getElementById("ra-next-chapter"),
      speed: document.getElementById("ra-speed"),
      status: document.getElementById("ra-status"),
    };

    function setStatus(text) { els.status.textContent = text; }

    // Resume position is tracked manually (segment index + character offset within
    // that segment) instead of relying on the browser's speechSynthesis.pause()/
    // resume(), which has a long-standing Chrome bug where resume() sometimes
    // restarts the utterance from its beginning instead of continuing it. Tracking
    // our own offset via the "boundary" event and re-speaking the remainder on
    // resume sidesteps that entirely, so "continue" always picks up where you left off.
    let charOffset = 0;
    let lastBoundaryRel = 0;

    function speakSegment() {
      if (idx >= segments.length) {
        setStatus("Done — that's the whole lesson.");
        speaking = false;
        setIconSpeaking(false);
        return;
      }
      const seg = segments[idx];
      if (seg.type === "pause") {
        speaking = false;
        setIconSpeaking(false);
        setStatus("Paused for you — press the speaker to continue ⤵");
        idx++;
        charOffset = 0;
        return;
      }
      const remaining = seg.text.slice(charOffset);
      if (!remaining) { idx++; charOffset = 0; speakSegment(); return; }
      lastBoundaryRel = 0;
      const utter = new SpeechSynthesisUtterance(remaining);
      utter.rate = rate;
      utter.onboundary = (e) => { if (typeof e.charIndex === "number") lastBoundaryRel = e.charIndex; };
      utter.onend = () => {
        if (!speaking) return; // user paused/restarted mid-utterance
        idx++;
        charOffset = 0;
        speakSegment();
      };
      utter.onerror = () => { speaking = false; setIconSpeaking(false); };
      setStatus(`Reading… (${idx + 1} of ${segments.length})`);
      window.speechSynthesis.speak(utter);
    }

    function setIconSpeaking(on) {
      els.toggleBtn.classList.toggle("is-speaking", on);
      els.toggleBtn.title = on ? "Pause" : "Listen to this lesson";
    }

    function play() {
      speaking = true;
      setIconSpeaking(true);
      els.controls.hidden = false;
      speakSegment();
    }
    function pause() {
      speaking = false;
      setIconSpeaking(false);
      charOffset += lastBoundaryRel;
      window.speechSynthesis.cancel();
      setStatus("Paused — take your notes, then press the speaker to continue from here");
    }
    function restart() {
      speaking = false;
      window.speechSynthesis.cancel();
      idx = 0;
      charOffset = 0;
      setIconSpeaking(false);
      setStatus("Ready");
    }

    // Jumps forward to the next section heading — for when you're picking this
    // lesson back up (today, tomorrow, whenever) and don't want to sit through
    // everything you already heard last time. Works whether or not it's
    // currently speaking: playing, it jumps and keeps reading from there;
    // paused/stopped, it just repositions for the next time you press play.
    function nextChapter() {
      let target = -1;
      for (let i = idx + 1; i < segments.length; i++) {
        if (segments[i].type === "text" && segments[i].chapter) { target = i; break; }
      }
      if (target === -1) {
        setStatus("No more sections ahead — that was the last one.");
        return;
      }
      const wasSpeaking = speaking;
      window.speechSynthesis.cancel();
      idx = target;
      charOffset = 0;
      if (wasSpeaking) {
        speakSegment();
      } else {
        setStatus(`Skipped to "${segments[target].chapterLabel}" (${target + 1} of ${segments.length}) — press the speaker to start there.`);
      }
    }

    // Click the speaker: starts reading right away (and keeps going even if you
    // collapse the panel below); click again to pause — and it resumes from
    // exactly where it paused, not from the beginning.
    els.toggleBtn.addEventListener("click", () => { speaking ? pause() : play(); });
    els.restart.addEventListener("click", restart);
    els.nextChapter.addEventListener("click", nextChapter);
    els.speed.addEventListener("click", () => {
      rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
      els.speed.textContent = rate + "×";
    });
    els.collapse.addEventListener("click", () => { els.controls.hidden = true; });

    // Stop speech if the trainee navigates away.
    window.addEventListener("beforeunload", () => window.speechSynthesis.cancel());
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => ReadAloud.init());
