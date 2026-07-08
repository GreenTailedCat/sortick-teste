(() => {
  const DICE_LIMIT = 10;
  const DICE_TYPES = [4, 6, 8, 10, 12, 20];
  const STORAGE_KEY = "sortick_test_draws_v1";

  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function getDrawId() {
    return new URLSearchParams(location.search).get("id");
  }

  function getDraws() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }

  function getDraw() {
    const id = getDrawId();
    return getDraws().find(draw => draw && draw.id === id) || null;
  }

  function saveDraw(draw) {
    try {
      const draws = getDraws();
      const index = draws.findIndex(item => item.id === draw.id);
      if (index >= 0) draws[index] = draw;
      else draws.push(draw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
    } catch {}
  }

  function isDiceDraw(draw) {
    return draw && draw.type === "quick" && draw.options && draw.options.quickType === "dice";
  }

  function randomIndex(max) {
    if (max <= 0) return 0;
    if (crypto && typeof crypto.getRandomValues === "function") {
      const buffer = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / max) * max;
      let value;
      do {
        crypto.getRandomValues(buffer);
        value = buffer[0];
      } while (value >= limit);
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function makeId() {
    return `die_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function state(draw) {
    draw.options = draw.options || {};
    draw.options.diceTable = draw.options.diceTable || {};
    const dice = Array.isArray(draw.options.diceTable.dice) ? draw.options.diceTable.dice : [];
    draw.options.diceTable.dice = dice
      .filter(item => item && DICE_TYPES.includes(Number(item.sides)))
      .slice(0, DICE_LIMIT)
      .map(item => ({
        id: item.id || makeId(),
        sides: Number(item.sides),
        value: Number.isInteger(Number(item.value)) ? Number(item.value) : null
      }));
    draw.options.diceTable.lastTotal = draw.options.diceTable.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    return draw.options.diceTable;
  }

  function diceSvg(sides, value) {
    const v = escapeHTML(value ?? "?");
    const shared = `
      <defs>
        <linearGradient id="diceGrad${sides}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="rgba(255,255,255,.95)"/>
          <stop offset=".35" stop-color="var(--dice-light)"/>
          <stop offset="1" stop-color="var(--dice-dark)"/>
        </linearGradient>
      </defs>`;
    const shapes = {
      4: `<path class="dice-shadow" d="M42 182 L178 182 L110 28 Z"/><path class="dice-main" d="M110 20 L204 186 L16 186 Z"/><path class="dice-side dice-side-a" d="M110 20 L110 186 L16 186 Z"/><path class="dice-side dice-side-b" d="M110 20 L204 186 L110 186 Z"/><path class="dice-line" d="M110 20 L110 186 M16 186 L204 186"/>`,
      6: `<path class="dice-shadow" d="M54 174 L166 174 L198 64 L88 54 Z"/><path class="dice-top" d="M58 52 L144 24 L198 64 L112 94 Z"/><path class="dice-main" d="M112 94 L198 64 L198 148 L112 180 Z"/><path class="dice-side dice-side-a" d="M58 52 L112 94 L112 180 L58 136 Z"/><path class="dice-line" d="M58 52 L112 94 L198 64 M112 94 L112 180"/>`,
      8: `<path class="dice-shadow" d="M110 192 L202 104 L110 14 L18 104 Z"/><path class="dice-top" d="M110 14 L202 104 L110 106 Z"/><path class="dice-side dice-side-a" d="M110 14 L110 106 L18 104 Z"/><path class="dice-main" d="M18 104 L110 106 L110 192 Z"/><path class="dice-side dice-side-b" d="M202 104 L110 106 L110 192 Z"/><path class="dice-line" d="M110 14 L110 192 M18 104 L202 104"/>`,
      10: `<path class="dice-shadow" d="M30 100 L70 30 L150 18 L202 90 L170 168 L96 190 L36 146 Z"/><path class="dice-top" d="M70 30 L150 18 L202 90 L112 106 Z"/><path class="dice-side dice-side-a" d="M30 100 L70 30 L112 106 L36 146 Z"/><path class="dice-main" d="M202 90 L170 168 L112 106 Z"/><path class="dice-side dice-side-b" d="M36 146 L112 106 L96 190 Z"/><path class="dice-side dice-side-c" d="M112 106 L170 168 L96 190 Z"/><path class="dice-line" d="M70 30 L112 106 L150 18 M30 100 L112 106 L202 90 M36 146 L112 106 L96 190 M170 168 L112 106"/>`,
      12: `<path class="dice-shadow" d="M110 12 L178 42 L206 108 L166 176 L92 192 L30 144 L26 70 Z"/><path class="dice-main" d="M110 42 L162 72 L150 134 L86 134 L66 74 Z"/><path class="dice-top" d="M110 12 L178 42 L162 72 L110 42 Z"/><path class="dice-side dice-side-a" d="M178 42 L206 108 L150 134 L162 72 Z"/><path class="dice-side dice-side-b" d="M150 134 L166 176 L92 192 L86 134 Z"/><path class="dice-side dice-side-c" d="M26 70 L66 74 L86 134 L30 144 Z"/><path class="dice-line" d="M110 42 L162 72 L150 134 L86 134 L66 74 Z M110 42 L110 12 M162 72 L178 42 M150 134 L206 108 M86 134 L92 192 M66 74 L26 70"/>`,
      20: `<path class="dice-shadow" d="M110 10 L192 54 L198 144 L110 194 L22 144 L28 54 Z"/><path class="dice-main" d="M110 42 L168 76 L142 138 L78 138 L52 76 Z"/><path class="dice-top" d="M110 10 L192 54 L168 76 L110 42 Z"/><path class="dice-side dice-side-a" d="M192 54 L198 144 L142 138 L168 76 Z"/><path class="dice-side dice-side-b" d="M142 138 L110 194 L78 138 Z"/><path class="dice-side dice-side-c" d="M22 144 L52 76 L78 138 Z"/><path class="dice-side dice-side-d" d="M28 54 L110 10 L110 42 L52 76 Z"/><path class="dice-line" d="M110 42 L168 76 L142 138 L78 138 L52 76 Z M110 10 L110 42 M192 54 L168 76 M198 144 L142 138 M110 194 L142 138 M110 194 L78 138 M22 144 L78 138 M28 54 L52 76"/>`
    };
    return `<svg class="dice-piece-svg dice-piece-svg-d${sides}" viewBox="0 0 220 205" role="img" aria-label="D${sides}, resultado ${v}">${shared}${shapes[sides]}<text class="dice-type-text" x="110" y="58" text-anchor="middle">D${sides}</text><text class="dice-value-text" x="110" y="137" text-anchor="middle">${v}</text></svg>`;
  }

  function render(draw, rolling = false) {
    if (!isDiceDraw(draw)) return;
    const root = document.querySelector(".draw-layout");
    const stage = document.querySelector(".draw-stage");
    const side = document.querySelector(".draw-side");
    if (!root || !stage) return;

    document.body.classList.add("dice-direct-mode");
    const old = document.querySelector(".winner-card");
    if (old) old.classList.add("hidden");

    const s = state(draw);
    const dice = s.dice;
    const total = dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const sizeClass = dice.length >= 8 ? "is-compact" : dice.length >= 5 ? "is-medium" : "";

    stage.innerHTML = `
      <div class="dice-direct-card">
        <div class="dice-direct-head">
          <div>
            <p class="eyebrow">DECISÕES RÁPIDAS</p>
            <h1>Jogar os dados</h1>
            <p>${dice.length ? "Role novamente, remova dados ou limpe a mesa." : "Escolha um ou mais dados abaixo para começar."}</p>
          </div>
          <span class="dice-count">${dice.length}/${DICE_LIMIT} dados</span>
        </div>

        <div class="dice-table ${sizeClass} ${rolling ? "is-rolling" : ""}">
          ${dice.length ? `
            <div class="dice-pieces">
              ${dice.map(item => `<article class="dice-piece dice-piece-d${item.sides}" data-die="${escapeHTML(item.id)}"><button class="dice-remove" type="button" aria-label="Remover D${item.sides}">×</button>${diceSvg(item.sides, item.value || "?")}</article>`).join("")}
            </div>
            ${dice.length > 1 ? `<div class="dice-total-box"><span>Total</span><strong>${total}</strong></div>` : ""}
          ` : `<div class="dice-empty"><strong>Mesa vazia</strong><span>Use os botões abaixo para adicionar dados.</span></div>`}
        </div>

        <div class="dice-controls">
          <div class="dice-add-row">
            ${DICE_TYPES.map(n => `<button class="dice-add" data-sides="${n}" type="button" ${dice.length >= DICE_LIMIT ? "disabled" : ""}>+ D${n}</button>`).join("")}
          </div>
          <div class="dice-action-row">
            <button id="diceRollButton" class="btn btn-primary" type="button" ${dice.length ? "" : "disabled"}>Rolar</button>
            <button id="diceClearButton" class="btn btn-ghost light" type="button" ${dice.length ? "" : "disabled"}>Limpar</button>
          </div>
          ${dice.length >= DICE_LIMIT ? `<p class="dice-limit-note">Limite de ${DICE_LIMIT} dados atingido.</p>` : ""}
        </div>
      </div>`;

    if (side) {
      side.innerHTML = `<aside class="info-card"><h3>Transparência</h3><p>Os resultados usam a aleatoriedade do navegador com crypto.getRandomValues, quando disponível.</p></aside>`;
    }

    stage.querySelectorAll(".dice-add").forEach(btn => {
      btn.addEventListener("click", () => {
        const sides = Number(btn.dataset.sides);
        const current = state(draw);
        if (!DICE_TYPES.includes(sides) || current.dice.length >= DICE_LIMIT) return;
        current.dice.push({ id: makeId(), sides, value: null });
        current.lastTotal = current.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        draw.result = null;
        saveDraw(draw);
        render(draw);
      });
    });

    stage.querySelectorAll(".dice-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.closest(".dice-piece")?.dataset.die;
        const current = state(draw);
        current.dice = current.dice.filter(item => item.id !== id);
        current.lastTotal = current.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        draw.options.diceTable = current;
        draw.result = null;
        saveDraw(draw);
        render(draw);
      });
    });

    const roll = stage.querySelector("#diceRollButton");
    const clear = stage.querySelector("#diceClearButton");

    if (roll) roll.addEventListener("click", () => rollDice(draw));
    if (clear) clear.addEventListener("click", () => {
      const current = state(draw);
      current.dice = [];
      current.lastTotal = 0;
      draw.result = null;
      saveDraw(draw);
      render(draw);
    });
  }

  function rollDice(draw) {
    const s = state(draw);
    if (!s.dice.length) return;

    let tick = 0;
    const maxTick = 13;
    const timer = setInterval(() => {
      tick += 1;
      s.dice = s.dice.map(item => ({ ...item, value: randomIndex(item.sides) + 1 }));
      s.lastTotal = s.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
      render(draw, true);
      if (tick >= maxTick) {
        clearInterval(timer);
        s.dice = s.dice.map(item => ({ ...item, value: randomIndex(item.sides) + 1 }));
        s.lastTotal = s.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        draw.result = {
          quickResult: { label: `Total: ${s.lastTotal}`, value: String(s.lastTotal) },
          diceResults: s.dice.map(item => ({ sides: item.sides, value: item.value })),
          createdAt: new Date().toISOString()
        };
        saveDraw(draw);
        render(draw, false);
      }
    }, 58);
  }

  function boot() {
    const draw = getDraw();
    if (!isDiceDraw(draw)) return false;
    render(draw);
    return true;
  }

  // Run repeatedly for a moment because the legacy renderer may repaint after DOMContentLoaded.
  function forceBoot() {
    let count = 0;
    const run = () => {
      if (boot()) count += 1;
      if (count < 10) setTimeout(run, 120);
    };
    run();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", forceBoot);
  } else {
    forceBoot();
  }
})();