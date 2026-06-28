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
const drawTitleField = document.querySelector("#drawTitleField");
const drawModeField = document.querySelector("#drawModeField");
const createSubmitButton = document.querySelector("#createSubmitButton");
const cartelaCreateWizard = document.querySelector("#cartelaCreateWizard");
const cartelaCreateTitle = document.querySelector("#cartelaCreateTitle");
const cartelaCreateTotal = document.querySelector("#cartelaCreateTotal");
const cartelaCreatePrize = document.querySelector("#cartelaCreatePrize");
const cartelaCreateImage = document.querySelector("#cartelaCreateImage");
const cartelaCreateImagePreview = document.querySelector("#cartelaCreateImagePreview");
const cartelaCreateImagePreviewImage = document.querySelector("#cartelaCreateImagePreviewImage");
const cartelaCreateImageName = document.querySelector("#cartelaCreateImageName");
const cartelaCreateImageStatus = document.querySelector("#cartelaCreateImageStatus");
const cartelaCreateRemoveImage = document.querySelector("#cartelaCreateRemoveImage");
const cartelaCreateValue = document.querySelector("#cartelaCreateValue");
const cartelaCreateDate = document.querySelector("#cartelaCreateDate");
const cartelaCreateNote = document.querySelector("#cartelaCreateNote");
const cartelaWizardNext1 = document.querySelector("#cartelaWizardNext1");
const cartelaWizardBack2 = document.querySelector("#cartelaWizardBack2");
const cartelaWizardNext2 = document.querySelector("#cartelaWizardNext2");
const cartelaWizardBack3 = document.querySelector("#cartelaWizardBack3");
const cartelaWizardCreate = document.querySelector("#cartelaWizardCreate");

const selectionCreationField = document.querySelector("#selectionCreationField");
const selectionModeInput = document.querySelector("#selectionModeInput");
const selectionCountField = document.querySelector("#selectionCountField");
const selectionCountInput = document.querySelector("#selectionCountInput");
const noRepeatInput = document.querySelector("#noRepeatInput");
const groupNamesCreationField = document.querySelector("#groupNamesCreationField");
const groupNamesInput = document.querySelector("#groupNamesInput");
const quickCreationField = document.querySelector("#quickCreationField");
const quickTypeInput = document.querySelector("#quickTypeInput");
const quickDiceField = document.querySelector("#quickDiceField");
const quickDiceSidesInput = document.querySelector("#quickDiceSidesInput");
const quickRandomFields = document.querySelector("#quickRandomFields");
const quickMinInput = document.querySelector("#quickMinInput");
const quickMaxInput = document.querySelector("#quickMaxInput");

let cartelaWizardStep = 1;
let cartelaCreateImageData = "";
let cartelaCreateImageNameValue = ""; 

function setCartelaWizardStep(step) {
  cartelaWizardStep = Math.max(1, Math.min(3, Number(step) || 1));

  document.querySelectorAll("[data-cartela-step]").forEach(section => {
    section.classList.toggle("hidden", Number(section.dataset.cartelaStep) !== cartelaWizardStep);
  });

  document.querySelectorAll("[data-cartela-step-indicator]").forEach(indicator => {
    const indicatorStep = Number(indicator.dataset.cartelaStepIndicator);
    indicator.classList.toggle("is-active", indicatorStep === cartelaWizardStep);
    indicator.classList.toggle("is-complete", indicatorStep < cartelaWizardStep);
  });
}

function updateCartelaCreateImagePreview() {
  const hasImage = Boolean(cartelaCreateImageData);

  cartelaCreateImagePreview.classList.toggle("hidden", !hasImage);

  if (!hasImage) {
    cartelaCreateImagePreviewImage.removeAttribute("src");
    cartelaCreateImageName.textContent = "Imagem selecionada";
    return;
  }

  cartelaCreateImagePreviewImage.src = cartelaCreateImageData;
  cartelaCreateImageName.textContent = cartelaCreateImageNameValue || "Imagem selecionada";
}

