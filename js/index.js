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
const reuseListDialog = document.querySelector("#reuseListDialog");
const reuseListDescription = document.querySelector("#reuseListDescription");
const closeReuseListDialogButton = document.querySelector("#closeReuseListDialogButton");
const cancelReuseListDialogButton = document.querySelector("#cancelReuseListDialogButton");
const reuseListOptions = document.querySelectorAll(".reuse-list-option");

const renameDrawDialog = document.querySelector("#renameDrawDialog");
const renameDrawForm = document.querySelector("#renameDrawForm");
const renameDrawInput = document.querySelector("#renameDrawInput");
const renameDrawError = document.querySelector("#renameDrawError");
const closeRenameDrawDialogButton = document.querySelector("#closeRenameDrawDialogButton");
const cancelRenameDrawButton = document.querySelector("#cancelRenameDrawButton");

const deleteDrawDialog = document.querySelector("#deleteDrawDialog");
const deleteDrawDescription = document.querySelector("#deleteDrawDescription");
const closeDeleteDrawDialogButton = document.querySelector("#closeDeleteDrawDialogButton");
const cancelDeleteDrawButton = document.querySelector("#cancelDeleteDrawButton");
const confirmDeleteDrawButton = document.querySelector("#confirmDeleteDrawButton");

let drawSelectedForReuse = null;
let drawSelectedForRename = null;
let drawSelectedForDeletion = null;

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

function defaultOptionsForType(type, sourceDraw = null) {
  const options = {
    confirmedOnly: false,
    removeWinnerAfterDraw: false,
    soundEnabled: false
  };

  if (type === "groups") {
    options.groupCount = Sortick.clampNumber(sourceDraw?.options?.groupCount || 2, 2, 50);
  }

  return options;
}

function makeDuplicateDraw(sourceDraw) {
  const duplicateType = sourceDraw.type;
  const duplicateOptions = JSON.parse(JSON.stringify(sourceDraw.options || {}));

  // Resultado e histórico representam uma rodada anterior, então não acompanham a cópia.
  if (duplicateType === "bingo") {
    duplicateOptions.bingoDrawnNumbers = [];
  }

  const copiedParticipants = Array.isArray(sourceDraw.participants)
    ? sourceDraw.participants.map(participant => ({
        ...participant,
        id: Sortick.createId("p")
      }))
    : [];

  const now = new Date().toISOString();
  const baseTitle = `Cópia de ${Sortick.normalizeText(sourceDraw.title) || "sorteio"}`;

  return {
    id: Sortick.createId("draw"),
    title: baseTitle.slice(0, 80),
    type: duplicateType,
    mode: sourceDraw.mode || "simple",
    options: duplicateOptions,
    participants: copiedParticipants,
    result: null,
    createdAt: now,
    updatedAt: now
  };
}

function createDrawFromList(sourceDraw, targetType) {
  const allowedTargetTypes = ["names", "roulette", "groups"];

  if (!allowedTargetTypes.includes(targetType)) return null;

  const participants = Array.isArray(sourceDraw.participants)
    ? sourceDraw.participants
        .map(participant => ({
          id: Sortick.createId("p"),
          name: Sortick.normalizeText(participant.name),
          status: participant.status === "confirmed" ? "confirmed" : "pending"
        }))
        .filter(participant => participant.name)
    : [];

  if (!participants.length) return null;

  const now = new Date().toISOString();
  const targetLabel = Sortick.typeLabel(targetType);
  const title = `${targetLabel} — ${Sortick.normalizeText(sourceDraw.title) || "nova lista"}`.slice(0, 80);

  return {
    id: Sortick.createId("draw"),
    title,
    type: targetType,
    mode: "simple",
    options: defaultOptionsForType(targetType, sourceDraw),
    participants,
    result: null,
    createdAt: now,
    updatedAt: now
  };
}

