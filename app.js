const defaults = {
  note: "glow",
  rank: "classic",
  keyMode: "4",
  noteColor: "#b8a0ff",
  accentColor: "#8b75ff",
  rankColor: "#ff79b9",
  motion: true,
};

const state = { ...defaults, assets: { note: null, ranking: null, background: null } };
const playfield = document.querySelector("#playfield");
const lanes = document.querySelector("#lanes");
const toast = document.querySelector("#toast");
let toastTimeout;

function updateColor(id, cssProperty) {
  const input = document.querySelector(`#${id}`);
  const color = input.value.toLowerCase();
  const key = id.replace("-color", "Color").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  state[key] = color;
  document.documentElement.style.setProperty(cssProperty, color);
  document.querySelector(`#${id}-swatch`).style.backgroundColor = color;
  document.querySelector(`#${id}-value`).textContent = color.toUpperCase();
}

function setSelection(selector, selected, attribute, value) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = button.dataset[attribute] === value;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
  playfield.dataset[selected] = value;
}

function renderLanes(mode) {
  const keys = mode === "7" ? ["S", "D", "F", "Space", "J", "K", "L"] : ["D", "F", "J", "K"];
  lanes.classList.toggle("mode-seven", mode === "7");
  const fragment = document.createDocumentFragment();
  keys.forEach((key, index) => {
    const lane = document.createElement("div");
    lane.className = `lane${index % 2 === 1 ? " lane-alt" : ""}`;
    lane.setAttribute("aria-hidden", "true");
    const line = document.createElement("div");
    line.className = "lane-line";
    const label = document.createElement("span");
    label.className = "key-label";
    label.textContent = key;
    lane.append(line, label);
    ["note-one", "note-two", "note-three"].forEach((noteClass, noteIndex) => {
      const note = document.createElement("div");
      note.className = `falling-note ${noteClass}`;
      note.style.animationDelay = `${-((index * 0.41 + noteIndex * 0.73) % 2.5)}s`;
      lane.append(note);
    });
    fragment.append(lane);
  });
  lanes.replaceChildren(fragment);
}

renderLanes(state.keyMode);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".settings-panel").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab.dataset.tab;
    });
  });
});

document.querySelectorAll("[data-note]").forEach((button) => {
  button.addEventListener("click", () => {
    state.note = button.dataset.note;
    setSelection(".note-options [data-note]", "note", "note", state.note);
    if (state.note !== "custom") {
      state.assets.note = null;
      updateAssetControls("note");
    }
  });
});

document.querySelectorAll("[data-rank]").forEach((button) => {
  button.addEventListener("click", () => {
    state.rank = button.dataset.rank;
    setSelection(".rank-options [data-rank]", "ranking", "rank", state.rank);
    if (state.rank !== "custom") {
      state.assets.ranking = null;
      updateAssetControls("ranking");
    }
  });
});

document.querySelector("#note-color").addEventListener("input", () => updateColor("note-color", "--note-color"));
document.querySelector("#accent-color").addEventListener("input", () => updateColor("accent-color", "--accent-color"));
document.querySelector("#rank-color").addEventListener("input", () => updateColor("rank-color", "--rank-color"));

document.querySelector("#key-mode").addEventListener("change", (event) => {
  state.keyMode = event.target.value;
  playfield.dataset.mode = state.keyMode;
  renderLanes(state.keyMode);
  lanes.setAttribute("aria-label", `${state.keyMode} pistas de osu!mania`);
  document.querySelector("#preview-mode").lastChild.textContent = ` ${state.keyMode}K`;
});

document.querySelector("#motion-toggle").addEventListener("change", (event) => {
  state.motion = event.target.checked;
  playfield.classList.toggle("motion-off", !state.motion);
});

function updateAssetControls(type) {
  const inputId = type === "ranking" ? "ranking-upload" : `${type}-upload`;
  const input = document.querySelector(`#${inputId}`);
  const label = document.querySelector(`#${inputId}-label`);
  const clearButton = document.querySelector(`[data-clear="${type}"]`);
  label.firstChild.textContent = state.assets[type] ? "Alterar " : "Adicionar ";
  clearButton.hidden = !state.assets[type];
  if (!state.assets[type]) input.value = "";
}