function setCartelaCreateImageStatus(message = "") {
  cartelaCreateImageStatus.textContent = message;
}

function parseGroupNames(value, groupCount) {
  const rawNames = String(value || "")
    .split(/[\n,;]+/)
    .map(Sortick.normalizeText)
    .filter(Boolean)
    .slice(0, groupCount);

  const names = [];
  for (let index = 0; index < groupCount; index += 1) {
    names.push(rawNames[index] || `Grupo ${index + 1}`);
  }

  return names;
}

function syncSelectionCreation() {
  const isMultiple = selectionModeInput.value === "multiple";
  selectionCountField.classList.toggle("hidden", !isMultiple);
}

function syncQuickCreation() {
  const isDice = quickTypeInput.value === "dice";
  const isRandom = quickTypeInput.value === "random";

  quickDiceField.classList.toggle("hidden", !isDice);
  quickRandomFields.classList.toggle("hidden", !isRandom);
}

function syncTypeSettings() {
  const type = typeInput.value;
  const isCartela = type === "numbers";
  const isSelection = type === "names" || type === "roulette";
  const isGroups = type === "groups";
  const isQuick = type === "quick";

  numberQuantityField.classList.add("hidden");
  totalNumbersInput.required = false;

  bingoQuantityField.classList.toggle("hidden", type !== "bingo");
  bingoTotalNumbersInput.required = type === "bingo";

  groupQuantityField.classList.toggle("hidden", !isGroups);
  groupCountInput.required = isGroups;

  selectionCreationField.classList.toggle("hidden", !isSelection);
  groupNamesCreationField.classList.toggle("hidden", !isGroups);
  quickCreationField.classList.toggle("hidden", !isQuick);

  drawTitleField.classList.toggle("hidden", isCartela);
  drawModeField.classList.toggle("hidden", isCartela || isQuick);
  createSubmitButton.classList.toggle("hidden", isCartela);
  cartelaCreateWizard.classList.toggle("hidden", !isCartela);
  titleInput.required = !isCartela;

  if (isCartela) {
    setCartelaWizardStep(cartelaWizardStep);
  }

  syncSelectionCreation();
  syncQuickCreation();
}


function validateCartelaStepOne() {
  const title = Sortick.normalizeText(cartelaCreateTitle.value);

  if (!title) {
    cartelaCreateTitle.focus();
    return false;
  }

  const total = Number.parseInt(cartelaCreateTotal.value, 10);
  if (!Number.isInteger(total) || total < 2 || total > 500) {
    cartelaCreateTotal.focus();
    return false;
  }

  return true;
}

