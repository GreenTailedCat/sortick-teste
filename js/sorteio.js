const params = new URLSearchParams(window.location.search);
const drawId = params.get("id");

let draw = drawId ? Sortick.getDraw(drawId) : null;
let isDrawing = false;
let currentWheelRotation = 0;
let isCartelaExpanded = false;

const WHEEL_COLORS = ["#6c4dff", "#00c2a8", "#ff4b6e", "#ffca3a", "#2f80ed", "#9b51e0", "#f2994a", "#27ae60", "#eb5757", "#56ccf2"];

const drawTitle = document.querySelector("#drawTitle");
const drawKind = document.querySelector("#drawKind");
const drawStatus = document.querySelector("#drawStatus");
const animationArea = document.querySelector("#animationArea");
const winnerCard = document.querySelector("#winnerCard");
const winnerName = document.querySelector("#winnerName");
const winnerMeta = document.querySelector("#winnerMeta");
const proofText = document.querySelector("#proofText");
const drawButton = document.querySelector("#drawButton");
const copyButton = document.querySelector("#copyButton");
const shareButton = document.querySelector("#shareButton");
const downloadButton = document.querySelector("#downloadButton");
const whatsappButton = document.querySelector("#whatsappButton");
const focusButton = document.querySelector("#focusButton");
const resetButton = document.querySelector("#resetButton");
const participantForm = document.querySelector("#participantForm");
const participantName = document.querySelector("#participantName");
const participantNumber = document.querySelector("#participantNumber");
const participantStatus = document.querySelector("#participantStatus");
const participantList = document.querySelector("#participantList");
const participantHelp = document.querySelector("#participantHelp");
const validationMessage = document.querySelector("#validationMessage");
const sampleButton = document.querySelector("#sampleButton");
const clearParticipantsButton = document.querySelector("#clearParticipantsButton");
const numberLegend = document.querySelector("#numberLegend");
const confirmedOnlyToggle = document.querySelector("#confirmedOnlyToggle");
const removeWinnerToggle = document.querySelector("#removeWinnerToggle");
const soundToggle = document.querySelector("#soundToggle");
const bingoRepeatToggle = document.querySelector("#bingoRepeatToggle");
const bingoRepeatOption = document.querySelector("#bingoRepeatOption");
const participantFilter = document.querySelector("#participantFilter");
const statusSummary = document.querySelector("#statusSummary");
const bulkButton = document.querySelector("#bulkButton");
const shuffleButton = document.querySelector("#shuffleButton");
const bulkAddPanel = document.querySelector("#bulkAddPanel");
const bulkText = document.querySelector("#bulkText");
const confirmBulkButton = document.querySelector("#confirmBulkButton");
const cancelBulkButton = document.querySelector("#cancelBulkButton");
const bulkPreview = document.querySelector("#bulkPreview");


if (!draw) {
  document.body.innerHTML = `
    <main class="section"><div class="create-panel"><div>
      <p class="eyebrow">Sorteio não encontrado</p>
      <h2>Este sorteio não existe neste navegador.</h2>
      <p class="subtle">Crie um novo sorteio para continuar.</p>
      <a class="btn btn-primary" href="/sortick-teste/">Criar sorteio</a>
    </div></div></main>`;
} else {
  draw.options = draw.options || {};
  draw.options.confirmedOnly = Boolean(draw.options.confirmedOnly);
  draw.options.removeWinnerAfterDraw = Boolean(draw.options.removeWinnerAfterDraw);
  draw.options.soundEnabled = Boolean(draw.options.soundEnabled);
  draw.options.groupCount = Sortick.clampNumber(draw.options.groupCount || 2, 2, 50);
  draw.options.bingoAllowRepeats = Boolean(draw.options.bingoAllowRepeats);
  draw.options.bingoDrawnNumbers = Array.isArray(draw.options.bingoDrawnNumbers) ? draw.options.bingoDrawnNumbers : [];
  draw.options.cartelaInfo = {
    prize: "",
    value: "",
    drawDate: "",
    note: "",
    imageData: "",
    imageName: "",
    exportShowNames: false,
    ...(draw.options.cartelaInfo || {})
  };
  draw.participants = draw.participants.map(p => ({ ...p, status: p.status || "pending" }));
  setupDraw();
}

function setupDraw() {
  drawTitle.textContent = draw.title;
  drawKind.textContent = Sortick.typeLabel(draw.type);
  drawStatus.textContent = draw.mode === "simple" ? "Modo simples" : "Modo ao vivo";
  confirmedOnlyToggle.checked = Boolean(draw.options.confirmedOnly);
  removeWinnerToggle.checked = Boolean(draw.options.removeWinnerAfterDraw);
  if (soundToggle) soundToggle.checked = Boolean(draw.options.soundEnabled);

  // O botão principal já permite sortear novamente com a mesma lista.
  // O reinício separado só é necessário no Bingo, pois ele limpa o histórico.
  resetButton.classList.add("hidden");
  const resetHint = document.querySelector("#resetHint");
  if (resetHint) resetHint.classList.add("hidden");

  if (draw.type === "numbers") {
    participantNumber.classList.remove("hidden");
    numberLegend.classList.remove("hidden");
    bulkButton.classList.add("hidden");

    participantNumber.placeholder = `Número de 1 a ${getTotalNumbers()}`;
    participantNumber.max = getTotalNumbers();
    participantHelp.textContent = "Toque em um número verde para selecionar. Toque em um número ocupado para alternar Confirmado/Pendente.";
  } else if (draw.type === "roulette") {
    participantHelp.textContent = "Adicione nomes ou opções para a roleta. Use Confirmado/Pendente para controlar quem entra.";
  } else if (draw.type === "bingo") {
    participantForm.classList.add("hidden");
    bulkButton.classList.add("hidden");
    shuffleButton.classList.add("hidden");
    sampleButton.classList.add("hidden");
    clearParticipantsButton.textContent = "Limpar histórico";
    drawButton.textContent = "Sortear número";
    resetButton.textContent = "Reiniciar bingo";
    resetButton.classList.remove("hidden");
    if (resetHint) resetHint.classList.remove("hidden");
    confirmedOnlyToggle.closest("label").classList.add("hidden");
    removeWinnerToggle.closest("label").classList.add("hidden");
    participantFilter.closest("label").classList.add("hidden");

    if (bingoRepeatOption) bingoRepeatOption.classList.remove("hidden");
    if (bingoRepeatToggle) bingoRepeatToggle.checked = Boolean(draw.options.bingoAllowRepeats);

    participantHelp.textContent = "Sorteie números para cartelas físicas. Escolha se os números podem repetir durante o jogo.";
  } else if (draw.type === "groups") {
    participantHelp.textContent = `Adicione nomes e gere ${draw.options.groupCount} grupo(s).`;
    drawButton.textContent = "Gerar grupos";
    confirmedOnlyToggle.closest("label").classList.add("hidden");
    removeWinnerToggle.closest("label").classList.add("hidden");
    participantFilter.closest("label").classList.add("hidden");
    participantStatus.closest("label").classList.add("hidden");
  } else {
    participantHelp.textContent = "Adicione nomes para o sorteio. Use Confirmado/Pendente para controlar quem entra.";
  }

  render();
}

function getTotalNumbers() { return Sortick.clampNumber(draw.options.totalNumbers || 50, 2, 500); }
function getCartelaInfo() {
  draw.options.cartelaInfo = {
    prize: "",
    value: "",
    drawDate: "",
    note: "",
    imageData: "",
    imageName: "",
    exportShowNames: false,
    ...(draw.options.cartelaInfo || {})
  };

  delete draw.options.cartelaInfo.markerStyle;

  return draw.options.cartelaInfo;
}

function formatCartelaDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function getCartelaStats() {
  const total = getTotalNumbers();
  const counts = getStatusCounts();
  const available = Math.max(0, total - counts.total);
  const progress = total ? Math.round((counts.total / total) * 100) : 0;

  return {
    total,
    available,
    occupied: counts.total,
    confirmed: counts.confirmed,
    pending: counts.pending,
    progress
  };
}

function getCartelaDetailParts() {
  const info = getCartelaInfo();
  const details = [];

  if (info.prize) details.push(`Prêmio: ${info.prize}`);
  if (info.value) details.push(`${info.value} por número`);
  if (info.drawDate) details.push(`Sorteio: ${formatCartelaDate(info.drawDate)}`);

  return details;
}

function persist() { draw.updatedAt = new Date().toISOString(); Sortick.saveDraw(draw); }
function setValidation(message = "") { validationMessage.textContent = message; }