function closeReuseListDialog() {
  if (!reuseListDialog) return;

  if (typeof reuseListDialog.close === "function" && reuseListDialog.open) {
    reuseListDialog.close();
  } else {
    reuseListDialog.removeAttribute("open");
  }

  drawSelectedForReuse = null;
}

function openReuseListDialog(sourceDraw) {
  if (!reuseListDialog) return;

  drawSelectedForReuse = sourceDraw;
  const participantCount = Array.isArray(sourceDraw.participants) ? sourceDraw.participants.length : 0;

  if (reuseListDescription) {
    reuseListDescription.textContent = `${participantCount} participante(s) serão copiados. O sorteio original continuará sem mudanças.`;
  }

  if (typeof reuseListDialog.showModal === "function") {
    reuseListDialog.showModal();
  } else {
    reuseListDialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (!dialog) return;

  if (typeof dialog.close === "function" && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function resetRenameDialog() {
  drawSelectedForRename = null;

  if (renameDrawInput) {
    renameDrawInput.value = "";
  }

  if (renameDrawError) {
    renameDrawError.textContent = "";
    renameDrawError.classList.add("hidden");
  }
}

function openRenameDrawDialog(sourceDraw) {
  if (!renameDrawDialog || !renameDrawInput) return;

  drawSelectedForRename = sourceDraw;
  renameDrawInput.value = sourceDraw.title || "";

  if (renameDrawError) {
    renameDrawError.textContent = "";
    renameDrawError.classList.add("hidden");
  }

  if (typeof renameDrawDialog.showModal === "function") {
    renameDrawDialog.showModal();
  } else {
    renameDrawDialog.setAttribute("open", "");
  }

  requestAnimationFrame(() => {
    renameDrawInput.focus();
    renameDrawInput.select();
  });
}

function closeRenameDrawDialog() {
  closeDialog(renameDrawDialog);
  resetRenameDialog();
}

function openDeleteDrawDialog(sourceDraw) {
  if (!deleteDrawDialog) return;

  drawSelectedForDeletion = sourceDraw;

  if (deleteDrawDescription) {
    deleteDrawDescription.textContent = `Você está prestes a excluir “${sourceDraw.title}”.`;
  }

  if (typeof deleteDrawDialog.showModal === "function") {
    deleteDrawDialog.showModal();
  } else {
    deleteDrawDialog.setAttribute("open", "");
  }
}

function closeDeleteDrawDialog() {
  closeDialog(deleteDrawDialog);
  drawSelectedForDeletion = null;
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

  return `${participants.length} participante(s)`;
}

function formatSavedDrawDate(savedDraw) {
  try {
    return Sortick.formatDateTime(savedDraw.updatedAt || savedDraw.createdAt);
  } catch {
    return "Data indisponível";
  }
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

    const renameButton = document.createElement("button");
    renameButton.className = "saved-action-button";
    renameButton.type = "button";
    renameButton.textContent = "Renomear";
    renameButton.setAttribute("aria-label", `Renomear sorteio ${savedDraw.title}`);

    renameButton.addEventListener("click", () => {
      openRenameDrawDialog(savedDraw);
    });

    const duplicateButton = document.createElement("button");
    duplicateButton.className = "saved-action-button";
    duplicateButton.type = "button";
    duplicateButton.textContent = "Duplicar";
    duplicateButton.setAttribute("aria-label", `Duplicar sorteio ${savedDraw.title}`);

    duplicateButton.addEventListener("click", () => {
      const duplicate = makeDuplicateDraw(savedDraw);
      Sortick.saveDraw(duplicate);
      window.location.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(duplicate.id)}`;
    });

    const canReuseList = ["names", "roulette", "groups"].includes(savedDraw.type)
      && Array.isArray(savedDraw.participants)
      && savedDraw.participants.length > 0;

    const reuseListButton = document.createElement("button");
    reuseListButton.className = "saved-action-button";
    reuseListButton.type = "button";
    reuseListButton.textContent = "Usar lista";
    reuseListButton.setAttribute("aria-label", `Usar a lista do sorteio ${savedDraw.title} em outro modo`);
    reuseListButton.disabled = !canReuseList;
    reuseListButton.title = canReuseList
      ? "Criar Nomes, Roleta ou Grupos com estes participantes"
      : "Disponível para sorteios por nomes, roletas e grupos com participantes";

    reuseListButton.addEventListener("click", () => {
      if (!canReuseList) return;
      openReuseListDialog(savedDraw);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "saved-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Excluir";
    deleteButton.setAttribute("aria-label", `Excluir sorteio ${savedDraw.title}`);

    deleteButton.addEventListener("click", () => {
      openDeleteDrawDialog(savedDraw);
    });

    actions.append(continueLink, renameButton, duplicateButton, reuseListButton, deleteButton);
    item.append(info, actions);
    savedDrawsList.appendChild(item);
  });
}


if (closeReuseListDialogButton) {
  closeReuseListDialogButton.addEventListener("click", closeReuseListDialog);
}

if (cancelReuseListDialogButton) {
  cancelReuseListDialogButton.addEventListener("click", closeReuseListDialog);
}

if (reuseListDialog) {
  reuseListDialog.addEventListener("click", event => {
    if (event.target === reuseListDialog) {
      closeReuseListDialog();
    }
  });

  reuseListDialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeReuseListDialog();
  });
}

reuseListOptions.forEach(option => {
  option.addEventListener("click", () => {
    if (!drawSelectedForReuse) return;

    const targetType = option.dataset.targetType;
    const newDraw = createDrawFromList(drawSelectedForReuse, targetType);

    if (!newDraw) {
      closeReuseListDialog();
      return;
    }

    Sortick.saveDraw(newDraw);
    window.location.href = `/sortick-teste/sorteio/?id=${encodeURIComponent(newDraw.id)}`;
  });
});

if (closeRenameDrawDialogButton) {
  closeRenameDrawDialogButton.addEventListener("click", closeRenameDrawDialog);
}

if (cancelRenameDrawButton) {
  cancelRenameDrawButton.addEventListener("click", closeRenameDrawDialog);
}

if (renameDrawDialog) {
  renameDrawDialog.addEventListener("click", event => {
    if (event.target === renameDrawDialog) {
      closeRenameDrawDialog();
    }
  });

  renameDrawDialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeRenameDrawDialog();
  });
}

if (renameDrawForm) {
  renameDrawForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!drawSelectedForRename) {
      closeRenameDrawDialog();
      return;
    }

    const nextTitle = Sortick.normalizeText(renameDrawInput.value);

    if (!nextTitle) {
      if (renameDrawError) {
        renameDrawError.textContent = "Digite um nome para o sorteio.";
        renameDrawError.classList.remove("hidden");
      }

      renameDrawInput.focus();
      return;
    }

    const updatedDraw = {
      ...drawSelectedForRename,
      title: nextTitle.slice(0, 80),
      updatedAt: new Date().toISOString()
    };

    Sortick.saveDraw(updatedDraw);
    closeRenameDrawDialog();
    renderSavedDraws();
  });
}

if (closeDeleteDrawDialogButton) {
  closeDeleteDrawDialogButton.addEventListener("click", closeDeleteDrawDialog);
}

if (cancelDeleteDrawButton) {
  cancelDeleteDrawButton.addEventListener("click", closeDeleteDrawDialog);
}

if (deleteDrawDialog) {
  deleteDrawDialog.addEventListener("click", event => {
    if (event.target === deleteDrawDialog) {
      closeDeleteDrawDialog();
    }
  });

  deleteDrawDialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeDeleteDrawDialog();
  });
}

if (confirmDeleteDrawButton) {
  confirmDeleteDrawButton.addEventListener("click", () => {
    if (!drawSelectedForDeletion) {
      closeDeleteDrawDialog();
      return;
    }

    Sortick.deleteDraw(drawSelectedForDeletion.id);
    closeDeleteDrawDialog();
    renderSavedDraws();
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
