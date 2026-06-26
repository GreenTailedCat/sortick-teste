const modeCarouselTrack = document.querySelector("#modos .mode-carousel-track");
const modeCarouselPrev = document.querySelector("#modos .carousel-button-prev");
const modeCarouselNext = document.querySelector("#modos .carousel-button-next");

function scrollModeCarousel(direction) {
  if (!modeCarouselTrack) return;

  const firstCard = modeCarouselTrack.querySelector(".mode-card");
  const amount = firstCard ? firstCard.getBoundingClientRect().width + 18 : 320;

  modeCarouselTrack.scrollBy({
    left: amount * direction,
    behavior: "smooth"
  });
}

if (modeCarouselPrev && modeCarouselNext) {
  modeCarouselPrev.addEventListener("click", () => scrollModeCarousel(-1));
  modeCarouselNext.addEventListener("click", () => scrollModeCarousel(1));
}


const form = document.querySelector("#createForm");
const titleInput = document.querySelector("#drawTitle");
const typeInput = document.querySelector("#drawType");
const modeInput = document.querySelector("#drawMode");
const numberQuantityField = document.querySelector("#numberQuantityField");
const totalNumbersInput = document.querySelector("#totalNumbers");
const bingoQuantityField = document.querySelector("#bingoQuantityField");
const bingoTotalNumbersInput = document.querySelector("#bingoTotalNumbers");
const groupQuantityField = document.querySelector("#groupQuantityField");
const groupCountInput = document.querySelector("#groupCount");
const savedDrawsList = document.querySelector("#savedDrawsList");

function syncTypeSettings() {
  const type = typeInput.value;

  numberQuantityField.classList.toggle("hidden", type !== "numbers");
  totalNumbersInput.required = type === "numbers";

  bingoQuantityField.classList.toggle("hidden", type !== "bingo");
  bingoTotalNumbersInput.required = type === "bingo";

  groupQuantityField.classList.toggle("hidden", type !== "groups");
  groupCountInput.required = type === "groups";
}

typeInput.addEventListener("change", syncTypeSettings);
syncTypeSettings();

function applyTypeFromURL() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("tipo");
  const allowedTypes = ["names", "roulette", "numbers", "bingo", "groups"];

  if (type && allowedTypes.includes(type)) {
    typeInput.value = type;
    syncTypeSettings();
  }
}

applyTypeFromURL();


function getSavedDraws() {
  return Object.values(Sortick.readDraws())
    .filter(item => item && item.id && item.title)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
}

function getSavedDrawSummary(savedDraw) {
  const options = savedDraw.options || {};
  const participants = Array.isArray(savedDraw.participants) ? savedDraw.participants : [];

  if (savedDraw.type === "bingo") {
    const drawn = Array.isArray(options.bingoDrawnNumbers) ? options.bingoDrawnNumbers.length : 0;
    return `${drawn} número(s) sorteado(s)`;
  }

  if (savedDraw.type === "numbers") {
    return `${participants.length} número(s) ocupado(s)`;
  }

  if (savedDraw.type === "groups") {
    return `${participants.length} participante(s) · ${options.groupCount || 2} grupo(s)`;
  }

  return `${participants.length} participante(s)`;
}

function formatSavedDrawDate(savedDraw) {
  try {
    return Sortick.formatDateTime(savedDraw.updatedAt || savedDraw.createdAt);
  } catch {
    return "Data indisponível";
  }
}

function cloneParticipants(participants) {
  return (Array.isArray(participants) ? participants : []).map(participant => ({
    ...participant,
    id: Sortick.createId("p")
  }));
}