function setRuleOptionsLocked(locked) {
  document.body.classList.toggle("drawing-locked", locked);
  confirmedOnlyToggle.disabled = locked;
  removeWinnerToggle.disabled = locked;
}
function getMinimumParticipants() { return draw.type === "numbers" ? 1 : 2; }
function getEligibleParticipants() { return draw.options.confirmedOnly ? draw.participants.filter(p => p.status === "confirmed") : draw.participants; }
function getStatusCounts() {
  const confirmed = draw.participants.filter(p => p.status === "confirmed").length;
  return { total: draw.participants.length, confirmed, pending: draw.participants.length - confirmed };
}

function render() {
  renderStatusSummary();
  renderParticipants();
  renderAnimationIdle();
  renderResult();
  let canDraw = getEligibleParticipants().length >= getMinimumParticipants();

  if (draw.type === "bingo") {
    canDraw = draw.options.bingoAllowRepeats || getRemainingBingoNumbers().length > 0;
  }

  drawButton.disabled = !canDraw || isDrawing;
  copyButton.disabled = !draw.result;
  shareButton.disabled = !draw.result;
  if (whatsappButton) whatsappButton.disabled = !draw.result;
  downloadButton.disabled = !draw.result;
  setRuleOptionsLocked(isDrawing);
}

function renderStatusSummary() {
  if (draw.type === "bingo") {
    const drawn = draw.options.bingoDrawnNumbers.length;
    const uniqueDrawn = new Set(draw.options.bingoDrawnNumbers.map(String)).size;
    const total = getTotalNumbers();

    statusSummary.innerHTML = `
      <span>Total: ${total}</span>
      <span>Sorteados: ${drawn}</span>
      <span>${draw.options.bingoAllowRepeats ? "Repetição: sim" : `Restantes: ${total - uniqueDrawn}`}</span>
    `;
    return;
  }

  if (draw.type === "groups") {
    statusSummary.innerHTML = `
      <span>Participantes: ${draw.participants.length}</span>
      <span>Grupos: ${draw.options.groupCount}</span>
      <span>Distribuição aleatória</span>
    `;
    return;
  }

  const c = getStatusCounts();
  statusSummary.innerHTML = `
    <span>Total: ${c.total}</span>
    <span>Confirmados: ${c.confirmed}</span>
    <span>Pendentes: ${c.pending}</span>
    ${draw.type === "numbers" ? `<span>Disponíveis: ${getTotalNumbers() - c.total}</span>` : ""}
  `;
}

function renderParticipants() {
  participantList.innerHTML = "";

  if (draw.type === "bingo") {
    const drawn = draw.options.bingoDrawnNumbers;

    if (drawn.length === 0) {
      participantList.innerHTML = `<li><span>Nenhum número sorteado ainda</span></li>`;
      return;
    }

    drawn.slice().reverse().forEach((number, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="participant-main-line">
          <span class="participant-name-line">
            <i class="status-dot confirmed-dot"></i>
            <strong>Nº ${Sortick.escapeHTML(number)}</strong>
            ${index === 0 ? "<small>último número</small>" : ""}
          </span>
        </div>`;

      participantList.appendChild(li);
    });

    return;
  }

  if (draw.type === "groups") {
    const items = draw.participants.slice();

    if (items.length === 0) {
      participantList.innerHTML = `<li><span>Nenhum participante para mostrar</span></li>`;
      return;
    }

    items.forEach(participant => {
      const originalIndex = draw.participants.findIndex(p => p.id === participant.id);
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="participant-main-line">
          <span class="participant-name-line"><strong>${Sortick.escapeHTML(participant.name)}</strong></span>
          <button class="remove-button" type="button" aria-label="Remover participante">×</button>
        </div>`;

      li.querySelector(".remove-button").addEventListener("click", () => {
        if (isDrawing) return;
        draw.participants.splice(originalIndex, 1);
        draw.result = null;
        persist();
        render();
      });

      participantList.appendChild(li);
    });

    return;
  }

  let items = draw.participants.slice();
  const filter = participantFilter.value;
  if (filter !== "all") items = items.filter(p => p.status === filter);
  if (draw.type === "numbers") items.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));

  if (items.length === 0) {
    participantList.innerHTML = `<li><span>Nenhum participante para mostrar</span></li>`;
    return;
  }

  items.forEach(participant => {
    const originalIndex = draw.participants.findIndex(p => p.id === participant.id);
    const li = document.createElement("li");
    const statusClass = participant.status === "confirmed" ? "confirmed" : "pending";
    const dotClass = participant.status === "confirmed" ? "confirmed-dot" : "pending-dot";
    const title = draw.type === "numbers" ? `Nº ${Sortick.escapeHTML(participant.number)}` : Sortick.escapeHTML(participant.name);
    const sub = draw.type === "numbers" ? `<small>${Sortick.escapeHTML(participant.name)}</small>` : "";

    li.innerHTML = `
      <div class="participant-main-line">
        <span class="participant-name-line"><i class="status-dot ${dotClass}"></i><strong>${title}</strong>${sub}</span>
        <button class="remove-button" type="button" aria-label="Remover participante">×</button>
      </div>
      <div class="participant-actions">
        <button class="status-label ${statusClass}" type="button"><i class="dot ${dotClass}"></i>${Sortick.statusLabel(participant.status)}</button>
        <small>Toque para alternar</small>
      </div>`;

    li.querySelector(".remove-button").addEventListener("click", () => {
      if (isDrawing) return;
      draw.participants.splice(originalIndex, 1);
      draw.result = null;
      persist();
      render();
    });

    li.querySelector(".status-label").addEventListener("click", () => {
      if (isDrawing) return;
      toggleParticipantStatus(participant.id);
    });

    participantList.appendChild(li);
  });
}

function toggleParticipantStatus(participantId) {
  const participant = draw.participants.find(p => p.id === participantId);
  if (!participant) return;
  participant.status = participant.status === "confirmed" ? "pending" : "confirmed";
  draw.result = null;
  persist();
  setValidation(`${participant.name} agora está como ${Sortick.statusLabel(participant.status)}.`);
  render();
}

function renderAnimationIdle() {
  if (draw.type === "numbers") return renderNumberBoard();
  if (draw.type === "bingo") return renderBingoBoard();
  if (draw.type === "groups") return renderGroupsIdle();
  if (draw.type === "roulette") return renderRouletteCanvas(draw.result?.wheelRotation || 0, draw.result?.participantIndex ?? null);

  if (draw.result) {
    animationArea.innerHTML = `<div class="rolling-name">${Sortick.escapeHTML(getParticipantDisplay(draw.result.participant))}</div>`;
    return;
  }

  const eligible = getEligibleParticipants();
  animationArea.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">✨</span>
      <strong>${eligible.length >= getMinimumParticipants() ? "Pronto para sortear" : `Faltam participantes elegíveis`}</strong>
      <p>${eligible.length} participante(s) pronto(s) para o sorteio.</p>
    </div>`;
}

function getRemainingBingoNumbers() {
  const drawn = new Set(draw.options.bingoDrawnNumbers.map(String));
  const remaining = [];

  for (let number = 1; number <= getTotalNumbers(); number += 1) {
    if (!drawn.has(String(number))) remaining.push(number);
  }

  return remaining;
}

function getNextBingoNumber() {
  const total = getTotalNumbers();

  if (draw.options.bingoAllowRepeats) {
    return String(Sortick.secureRandomIndex(total) + 1);
  }

  const remaining = getRemainingBingoNumbers();

  if (!remaining.length) {
    return null;
  }

  return String(remaining[Sortick.secureRandomIndex(remaining.length)]);
}

function renderBingoBoard(highlightNumber = null) {
  const total = getTotalNumbers();
  const drawnSet = new Set(draw.options.bingoDrawnNumbers.map(String));
  const latest = highlightNumber || draw.options.bingoDrawnNumbers[draw.options.bingoDrawnNumbers.length - 1] || null;
  const uniqueDrawn = drawnSet.size;

  let cells = "";

  for (let number = 1; number <= total; number += 1) {
    const isDrawn = drawnSet.has(String(number));
    const isLatest = String(latest) === String(number);

    cells += `
      <button class="number-cell ${isDrawn ? "taken" : "available"} ${isLatest ? "winner" : ""}" type="button" disabled>
        <span>${number}</span>
      </button>`;
  }

  animationArea.innerHTML = `
    <div class="number-board-wrap bingo-wrap">
      <div class="number-board-header">
        <span>Bingo de 1 a ${total}</span>
        <small>${draw.options.bingoDrawnNumbers.length} sorteados · ${draw.options.bingoAllowRepeats ? "repetição permitida" : `${total - uniqueDrawn} restantes`}</small>
      </div>

      <div class="bingo-latest">
        ${latest ? `<small>Último número</small><strong>${Sortick.escapeHTML(latest)}</strong>` : `<small>Nenhum número sorteado</small><strong>--</strong>`}
      </div>

      <div class="number-board cartela-board ${total <= 100 ? "cartela-board-compact" : "cartela-board-scroll"}">${cells}</div>
    </div>`;
}

function runBingoAnimation(finalNumber) {
  const duration = 1900;
  const start = performance.now();
  let lastTick = 0;

  return new Promise(resolve => {
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const delay = 70 + progress * 130;

      if (now - lastTick > delay) {
        lastTick = now;
        playTickSound();

        const randomNumber = String(Sortick.secureRandomIndex(getTotalNumbers()) + 1);
        renderBingoBoard(randomNumber);
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        renderBingoBoard(finalNumber);
        playSuccessSound();
        setTimeout(resolve, 350);
      }
    }

    requestAnimationFrame(frame);
  });
}

function renderGroupsIdle() {
  if (draw.result?.groups) {
    animationArea.innerHTML = renderGroupsHTML(draw.result.groups);
    return;
  }

  animationArea.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">🏆</span>
      <strong>${draw.participants.length >= 2 ? "Pronto para gerar grupos" : "Adicione pelo menos 2 participantes"}</strong>
      <p>${draw.participants.length} participante(s) · ${draw.options.groupCount} grupo(s)</p>
    </div>`;
}

