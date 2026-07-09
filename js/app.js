const BASE_ENTRIES = ["Escolha 1","Escolha 2","Escolha 3","Escolha 4","Escolha 5","Escolha 6","Escolha 7"];
const COLORS = ["#e51f24","#52a7d3","#ffffff","#f2ea36","#5b458e","#24a636","#ee7b0d","#e51f24","#52a7d3","#ffcc33"];
const modeInfo = {
  wheel: ["ROLETE SUAS OPÇÕES", "Roleta"],
  names: ["SORTEIO SIMPLES", "Sorteio por nomes"],
  random: ["DECISÃO RÁPIDA", "Número aleatório"],
  coin: ["DECISÃO RÁPIDA", "Cara ou coroa"],
  dice: ["DECISÃO RÁPIDA", "Dados"],
  groups: ["ORGANIZAR LISTA", "Grupos"],
  bingo: ["SORTEIO DE NÚMEROS", "Bingo"],
  raffle: ["NÚMERO DA SORTE", "Cartela"]
};

let currentMode = "wheel";
let wheelRotation = 0;
let previewRotation = 0;
let dice = [];

const $ = selector => document.querySelector(selector);
const entriesInput = $("#entriesInput");
const entryCount = $("#entryCount");
const workspace = $("#workspace");
const modeTitle = $("#modeTitle");
const modeKicker = $("#modeKicker");
const interactiveArea = $("#interactiveArea");
const modeOptions = $("#modeOptions");
const resultToast = $("#resultToast");