function createCartelaFromWizard() {
  if (!validateCartelaStepOne()) {
    setCartelaWizardStep(1);
    return;
  }

  const title = Sortick.normalizeText(cartelaCreateTitle.value).slice(0, 80);
  const mode = "simple";
  const options = {
    confirmedOnly: false,
    removeWinnerAfterDraw: false,
    soundEnabled: false,
    totalNumbers: Sortick.clampNumber(cartelaCreateTotal.value, 2, 500),
    cartelaInfo: {
      prize: Sortick.normalizeText(cartelaCreatePrize.value).slice(0, 100),
      imageData: cartelaCreateImageData,
      imageName: cartelaCreateImageNameValue,
      value: Sortick.normalizeText(cartelaCreateValue.value).slice(0, 30),
      drawDate: cartelaCreateDate.value || "",
      note: Sortick.normalizeText(cartelaCreateNote.value).slice(0, 180),
      exportShowNames: false
    }
  };

  const draw = {
    id: Sortick.createId("draw"),
    title,
    type: "numbers",
    mode,
    options,
    participants: [],
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    Sortick.saveDraw(draw);
  } catch {
    setCartelaCreateImageStatus("Não foi possível salvar a cartela. Tente remover a imagem ou usar outra menor.");
    setCartelaWizardStep(2);
    return;
  }

  if (typeof window.sortickTrack === "function") {
    window.sortickTrack("create_draw", {
      draw_type: "numbers",
      draw_mode: mode
    });
  }

  window.location.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(draw.id)}`;
}

typeInput.addEventListener("change", syncTypeSettings);
syncTypeSettings();

function applyTypeFromURL() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("tipo");
  const allowedTypes = ["names", "roulette", "numbers", "bingo", "groups", "quick"];

  if (type && allowedTypes.includes(type)) {
    typeInput.value = type;
    syncTypeSettings();
  }
}

applyTypeFromURL();

selectionModeInput.addEventListener("change", syncSelectionCreation);
quickTypeInput.addEventListener("change", syncQuickCreation);

if (cartelaWizardNext1) {
  cartelaWizardNext1.addEventListener("click", () => {
    if (validateCartelaStepOne()) setCartelaWizardStep(2);
  });
}

if (cartelaWizardBack2) cartelaWizardBack2.addEventListener("click", () => setCartelaWizardStep(1));
if (cartelaWizardNext2) cartelaWizardNext2.addEventListener("click", () => setCartelaWizardStep(3));
if (cartelaWizardBack3) cartelaWizardBack3.addEventListener("click", () => setCartelaWizardStep(2));
if (cartelaWizardCreate) cartelaWizardCreate.addEventListener("click", createCartelaFromWizard);

if (cartelaCreateImage) {
  cartelaCreateImage.addEventListener("change", async () => {
    const file = cartelaCreateImage.files && cartelaCreateImage.files[0];

    if (!file) return;

    setCartelaCreateImageStatus("Preparando imagem...");

    try {
      const preparedImage = await Sortick.prepareImageFile(file);
      cartelaCreateImageData = preparedImage.dataUrl;
      cartelaCreateImageNameValue = preparedImage.name;
      updateCartelaCreateImagePreview();
      setCartelaCreateImageStatus("Imagem pronta.");
    } catch (error) {
      cartelaCreateImage.value = "";
      cartelaCreateImageData = "";
      cartelaCreateImageNameValue = "";
      updateCartelaCreateImagePreview();
      setCartelaCreateImageStatus(error && error.message ? error.message : "Não foi possível usar esta imagem.");
    }
  });
}

if (cartelaCreateRemoveImage) {
  cartelaCreateRemoveImage.addEventListener("click", () => {
    cartelaCreateImage.value = "";
    cartelaCreateImageData = "";
    cartelaCreateImageNameValue = "";
    updateCartelaCreateImagePreview();
    setCartelaCreateImageStatus("Imagem removida.");
  });
}



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

  if (savedDraw.type === "quick") {
    const labels = { coin: "Cara ou coroa", dice: "Dado", random: "Número aleatório" };
    return labels[options.quickType] || "Decisão rápida";
  }

  if (savedDraw.type === "names" || savedDraw.type === "roulette") {
    const selectionLabels = { multiple: "vários sorteados", order: "ordem completa", single: "um sorteado" };
    return `${participants.length} participante(s) · ${selectionLabels[options.selectionMode] || "um sorteado"}`;
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
    removeWinnerAfterDraw: false,
    soundEnabled: Boolean(sourceOptions.soundEnabled),
    selectionMode: ["single", "multiple", "order"].includes(sourceOptions.selectionMode) ? sourceOptions.selectionMode : "single",
    selectionCount: Sortick.clampNumber(sourceOptions.selectionCount || 2, 2, 100),
    noRepeat: Boolean(sourceOptions.noRepeat || sourceOptions.removeWinnerAfterDraw),
    roundDrawnIds: []
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
    options.groupNames = Array.isArray(sourceOptions.groupNames)
      ? sourceOptions.groupNames.slice(0, options.groupCount)
      : [];
  }

  if (type === "quick") {
    options.quickType = ["coin", "dice", "random"].includes(sourceOptions.quickType)
      ? sourceOptions.quickType
      : "coin";
    options.diceSides = Sortick.clampNumber(sourceOptions.diceSides || 6, 2, 100);
    options.randomMin = Number.isInteger(sourceOptions.randomMin) ? sourceOptions.randomMin : 1;
    options.randomMax = Number.isInteger(sourceOptions.randomMax) ? sourceOptions.randomMax : 100;
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
  const sourceDraw = Sortick.getDraw(savedDraw.id) || savedDraw;
  const isTransfer = targetType !== sourceDraw.type;

  const copy = {
    id: Sortick.createId("draw"),
    title: buildCopyTitle(sourceDraw, targetType),
    type: targetType,
    mode: isTransfer ? "simple" : (sourceDraw.mode || "simple"),
    options: getCopyOptions(targetType, isTransfer ? {} : (sourceDraw.options || {})),
    participants: cloneParticipants(sourceDraw.participants),
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  Sortick.saveDraw(copy);
  return copy;
}

async function renameSavedDraw(savedDraw) {
  const response = await Sortick.askForText({
    title: "Renomear sorteio",
    message: "Escolha um nome claro para identificar este sorteio salvo.",
    confirmText: "Salvar nome",
    input: {
      label: "Novo nome do sorteio",
      value: savedDraw.title,
      maxLength: 80,
      validate: value => value ? "" : "Digite um nome para o sorteio."
    }
  });

  if (!response.confirmed) return;

  Sortick.updateDraw(savedDraw.id, current => ({
    ...current,
    title: response.value,
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
  description.textContent = "Usar esta lista em outro sorteio:";

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
      transferButton.textContent = "Usar em outro sorteio";
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

    deleteButton.addEventListener("click", async () => {
      const response = await Sortick.askForConfirmation({
        title: "Excluir sorteio?",
        message: `“${savedDraw.title}” será removido deste navegador. Essa ação não pode ser desfeita.`,
        confirmText: "Excluir sorteio",
        tone: "danger"
      });

      if (!response.confirmed) return;

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

  const type = typeInput.value;

  if (type === "numbers") {
    createCartelaFromWizard();
    return;
  }

  const mode = type === "quick" ? "simple" : modeInput.value;
  let title = Sortick.normalizeText(titleInput.value);

  if (!title && type === "quick") {
    const quickTitles = {
      coin: "Cara ou coroa",
      dice: "Dado",
      random: "Número aleatório"
    };
    title = quickTitles[quickTypeInput.value] || "Decisão rápida";
  }

  if (!title) {
    titleInput.focus();
    return;
  }

  const options = {
    confirmedOnly: false,
    removeWinnerAfterDraw: false,
    soundEnabled: false
  };

  if (type === "names" || type === "roulette") {
    options.selectionMode = ["single", "multiple", "order"].includes(selectionModeInput.value)
      ? selectionModeInput.value
      : "single";
    options.selectionCount = Sortick.clampNumber(selectionCountInput.value, 2, 100);
    options.noRepeat = Boolean(noRepeatInput.checked);
    options.roundDrawnIds = [];
  }

  if (type === "bingo") {
    options.totalNumbers = Sortick.clampNumber(bingoTotalNumbersInput.value, 2, 500);
    options.bingoDrawnNumbers = [];
    options.bingoAllowRepeats = false;
  }

  if (type === "groups") {
    options.groupCount = Sortick.clampNumber(groupCountInput.value, 2, 50);
    options.groupNames = parseGroupNames(groupNamesInput.value, options.groupCount);
  }

  if (type === "quick") {
    const quickType = ["coin", "dice", "random"].includes(quickTypeInput.value)
      ? quickTypeInput.value
      : "coin";

    const minimum = Number.parseInt(quickMinInput.value, 10);
    const maximum = Number.parseInt(quickMaxInput.value, 10);

    options.quickType = quickType;
    options.diceSides = Sortick.clampNumber(quickDiceSidesInput.value, 2, 100);
    options.randomMin = Number.isInteger(minimum) ? minimum : 1;
    options.randomMax = Number.isInteger(maximum) ? maximum : 100;

    if (options.randomMin > options.randomMax) {
      [options.randomMin, options.randomMax] = [options.randomMax, options.randomMin];
    }
  }

  const draw = {
    id: Sortick.createId("draw"),
    title: title.slice(0, 80),
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
