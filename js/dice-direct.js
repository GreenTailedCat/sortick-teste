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
      4: `<svg viewBox="0 0 180 180" aria-label="D4"><polygon class="dd-face dd4a" points="90,20 156,158 24,158"/><text class="dd-value" x="90" y="132">${value}</text></svg>`,
      6: `<svg viewBox="0 0 180 180" aria-label="D6"><rect class="dd-face dd6" x="34" y="44" width="112" height="112" rx="14"/><text class="dd-value" x="90" y="100">${value}</text></svg>`,
      8: `<svg viewBox="0 0 180 180" aria-label="D8"><polygon class="dd-face dd8a" points="90,10 148,55 150,100 30,100 32,55"/><polygon class="dd-face dd8b" points="30,100 150,100 120,150 90,172 60,150"/><text class="dd-value" x="90" y="112">${value}</text></svg>`,
      10: `<svg viewBox="0 0 180 180" aria-label="D10"><polygon class="dd-face dd10a" points="90,18 145,58 150,102 30,102 35,58"/><polygon class="dd-face dd10b" points="30,102 150,102 122,155 90,172 58,155"/><text class="dd-value" x="90" y="112">${value}</text></svg>`,
      12: `<svg viewBox="0 0 180 180" aria-label="D12"><polygon class="dd-face dd12a" points="90,19 134.7,33.5 162.3,71.5 162.3,118.5 134.7,156.5 90,171 45.3,156.5 17.7,118.5 17.7,71.5 45.3,33.5"/><polygon class="dd-face dd12b" points="78,40 101.5,47.6 116,67.6 116,92.4 101.5,112.4 78,120 54.5,112.4 40,92.4 40,67.6 54.5,47.6"/><text class="dd-value" x="90" y="102">${value}</text></svg>`,
      20: `<svg viewBox="0 0 180 180" aria-label="D20"><polygon class="dd-face dd20a" points="90,95 90,15 159,55"/><polygon class="dd-face dd20a" points="90,95 21,55 90,15"/><polygon class="dd-face dd20b" points="90,95 159,55 159,135"/><polygon class="dd-face dd20c" points="90,95 159,135 90,175"/><polygon class="dd-face dd20d" points="90,95 90,175 21,135"/><polygon class="dd-face dd20e" points="90,95 21,135 21,55"/><text class="dd-value" x="90" y="102">${value}</text></svg>`
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
