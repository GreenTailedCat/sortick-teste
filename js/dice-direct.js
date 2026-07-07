(() => {
  "use strict";

  const STORAGE_KEY = "sortick_test_draws_v1";
  const SUPPORTED = [4, 6, 8, 10, 12, 20];
  const MAX_DICE = 10;
  const params = new URLSearchParams(window.location.search);
  const drawId = params.get("id");

  function readDraw() {
    if (!drawId) return null;
    try {
      const draws = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return draws[drawId] || null;
    } catch {
      return null;
    }
  }

  function saveDraw(draw) {
    if (!draw || !drawId) return;
    try {
      const draws = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      draws[drawId] = draw;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
    } catch {
      // The page keeps working for the current session even if browser storage is unavailable.
    }
  }

  function secureIndex(length) {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      const max = 0xffffffff;
      const limit = max - (max % length);
      do { window.crypto.getRandomValues(array); } while (array[0] >= limit);
      return array[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function createId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHTML(value) {
    const node = document.createElement("div");
    node.textContent = String(value ?? "");
    return node.innerHTML;
  }

  function normalizeTray(draw) {
    draw.options = draw.options || {};
    const tray = Array.isArray(draw.options.diceTray) ? draw.options.diceTray : [];
    draw.options.diceTray = tray
      .filter(die => die && SUPPORTED.includes(Number(die.sides)))
      .slice(0, MAX_DICE)
      .map(die => ({
        id: die.id || createId("die"),
        sides: Number(die.sides),
        value: Number.isInteger(die.value) ? die.value : null
      }));
    return draw.options.diceTray;
  }

  function dieSVG(die) {
    const value = die.value ?? "?";
    const shapes = {
      4: `<svg viewBox="0 0 180 180" aria-label="D4"><polygon class="dd-face dd4a" points="90,12 166,160 90,140"/><polygon class="dd-face dd4b" points="90,12 90,140 14,160"/><polygon class="dd-face dd4c" points="14,160 90,140 166,160"/><text class="dd-kind" x="90" y="58">D4</text><text class="dd-value" x="90" y="124">${value}</text></svg>`,
      6: `<svg viewBox="0 0 180 180" aria-label="D6"><polygon class="dd-face dd6top" points="50,34 119,16 158,50 90,72"/><polygon class="dd-face dd6left" points="50,34 90,72 90,152 24,112"/><polygon class="dd-face dd6right" points="90,72 158,50 158,128 90,152"/><text class="dd-kind" x="112" y="53">D6</text><text class="dd-value" x="122" y="116">${value}</text></svg>`,
      8: `<svg viewBox="0 0 180 180" aria-label="D8"><polygon class="dd-face dd8a" points="90,9 163,90 90,90"/><polygon class="dd-face dd8b" points="90,9 90,90 17,90"/><polygon class="dd-face dd8c" points="17,90 90,90 90,171"/><polygon class="dd-face dd8d" points="90,90 163,90 90,171"/><text class="dd-kind" x="90" y="57">D8</text><text class="dd-value" x="90" y="116">${value}</text></svg>`,
      10: `<svg viewBox="0 0 180 180" aria-label="D10"><polygon class="dd-face dd10a" points="90,8 152,50 132,145 90,172"/><polygon class="dd-face dd10b" points="90,8 28,50 48,145 90,172"/><polygon class="dd-face dd10c" points="28,50 90,87 152,50 132,145 90,172 48,145"/><text class="dd-kind" x="90" y="54">D10</text><text class="dd-value" x="90" y="122">${value}</text></svg>`,
      12: `<svg viewBox="0 0 180 180" aria-label="D12"><polygon class="dd-face dd12a" points="90,23 123,48 111,86 69,86 57,48"/><polygon class="dd-face dd12b" points="57,48 69,86 49,122 16,97 25,60"/><polygon class="dd-face dd12c" points="123,48 155,60 164,97 131,122 111,86"/><polygon class="dd-face dd12d" points="69,86 111,86 131,122 105,155 75,155 49,122"/><polygon class="dd-face dd12e" points="75,155 105,155 90,174"/><text class="dd-kind" x="90" y="67">D12</text><text class="dd-value" x="90" y="129">${value}</text></svg>`,
      20: `<svg viewBox="0 0 180 180" aria-label="D20"><polygon class="dd-face dd20a" points="90,7 152,60 90,91"/><polygon class="dd-face dd20b" points="90,7 28,60 90,91"/><polygon class="dd-face dd20c" points="28,60 90,91 51,159"/><polygon class="dd-face dd20d" points="152,60 129,159 90,91"/><polygon class="dd-face dd20e" points="51,159 90,91 129,159 90,174"/><text class="dd-kind" x="90" y="59">D20</text><text class="dd-value" x="90" y="122">${value}</text></svg>`
    };
    return shapes[die.sides] || shapes[6];
  }

  function hideLegacyControls() {
    const ids = ["participantPanel", "participantForm", "bulkAddPanel", "activityInfoPanel", "winnerCard", "drawButton", "resetButton"];
    ids.forEach(id => document.getElementById(id)?.classList.add("hidden"));
    const title = document.getElementById("drawTitle");
    const kind = document.getElementById("drawKind");
    const status = document.getElementById("drawStatus");
    if (title) title.textContent = "Dado";
    if (kind) kind.textContent = "Decisões rápidas";
    if (status) status.textContent = "Mesa de dados";
  }

  function updateButtons(draw) {
    const hasResult = Boolean(draw.result && draw.result.quickResult && Array.isArray(draw.result.quickResult.dice));
    ["copyButton", "shareButton", "downloadButton"].forEach(id => {
      const button = document.getElementById(id);
      if (button) button.disabled = !hasResult;
    });
  }

  function render(draw, rolling = false) {
    const stage = document.getElementById("animationArea");
    if (!stage) return;
    const tray = normalizeTray(draw);
    const allRolled = tray.length > 0 && tray.every(die => Number.isInteger(die.value));
    const total = tray.reduce((sum, die) => sum + (Number.isInteger(die.value) ? die.value : 0), 0);
    stage.innerHTML = `
      <section class="direct-dice-game ${rolling ? "is-rolling" : ""}" aria-label="Jogar os dados">
        <header class="direct-dice-header">
          <div><h2>Jogar os dados</h2><p>Adicione até 10 dados e role a mesa.</p></div>
          <span>${tray.length}/10 dados</span>
        </header>
        <div class="direct-dice-stage">
          ${tray.map(die => `<article class="direct-die direct-d${die.sides}" data-id="${escapeHTML(die.id)}">${dieSVG(die)}<button type="button" class="direct-die-remove" data-remove="${escapeHTML(die.id)}" aria-label="Remover D${die.sides}">×</button></article>`).join("")}
          ${!tray.length ? '<p class="direct-dice-empty">Escolha um dado abaixo para começar.</p>' : ""}
          ${allRolled && tray.length > 1 ? `<strong class="direct-dice-total"><small>Total</small>${total}</strong>` : ""}
        </div>
        <div class="direct-dice-toolbar">
          <div class="direct-dice-picker" aria-label="Adicionar dados">${SUPPORTED.map(sides => `<button type="button" data-add="${sides}" ${rolling || tray.length >= MAX_DICE ? "disabled" : ""}>D${sides}</button>`).join("")}</div>
          <div class="direct-dice-actions"><button id="directRoll" class="btn btn-primary" type="button" ${!tray.length || rolling ? "disabled" : ""}>Rolar</button><button id="directClear" class="btn btn-ghost" type="button" ${!tray.length || rolling ? "disabled" : ""}>Limpar</button></div>
        </div>
      </section>`;

    stage.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => {
      const current = normalizeTray(draw);
      if (current.length >= MAX_DICE) return;
      current.push({ id: createId("die"), sides: Number(button.dataset.add), value: null });
      draw.result = null;
      saveDraw(draw);
      render(draw);
      updateButtons(draw);
    }));
    stage.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      draw.options.diceTray = normalizeTray(draw).filter(die => die.id !== button.dataset.remove);
      draw.result = null;
      saveDraw(draw);
      render(draw);
      updateButtons(draw);
    }));
    stage.querySelector("#directClear")?.addEventListener("click", () => {
      draw.options.diceTray = [];
      draw.result = null;
      saveDraw(draw);
      render(draw);
      updateButtons(draw);
    });
    stage.querySelector("#directRoll")?.addEventListener("click", () => roll(draw));
  }

  async function roll(draw) {
    const tray = normalizeTray(draw);
    if (!tray.length) return;
    const finalTray = tray.map(die => ({ ...die, value: secureIndex(die.sides) + 1 }));
    const started = performance.now();
    let last = 0;
    await new Promise(resolve => {
      function frame(now) {
        const progress = Math.min((now - started) / 920, 1);
        if (now - last > 60 + progress * 120) {
          last = now;
          render({ ...draw, options: { ...draw.options, diceTray: tray.map(die => ({ ...die, value: secureIndex(die.sides) + 1 })) } }, true);
        }
        if (progress < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
    draw.options.diceTray = finalTray;
    const total = finalTray.reduce((sum, die) => sum + die.value, 0);
    draw.result = {
      participant: { id: createId("dice"), name: finalTray.map(die => `D${die.sides}: ${die.value}`).join(" + "), status: "confirmed" },
      quickResult: {
        label: finalTray.length > 1 ? `Total: ${total}` : `D${finalTray[0].sides}: ${finalTray[0].value}`,
        value: String(total),
        dice: finalTray.map(die => ({ sides: die.sides, value: die.value })),
        total
      },
      createdAt: new Date().toISOString(),
      participantCount: 0
    };
    saveDraw(draw);
    render(draw);
    updateButtons(draw);
  }

  function boot() {
    const draw = readDraw();
    if (!draw || draw.type !== "quick" || draw.options?.quickType !== "dice") return;
    document.documentElement.classList.add("sortick-direct-dice");
    hideLegacyControls();
    render(draw);
    updateButtons(draw);
  }

  // Run after all legacy scripts and again after browser restoration from cache.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
  window.addEventListener("pageshow", () => setTimeout(boot, 0));
})();