function entries() {
  return entriesInput.value
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function updateCount() {
  entryCount.textContent = entries().length;
}

function randomIndex(max) {
  if (!max) return 0;
  if (crypto && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function showToast(text) {
  resultToast.textContent = text;
  resultToast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => resultToast.classList.add("hidden"), 2600);
}

function drawWheel(canvas, items, rotation = 0, largeText = false) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.44;
  const list = items.length ? items : BASE_ENTRIES;
  const slice = (Math.PI * 2) / list.length;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < list.length; i++) {
    const start = i * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.32)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLORS[i % COLORS.length] === "#ffffff" || COLORS[i % COLORS.length] === "#f2ea36" ? "#111" : "#fff";
    ctx.font = `${largeText ? 31 : 25}px Arial`;
    ctx.shadowColor = COLORS[i % COLORS.length] === "#ffffff" || COLORS[i % COLORS.length] === "#f2ea36" ? "transparent" : "rgba(0,0,0,.38)";
    ctx.shadowBlur = 3;
    ctx.fillText(list[i].slice(0, 18), r - 22, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#f4f5f8";
  ctx.fill();
  ctx.strokeStyle = "#c5c7cf";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function renderPreview() {
  drawWheel($("#previewWheel"), BASE_ENTRIES, previewRotation, true);
}

function openMode(mode) {
  currentMode = mode;
  const [kicker, title] = modeInfo[mode] || modeInfo.wheel;
  modeKicker.textContent = kicker;
  modeTitle.textContent = title;
  workspace.classList.remove("hidden");
  renderMode();
  workspace.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMode() {
  updateCount();
  const list = entries();
  modeOptions.innerHTML = "";

  if (currentMode === "wheel" || currentMode === "names") {
    interactiveArea.innerHTML = `
      <div class="main-wheel-box">
        <div class="main-wheel-wrap">
          <canvas id="mainWheel" width="560" height="560"></canvas>
          <span class="wheel-pointer"></span>
          <button id="spinMainWheel" class="wheel-center-button" type="button">${currentMode === "wheel" ? "Girar" : "Sortear"}</button>
        </div>
      </div>`;
    drawWheel($("#mainWheel"), list, wheelRotation, true);
    $("#spinMainWheel").addEventListener("click", spinMainWheel);
    return;
  }

  if (currentMode === "random") {
    modeOptions.innerHTML = `
      <div class="option-card"><label>Mínimo</label><input id="minNumber" type="number" value="1"></div>
      <div class="option-card"><label>Máximo</label><input id="maxNumber" type="number" value="100"></div>`;
    interactiveArea.innerHTML = `
      <div class="result-card">
        <span>Número aleatório</span>
        <strong id="randomNumber">?</strong>
        <button id="randomButton" class="main-action" type="button">Sortear número</button>
      </div>`;
    $("#randomButton").addEventListener("click", () => {
      const min = Number($("#minNumber").value || 1);
      const max = Number($("#maxNumber").value || 100);
      const low = Math.min(min, max);
      const high = Math.max(min, max);
      let ticks = 0;
      const timer = setInterval(() => {
        $("#randomNumber").textContent = low + randomIndex(high - low + 1);
        ticks++;
        if (ticks > 14) {
          clearInterval(timer);
          showToast(`Resultado: ${$("#randomNumber").textContent}`);
        }
      }, 55);
    });
    return;
  }

  if (currentMode === "coin") {
    interactiveArea.innerHTML = `
      <div class="result-card">
        <div id="coinFace" class="coin-concept">?</div>
        <button id="coinButton" class="main-action" type="button">Jogar moeda</button>
      </div>`;
    $("#coinButton").addEventListener("click", () => {
      let ticks = 0;
      const faces = ["😄", "👑"];
      const timer = setInterval(() => {
        $("#coinFace").textContent = faces[randomIndex(2)];
        ticks++;
        if (ticks > 12) {
          clearInterval(timer);
          const final = faces[randomIndex(2)];
          $("#coinFace").textContent = final;
          showToast(final === "😄" ? "Cara" : "Coroa");
        }
      }, 70);
    });
    return;
  }

  if (currentMode === "dice") {
    renderDice();
    return;
  }

  if (currentMode === "groups") {
    modeOptions.innerHTML = `<div class="option-card"><label>Quantidade de grupos</label><input id="groupCount" type="number" min="2" value="2"></div>`;
    interactiveArea.innerHTML = `
      <div class="result-card">
        <span>Dividir lista</span>
        <strong>Grupos</strong>
        <button id="groupButton" class="main-action" type="button">Gerar grupos</button>
      </div>`;
    $("#groupButton").addEventListener("click", () => {
      const count = Math.max(2, Number($("#groupCount").value || 2));
      const shuffled = [...entries()].sort(() => Math.random() - 0.5);
      const groups = Array.from({ length: count }, () => []);
      shuffled.forEach((item, index) => groups[index % count].push(item));
      interactiveArea.innerHTML = `<div class="result-card" style="place-items:stretch;text-align:left"><span>Resultado</span>${groups.map((g,i)=>`<p><strong style="font-size:1.2rem">Grupo ${i+1}</strong><br>${g.join(", ") || "—"}</p>`).join("")}<button class="main-action" onclick="renderMode()">Refazer</button></div>`;
    });
    return;
  }

  if (currentMode === "bingo" || currentMode === "raffle") {
    const title = currentMode === "bingo" ? "Bingo" : "Cartela";
    interactiveArea.innerHTML = `
      <div class="result-card">
        <span>${title}</span>
        <div class="card-grid-preview">
          ${Array.from({length: 20}, (_, i) => `<div class="number-cell ${i === 6 || i === 14 ? "is-picked" : ""}">${i + 1}</div>`).join("")}
        </div>
        <button id="numberGridButton" class="main-action" type="button">${currentMode === "bingo" ? "Sortear número" : "Marcar número"}</button>
      </div>`;
    $("#numberGridButton").addEventListener("click", () => {
      const cells = [...document.querySelectorAll(".number-cell")];
      cells[randomIndex(cells.length)].classList.toggle("is-picked");
    });
    return;
  }
}

function spinMainWheel() {
  const list = entries();
  if (!list.length) return showToast("Adicione pelo menos uma entrada.");
  const choice = list[randomIndex(list.length)];
  const extra = Math.PI * 8 + Math.random() * Math.PI * 4;
  const start = wheelRotation;
  const end = start + extra;
  const duration = 1500;
  const t0 = performance.now();

  function frame(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    wheelRotation = start + (end - start) * eased;
    drawWheel($("#mainWheel"), list, wheelRotation, true);
    if (p < 1) requestAnimationFrame(frame);
    else showToast(`Resultado: ${choice}`);
  }
  requestAnimationFrame(frame);
}

function renderDice() {
  interactiveArea.innerHTML = `
    <div class="dice-table-concept">
      <div class="dice-stage-concept">
        <div class="dice-list-concept">
          ${dice.length ? dice.map(d => `<div class="die-concept">D${d.sides}<br><span style="font-size:1rem">${d.value ?? "?"}</span></div>`).join("") : `<div style="color:white;font-weight:900;text-align:center">Escolha um dado abaixo</div>`}
        </div>
      </div>
      <div class="tool-row" style="justify-content:center;flex-wrap:wrap">
        ${[4,6,8,10,12,20].map(n => `<button type="button" data-add-die="${n}">+ D${n}</button>`).join("")}
        <button id="rollDice" class="main-action" type="button">Rolar</button>
        <button id="clearDice" type="button">Limpar</button>
      </div>
    </div>`;

  document.querySelectorAll("[data-add-die]").forEach(button => {
    button.addEventListener("click", () => {
      if (dice.length >= 10) return showToast("Limite de 10 dados.");
      dice.push({ sides: Number(button.dataset.addDie), value: null });
      renderDice();
    });
  });

  $("#rollDice").addEventListener("click", () => {
    if (!dice.length) return showToast("Adicione um dado.");
    let ticks = 0;
    const timer = setInterval(() => {
      dice = dice.map(d => ({ ...d, value: 1 + randomIndex(d.sides) }));
      renderDice();
      ticks++;
      if (ticks > 10) {
        clearInterval(timer);
        dice = dice.map(d => ({ ...d, value: 1 + randomIndex(d.sides) }));
        renderDice();
        const total = dice.reduce((sum, d) => sum + d.value, 0);
        showToast(`Total: ${total}`);
      }
    }, 75);
  });

  $("#clearDice").addEventListener("click", () => {
    dice = [];
    renderDice();
  });
}

$("#previewSpin").addEventListener("click", () => {
  const start = previewRotation;
  const end = start + Math.PI * 7 + Math.random() * Math.PI * 4;
  const duration = 1200;
  const t0 = performance.now();
  function frame(now) {
    const p = Math.min((now - t0) / duration, 1);
    previewRotation = start + (end - start) * (1 - Math.pow(1 - p, 3));
    renderPreview();
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});

document.querySelectorAll("[data-open-mode]").forEach(button => {
  button.addEventListener("click", () => openMode(button.dataset.openMode));
});

$("#closeWorkspace").addEventListener("click", () => workspace.classList.add("hidden"));
entriesInput.addEventListener("input", () => {
  updateCount();
  if (!workspace.classList.contains("hidden")) renderMode();
});

$("#shuffleEntries").addEventListener("click", () => {
  const shuffled = entries().sort(() => Math.random() - 0.5);
  entriesInput.value = shuffled.join("\n");
  renderMode();
});

$("#clearEntries").addEventListener("click", () => {
  entriesInput.value = "";
  renderMode();
});

$("#miniHelpButton").addEventListener("click", () => showToast("Conceito visual: menos texto, mais ferramenta."));

renderPreview();
updateCount();
