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
      4: `<svg viewBox="0 0 180 180" aria-label="D4"><polygon class="dd-face dd4a" points="90,18 162,158 90,172"/><polygon class="dd-face dd4b" points="90,18 90,172 18,158"/><polygon class="dd-face dd4c" points="18,158 90,172 162,158"/><text class="dd-kind" x="90" y="55">D4</text><text class="dd-value" x="90" y="128">${value}</text></svg>`,
      6: `<svg viewBox="0 0 180 180" aria-label="D6"><polygon class="dd-face dd6top" points="90,20 155,55 90,90 25,55"/><polygon class="dd-face dd6left" points="25,55 90,90 90,165 25,130"/><polygon class="dd-face dd6right" points="90,90 155,55 155,130 90,165"/><text class="dd-kind" x="90" y="50">D6</text><text class="dd-value" x="90" y="128">${value}</text></svg>`,
      8: `<svg viewBox="0 0 180 180" aria-label="D8"><polygon class="dd-face dd8a" points="90,15 160,90 90,90"/><polygon class="dd-face dd8b" points="90,15 90,90 20,90"/><polygon class="dd-face dd8c" points="20,90 90,90 90,165"/><polygon class="dd-face dd8d" points="90,90 160,90 90,165"/><text class="dd-kind" x="90" y="55">D8</text><text class="dd-value" x="90" y="122">${value}</text></svg>`,
      10: `<svg viewBox="0 0 180 180" aria-label="D10"><polygon class="dd-face dd10a" points="90,10 150,55 125,150 90,172"/><polygon class="dd-face dd10b" points="90,10 90,172 55,150 30,55"/><polygon class="dd-face dd10c" points="55,150 90,172 125,150"/><text class="dd-kind" x="90" y="50">D10</text><text class="dd-value" x="90" y="120">${value}</text></svg>`,
      12: `<svg viewBox="0 0 180 180" aria-label="D12"><polygon class="dd-face dd12a" points="90,53 130,82 115,129 65,129 50,82"/><polygon class="dd-face dd12b" points="50,82 90,53 90,17 16,71"/><polygon class="dd-face dd12c" points="90,53 130,82 164,71 90,17"/><polygon class="dd-face dd12d" points="65,129 50,82 16,71 44,158"/><polygon class="dd-face dd12e" points="130,82 115,129 136,158 164,71"/><text class="dd-kind" x="90" y="45">D12</text><text class="dd-value" x="90" y="102">${value}</text></svg>`,
      20: `<svg viewBox="0 0 180 180" aria-label="D20"><polygon class="dd-face dd20a" points="90,95 90,15 159,55"/><polygon class="dd-face dd20a" points="90,95 21,55 90,15"/><polygon class="dd-face dd20b" points="90,95 159,55 159,135"/><polygon class="dd-face dd20c" points="90,95 159,135 90,175"/><polygon class="dd-face dd20d" points="90,95 90,175 21,135"/><polygon class="dd-face dd20e" points="90,95 21,135 21,55"/><text class="dd-kind" x="90" y="38">D20</text><text class="dd-value" x="90" y="102">${value}</text></svg>`
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