function getCopyOptions(type, sourceOptions = {}) {
  const options = {
    confirmedOnly: Boolean(sourceOptions.confirmedOnly),
    removeWinnerAfterDraw: Boolean(sourceOptions.removeWinnerAfterDraw),
    soundEnabled: Boolean(sourceOptions.soundEnabled)
  };

  if (type === "numbers") {
    options.totalNumbers = Sortick.clampNumber(sourceOptions.totalNumbers || 50, 2, 500);
  }

  if (type === "bingo") {
    options.totalNumbers = Sortick.clampNumber(sourceOptions.totalNumbers || 75, 2, 500);
    options.bingoDrawnNumbers = [];
    options.bingoAllowRepeats = Boolean(sourceOptions.bingoAllowRepeats);
  }

  if (type === "groups") {
    options.groupCount = Sortick.clampNumber(sourceOptions.groupCount || 2, 2, 50);
  }

  return options;
}

function buildCopyTitle(savedDraw, targetType) {
  const suffix = targetType === savedDraw.type
    ? " (cópia)"
    : ` — ${Sortick.typeLabel(targetType)}`;

  const availableLength = Math.max(1, 80 - suffix.length);
  return `${Sortick.normalizeText(savedDraw.title).slice(0, availableLength)}${suffix}`;
}