function readAsset(input, type) {
  const file = input.files?.[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    showToast("Escolha uma imagem PNG, JPG ou WebP.");
    input.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("A imagem precisa ter no máximo 5 MB.");
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result !== "string") {
      showToast("Não foi possível carregar essa imagem.");
      return;
    }
    state.assets[type] = reader.result;
    if (type === "note") {
      state.note = "custom";
      playfield.dataset.note = "custom";
      playfield.style.setProperty("--custom-note", `url("${reader.result}")`);
    } else if (type === "ranking") {
      state.rank = "custom";
      playfield.dataset.ranking = "custom";
      playfield.style.setProperty("--custom-ranking", `url("${reader.result}")`);
    } else {
      document.querySelector("#game-background").style.backgroundImage = `linear-gradient(rgba(12, 12, 18, .45), rgba(12, 12, 18, .45)), url("${reader.result}")`;
    }
    if (type !== "background") {
      const selector = type === "ranking" ? ".rank-options [data-rank]" : ".note-options [data-note]";
      const dataAttribute = type === "ranking" ? "rank" : "note";
      document.querySelectorAll(selector).forEach((button) => {
        button.classList.remove("is-selected");
        button.setAttribute("aria-pressed", "false");
      });
    }
    updateAssetControls(type);
    showToast(`“${file.name}” aplicada à prévia.`);
  });
  reader.addEventListener("error", () => showToast("Não foi possível ler essa imagem."));
  reader.readAsDataURL(file);
}

document.querySelector("#note-upload").addEventListener("change", (event) => readAsset(event.currentTarget, "note"));
document.querySelector("#ranking-upload").addEventListener("change", (event) => readAsset(event.currentTarget, "ranking"));
document.querySelector("#background-upload").addEventListener("change", (event) => readAsset(event.currentTarget, "background"));

document.querySelectorAll("[data-clear]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.clear;
    state.assets[type] = null;
    if (type === "note") {
      state.note = defaults.note;
      playfield.dataset.note = defaults.note;
      playfield.style.removeProperty("--custom-note");
      setSelection(".note-options [data-note]", "note", "note", defaults.note);
    } else if (type === "ranking") {
      state.rank = defaults.rank;
      playfield.dataset.ranking = defaults.rank;
      playfield.style.removeProperty("--custom-ranking");
      setSelection(".rank-options [data-rank]", "ranking", "rank", defaults.rank);
    } else {
      document.querySelector("#game-background").style.removeProperty("background-image");
    }
    updateAssetControls(type);
  });
});

document.querySelector("#reset-button").addEventListener("click", () => {
  Object.assign(state, defaults, { assets: { note: null, ranking: null, background: null } });
  document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== "notes"; });
  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.tab === "notes";
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  state.note = defaults.note;
  state.rank = defaults.rank;
  setSelection(".note-options [data-note]", "note", "note", defaults.note);
  setSelection(".rank-options [data-rank]", "ranking", "rank", defaults.rank);
  document.querySelector("#note-color").value = defaults.noteColor;
  document.querySelector("#accent-color").value = defaults.accentColor;
  document.querySelector("#rank-color").value = defaults.rankColor;
  updateColor("note-color", "--note-color");
  updateColor("accent-color", "--accent-color");
  updateColor("rank-color", "--rank-color");
  document.querySelector("#key-mode").value = defaults.keyMode;
  document.querySelector("#motion-toggle").checked = defaults.motion;
  playfield.dataset.mode = defaults.keyMode;
  playfield.classList.remove("motion-off");
  renderLanes(defaults.keyMode);
  lanes.setAttribute("aria-label", "4 pistas de osu!mania");
  document.querySelector("#preview-mode").lastChild.textContent = " 4K";
  document.querySelector("#game-background").style.removeProperty("background-image");
  playfield.style.removeProperty("--custom-note");
  playfield.style.removeProperty("--custom-ranking");
  ["note", "ranking", "background"].forEach(updateAssetControls);
  showToast("Tudo restaurado às opções originais.");
});

document.querySelector("#export-button").addEventListener("click", () => {
  const skin = {
    name: "Minha skin Skinlab",
    gameMode: "osu!mania",
    exportedAt: new Date().toISOString(),
    settings: {
      noteStyle: state.assets.note ? "custom" : state.note,
      noteColor: state.noteColor,
      keyMode: Number(state.keyMode),
      accentColor: state.accentColor,
      rankingStyle: state.assets.ranking ? "custom" : state.rank,
      rankingColor: state.rankColor,
      motion: state.motion,
    },
    assets: state.assets,
  };
  const blob = new Blob([JSON.stringify(skin, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "minha-skin-skinlab.json";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Configuração da skin exportada em JSON.");
});
