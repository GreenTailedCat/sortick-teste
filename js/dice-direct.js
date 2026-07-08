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

  function getQueryId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  function readDraw() {
    try {
      const id = getQueryId();
      const draws = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return draws.find(draw => draw.id === id) || null;
    } catch {
      return null;
    }
  }

  function saveDraw(draw) {
    try {
      const draws = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const index = draws.findIndex(item => item.id === draw.id);
      if (index >= 0) {
        draws[index] = draw;
      } else {
        draws.push(draw);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
    } catch {
      // Fallback: the dice table remains usable even when storage fails.
    }
  }

  function secureRandomIndex(max) {
    if (max <= 0) return 0;
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const array = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / max) * max;
      let value;
      do {
        window.crypto.getRandomValues(array);
        value = array[0];
      } while (value >= limit);
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function createId(prefix = "dice") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function getDiceState(draw) {
    draw.options = draw.options || {};
    draw.options.diceTable = draw.options.diceTable || {
      dice: [],
      lastTotal: 0,
      updatedAt: ""
    };
    draw.options.diceTable.dice = Array.isArray(draw.options.diceTable.dice)
      ? draw.options.diceTable.dice.filter(item => item && DICE_TYPES.includes(Number(item.sides))).slice(0, DICE_LIMIT)
      : [];
    return draw.options.diceTable;
  }

  function diceLabel(sides) {
    return `D${sides}`;
  }

  function diceSvg(sides, value = "?") {
    const safeValue = escapeHTML(value);
    const configs = {
      4: {
        labelY: 56,
        valueY: 134,
        view: "0 0 220 200",
        body: `
          <path class="dice-shadow" d="M44 176 L176 176 L110 22 Z"/>
          <path class="dice-face dice-main" d="M110 18 L202 184 L18 184 Z"/>
          <path class="dice-face dice-side-a" d="M110 18 L110 184 L18 184 Z"/>
          <path class="dice-face dice-side-b" d="M110 18 L202 184 L110 184 Z"/>
          <path class="dice-line" d="M110 18 L110 184 M18 184 L202 184"/>
        `
      },
      6: {
        labelY: 58,
        valueY: 136,
        view: "0 0 220 200",
        body: `
          <path class="dice-shadow" d="M58 172 L166 172 L196 58 L90 58 Z"/>
          <path class="dice-face dice-top" d="M62 48 L144 22 L196 58 L112 88 Z"/>
          <path class="dice-face dice-main" d="M112 88 L196 58 L196 144 L112 178 Z"/>
          <path class="dice-face dice-side-a" d="M62 48 L112 88 L112 178 L62 132 Z"/>
          <path class="dice-line" d="M62 48 L112 88 L196 58 M112 88 L112 178"/>
        `
      },
      8: {
        labelY: 54,
        valueY: 132,
        view: "0 0 220 200",
        body: `
          <path class="dice-shadow" d="M110 188 L198 102 L110 18 L22 102 Z"/>
          <path class="dice-face dice-main" d="M110 18 L198 102 L110 106 Z"/>
          <path class="dice-face dice-side-a" d="M110 18 L110 106 L22 102 Z"/>
          <path class="dice-face dice-side-b" d="M22 102 L110 106 L110 188 Z"/>
          <path class="dice-face dice-side-c" d="M198 102 L110 106 L110 188 Z"/>
          <path class="dice-line" d="M110 18 L110 188 M22 102 L198 102"/>
        `
      },
      10: {
        labelY: 56,
        valueY: 133,
        view: "0 0 220 200",
        body: `
          <path class="dice-shadow" d="M34 98 L70 32 L150 20 L196 88 L170 164 L98 188 L38 142 Z"/>
          <path class="dice-face dice-main" d="M70 32 L150 20 L196 88 L112 104 Z"/>
          <path class="dice-face dice-side-a" d="M34 98 L70 32 L112 104 L38 142 Z"/>
          <path class="dice-face dice-side-b" d="M196 88 L170 164 L112 104 Z"/>
          <path class="dice-face dice-side-c" d="M38 142 L112 104 L98 188 Z"/>
          <path class="dice-face dice-side-d" d="M112 104 L170 164 L98 188 Z"/>
          <path class="dice-line" d="M70 32 L112 104 L150 20 M34 98 L112 104 L196 88 M38 142 L112 104 L98 188 M170 164 L112 104"/>
        `
      },
      12: {
        labelY: 56,
        valueY: 134,
        view: "0 0 220 200",
        body: `
          <path class="dice-shadow" d="M110 14 L176 40 L204 106 L166 174 L92 190 L32 142 L28 70 Z"/>
          <path class="dice-face dice-main" d="M110 42 L160 70 L148 132 L86 132 L68 72 Z"/>
          <path class="dice-face dice-side-a" d="M110 14 L176 40 L160 70 L110 42 Z"/>
          <path class="dice-face dice-side-b" d="M176 40 L204 106 L148 132 L160 70 Z"/>
          <path class="dice-face dice-side-c" d="M148 132 L166 174 L92 190 L86 132 Z"/>
          <path class="dice-face dice-side-d" d="M28 70 L68 72 L86 132 L32 142 Z"/>
          <path class="dice-line" d="M110 42 L160 70 L148 132 L86 132 L68 72 Z M110 42 L110 14 M160 70 L176 40 M148 132 L204 106 M86 132 L92 190 M68 72 L28 70"/>
        `
      },
      20: {
        labelY: 54,
        valueY: 132,
        view: "0 0 220 200",
        body: `
          <path class="dice-shadow" d="M110 10 L190 54 L196 142 L110 192 L24 142 L30 54 Z"/>
          <path class="dice-face dice-main" d="M110 40 L166 74 L142 136 L78 136 L54 74 Z"/>
          <path class="dice-face dice-side-a" d="M110 10 L190 54 L166 74 L110 40 Z"/>
          <path class="dice-face dice-side-b" d="M190 54 L196 142 L142 136 L166 74 Z"/>
          <path class="dice-face dice-side-c" d="M142 136 L110 192 L78 136 Z"/>
          <path class="dice-face dice-side-d" d="M24 142 L54 74 L78 136 Z"/>
          <path class="dice-face dice-side-e" d="M30 54 L110 10 L110 40 L54 74 Z"/>
          <path class="dice-line" d="M110 40 L166 74 L142 136 L78 136 L54 74 Z M110 10 L110 40 M190 54 L166 74 M196 142 L142 136 M110 192 L142 136 M110 192 L78 136 M24 142 L78 136 M30 54 L54 74"/>
        `
      }
    };

    const config = configs[sides] || configs[6];
    return `
      <svg class="dice-piece-svg dice-piece-svg-d${sides}" viewBox="${config.view}" role="img" aria-label="D${sides}, resultado ${safeValue}">
        ${config.body}
        <text class="dice-type-text" x="110" y="${config.labelY}" text-anchor="middle">D${sides}</text>
        <text class="dice-value-text" x="110" y="${config.valueY}" text-anchor="middle">${safeValue}</text>
      </svg>`;
  }

  function totalFromDice(dice) {
    return dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }

  function render(draw, { rolling = false } = {}) {
    const stage = document.querySelector(".draw-stage");
    const side = document.querySelector(".draw-side");
    if (!stage) return;

    document.body.classList.add("dice-direct-mode");

    const state = getDiceState(draw);
    const dice = state.dice;
    const total = totalFromDice(dice);
    const compactClass = dice.length >= 8 ? "is-compact" : dice.length >= 5 ? "is-medium" : "";
    const hasDice = dice.length > 0;

    stage.innerHTML = `
      <div class="dice-direct-card">
        <div class="dice-direct-head">
          <div>
            <p class="eyebrow">DECISÕES RÁPIDAS</p>
            <h1>Jogar os dados</h1>
            <p>${hasDice ? "Role novamente, remova dados ou limpe a mesa." : "Escolha um ou mais dados abaixo para começar."}</p>
          </div>
          <span class="dice-count">${dice.length}/${DICE_LIMIT} dados</span>
        </div>

        <div class="dice-table ${compactClass} ${rolling ? "is-rolling" : ""}">
          ${hasDice ? `
            <div class="dice-pieces" aria-live="polite">
              ${dice.map(item => `
                <article class="dice-piece dice-piece-d${item.sides}" data-dice-id="${escapeHTML(item.id)}">
                  <button class="dice-remove" type="button" aria-label="Remover D${item.sides}">×</button>
                  ${diceSvg(item.sides, item.value || "?")}
                </article>`).join("")}
            </div>
            ${dice.length > 1 ? `
              <div class="dice-total-box">
                <span>Total</span>
                <strong>${total}</strong>
              </div>` : ""}
          ` : `
            <div class="dice-empty">
              <strong>Escolha os dados</strong>
              <span>Use os botões abaixo para adicionar D4, D6, D8, D10, D12 ou D20.</span>
            </div>`}
        </div>

        <div class="dice-controls">
          <div class="dice-add-row">
            ${DICE_TYPES.map(sides => `
              <button class="dice-add" type="button" data-sides="${sides}" ${dice.length >= DICE_LIMIT ? "disabled" : ""}>+ D${sides}</button>`).join("")}
          </div>

          <div class="dice-action-row">
            <button id="diceRollButton" class="btn btn-primary" type="button" ${!hasDice ? "disabled" : ""}>Rolar</button>
            <button id="diceClearButton" class="btn btn-ghost light" type="button" ${!hasDice ? "disabled" : ""}>Limpar</button>
          </div>

          ${dice.length >= DICE_LIMIT ? `<p class="dice-limit-note">Limite de ${DICE_LIMIT} dados atingido.</p>` : ""}
        </div>
      </div>`;

    if (side) {
      side.innerHTML = `
        <aside class="info-card">
          <h3>Transparência</h3>
          <p>Os resultados usam a aleatoriedade do navegador com crypto.getRandomValues, quando disponível.</p>
        </aside>`;
    }

    stage.querySelectorAll(".dice-add").forEach(button => {
      button.addEventListener("click", () => {
        const sides = Number(button.dataset.sides);
        if (!DICE_TYPES.includes(sides) || state.dice.length >= DICE_LIMIT) return;
        state.dice.push({ id: createId("die"), sides, value: null });
        state.updatedAt = new Date().toISOString();
        draw.result = null;
        saveDraw(draw);
        render(draw);
      });
    });

    stage.querySelectorAll(".dice-remove").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.closest(".dice-piece")?.dataset.diceId;
        state.dice = state.dice.filter(item => item.id !== id);
        draw.options.diceTable = state;
        draw.result = null;
        state.updatedAt = new Date().toISOString();
        saveDraw(draw);
        render(draw);
      });
    });

    const rollButton = stage.querySelector("#diceRollButton");
    const clearButton = stage.querySelector("#diceClearButton");

    if (rollButton) rollButton.addEventListener("click", () => rollDice(draw));
    if (clearButton) clearButton.addEventListener("click", () => {
      state.dice = [];
      state.lastTotal = 0;
      state.updatedAt = new Date().toISOString();
      draw.result = null;
      saveDraw(draw);
      render(draw);
    });
  }

  function rollDice(draw) {
    const state = getDiceState(draw);
    if (!state.dice.length) return;

    let ticks = 0;
    const maxTicks = 13;

    const interval = window.setInterval(() => {
      ticks += 1;
      state.dice = state.dice.map(item => ({
        ...item,
        value: secureRandomIndex(item.sides) + 1
      }));
      state.lastTotal = totalFromDice(state.dice);
      render(draw, { rolling: true });

      if (ticks >= maxTicks) {
        window.clearInterval(interval);
        state.dice = state.dice.map(item => ({
          ...item,
          value: secureRandomIndex(item.sides) + 1
        }));
        state.lastTotal = totalFromDice(state.dice);
        state.updatedAt = new Date().toISOString();
        draw.result = {
          quickResult: {
            label: `Total: ${state.lastTotal}`,
            value: String(state.lastTotal)
          },
          diceResults: state.dice.map(item => ({ sides: item.sides, value: item.value })),
          createdAt: new Date().toISOString()
        };
        saveDraw(draw);
        render(draw);
      }
    }, 58);
  }

  function init() {
    const draw = readDraw();
    if (!draw || draw.type !== "quick" || draw.options?.quickType !== "dice") return;
    render(draw);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
