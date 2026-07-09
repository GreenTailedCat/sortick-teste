const MODES = {
  home: ["Início", "Escolha um modo abaixo para começar."],
  wheel: ["Roleta", "Gire uma roda com opções."],
  names: ["Sorteio por nomes", "Sorteie um item da lista."],
  random: ["Número aleatório", "Escolha um intervalo e sorteie."],
  coin: ["Cara ou coroa", "Decisão rápida com moeda."],
  dice: ["Dados", "Role D4, D6, D8, D10, D12 ou D20."],
  groups: ["Grupos", "Divida entradas em equipes."],
  bingo: ["Bingo", "Sorteie números em estilo bingo."],
  raffle: ["Cartela", "Visual simples de número da sorte."]
};

const COLORS = ["#e51f24", "#52a7d3", "#ffffff", "#f2ea36", "#5b458e", "#24a636", "#ee7b0d", "#d92027"];
let currentMode = "home";
let wheelRotation = 0;
let dice = [];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function entries() {
  const text = $("#entriesInput")?.value || "";
  return text.split(/\n+/).map(x => x.trim()).filter(Boolean);
}

function randomIndex(max) {
  if (!max) return 0;
  if (window.crypto?.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function setResult(text) {
  $("#resultBox").textContent = text;
}

function setStatus(text = "Pronto") {
  $("#statusCount").textContent = `${entries().length} item(ns)`;
  $("#statusMode").textContent = text;
}

function setActive(mode) {
  $$(".tab, .tree-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.openMode === mode);
  });
}

function openMode(mode) {
  currentMode = mode;
  const [title, desc] = MODES[mode] || MODES.home;
  $("#viewHeader").innerHTML = `<h1>${title}</h1><p>${desc}</p>`;
  setActive(mode);
  render();
}

function properties(html) {
  $("#propertiesBox").innerHTML = html;
}

function render() {
  setStatus();
  if (currentMode === "home") return renderHome();
  if (currentMode === "wheel" || currentMode === "names") return renderWheel();
  if (currentMode === "random") return renderRandom();
  if (currentMode === "coin") return renderCoin();
  if (currentMode === "dice") return renderDice();
  if (currentMode === "groups") return renderGroups();
  if (currentMode === "bingo" || currentMode === "raffle") return renderGrid();
}

function renderHome() {
  properties(`<p>Aplicativo em modo conceito.</p><p>Use os botões, abas ou atalhos da área de trabalho.</p>`);
  $("#appView").innerHTML = `
    <div class="home-grid">
      ${Object.entries(MODES).filter(([k]) => k !== "home").map(([key, [title, desc]]) => `
        <button class="mode-card" data-open-mode="${key}">
          <span>${iconFor(key)}</span>
          <strong>${title}</strong>
          <small>${desc}</small>
        </button>`).join("")}
    </div>`;
  bindModeButtons();
}

function iconFor(mode) {
  return {
    wheel: "🎡", names: "👥", random: "🔢", coin: "🪙",
    dice: "🎲", groups: "🧩", bingo: "🔵", raffle: "🎟️"
  }[mode] || "▣";
}

function renderWheel() {
  properties(`<label>Modo</label><select><option>${currentMode === "wheel" ? "Roleta" : "Sorteio por nomes"}</option></select><p>Use a lista no painel esquerdo.</p>`);
  $("#appView").innerHTML = `
    <div class="wheel-zone">
      <div class="wheel-wrap">
        <canvas id="wheelCanvas" width="520" height="520"></canvas>
        <span class="pointer"></span>
        <button id="spinButton" class="center-button" type="button">${currentMode === "wheel" ? "Girar" : "Sortear"}</button>
      </div>
    </div>`;
  drawWheel();
  $("#spinButton").addEventListener("click", spinWheel);
}

function drawWheel() {
  const canvas = $("#wheelCanvas");
  if (!canvas) return;
  const list = entries().length ? entries() : ["Escolha 1", "Escolha 2", "Escolha 3", "Escolha 4"];
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.43;
  const slice = Math.PI * 2 / list.length;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(wheelRotation);

  for (let i = 0; i < list.length; i++) {
    const start = i * slice;
    const end = start + slice;
    const color = COLORS[i % COLORS.length];

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, start, end);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "29px Tahoma, Arial";
    ctx.fillStyle = color === "#ffffff" || color === "#f2ea36" ? "#111" : "#fff";
    ctx.shadowColor = color === "#ffffff" || color === "#f2ea36" ? "transparent" : "rgba(0,0,0,.45)";
    ctx.shadowBlur = 3;
    ctx.fillText(list[i].slice(0, 17), r - 20, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#e8e8e8";
  ctx.fill();
  ctx.strokeStyle = "#777";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function spinWheel() {
  const list = entries();
  if (!list.length) {
    setResult("Adicione pelo menos uma entrada.");
    return;
  }
  const picked = list[randomIndex(list.length)];
  const start = wheelRotation;
  const end = start + Math.PI * 8 + Math.random() * Math.PI * 5;
  const t0 = performance.now();
  const duration = 1450;

  setStatus("Girando...");
  function frame(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    wheelRotation = start + (end - start) * eased;
    drawWheel();
    if (p < 1) requestAnimationFrame(frame);
    else {
      setStatus("Pronto");
      setResult(`Resultado: ${picked}`);
    }
  }
  requestAnimationFrame(frame);
}

function renderRandom() {
  properties(`<label>Mínimo</label><input id="minNumber" type="number" value="1"><label>Máximo</label><input id="maxNumber" type="number" value="100">`);
  $("#appView").innerHTML = `<div class="result-big"><span>Número aleatório</span><strong id="randomResult">?</strong><button id="randomButton" class="action-button">Sortear</button></div>`;
  $("#randomButton").addEventListener("click", () => {
    const min = Number($("#minNumber").value || 1);
    const max = Number($("#maxNumber").value || 100);
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    let tick = 0;
    setStatus("Sorteando...");
    const timer = setInterval(() => {
      $("#randomResult").textContent = low + randomIndex(high - low + 1);
      tick++;
      if (tick > 14) {
        clearInterval(timer);
        setStatus("Pronto");
        setResult(`Número sorteado: ${$("#randomResult").textContent}`);
      }
    }, 55);
  });
}

function renderCoin() {
  properties(`<p>Resultado possível:</p><p>😄 Cara<br>👑 Coroa</p>`);
  $("#appView").innerHTML = `<div class="result-big"><div id="coinFace" class="coin">?</div><button id="coinButton" class="action-button">Jogar moeda</button></div>`;
  $("#coinButton").addEventListener("click", () => {
    const faces = ["😄", "👑"];
    let tick = 0;
    setStatus("Jogando moeda...");
    const timer = setInterval(() => {
      $("#coinFace").textContent = faces[randomIndex(2)];
      tick++;
      if (tick > 12) {
        clearInterval(timer);
        const face = faces[randomIndex(2)];
        $("#coinFace").textContent = face;
        setStatus("Pronto");
        setResult(face === "😄" ? "Resultado: Cara" : "Resultado: Coroa");
      }
    }, 70);
  });
}

function renderDice() {
  properties(`<p>Adicione até 10 dados.</p><button id="clearDiceProp">Limpar dados</button>`);
  $("#appView").innerHTML = `
    <div class="result-big">
      <div class="dice-row">${dice.length ? dice.map(d => `<div class="die">D${d.sides}<br>${d.value ?? "?"}</div>`).join("") : "Nenhum dado adicionado."}</div>
      <div class="dice-row">${[4,6,8,10,12,20].map(n => `<button class="action-button" data-add-die="${n}">+ D${n}</button>`).join("")}</div>
      <button id="rollDice" class="action-button">Rolar</button>
    </div>`;
  $$("[data-add-die]").forEach(btn => btn.addEventListener("click", () => {
    if (dice.length >= 10) return setResult("Limite de 10 dados.");
    dice.push({ sides: Number(btn.dataset.addDie), value: null });
    renderDice();
  }));
  $("#rollDice").addEventListener("click", () => {
    if (!dice.length) return setResult("Adicione um dado.");
    let tick = 0;
    setStatus("Rolando dados...");
    const timer = setInterval(() => {
      dice = dice.map(d => ({ ...d, value: 1 + randomIndex(d.sides) }));
      renderDice();
      tick++;
      if (tick > 10) {
        clearInterval(timer);
        dice = dice.map(d => ({ ...d, value: 1 + randomIndex(d.sides) }));
        const total = dice.reduce((sum, d) => sum + d.value, 0);
        renderDice();
        setStatus("Pronto");
        setResult(`Total dos dados: ${total}`);
      }
    }, 75);
  });
  $("#clearDiceProp")?.addEventListener("click", () => {
    dice = [];
    renderDice();
    setResult("Dados limpos.");
  });
}

function renderGroups() {
  properties(`<label>Quantidade de grupos</label><input id="groupCount" type="number" min="2" value="2">`);
  $("#appView").innerHTML = `<div class="result-big"><span>Dividir entradas</span><strong>Grupos</strong><button id="groupButton" class="action-button">Gerar</button></div>`;
  $("#groupButton").addEventListener("click", () => {
    const count = Math.max(2, Number($("#groupCount").value || 2));
    const shuffled = [...entries()].sort(() => Math.random() - 0.5);
    const groups = Array.from({ length: count }, () => []);
    shuffled.forEach((item, i) => groups[i % count].push(item));
    $("#appView").innerHTML = `<div class="result-big" style="place-items:stretch;text-align:left">${groups.map((g,i)=>`<p><b>Grupo ${i+1}</b><br>${g.join(", ") || "—"}</p>`).join("")}<button class="action-button" id="backGroups">Voltar</button></div>`;
    $("#backGroups").addEventListener("click", renderGroups);
    setResult(`${count} grupos gerados.`);
  });
}

function renderGrid() {
  properties(`<p>Conceito visual simples para ${currentMode === "bingo" ? "bingo" : "cartela"}.</p>`);
  $("#appView").innerHTML = `
    <div class="result-big">
      <span>${currentMode === "bingo" ? "Bingo" : "Cartela"}</span>
      <div class="number-grid">
        ${Array.from({ length: 25 }, (_, i) => `<button class="number-cell" data-num="${i + 1}">${i + 1}</button>`).join("")}
      </div>
      <button id="pickNumber" class="action-button">${currentMode === "bingo" ? "Sortear número" : "Marcar número"}</button>
    </div>`;
  $("#pickNumber").addEventListener("click", () => {
    const cells = $$(".number-cell");
    const cell = cells[randomIndex(cells.length)];
    cell.classList.add("active");
    setResult(`Número: ${cell.dataset.num}`);
  });
}

function bindModeButtons() {
  $$("[data-open-mode]").forEach(btn => {
    btn.onclick = () => openMode(btn.dataset.openMode);
  });
}

$("#entriesInput").addEventListener("input", () => {
  setStatus();
  if (["wheel", "names"].includes(currentMode)) drawWheel();
});

$("#shuffleEntries").addEventListener("click", () => {
  const shuffled = entries().sort(() => Math.random() - 0.5);
  $("#entriesInput").value = shuffled.join("\n");
  render();
});

$("#clearEntries").addEventListener("click", () => {
  $("#entriesInput").value = "";
  render();
});

$("#newItemButton").addEventListener("click", () => {
  $("#entriesInput").value += `${$("#entriesInput").value.trim() ? "\n" : ""}Nova opção`;
  render();
});

$("#quickFilter").addEventListener("input", event => {
  const q = event.target.value.toLowerCase();
  $$(".tree-item").forEach(btn => {
    btn.style.display = btn.textContent.toLowerCase().includes(q) ? "" : "none";
  });
});

$("#globalSearch").addEventListener("input", event => {
  const q = event.target.value.toLowerCase();
  const match = Object.entries(MODES).find(([key, [title]]) => title.toLowerCase().includes(q));
  if (match && q.length >= 3) openMode(match[0]);
});

bindModeButtons();
openMode("home");
