/* ============================================================
   Generic quiz renderer used by every lesson + exam page.
   Usage:
     Quiz.render("quiz-mount", questions, {
       sessionId: "s02",
       title: "Lesson check",
       onFinish: (correct, total) => {}
     });
   Question shape:
     {
       lo: "AI-1.1.1", k: "K2", type: "single" | "multi",
       prompt: "...", choices: [{text:"...", correct:true}, ...],
       explain: "..."
     }
   ============================================================ */

const Quiz = (() => {
  function letter(i) { return String.fromCharCode(65 + i); }

  function render(mountId, questions, opts = {}) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const sessionId = opts.sessionId || mountId;
    mount.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "quiz";

    questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "qcard";
      card.dataset.qi = qi;

      const head = document.createElement("div");
      head.className = "qhead";
      head.innerHTML = `<span class="qnum">Question ${qi + 1} of ${questions.length}</span>
        <span class="chip ${q.k ? q.k.toLowerCase() : "k2"}">${q.k || "K2"}${q.lo ? " · " + q.lo : ""}</span>`;
      card.appendChild(head);

      const prompt = document.createElement("div");
      prompt.className = "qprompt";
      prompt.innerHTML = q.prompt;
      card.appendChild(prompt);

      const choicesEl = document.createElement("div");
      choicesEl.className = "choices";
      const inputType = q.type === "multi" ? "checkbox" : "radio";

      q.choices.forEach((c, ci) => {
        const id = `${sessionId}-q${qi}-c${ci}`;
        const label = document.createElement("label");
        label.className = "choice";
        label.setAttribute("for", id);
        label.innerHTML = `<input type="${inputType}" name="${sessionId}-q${qi}" id="${id}" value="${ci}">
          <span><strong>${letter(ci)}.</strong> ${c.text}</span>`;
        choicesEl.appendChild(label);
      });
      card.appendChild(choicesEl);

      const explain = document.createElement("div");
      explain.className = "explain";
      explain.innerHTML = `<strong>Why:</strong> ${q.explain || ""}`;
      card.appendChild(explain);

      wrap.appendChild(card);
    });

    mount.appendChild(wrap);

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex; gap:.7rem; margin-top:1rem; flex-wrap:wrap;";
    const submitBtn = document.createElement("button");
    submitBtn.className = "btn btn-primary";
    const submitLabel = opts.submitLabel || "Check my answers";
    submitBtn.textContent = submitLabel;
    actions.appendChild(submitBtn);

    const retakeBtn = document.createElement("button");
    retakeBtn.className = "btn btn-ghost";
    retakeBtn.textContent = "↺ Retake quiz";
    retakeBtn.style.display = "none";
    actions.appendChild(retakeBtn);

    mount.appendChild(actions);

    const banner = document.createElement("div");
    banner.style.display = "none";
    mount.appendChild(banner);

    function grade() {
      let correctCount = 0;
      const cards = wrap.querySelectorAll(".qcard");
      cards.forEach((card, qi) => {
        const q = questions[qi];
        const inputs = card.querySelectorAll("input");
        const chosen = Array.from(inputs).filter(i => i.checked).map(i => parseInt(i.value, 10));
        const correctIdx = q.choices.map((c, i) => c.correct ? i : -1).filter(i => i >= 0);
        // A question where every choice is marked correct is a no-wrong-answer
        // self-assessment prompt — any selection counts.
        const selfAssess = correctIdx.length === q.choices.length;
        const isCorrect = selfAssess ? chosen.length > 0
          : (chosen.length === correctIdx.length && chosen.every(i => correctIdx.includes(i)));
        if (isCorrect) correctCount++;

        inputs.forEach((inp, ci) => {
          inp.disabled = true;
          const lbl = inp.closest(".choice");
          const wasChecked = inp.checked;
          const isRight = q.choices[ci].correct;
          const note = document.createElement("span");
          note.className = "note";
          if (isRight && wasChecked) {
            lbl.classList.add("correct");
            note.textContent = "✓ your answer";
          } else if (isRight && !wasChecked && !selfAssess) {
            // A correct choice you didn't check — this is what makes a
            // "select all that apply" question come up short even when
            // nothing you picked was actually wrong.
            lbl.classList.add("missed");
            note.textContent = "you missed this one — also correct";
          } else if (!isRight && wasChecked) {
            lbl.classList.add("incorrect");
            note.textContent = "✗ your answer";
          } else {
            return;
          }
          lbl.querySelector("span").appendChild(note);
        });
        card.classList.add("revealed");
      });

      submitBtn.disabled = true;
      submitBtn.textContent = "Answers checked";
      retakeBtn.style.display = "inline-flex";
      const pct = Math.round((correctCount / questions.length) * 100);
      const tone = pct >= 80 ? "success" : pct >= 60 ? "warning" : "danger";
      banner.style.display = "block";
      banner.innerHTML = `<div class="result-banner" style="border-color: var(--${tone}); background: var(--${tone}-soft);">
          <div class="score" style="color: var(--${tone});">${correctCount} / ${questions.length}</div>
          <div class="small">${pct}% correct${opts.passPct ? " · pass mark " + opts.passPct + "%" : ""}</div>
        </div>`;
      banner.scrollIntoView({ behavior: "smooth", block: "center" });

      if (typeof Progress !== "undefined") Progress.saveQuiz(sessionId, correctCount, questions.length);
      if (opts.onFinish) opts.onFinish(correctCount, questions.length);
    }

    function resetQuiz() {
      wrap.querySelectorAll(".qcard").forEach((card) => {
        card.classList.remove("revealed");
        card.querySelectorAll("input").forEach((inp) => {
          inp.checked = false;
          inp.disabled = false;
        });
        card.querySelectorAll(".choice").forEach((lbl) => {
          lbl.classList.remove("correct", "incorrect", "missed");
          lbl.querySelectorAll(".note").forEach((n) => n.remove());
        });
      });
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
      retakeBtn.style.display = "none";
      banner.style.display = "none";
      banner.innerHTML = "";
      wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    submitBtn.addEventListener("click", grade);
    retakeBtn.addEventListener("click", resetQuiz);
  }

  return { render };
})();