function renderGroupsHTML(groups) {
  return `
    <div class="groups-board">
      ${groups.map((group, index) => `
        <div class="group-card">
          <h3>Grupo ${index + 1}</h3>
          <ol>
            ${group.map(name => `<li>${Sortick.escapeHTML(name)}</li>`).join("")}
          </ol>
        </div>
      `).join("")}
    </div>`;
}

function generateGroups() {
  const shuffled = Sortick.shuffleArray(draw.participants.map(p => p.name));
  const groupCount = Math.min(draw.options.groupCount, shuffled.length);
  const groups = Array.from({ length: groupCount }, () => []);

  shuffled.forEach((name, index) => {
    groups[index % groupCount].push(name);
  });

  return groups;
}

function renderRouletteCanvas(rotation = currentWheelRotation, activeIndex = null) {
  const participants = (draw.result && draw.result.rouletteParticipants && activeIndex !== null)
    ? draw.result.rouletteParticipants
    : getEligibleParticipants();
  const count = participants.length;
  if (count === 0) {
    animationArea.innerHTML = `<div class="empty-state"><span class="empty-icon">🎡</span><strong>Roleta vazia</strong><p>Adicione participantes ou desative “sortear apenas confirmados”.</p></div>`;
    return;
  }

  currentWheelRotation = rotation;
  const activeText = activeIndex !== null && participants[activeIndex] ? getParticipantDisplay(participants[activeIndex]) : "Sortick";
  animationArea.innerHTML = `
    <div class="roulette-wrap">
      <div class="canvas-wheel-scene">
        <div class="canvas-pointer"></div>
        <canvas id="rouletteCanvas" class="roulette-canvas" width="900" height="900"></canvas>
        <div class="canvas-center">${Sortick.escapeHTML(activeText)}</div>
      </div>
      <div class="roulette-winner-strip">${activeIndex !== null ? `Resultado: ${Sortick.escapeHTML(activeText)}` : `${count} participante(s) na roleta`}</div>
    </div>`;

  drawWheel(document.querySelector("#rouletteCanvas"), participants, rotation, activeIndex);
}

function drawWheel(canvas, participants, rotationDegrees = 0, activeIndex = null) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = size * 0.46;
  const count = participants.length;
  const slice = (Math.PI * 2) / count;
  const rotation = degreesToRadians(rotationDegrees);

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  ctx.beginPath();
  ctx.arc(0, 0, radius + 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();

  for (let index = 0; index < count; index += 1) {
    const start = -Math.PI / 2 + rotation + index * slice;
    const end = start + slice;
    const middle = start + slice / 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, start, end); ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length]; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.62)"; ctx.lineWidth = 4; ctx.stroke();

    const label = getRouletteLabel(participants[index], index, count);
    ctx.save();
    ctx.rotate(middle);
    ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${getLabelFontSize(count)}px Inter, system-ui, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5;
    ctx.fillText(label, radius * 0.72, 0, radius * 0.38);
    ctx.restore();
  }

  ctx.beginPath(); ctx.arc(0, 0, radius * 0.37, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2); ctx.strokeStyle = "rgba(16,15,46,0.10)"; ctx.lineWidth = 8; ctx.stroke();

  if (activeIndex !== null) {
    const start = -Math.PI / 2 + rotation + activeIndex * slice;
    const end = start + slice;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, start, end); ctx.closePath();
    ctx.strokeStyle = "#ffca3a"; ctx.lineWidth = 12; ctx.stroke();
  }
  ctx.restore();
}

