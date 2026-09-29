/* ============================================================
   Shared page chrome: theme toggle, topbar nav (dashboard link,
   jump-to-session search, glossary popup), session-nav footer.
   ============================================================ */

const App = (() => {
  function chapterSlug(chapter) {
    return "ch-" + String(chapter).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function isDashboardPage() {
    const file = location.pathname.split("/").pop();
    return file === "index.html" || file === "";
  }

  // ---- Keep-alive ping so server.py knows a tab is still open. Only relevant when
  // running via start-training.bat (http://) — a no-op (and harmless) over file://. ----
  function startHeartbeat() {
    if (location.protocol !== "http:") return;
    const ping = () => fetch("/__heartbeat", { keepalive: true }).catch(() => {});
    ping();
    setInterval(ping, 3000);
  }

  function initTheme() {
    const saved = localStorage.getItem("avea.theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const setIcon = () => {
      const isDark = (document.documentElement.getAttribute("data-theme") === "dark") ||
        (!document.documentElement.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      btn.textContent = isDark ? "☀" : "☾";
    };
    setIcon();
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("avea.theme", next);
      setIcon();
    });
  }

  function initTopbar(sessionId) {
    const tag = document.getElementById("session-tag");
    const mini = document.getElementById("progress-mini-fill");
    if (typeof COURSE === "undefined") return;
    const s = COURSE.sessions.find(x => x.id === sessionId);
    if (tag && s) {
      const root = document.body.dataset.root || "";
      tag.innerHTML = `<a href="${root}index.html#${chapterSlug(s.chapter)}" title="Jump to ${s.chapter} on the dashboard">Session ${s.n} of ${COURSE.sessions.length} · ${s.chapter}</a>`;
    }
    if (mini && typeof Progress !== "undefined") mini.style.width = Progress.overallPct() + "%";
  }

  function buildSessionNav(containerId, currentId) {
    const el = document.getElementById(containerId);
    if (!el || typeof COURSE === "undefined") return;
    const idx = COURSE.sessions.findIndex(s => s.id === currentId);
    const prev = idx > 0 ? COURSE.sessions[idx - 1] : null;
    const next = idx >= 0 && idx < COURSE.sessions.length - 1 ? COURSE.sessions[idx + 1] : null;
    const root = (document.body.dataset.root || "");

    const prevHtml = prev
      ? `<a class="btn btn-ghost" href="${root}${prev.file}"><span class="lbl">← Previous</span><span>${prev.title}</span></a>`
      : `<span></span>`;
    const nextHtml = next
      ? `<a class="btn btn-ghost to-right" href="${root}${next.file}"><span class="lbl">Next →</span><span>${next.title}</span></a>`
      : `<span></span>`;
    el.innerHTML = prevHtml + nextHtml;
  }

  function wireMarkComplete(btnId, sessionId, redirectToNext) {
    const btn = document.getElementById(btnId);
    if (!btn || typeof Progress === "undefined") return;
    const refresh = () => {
      const done = Progress.isComplete(sessionId);
      btn.textContent = done ? "✓ Session complete" : "Mark session complete";
      btn.classList.toggle("btn-primary", !done);
      btn.classList.toggle("btn-ghost", done);
    };
    refresh();
    btn.addEventListener("click", () => {
      Progress.markComplete(sessionId);
      refresh();
      const mini = document.getElementById("progress-mini-fill");
      if (mini) mini.style.width = Progress.overallPct() + "%";
    });
  }

  function injectFooter() {
    const root = document.body.dataset.root || "";
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="site-footer-logo">
        <img class="logo-light" src="${root}assets/img/icon-ai-home-university.jpg" alt="AI Home University">
        <img class="logo-dark" src="${root}assets/img/icon-ai-home-university-dark.jpg" alt="AI Home University">
      </div>
      Made by Alek Nikolovski · September 2026 · <a href="https://www.linkedin.com/in/alekn/" target="_blank" rel="noopener noreferrer">LinkedIn</a>`;
    document.body.appendChild(footer);
  }

  // ---- Brand logo: swaps the plain "AI" square mark in the topbar for the real logo.
  // Both a light-bg and dark-bg version are injected; CSS shows whichever matches the
  // active theme (same light/dark selector pattern used everywhere else in style.css). ----
  function injectBrandLogo() {
    const mark = document.querySelector(".topbar .brand .mark");
    if (!mark) return;
    const root = document.body.dataset.root || "";
    mark.classList.add("mark-logo");
    mark.innerHTML = `
      <img class="logo-light" src="${root}assets/img/icon-ai-home-university.jpg" alt="AI Home University">
      <img class="logo-dark" src="${root}assets/img/icon-ai-home-university-dark.jpg" alt="AI Home University">`;
  }

  // ---- Dashboard link: always-visible way back to the main menu ----
  function injectDashboardLink() {
    if (isDashboardPage()) return; // already home, nothing to link to
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;
    const root = document.body.dataset.root || "";
    const link = document.createElement("a");
    link.className = "nav-btn";
    link.href = root + "index.html";
    link.innerHTML = `🏠 <span>Dashboard</span>`;
    link.title = "Back to the dashboard (all sessions)";
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) topbar.insertBefore(link, themeBtn);
    else topbar.appendChild(link);
  }

  // ---- Jump-to-session search: available from the top nav on every page ----
  function renderSearchResults(container, query) {
    const root = document.body.dataset.root || "";
    if (!query.trim()) {
      container.innerHTML = `<p class="small" style="padding:.4rem;">Start typing to search all ${COURSE.sessions.length} sessions by title or topic — e.g. "metamorphic," "bias," "red teaming."</p>`;
      return;
    }
    const q = query.toLowerCase();
    const hits = COURSE.sessions.filter(s =>
      s.title.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q) || s.chapter.toLowerCase().includes(q));
    container.innerHTML = "";
    if (!hits.length) {
      container.innerHTML = `<p class="small" style="padding:.4rem;">No sessions match "${query}".</p>`;
      return;
    }
    const mark = (text) => {
      const i = text.toLowerCase().indexOf(q);
      if (i === -1) return text;
      return text.slice(0, i) + "<mark>" + text.slice(i, i + q.length) + "</mark>" + text.slice(i + q.length);
    };
    hits.forEach((s, i) => {
      const built = s.built;
      const row = document.createElement(built ? "a" : "div");
      row.className = "search-result" + (i === 0 ? " active" : "");
      if (built) row.href = root + s.file;
      else row.style.opacity = ".5";
      row.innerHTML = `
        <div class="n">${String(s.n).padStart(2, "0")}</div>
        <div class="meta">
          <div class="t">${mark(s.title)}${built ? "" : " <span class=\"chip\">Coming soon</span>"}</div>
          <div class="b">${s.chapter} — ${mark(s.blurb)}</div>
        </div>`;
      container.appendChild(row);
    });
  }

  function injectSearchModal() {
    if (typeof COURSE === "undefined") return; // needs course-data.js loaded
    const topbar = document.querySelector(".topbar");
    if (topbar) {
      const trigger = document.createElement("button");
      trigger.className = "nav-btn";
      trigger.id = "search-trigger";
      trigger.type = "button";
      trigger.innerHTML = `🔍 <span>Search</span>`;
      trigger.title = "Jump to a session (press / to open)";
      const themeBtn = document.getElementById("theme-toggle");
      if (themeBtn) topbar.insertBefore(trigger, themeBtn);
      else topbar.appendChild(trigger);
    }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "search-backdrop";
    backdrop.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-label="Jump to a session">
        <div class="modal-head">
          <strong>🔍 Jump to a session</strong>
          <button class="modal-close" id="search-close" type="button" aria-label="Close search">✕</button>
        </div>
        <input type="text" id="search-input" class="modal-search-input" placeholder="Search by title or topic…">
        <div class="modal-body" id="search-results"></div>
      </div>`;
    document.body.appendChild(backdrop);

    const input = document.getElementById("search-input");
    const results = document.getElementById("search-results");
    renderSearchResults(results, "");

    function moveActive(delta) {
      const items = Array.from(results.querySelectorAll(".search-result"));
      if (!items.length) return;
      let idx = items.findIndex(el => el.classList.contains("active"));
      items[idx]?.classList.remove("active");
      idx = (idx + delta + items.length) % items.length;
      items[idx].classList.add("active");
      items[idx].scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("input", (e) => renderSearchResults(results, e.target.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
      else if (e.key === "Enter") {
        const active = results.querySelector(".search-result.active");
        if (active && active.href) { e.preventDefault(); location.href = active.href; }
      }
    });

    const open = () => {
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      input.value = "";
      renderSearchResults(results, "");
      setTimeout(() => input.focus(), 50);
    };
    const close = () => {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    };

    document.getElementById("search-trigger")?.addEventListener("click", open);
    document.getElementById("search-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("open")) { close(); return; }
      // Global "/" shortcut to open search, unless the user is typing somewhere else.
      if (e.key === "/" && !backdrop.classList.contains("open")) {
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        open();
      }
    });
  }

  // ---- Glossary popup: available from the top nav on every page ----
  function renderGlossaryList(container, list) {
    container.innerHTML = "";
    if (!list.length) { container.innerHTML = `<p class="small">No terms match.</p>`; return; }
    list.forEach(t => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.margin = ".5rem 0";
      card.innerHTML = `<div style="display:flex; justify-content:space-between; gap:1rem; align-items:baseline;">
          <strong>${t.term}</strong><span class="chip">Ch.${t.chapter}</span>
        </div>
        <p class="small" style="margin-top:.35rem;">${t.def}</p>`;
      container.appendChild(card);
    });
  }

  function injectGlossaryModal() {
    const root = document.body.dataset.root || "";
    const hasTerms = typeof GLOSSARY_TERMS !== "undefined";

    const topbar = document.querySelector(".topbar");
    if (topbar) {
      const trigger = document.createElement("button");
      trigger.className = "nav-btn";
      trigger.id = "glossary-trigger";
      trigger.type = "button";
      trigger.innerHTML = `📖 <span>Glossary</span>`;
      trigger.title = "Open glossary & abbreviations";
      const themeBtn = document.getElementById("theme-toggle");
      if (themeBtn) topbar.insertBefore(trigger, themeBtn);
      else topbar.appendChild(trigger);
    }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "glossary-backdrop";
    backdrop.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-label="Glossary and abbreviations">
        <div class="modal-head">
          <strong>📖 Glossary &amp; Abbreviations</strong>
          <button class="modal-close" id="glossary-close" type="button" aria-label="Close glossary">✕</button>
        </div>
        <input type="text" id="glossary-search" class="modal-search-input" placeholder="Search a term…">
        <div class="modal-body" id="glossary-terms"></div>
        <div class="modal-foot">
          <a href="${root}reference/glossary.html">Open full glossary page →</a>
        </div>
      </div>`;
    document.body.appendChild(backdrop);

    const termsEl = document.getElementById("glossary-terms");
    if (hasTerms) {
      renderGlossaryList(termsEl, GLOSSARY_TERMS);
    } else {
      termsEl.innerHTML = `<p class="small">Glossary data isn't loaded on this page — use the full glossary page instead.</p>`;
    }

    const search = document.getElementById("glossary-search");
    search.addEventListener("input", (e) => {
      if (!hasTerms) return;
      const q = e.target.value.toLowerCase();
      renderGlossaryList(termsEl, GLOSSARY_TERMS.filter(t =>
        t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)));
    });

    const open = () => {
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      search.value = "";
      if (hasTerms) renderGlossaryList(termsEl, GLOSSARY_TERMS);
      setTimeout(() => search.focus(), 50);
    };
    const close = () => {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    };

    const trigger = document.getElementById("glossary-trigger");
    if (trigger) trigger.addEventListener("click", open);
    document.getElementById("glossary-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("open")) close();
    });
  }

  return {
    chapterSlug, initTheme, initTopbar, buildSessionNav, wireMarkComplete, startHeartbeat,
    injectFooter, injectBrandLogo, injectDashboardLink, injectSearchModal, injectGlossaryModal,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  App.initTheme();
  App.startHeartbeat();
  App.injectBrandLogo();
  App.injectFooter();
  App.injectDashboardLink();
  App.injectSearchModal();
  App.injectGlossaryModal();
});