function createSavedCopy(savedDraw, targetType = savedDraw.type) {
  const isTransfer = targetType !== savedDraw.type;

  const copy = {
    id: Sortick.createId("draw"),
    title: buildCopyTitle(savedDraw, targetType),
    type: targetType,
    mode: isTransfer ? "simple" : (savedDraw.mode || "simple"),
    options: getCopyOptions(targetType, isTransfer ? {} : (savedDraw.options || {})),
    participants: cloneParticipants(savedDraw.participants),
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  Sortick.saveDraw(copy);
  return copy;
}

function renameSavedDraw(savedDraw) {
  const requestedTitle = prompt("Novo nome do sorteio:", savedDraw.title);

  if (requestedTitle === null) return;

  const title = Sortick.normalizeText(requestedTitle).slice(0, 80);

  if (!title) {
    alert("Digite um nome para o sorteio.");
    return;
  }

  Sortick.updateDraw(savedDraw.id, current => ({
    ...current,
    title,
    updatedAt: new Date().toISOString()
  }));

  renderSavedDraws();
}

function createTransferControls(savedDraw, item) {
  const reusableTypes = ["names", "roulette", "groups"];
  const targetTypes = reusableTypes.filter(type => type !== savedDraw.type);

  if (!targetTypes.length) return;

  const existingMenu = item.querySelector(".saved-transfer-menu");
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement("div");
  menu.className = "saved-transfer-menu";

  const description = document.createElement("span");
  description.textContent = "Criar uma nova cópia desta lista em:";

  const select = document.createElement("select");
  select.className = "saved-transfer-select";
  select.setAttribute("aria-label", "Escolher modo para usar esta lista");

  targetTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = Sortick.typeLabel(type);
    select.appendChild(option);
  });

  const createButton = document.createElement("button");
  createButton.className = "btn btn-secondary saved-transfer-create";
  createButton.type = "button";
  createButton.textContent = "Criar e abrir";

  const cancelButton = document.createElement("button");
  cancelButton.className = "saved-action-button";
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  createButton.addEventListener("click", () => {
    const copiedDraw = createSavedCopy(savedDraw, select.value);
    window.location.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(copiedDraw.id)}`;
  });

  cancelButton.addEventListener("click", () => menu.remove());

  menu.append(description, select, createButton, cancelButton);
  item.appendChild(menu);
}

function renderSavedDraws() {
  if (!savedDrawsList) return;

  const savedDraws = getSavedDraws();

  if (!savedDraws.length) {
    savedDrawsList.innerHTML = `
      <div class="saved-empty">
        <strong>Nenhum sorteio salvo ainda</strong>
        <p>Quando você criar um sorteio, ele ficará salvo automaticamente neste navegador.</p>
      </div>`;
    return;
  }

  savedDrawsList.innerHTML = "";

  savedDraws.forEach(savedDraw => {
    const item = document.createElement("article");
    item.className = "saved-draw-item";

    const info = document.createElement("div");
    info.className = "saved-draw-info";

    const title = document.createElement("strong");
    title.textContent = savedDraw.title;

    const meta = document.createElement("span");
    meta.textContent = `${Sortick.typeLabel(savedDraw.type)} · ${getSavedDrawSummary(savedDraw)}`;

    const date = document.createElement("small");
    date.textContent = `Atualizado em ${formatSavedDrawDate(savedDraw)}`;

    info.append(title, meta, date);

    const actions = document.createElement("div");
    actions.className = "saved-draw-actions";

    const continueLink = document.createElement("a");
    continueLink.className = "btn btn-secondary saved-continue";
    continueLink.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(savedDraw.id)}`;
    continueLink.textContent = "Continuar";

    const duplicateButton = document.createElement("button");
    duplicateButton.className = "saved-action-button";
    duplicateButton.type = "button";
    duplicateButton.textContent = "Duplicar";
    duplicateButton.setAttribute("aria-label", `Duplicar o sorteio ${savedDraw.title}`);

    duplicateButton.addEventListener("click", () => {
      const copiedDraw = createSavedCopy(savedDraw);
      window.location.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(copiedDraw.id)}`;
    });

    const renameButton = document.createElement("button");
    renameButton.className = "saved-action-button";
    renameButton.type = "button";
    renameButton.textContent = "Renomear";
    renameButton.setAttribute("aria-label", `Renomear o sorteio ${savedDraw.title}`);
    renameButton.addEventListener("click", () => renameSavedDraw(savedDraw));

    actions.append(continueLink, duplicateButton, renameButton);

    if (["names", "roulette", "groups"].includes(savedDraw.type) && savedDraw.participants.length) {
      const transferButton = document.createElement("button");
      transferButton.className = "saved-action-button";
      transferButton.type = "button";
      transferButton.textContent = "Usar lista";
      transferButton.setAttribute("aria-expanded", "false");
      transferButton.setAttribute("aria-label", `Usar a lista de ${savedDraw.title} em outro modo`);

      transferButton.addEventListener("click", () => {
        const willOpen = !item.querySelector(".saved-transfer-menu");
        createTransferControls(savedDraw, item);
        transferButton.setAttribute("aria-expanded", String(willOpen));
      });

      actions.appendChild(transferButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "saved-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Excluir";
    deleteButton.setAttribute("aria-label", `Excluir sorteio ${savedDraw.title}`);

    deleteButton.addEventListener("click", () => {
      const shouldDelete = confirm(
        `Excluir o sorteio "${savedDraw.title}" deste navegador?\n\nEssa ação não pode ser desfeita.`
      );

      if (!shouldDelete) return;

      Sortick.deleteDraw(savedDraw.id);
      renderSavedDraws();
    });

    actions.append(deleteButton);
    item.append(info, actions);
    savedDrawsList.appendChild(item);
  });
}

renderSavedDraws();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = Sortick.normalizeText(titleInput.value);
  const type = typeInput.value;
  const mode = modeInput.value;

  if (!title) {
    titleInput.focus();
    return;
  }

  const options = {
    confirmedOnly: false,
    removeWinnerAfterDraw: false,
    soundEnabled: false
  };

  if (type === "numbers") {
    options.totalNumbers = Sortick.clampNumber(totalNumbersInput.value, 2, 500);
  }

  if (type === "bingo") {
    options.totalNumbers = Sortick.clampNumber(bingoTotalNumbersInput.value, 2, 500);
    options.bingoDrawnNumbers = [];
    options.bingoAllowRepeats = false;
  }

  if (type === "groups") {
    options.groupCount = Sortick.clampNumber(groupCountInput.value, 2, 50);
  }

  const draw = {
    id: Sortick.createId("draw"),
    title,
    type,
    mode,
    options,
    participants: [],
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  Sortick.saveDraw(draw);

  if (typeof window.sortickTrack === "function") {
    window.sortickTrack("create_draw", {
      draw_type: type,
      draw_mode: mode
    });
  }

  window.location.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(draw.id)}`;
});