function getRouletteLabel(participant, index, count) {
  if (count > 24) return String(index + 1);
  const text = getParticipantDisplay(participant);
  return text.length > 14 ? text.slice(0, 13) + "…" : text;
}
function getLabelFontSize(count) { return count <= 6 ? 34 : count <= 10 ? 28 : count <= 16 ? 22 : count <= 24 ? 17 : 14; }
function degreesToRadians(degrees) { return degrees * Math.PI / 180; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function getCartelaImageMarkup(className = "cartela-prize-thumb") {
  const info = getCartelaInfo();

  if (!info.imageData) return "";

  return `<img class="${className}" src="${info.imageData}" alt="${Sortick.escapeHTML(info.prize || "Imagem do prêmio")}" />`;
}

function buildCartelaCellMarkup(number, participant, isWinner, { interactive = true, showNames = true } = {}) {
  const dot = participant
    ? `<i class="status-dot ${participant.status === "confirmed" ? "confirmed-dot" : "pending-dot"}"></i>`
    : "";
  const name = participant && showNames
    ? `<small>${Sortick.escapeHTML(participant.name)}</small>`
    : "";
  const tag = interactive ? "button" : "div";
  const interactionAttributes = interactive
    ? `type="button" data-number="${number}"`
    : `role="listitem"`;
  const label = participant ? participant.name : "Disponível";

  return `
    <${tag} class="number-cell ${participant ? "taken" : "available"} ${isWinner ? "winner" : ""}" ${interactionAttributes} title="${Sortick.escapeHTML(label)}">
      ${dot}
      <span>${number}</span>${name}
    </${tag}>`;
}

function buildCartelaGrid({ interactive = true, showNames = true, extraClass = "" } = {}) {
  const total = getTotalNumbers();
  const takenByNumber = new Map(draw.participants.map(participant => [String(participant.number), participant]));
  const winnerNumber = draw.result && draw.result.participant ? String(draw.result.participant.number) : null;
  const cellClass = total <= 100 ? "cartela-board-compact" : "cartela-board-scroll";
  let cells = "";

  for (let number = 1; number <= total; number += 1) {
    const participant = takenByNumber.get(String(number));
    const isWinner = String(number) === String(winnerNumber);
    cells += buildCartelaCellMarkup(number, participant, isWinner, { interactive, showNames });
  }

  return `<div class="number-board ${cellClass} ${extraClass}">${cells}</div>`;
}

function renderNumberBoard(highlightNumber = null) {
  const info = getCartelaInfo();
  const stats = getCartelaStats();
  const details = getCartelaDetailParts();
  const takenByNumber = new Map(draw.participants.map(participant => [String(participant.number), participant]));
  const highlight = highlightNumber ? String(highlightNumber) : null;
  const winnerNumber = highlight || (draw.result ? String(draw.result.participant.number) : null);
  let cells = "";

  for (let number = 1; number <= stats.total; number += 1) {
    const participant = takenByNumber.get(String(number));
    const isWinner = String(number) === String(winnerNumber);
    cells += buildCartelaCellMarkup(number, participant, isWinner, { interactive: true, showNames: true });
  }

  animationArea.innerHTML = `
    <div class="number-board-wrap">
      <div class="number-board-header cartela-header">
        <div class="cartela-title-with-image">
          ${getCartelaImageMarkup()}
          <div class="cartela-title-block">
            <span>${Sortick.escapeHTML(draw.title)}</span>
            ${details.length ? `<small>${Sortick.escapeHTML(details.join(" · "))}</small>` : ""}
            ${info.note ? `<small class="cartela-note">${Sortick.escapeHTML(info.note)}</small>` : ""}
          </div>
        </div>

        <div class="cartela-header-actions">
          <small>${stats.available} disponíveis · ${stats.occupied} ocupados · ${stats.confirmed} confirmados</small>
          <button id="editCartelaButton" class="cartela-expand-button" type="button">Editar detalhes</button>
        </div>
      </div>

      <div class="cartela-progress-block" aria-label="${stats.progress}% da cartela ocupada">
        <div class="cartela-progress-track"><span style="width: ${stats.progress}%"></span></div>
        <small>${stats.progress}% preenchida</small>
      </div>

      <div class="number-board ${stats.total <= 100 ? "cartela-board-compact" : "cartela-board-scroll"}">${cells}</div>

      <div class="cartela-board-actions">
        <label class="inline-option cartela-export-option">
          <input id="cartelaShowNamesToggle" type="checkbox" ${info.exportShowNames ? "checked" : ""} />
          Mostrar nomes na imagem
        </label>
        <div class="cartela-board-action-buttons">
          <button id="previewCartelaStageButton" class="btn btn-ghost light" type="button">Visualizar cartela</button>
          <button id="exportCartelaButton" class="btn btn-primary" type="button">Exportar imagem</button>
        </div>
      </div>
    </div>`;

  const previewStageButton = animationArea.querySelector("#previewCartelaStageButton");
  const exportButton = animationArea.querySelector("#exportCartelaButton");
  const editButton = animationArea.querySelector("#editCartelaButton");
  const showNamesToggle = animationArea.querySelector("#cartelaShowNamesToggle");

  if (previewStageButton) previewStageButton.addEventListener("click", openCartelaPreview);
  if (editButton) editButton.addEventListener("click", openCartelaEditor);

  if (showNamesToggle) {
    showNamesToggle.addEventListener("change", () => {
      getCartelaInfo().exportShowNames = Boolean(showNamesToggle.checked);
      persist();
    });
  }

  if (exportButton) {
    exportButton.addEventListener("click", async () => {
      try {
        await downloadCartelaImage();
        setValidation("Imagem da cartela gerada.");
      } catch {
        setValidation("Não foi possível gerar a imagem da cartela agora.");
      }
    });
  }

  animationArea.querySelectorAll(".number-cell[data-number]").forEach(button => {
    button.addEventListener("click", () => {
      if (isDrawing) return;

      const number = button.dataset.number;
      const participant = takenByNumber.get(String(number));

      if (participant) {
        toggleParticipantStatus(participant.id);
        return;
      }

      participantNumber.value = number;
      playSelectSound();
      participantName.focus();
      setValidation(`Número ${number} selecionado. Informe o nome do participante.`);
    });
  });
}

function openCartelaEditor() {
  if (draw.type !== "numbers") return;

  const previousFocus = document.activeElement;
  const info = getCartelaInfo();
  let pendingImageData = info.imageData || "";
  let pendingImageName = info.imageName || "";

  const overlay = document.createElement("div");
  const panel = document.createElement("section");
  const headingId = `cartela-editor-${Sortick.createId("title")}`;

  overlay.className = "cartela-editor-backdrop";
  overlay.setAttribute("role", "presentation");

  panel.className = "cartela-editor-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", headingId);

  panel.innerHTML = `
    <header class="cartela-editor-header">
      <div>
        <p class="eyebrow">Editar cartela</p>
        <h2 id="${headingId}">Detalhes da cartela</h2>
        <p>Você pode alterar as informações que aparecem na cartela e na imagem exportada.</p>
      </div>
      <button class="cartela-preview-close" type="button" aria-label="Fechar edição">×</button>
    </header>

    <form class="cartela-editor-form">
      <label>
        Nome da cartela
        <input name="title" type="text" maxlength="80" value="${Sortick.escapeHTML(draw.title)}" />
      </label>

      <div class="cartela-editor-locked">
        <strong>Cartela de 1 a ${getTotalNumbers()}</strong>
        <span>A quantidade de números é definida na criação e não pode ser alterada depois.</span>
      </div>

      <label>
        Prêmio
        <input name="prize" type="text" maxlength="100" value="${Sortick.escapeHTML(info.prize || "")}" placeholder="Ex: Cesta de chocolates" />
      </label>

      <label class="cartela-image-upload">
        <span>Imagem do prêmio <small>Opcional</small></span>
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
        <span class="field-hint">PNG, JPG ou WEBP.</span>
      </label>

      <div class="cartela-editor-image-preview ${pendingImageData ? "" : "hidden"}">
        <img alt="Prévia da imagem do prêmio" ${pendingImageData ? `src="${pendingImageData}"` : ""} />
        <div>
          <strong>${Sortick.escapeHTML(pendingImageName || "Imagem selecionada")}</strong>
          <button class="link-button danger-text cartela-editor-remove-image" type="button">Remover imagem</button>
        </div>
      </div>
      <p class="cartela-editor-image-status" aria-live="polite"></p>

      <div class="cartela-editor-row">
        <label>
          Valor por número
          <input name="value" type="text" maxlength="30" value="${Sortick.escapeHTML(info.value || "")}" placeholder="Ex: R$ 5,00" />
        </label>

        <label>
          Data do sorteio
          <input name="drawDate" type="date" value="${Sortick.escapeHTML(info.drawDate || "")}" />
        </label>
      </div>

      <label>
        Condição ou observação
        <textarea name="note" rows="3" maxlength="180" placeholder="Ex: Sorteio quando todos os números forem ocupados.">${Sortick.escapeHTML(info.note || "")}</textarea>
      </label>

      <div class="cartela-editor-actions">
        <button class="btn btn-ghost light cartela-editor-cancel" type="button">Cancelar</button>
        <button class="btn btn-primary" type="submit">Salvar alterações</button>
      </div>
    </form>`;

  const form = panel.querySelector(".cartela-editor-form");
  const closeButton = panel.querySelector(".cartela-preview-close");
  const cancelButton = panel.querySelector(".cartela-editor-cancel");
  const imageInput = form.elements.image;
  const imagePreview = panel.querySelector(".cartela-editor-image-preview");
  const imagePreviewImage = imagePreview.querySelector("img");
  const imagePreviewName = imagePreview.querySelector("strong");
  const imageStatus = panel.querySelector(".cartela-editor-image-status");
  const removeImageButton = panel.querySelector(".cartela-editor-remove-image");

  function renderImagePreview() {
    imagePreview.classList.toggle("hidden", !pendingImageData);

    if (!pendingImageData) {
      imagePreviewImage.removeAttribute("src");
      imagePreviewName.textContent = "Imagem selecionada";
      return;
    }

    imagePreviewImage.src = pendingImageData;
    imagePreviewName.textContent = pendingImageName || "Imagem selecionada";
  }

  function closeEditor() {
    document.removeEventListener("keydown", onKeyDown);
    overlay.remove();
    document.body.classList.remove("sortick-modal-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeEditor();
    }
  }

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) return;

    imageStatus.textContent = "Preparando imagem...";

    try {
      const preparedImage = await Sortick.prepareImageFile(file);
      pendingImageData = preparedImage.dataUrl;
      pendingImageName = preparedImage.name;
      renderImagePreview();
      imageStatus.textContent = "Imagem pronta.";
    } catch (error) {
      imageInput.value = "";
      imageStatus.textContent = error && error.message ? error.message : "Não foi possível usar esta imagem.";
    }
  });

  removeImageButton.addEventListener("click", () => {
    pendingImageData = "";
    pendingImageName = "";
    imageInput.value = "";
    renderImagePreview();
    imageStatus.textContent = "Imagem removida.";
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const title = Sortick.normalizeText(form.elements.title.value).slice(0, 80);
    if (!title) {
      form.elements.title.focus();
      return;
    }

    const updatedInfo = getCartelaInfo();
    updatedInfo.prize = Sortick.normalizeText(form.elements.prize.value).slice(0, 100);
    updatedInfo.imageData = pendingImageData;
    updatedInfo.imageName = pendingImageName;
    updatedInfo.value = Sortick.normalizeText(form.elements.value.value).slice(0, 30);
    updatedInfo.drawDate = form.elements.drawDate.value || "";
    updatedInfo.note = Sortick.normalizeText(form.elements.note.value).slice(0, 180);

    draw.title = title;
    draw.options.cartelaInfo = updatedInfo;
    drawTitle.textContent = draw.title;
    persist();
    render();
    setValidation("Detalhes da cartela atualizados.");
    closeEditor();
  });

  closeButton.addEventListener("click", closeEditor);
  cancelButton.addEventListener("click", closeEditor);
  overlay.addEventListener("mousedown", event => {
    if (event.target === overlay) closeEditor();
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.body.classList.add("sortick-modal-open");
  document.addEventListener("keydown", onKeyDown);

  requestAnimationFrame(() => form.elements.title.focus());
}


function openCartelaPreview() {
  if (draw.type !== "numbers") return;

  const previousFocus = document.activeElement;
  const info = getCartelaInfo();
  const stats = getCartelaStats();
  const details = getCartelaDetailParts();
  const overlay = document.createElement("div");
  const panel = document.createElement("section");
  const headingId = `cartela-preview-${Sortick.createId("title")}`;

  overlay.className = "cartela-preview-backdrop";
  overlay.setAttribute("role", "presentation");

  panel.className = "cartela-preview-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", headingId);

  panel.innerHTML = `
    <header class="cartela-preview-header">
      <div class="cartela-title-with-image">
        ${getCartelaImageMarkup("cartela-preview-image")}
        <div>
          <p class="eyebrow">Visualização da cartela</p>
          <h2 id="${headingId}">${Sortick.escapeHTML(draw.title)}</h2>
          ${details.length ? `<p>${Sortick.escapeHTML(details.join(" · "))}</p>` : ""}
          ${info.note ? `<p>${Sortick.escapeHTML(info.note)}</p>` : ""}
        </div>
      </div>
      <button class="cartela-preview-close" type="button" aria-label="Fechar visualização">×</button>
    </header>

    <div class="cartela-preview-summary">
      <span>${stats.available} disponíveis</span>
      <span>${stats.occupied} ocupados</span>
      <span>${stats.confirmed} confirmados</span>
      <span>${stats.progress}% preenchida</span>
    </div>

    <div class="cartela-preview-grid-wrap">
      ${buildCartelaGrid({ interactive: false, showNames: true, extraClass: "cartela-preview-grid" })}
    </div>`;

  function closePreview() {
    document.removeEventListener("keydown", onKeyDown);
    overlay.remove();
    document.body.classList.remove("sortick-modal-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePreview();
    }
  }

  panel.querySelector(".cartela-preview-close").addEventListener("click", closePreview);
  overlay.addEventListener("mousedown", event => {
    if (event.target === overlay) closePreview();
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.body.classList.add("sortick-modal-open");
  document.addEventListener("keydown", onKeyDown);

  requestAnimationFrame(() => panel.querySelector(".cartela-preview-close").focus());
}

function renderResult() {
  if (!draw.result) {
    winnerCard.classList.add("hidden"); winnerName.textContent = ""; winnerMeta.textContent = ""; proofText.textContent = ""; return;
  }
  winnerCard.classList.remove("hidden");

  if (draw.type === "groups") {
    winnerName.textContent = "Grupos gerados";
    winnerMeta.textContent = `${draw.result.groups.length} grupo(s) · ${draw.result.participantCount} participante(s)`;
    proofText.textContent = createProofText();
    return;
  }

  const p = draw.result.participant;
  winnerName.textContent = getParticipantDisplay(p);

  if (draw.type === "bingo") {
    winnerMeta.textContent = `Bingo de 1 a ${getTotalNumbers()} · ${draw.options.bingoAllowRepeats ? "repetição permitida" : "sem repetição"}`;
  } else {
    winnerMeta.textContent = draw.type === "numbers" ? `Associado a: ${p.name} · ${Sortick.statusLabel(p.status)}` : `${Sortick.typeLabel(draw.type)} · ${Sortick.statusLabel(p.status)}`;
  }

  proofText.textContent = createProofText();
}

function getParticipantDisplay(participant) {
  if (draw.type === "numbers" || draw.type === "bingo") return `Nº ${participant.number}`;
  return participant.name;
}
function createProofText() {
  if (!draw.result) return "";

  if (draw.type === "groups") {
    const lines = [
      "Sortick — Grupos gerados",
      `Sorteio: ${draw.title}`,
      `Participantes: ${draw.result.participantCount}`,
      `Data: ${Sortick.formatDateTime(draw.result.createdAt)}`,
      ""
    ];

    draw.result.groups.forEach((group, index) => {
      lines.push(`Grupo ${index + 1}: ${group.join(", ")}`);
    });

    lines.push("");
    lines.push("Feito no Sortick");
    return lines.join("\n");
  }

  const p = draw.result.participant;
  const lines = [
    `Sortick — Resultado do sorteio`,
    `Sorteio: ${draw.title}`,
    `Tipo: ${Sortick.typeLabel(draw.type)}`,
    `Vencedor: ${getParticipantDisplay(p)}`
  ];

  if (draw.type === "numbers") {
    lines.push(`Associado a: ${p.name}`);
    lines.push(`Cartela: 1 a ${getTotalNumbers()}`);
    lines.push(`Status: ${Sortick.statusLabel(p.status)}`);
    lines.push(`Participantes no sorteio: ${draw.result.participantCount || draw.participants.length}`);
  } else if (draw.type === "bingo") {
    lines.push(`Bingo: 1 a ${getTotalNumbers()}`);
    lines.push(`Modo: ${draw.options.bingoAllowRepeats ? "com repetição" : "sem repetição"}`);
    lines.push(`Números sorteados: ${draw.options.bingoDrawnNumbers.join(", ")}`);
  } else {
    lines.push(`Status: ${Sortick.statusLabel(p.status)}`);
    lines.push(`Participantes no sorteio: ${draw.result.participantCount || draw.participants.length}`);
  }

  lines.push(`Data: ${Sortick.formatDateTime(draw.result.createdAt)}`);
  lines.push(`Feito no Sortick`);

  return lines.join("\n");
}

function createShareText() {
  if (!draw.result) return "";

  if (draw.type === "groups") {
    return createProofText();
  }

  const p = draw.result.participant;
  const lines = [
    `Veja o resultado do meu sorteio no Sortick:`,
    ``,
    `Sorteio: ${draw.title}`,
    `Vencedor: ${getParticipantDisplay(p)}`
  ];

  if (draw.type === "numbers") {
    const info = getCartelaInfo();
    lines.push(`Associado a: ${p.name}`);
    if (info.prize) lines.push(`Prêmio: ${info.prize}`);
    if (info.value) lines.push(`Valor por número: ${info.value}`);
  }

  lines.push(`Status: ${Sortick.statusLabel(p.status)}`);
  lines.push(`Data: ${Sortick.formatDateTime(draw.result.createdAt)}`);
  lines.push(``);
  lines.push(`Feito no Sortick`);

  if (draw.result.shareUrl) {
    lines.push(draw.result.shareUrl);
  }

  return lines.join("\n");
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let currentY = y;

  for (let index = 0; index < words.length; index += 1) {
    const testLine = line ? `${line} ${words[index]}` : words[index];
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = words[index];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    context.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function truncateCanvasText(ctx, text, maxWidth) {
  const value = String(text || "");

  if (ctx.measureText(value).width <= maxWidth) return value;

  let result = value;
  while (result.length && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result}…`;
}

function drawCanvasPill(ctx, text, x, y, fill, color) {
  ctx.font = "800 24px Inter, Arial, sans-serif";
  const width = ctx.measureText(text).width + 36;
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, width, 44, 22);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x + 18, y + 29);
  return width;
}

function loadCanvasImage(source) {
  return new Promise((resolve, reject) => {
    if (!source) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    image.src = source;
  });
}

function drawCanvasCoverImage(ctx, image, x, y, width, height, radius = 20) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;

  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}

async function downloadCartelaImage() {
  if (draw.type !== "numbers") return;

  const info = getCartelaInfo();
  const stats = getCartelaStats();
  const showNames = Boolean(info.exportShowNames);
  const columns = stats.total <= 100 ? 10 : 12;
  const rows = Math.ceil(stats.total / columns);
  const cellWidth = showNames ? 128 : 112;
  const cellHeight = showNames ? 104 : 78;
  const gap = 10;
  const padding = 58;
  const gridWidth = columns * cellWidth + (columns - 1) * gap;
  const width = Math.max(1320, gridWidth + padding * 2);
  const hasImage = Boolean(info.imageData);
  const headerHeight = hasImage ? 410 : (info.note || info.prize || info.value || info.drawDate ? 360 : 300);
  const height = headerHeight + rows * cellHeight + (rows - 1) * gap + padding + 110;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas não disponível.");

  let prizeImage = null;
  if (hasImage) {
    try {
      prizeImage = await loadCanvasImage(info.imageData);
    } catch {
      prizeImage = null;
    }
  }

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#161243");
  background.addColorStop(0.5, "#4935b8");
  background.addColorStop(1, "#00a995");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.arc(width - 120, 110, 170, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 30, 30, width - 60, height - 60, 34);
  ctx.fill();

  const contentRight = hasImage ? width - padding - 310 : width - padding;
  let y = 92;

  ctx.fillStyle = "#00a995";
  ctx.font = "900 23px Inter, Arial, sans-serif";
  ctx.fillText("CARTELA DO SORTEIO", padding, y);

  y += 60;
  ctx.fillStyle = "#17142f";
  ctx.font = "900 52px Inter, Arial, sans-serif";
  const title = truncateCanvasText(ctx, draw.title, contentRight - padding);
  ctx.fillText(title, padding, y);

  y += 44;
  const detailLines = [];
  if (info.prize) detailLines.push(`Prêmio: ${info.prize}`);
  if (info.value) detailLines.push(`${info.value} por número`);
  if (info.drawDate) detailLines.push(`Sorteio: ${formatCartelaDate(info.drawDate)}`);

  ctx.fillStyle = "#6f6b85";
  ctx.font = "700 24px Inter, Arial, sans-serif";
  if (detailLines.length) {
    y = wrapCanvasText(ctx, detailLines.join(" · "), padding, y, contentRight - padding, 32);
  }

  if (info.note) {
    y += 8;
    ctx.font = "700 22px Inter, Arial, sans-serif";
    y = wrapCanvasText(ctx, info.note, padding, y, contentRight - padding, 30);
  }

  if (prizeImage) {
    drawCanvasCoverImage(ctx, prizeImage, width - padding - 250, 84, 250, 188, 22);
  }

  const statY = headerHeight - 94;
  let pillX = padding;
  pillX += drawCanvasPill(ctx, `${stats.available} disponíveis`, pillX, statY, "#e8fff4", "#087543") + 12;
  pillX += drawCanvasPill(ctx, `${stats.occupied} ocupados`, pillX, statY, "#ffeaf0", "#a0173a") + 12;
  drawCanvasPill(ctx, `${stats.confirmed} confirmados`, pillX, statY, "#eeeaff", "#4d31d7");

  const takenByNumber = new Map(draw.participants.map(participant => [String(participant.number), participant]));
  const winnerNumber = draw.result && draw.result.participant ? String(draw.result.participant.number) : null;
  const startY = headerHeight;
  const nameFont = showNames ? 15 : 0;

  for (let number = 1; number <= stats.total; number += 1) {
    const index = number - 1;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + column * (cellWidth + gap);
    const cellY = startY + row * (cellHeight + gap);
    const participant = takenByNumber.get(String(number));
    const isWinner = String(number) === String(winnerNumber);

    let fill = "#18c970";
    let textColor = "#ffffff";

    if (participant && participant.status === "pending") fill = "#ff4b6e";
    if (participant && participant.status === "confirmed") fill = "#6c4dff";
    if (isWinner) {
      fill = "#ffca3a";
      textColor = "#261200";
    }

    ctx.fillStyle = fill;
    roundRect(ctx, x, cellY, cellWidth, cellHeight, 16);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = "900 30px Inter, Arial, sans-serif";
    ctx.fillText(String(number), x + 14, cellY + 37);

    if (participant) {
      ctx.fillStyle = participant.status === "confirmed" ? "#18c970" : "#ff4b6e";
      ctx.beginPath();
      ctx.arc(x + cellWidth - 17, cellY + 17, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (showNames && participant) {
      ctx.fillStyle = textColor;
      ctx.font = `800 ${nameFont}px Inter, Arial, sans-serif`;
      const safeName = truncateCanvasText(ctx, participant.name, cellWidth - 26);
      ctx.fillText(safeName, x + 13, cellY + cellHeight - 17);
    }
  }

  ctx.fillStyle = "#6f6b85";
  ctx.font = "800 20px Inter, Arial, sans-serif";
  ctx.fillText(`Cartela de 1 a ${stats.total} · ${stats.progress}% preenchida`, padding, height - 62);

  ctx.textAlign = "right";
  ctx.fillStyle = "#17142f";
  ctx.font = "900 22px Inter, Arial, sans-serif";
  ctx.fillText("Feito no Sortick", width - padding, height - 62);
  ctx.textAlign = "left";

  const link = document.createElement("a");
  const safeTitle = draw.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "cartela";
  link.download = `sortick-cartela-${safeTitle}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function downloadResultImage() {
  if (!draw.result) return;

  const p = draw.result.participant || { name: "Grupos gerados", status: "confirmed" };
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#6c4dff");
  gradient.addColorStop(1, "#00c2a8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(1060, 130, 170, 0, Math.PI * 2);
  ctx.fill();

  const cardX = 90;
  const cardY = 95;
  const cardW = canvas.width - 180;
  const cardH = canvas.height - 190;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.fill();

  ctx.fillStyle = "#17142f";
  ctx.font = "900 44px Inter, Arial, sans-serif";
  ctx.fillText(draw.type === "groups" ? "Grupos gerados" : "Resultado do sorteio", 150, 180);

  ctx.fillStyle = "#6f6b85";
  ctx.font = "700 28px Inter, Arial, sans-serif";
  ctx.fillText(draw.title, 150, 228);

  ctx.fillStyle = "#f5f5ff";
  roundRect(ctx, 150, 275, cardW - 120, 260, 34);
  ctx.fill();

  ctx.fillStyle = "#6f6b85";
  ctx.font = "800 28px Inter, Arial, sans-serif";
  ctx.fillText(draw.type === "groups" ? "Resultado" : "Vencedor", 190, 340);

  ctx.fillStyle = "#17142f";
  ctx.font = "900 84px Inter, Arial, sans-serif";
  const winnerText = draw.type === "groups" ? `${draw.result.groups.length} grupos` : getParticipantDisplay(p);
  let winnerFont = 84;
  while (ctx.measureText(winnerText).width > cardW - 180 && winnerFont > 46) {
    winnerFont -= 4;
    ctx.font = `900 ${winnerFont}px Inter, Arial, sans-serif`;
  }
  ctx.fillText(winnerText, 190, 425);

  ctx.fillStyle = "#6f6b85";
  ctx.font = "800 30px Inter, Arial, sans-serif";
  const metaText = draw.type === "groups"
    ? `${draw.result.participantCount} participante(s) distribuído(s)`
    : draw.type === "bingo"
      ? `Bingo de 1 a ${getTotalNumbers()} · ${draw.options.bingoAllowRepeats ? "com repetição" : "sem repetição"}`
      : draw.type === "numbers"
        ? `Associado a ${p.name} · ${Sortick.statusLabel(p.status)}`
        : `${Sortick.typeLabel(draw.type)} · ${Sortick.statusLabel(p.status)}`;
  wrapCanvasText(ctx, metaText, 190, 480, cardW - 200, 40);

  let y = 620;
  ctx.fillStyle = "#17142f";
  ctx.font = "900 36px Inter, Arial, sans-serif";
  ctx.fillText("Resumo", 150, y);
  y += 60;

  ctx.fillStyle = "#6f6b85";
  ctx.font = "700 29px Inter, Arial, sans-serif";
  y = wrapCanvasText(ctx, `Tipo: ${Sortick.typeLabel(draw.type)}`, 150, y, cardW - 160, 40);
  y = wrapCanvasText(ctx, `Participantes no sorteio: ${draw.result.participantCount || draw.participants.length}`, 150, y + 10, cardW - 160, 40);

  if (draw.type === "numbers") {
    y = wrapCanvasText(ctx, `Cartela: 1 a ${getTotalNumbers()}`, 150, y + 10, cardW - 160, 40);
  }

  y = wrapCanvasText(ctx, `Data: ${Sortick.formatDateTime(draw.result.createdAt)}`, 150, y + 10, cardW - 160, 40);

  ctx.fillStyle = "#17142f";
  ctx.font = "900 34px Inter, Arial, sans-serif";
  ctx.fillText("Feito no Sortick", 150, 1060);

  const link = document.createElement("a");
  const safeTitle = draw.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "sorteio";
  link.download = `sortick-resultado-${safeTitle}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

// Controles da cartela são renderizados junto da própria cartela.


participantForm.addEventListener("submit", event => {
  event.preventDefault(); if (isDrawing) return; setValidation();
  const name = Sortick.normalizeText(participantName.value);
  const number = Sortick.normalizeText(participantNumber.value);
  const status = participantStatus.value === "confirmed" ? "confirmed" : "pending";
  if (!name) { setValidation("Informe o nome do participante."); participantName.focus(); return; }
  const participant = { id: Sortick.createId("p"), name, status };

  if (draw.type === "numbers") {
    if (!number) { setValidation("Informe o número do participante."); participantNumber.focus(); return; }
    const numericNumber = Number.parseInt(number, 10);
    if (Number.isNaN(numericNumber) || numericNumber < 1 || numericNumber > getTotalNumbers()) { setValidation(`Informe um número entre 1 e ${getTotalNumbers()}.`); return; }
    if (draw.participants.some(p => String(p.number) === String(numericNumber))) { setValidation("Este número já está ocupado."); return; }
    participant.number = String(numericNumber);
  } else if (draw.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    setValidation("Este nome já está na lista."); return;
  }

  draw.participants.push(participant); draw.result = null; persist();
  participantName.value = ""; participantNumber.value = ""; participantName.focus(); render();
});

drawButton.addEventListener("click", async () => {
  const eligible = getEligibleParticipants();
  let canDraw = eligible.length >= getMinimumParticipants();

  if (draw.type === "bingo") {
    canDraw = draw.options.bingoAllowRepeats || getRemainingBingoNumbers().length > 0;
  }

  if (isDrawing || !canDraw) return;

  isDrawing = true;
  drawButton.disabled = true;
  copyButton.disabled = true;
  shareButton.disabled = true;
  downloadButton.disabled = true;
  setRuleOptionsLocked(true);
  winnerCard.classList.add("hidden");

  if (typeof window.sortickTrack === "function") {
    window.sortickTrack("start_draw", {
      draw_type: draw.type,
      draw_mode: draw.mode
    });
  }

  // No Bingo, a contagem prepara apenas o começo de cada partida.
  // Depois do primeiro número, a animação curta já mantém o ritmo do jogo.
  const shouldRunCountdown = draw.type !== "bingo" || draw.options.bingoDrawnNumbers.length === 0;
  if (shouldRunCountdown) {
    await runCountdown();
  }

  if (draw.type === "bingo") {
    const number = getNextBingoNumber();

    if (!number) {
      setValidation("Todos os números já foram sorteados. Ative repetição ou reinicie o bingo.");
      isDrawing = false;
      setRuleOptionsLocked(false);
      render();
      return;
    }

    await runBingoAnimation(number);

    draw.options.bingoDrawnNumbers.push(String(number));
    draw.result = {
      participant: { id: Sortick.createId("b"), name: `Nº ${number}`, number: String(number), status: "confirmed" },
      participantIndex: null,
      createdAt: new Date().toISOString(),
      participantCount: getTotalNumbers()
    };
  } else if (draw.type === "groups") {
    const groups = generateGroups();
    animationArea.innerHTML = renderGroupsHTML(groups);
    playSuccessSound();

    draw.result = {
      groups,
      participant: { id: Sortick.createId("g"), name: "Grupos gerados", status: "confirmed" },
      participantIndex: null,
      createdAt: new Date().toISOString(),
      participantCount: draw.participants.length
    };
  } else {
    const winnerIndex = Sortick.secureRandomIndex(eligible.length);
    const winner = eligible[winnerIndex];
    const animationResult = await runAnimation(winner, winnerIndex, eligible);
    draw.result = {
      participant: winner,
      participantIndex: winnerIndex,
      createdAt: new Date().toISOString(),
      wheelRotation: animationResult.wheelRotation || null,
      participantCount: eligible.length,
      rouletteParticipants: draw.type === "roulette" ? eligible.map(participant => ({ ...participant })) : null
    };

    if (draw.options.removeWinnerAfterDraw) {
      draw.participants = draw.participants.filter(participant => participant.id !== winner.id);
    }
  }

  persist();
  isDrawing = false;
  setRuleOptionsLocked(false);
  render();
  launchConfetti();
});


let sortickAudioContext = null;

function getSortickAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return null;
  }

  if (!sortickAudioContext) {
    sortickAudioContext = new AudioContext();
  }

  if (sortickAudioContext.state === "suspended") {
    sortickAudioContext.resume();
  }

  return sortickAudioContext;
}

function playTone(frequency = 440, duration = 0.08, type = "sine", volume = 0.035) {
  if (!draw.options.soundEnabled) {
    return;
  }

  try {
    const context = getSortickAudioContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  } catch {
    // Se o navegador bloquear áudio, o Sortick continua funcionando sem som.
  }
}

function playTickSound() {
  playTone(620, 0.045, "square", 0.025);
}

function playSelectSound() {
  playTone(420, 0.055, "sine", 0.025);
}

function playSuccessSound() {
  if (!draw.options.soundEnabled) {
    return;
  }

  playTone(523.25, 0.09, "sine", 0.045);
  setTimeout(() => playTone(659.25, 0.09, "sine", 0.045), 95);
  setTimeout(() => playTone(783.99, 0.14, "sine", 0.045), 190);
}

function runCountdown() {
  const steps = ["3", "2", "1"];
  let index = 0;
  return new Promise(resolve => {
    function next() {
      if (index >= steps.length) return resolve();
      animationArea.innerHTML = `<div class="countdown-number">${steps[index]}</div>`;
      playTickSound();
      index += 1;
      setTimeout(next, 640);
    }
    next();
  });
}

function launchConfetti() {
  const colors = ["#ffca3a", "#ff4b6e", "#00c2a8", "#6c4dff", "#ffffff"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Sortick.secureRandomIndex(100)}%`;
    piece.style.background = colors[Sortick.secureRandomIndex(colors.length)];
    piece.style.animationDelay = `${Sortick.secureRandomIndex(260)}ms`;
    animationArea.appendChild(piece);
    setTimeout(() => piece.remove(), 1900);
  }
}

async function runAnimation(winner, winnerIndex, eligible) {
  if (draw.type === "roulette") return runRouletteCanvasAnimation(winnerIndex, eligible);
  const duration = 2600, start = performance.now(); let lastTick = 0;
  return new Promise(resolve => {
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const delay = 55 + progress * 170;
      if (now - lastTick > delay) {
        lastTick = now;
        playTickSound();
        const randomParticipant = eligible[Sortick.secureRandomIndex(eligible.length)];
        if (draw.type === "numbers") renderNumberBoard(randomParticipant.number);
        else animationArea.innerHTML = `<div class="rolling-name">${Sortick.escapeHTML(getParticipantDisplay(randomParticipant))}</div>`;
      }
      if (progress < 1) requestAnimationFrame(frame);
      else { draw.type === "numbers" ? renderNumberBoard(winner.number) : animationArea.innerHTML = `<div class="rolling-name">${Sortick.escapeHTML(getParticipantDisplay(winner))}</div>`; playSuccessSound(); setTimeout(() => resolve({}), 350); }
    }
    requestAnimationFrame(frame);
  });
}

function runRouletteCanvasAnimation(winnerIndex, eligible) {
  const count = eligible.length;
  const sliceDegrees = 360 / count;
  const currentBase = currentWheelRotation % 360;
  const winnerCenter = winnerIndex * sliceDegrees + sliceDegrees / 2;
  const normalizedTarget = 360 - winnerCenter;
  const extraTurns = 6 + Sortick.secureRandomIndex(3);
  const finalRotation = currentBase + extraTurns * 360 + ((normalizedTarget - currentBase + 360) % 360);
  const duration = 4300;
  const start = performance.now();
  const startRotation = currentWheelRotation;

  let lastActiveIndex = null;
  let lastWheelTickTime = 0;

  renderRouletteCanvas(startRotation, null);

  return new Promise(resolve => {
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const rotation = startRotation + (finalRotation - startRotation) * easeOutCubic(progress);

      currentWheelRotation = rotation;
      drawWheel(document.querySelector("#rouletteCanvas"), eligible, rotation, null);

      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalizedRotation + 360) % 360;
      const activeIndex = Math.floor(pointerAngle / sliceDegrees) % count;

      if (activeIndex !== lastActiveIndex && now - lastWheelTickTime > 28) {
        lastActiveIndex = activeIndex;
        lastWheelTickTime = now;
        playTickSound();
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        currentWheelRotation = finalRotation;
        renderRouletteCanvas(finalRotation, winnerIndex);
        playSuccessSound();
        setTimeout(() => resolve({ wheelRotation: finalRotation }), 350);
      }
    }

    requestAnimationFrame(frame);
  });
}

confirmedOnlyToggle.addEventListener("change", () => {
  if (isDrawing) {
    confirmedOnlyToggle.checked = Boolean(draw.options.confirmedOnly);
    return;
  }

  draw.options.confirmedOnly = confirmedOnlyToggle.checked;
  draw.result = null;
  persist();
  render();
});

removeWinnerToggle.addEventListener("change", () => {
  if (isDrawing) {
    removeWinnerToggle.checked = Boolean(draw.options.removeWinnerAfterDraw);
    return;
  }

  draw.options.removeWinnerAfterDraw = removeWinnerToggle.checked;
  persist();
});


if (bingoRepeatToggle) {
  bingoRepeatToggle.addEventListener("change", () => {
    draw.options.bingoAllowRepeats = bingoRepeatToggle.checked;
    persist();
    setValidation(draw.options.bingoAllowRepeats ? "Números repetidos permitidos no próximo sorteio." : "Números repetidos bloqueados no próximo sorteio.");
    render();
  });
}

if (soundToggle) {
  soundToggle.addEventListener("change", () => {
    draw.options.soundEnabled = soundToggle.checked;
    persist();

    if (soundToggle.checked) {
      getSortickAudioContext();
      playSuccessSound();
      setValidation("Som ativado.");
    } else {
      setValidation("Som desativado.");
    }
  });
}

participantFilter.addEventListener("change", renderParticipants);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(createProofText());
    if (typeof window.sortickTrack === "function") {
      window.sortickTrack("copy_result", { draw_type: draw.type });
    }
    copyButton.textContent = "Copiado!";
    setTimeout(() => copyButton.textContent = "Copiar resumo", 1400);
  } catch {
    setValidation("Não foi possível copiar automaticamente. Copie o resumo manualmente.");
  }
});

shareButton.addEventListener("click", async () => {
  if (!draw.result) return;

  const shareText = createShareText();

  try {
    if (navigator.share) {
      await navigator.share({
        title: `Resultado do sorteio — ${draw.title}`,
        text: shareText
      });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText);
      if (typeof window.sortickTrack === "function") {
        window.sortickTrack("share_result", { draw_type: draw.type, method: "clipboard" });
      }
      setValidation("Seu navegador não abriu o compartilhamento nativo. O texto foi copiado.");
      return;
    }

    setValidation("Compartilhamento nativo não disponível neste navegador.");
  } catch (error) {
    if (String(error && error.name) === "AbortError") return;
    setValidation("Não foi possível compartilhar agora.");
  }
});

if (whatsappButton) {
  whatsappButton.addEventListener("click", () => {
    if (!draw.result) return;

    const text = createShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    if (typeof window.sortickTrack === "function") {
      window.sortickTrack("share_result", { draw_type: draw.type, method: "whatsapp" });
    }
  });
}

if (focusButton) {
  focusButton.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        setValidation("Tela cheia não está disponível neste navegador.");
      }
    } catch {
      setValidation("Não foi possível abrir a tela cheia agora.");
    }
  });
}

downloadButton.addEventListener("click", () => {
  if (typeof window.sortickTrack === "function") {
    window.sortickTrack("download_result", { draw_type: draw.type });
  }
  try {
    downloadResultImage();
  } catch {
    setValidation("Não foi possível gerar a imagem agora.");
  }
});

resetButton.addEventListener("click", async () => {
  if (isDrawing || draw.type !== "bingo") return;

  const response = await Sortick.askForConfirmation({
    title: "Reiniciar bingo?",
    message: "O histórico de números sorteados será limpo e a próxima rodada começará do início.",
    confirmText: "Reiniciar bingo",
    tone: "danger"
  });

  if (!response.confirmed) return;

  draw.options.bingoDrawnNumbers = [];
  draw.result = null;
  persist();
  render();
});

clearParticipantsButton.addEventListener("click", async () => {
  if (isDrawing) return;

  if (draw.type === "bingo") {
    const response = await Sortick.askForConfirmation({
      title: "Limpar histórico do Bingo?",
      message: "Todos os números sorteados nesta partida serão removidos.",
      confirmText: "Limpar histórico",
      tone: "danger"
    });

    if (!response.confirmed) return;

    draw.options.bingoDrawnNumbers = [];
    draw.result = null;
    persist();
    render();
    return;
  }

  const response = await Sortick.askForConfirmation({
    title: "Limpar participantes?",
    message: "Todos os participantes deste sorteio serão removidos. Essa ação não pode ser desfeita.",
    confirmText: "Limpar participantes",
    tone: "danger"
  });

  if (!response.confirmed) return;

  draw.participants = [];
  draw.result = null;
  persist();
  render();
});

sampleButton.addEventListener("click", () => {
  if (isDrawing) return;
  if (draw.type === "numbers") {
    const total = getTotalNumbers();
    const numbers = [1, Math.min(7, total), Math.min(12, total), Math.min(27, total)].filter((v, i, a) => a.indexOf(v) === i);
    const names = ["Ana", "Bruno", "Carla", "Diego"];
    draw.participants = numbers.map((number, index) => ({ id: Sortick.createId("p"), name: names[index], number: String(number), status: index % 2 === 0 ? "confirmed" : "pending" }));
  } else if (draw.type === "groups") {
    draw.participants = ["Ana", "Bruno", "Carla", "Diego", "Eduardo", "Fernanda"].map(name => ({
      id: Sortick.createId("p"),
      name,
      status: "pending"
    }));
  } else {
    draw.participants = [
      { name: "Ana", status: "confirmed" }, { name: "Bruno", status: "pending" }, { name: "Carla", status: "confirmed" }, { name: "Diego", status: "pending" }
    ].map(item => ({ id: Sortick.createId("p"), ...item }));
  }
  draw.result = null; persist(); render();
});


function getBulkNames() {
  return bulkText.value
    .split(/[\n,;]+/)
    .map(Sortick.normalizeText)
    .filter(Boolean);
}

function updateBulkPreview() {
  if (!bulkPreview) return;

  const names = getBulkNames();
  if (!names.length) {
    bulkPreview.textContent = "Nenhum nome informado.";
    return;
  }

  const existing = new Set(draw.participants.map(participant => participant.name.toLocaleLowerCase("pt-BR")));
  const seen = new Set();
  let ready = 0;
  let ignored = 0;

  names.forEach(name => {
    const normalized = name.toLocaleLowerCase("pt-BR");
    if (existing.has(normalized) || seen.has(normalized)) {
      ignored += 1;
      return;
    }
    seen.add(normalized);
    ready += 1;
  });

  bulkPreview.textContent = ignored
    ? `${ready} nome(s) pronto(s) para adicionar · ${ignored} duplicado(s) será(ão) ignorado(s).`
    : `${ready} nome(s) pronto(s) para adicionar.`;
}

bulkButton.addEventListener("click", () => {
  if (draw.type === "numbers" || draw.type === "bingo") {
    setValidation(draw.type === "bingo" ? "O Bingo não usa lista de participantes." : "Adicionar vários está disponível para nomes, roleta e grupos nesta versão.");
    return;
  }

  const willOpen = bulkAddPanel.classList.contains("hidden");
  bulkAddPanel.classList.toggle("hidden");

  if (willOpen) {
    updateBulkPreview();
    bulkText.focus();
  }
});

bulkText.addEventListener("input", updateBulkPreview);

cancelBulkButton.addEventListener("click", () => {
  bulkAddPanel.classList.add("hidden");
  bulkText.value = "";
  updateBulkPreview();
});

confirmBulkButton.addEventListener("click", () => {
  if (draw.type === "numbers" || draw.type === "bingo") return;

  const status = participantStatus.value === "confirmed" ? "confirmed" : "pending";
  const names = getBulkNames();

  if (!names.length) {
    setValidation("Cole pelo menos um nome.");
    bulkText.focus();
    return;
  }

  const existing = new Set(draw.participants.map(participant => participant.name.toLocaleLowerCase("pt-BR")));
  let added = 0;
  let ignored = 0;

  names.forEach(name => {
    const normalized = name.toLocaleLowerCase("pt-BR");
    if (existing.has(normalized)) {
      ignored += 1;
      return;
    }

    draw.participants.push({ id: Sortick.createId("p"), name, status });
    existing.add(normalized);
    added += 1;
  });

  draw.result = null;
  persist();

  bulkText.value = "";
  bulkAddPanel.classList.add("hidden");
  updateBulkPreview();

  setValidation(
    added
      ? `${added} nome(s) adicionado(s).${ignored ? ` ${ignored} duplicado(s) ignorado(s).` : ""}`
      : "Nenhum nome novo foi adicionado; todos já estavam na lista."
  );
  render();
});

shuffleButton.addEventListener("click", () => {
  if (isDrawing) return;
  if (draw.type === "numbers" || draw.type === "bingo") {
    setValidation(draw.type === "bingo" ? "O histórico do Bingo já segue a ordem dos números sorteados." : "A cartela de números já fica organizada por número.");
    return;
  }
  draw.participants = Sortick.shuffleArray(draw.participants);
  draw.result = null;
  persist();
  setValidation("Lista embaralhada.");
  render();
});
