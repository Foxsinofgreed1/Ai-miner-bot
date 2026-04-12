const SAMPLE_LINEAGES = [
  "Ada = SPARK → VHDL → Eiffel → GNAT → Ravenscar",
  "C = C++ → Objective-C → C# → D → Rust → Zig → Go → V → Nim",
  "JavaScript = TypeScript → JSX → ReScript → Elm → Svelte → Astro",
  "Python = Ruby → Julia → Mojo → Coconut → PyPy → MicroPython → RustPython",
  "Rust = Zig → V → Odin → Carbon → Mojo → Vale",
];

const sourceInput = document.getElementById("sourceInput");
const loadButton = document.getElementById("loadButton");
const resetButton = document.getElementById("resetButton");
const searchInput = document.getElementById("searchInput");
const grid = document.getElementById("grid");
const details = document.getElementById("details");
const letterFilters = document.getElementById("letterFilters");

let lineages = [];
let activeLetter = "all";
let activeIndex = null;
let searchTerm = "";

function normalizeLine(line) {
  return line
    .replace(/^[\s\u2705\u26a1\u2728\u2728\u1f4a0\u1f5a4]+/u, "")
    .trim();
}

function parseLineages(rawText) {
  return rawText
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter((line) => line.includes("="))
    .map((line) => {
      const [root, rest] = line.split("=").map((part) => part.trim());
      const chain = rest
        ? rest.split("→").map((part) => part.trim()).filter(Boolean)
        : [];
      return {
        root,
        chain,
        full: `${root} = ${chain.join(" → ")}`,
      };
    });
}

function buildLetterFilters() {
  const letters = ["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
  letterFilters.innerHTML = "";

  letters.forEach((letter) => {
    const chip = document.createElement("button");
    chip.className = "filter-chip";
    chip.type = "button";
    chip.textContent = letter.toUpperCase();
    chip.dataset.letter = letter;
    chip.addEventListener("click", () => {
      activeLetter = letter;
      render();
    });
    letterFilters.appendChild(chip);
  });
}

function updateFilterState() {
  [...letterFilters.children].forEach((chip) => {
    chip.classList.toggle(
      "is-active",
      chip.dataset.letter === activeLetter
    );
  });
}

function filterLineages() {
  return lineages.filter((lineage) => {
    const matchesLetter =
      activeLetter === "all" ||
      lineage.root.toLowerCase().startsWith(activeLetter);
    const matchesSearch = lineage.full
      .toLowerCase()
      .includes(searchTerm);
    return matchesLetter && matchesSearch;
  });
}

function renderGrid(items) {
  grid.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No lineages match your filters.";
    grid.appendChild(empty);
    return;
  }

  items.forEach((lineage, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.innerHTML = `
      <div class="tile__title">${lineage.root}</div>
      <div class="tile__count">${lineage.chain.length} descendants</div>
      <div class="tile__preview">${lineage.chain.slice(0, 3).join(" → ")}${
        lineage.chain.length > 3 ? " …" : ""
      }</div>
    `;
    tile.addEventListener("click", () => {
      activeIndex = index;
      renderDetails(lineage);
    });
    grid.appendChild(tile);
  });
}

function renderDetails(lineage) {
  details.innerHTML = `
    <h2 class="details__title">${lineage.root}</h2>
    <p class="details__text">${lineage.chain.length} descendants</p>
    <div class="chain"></div>
  `;

  const chain = details.querySelector(".chain");
  const nodes = [lineage.root, ...lineage.chain];
  nodes.forEach((node, index) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "chain__node";
    tag.textContent = node;
    tag.addEventListener("click", () => {
      [...chain.children].forEach((child) =>
        child.classList.remove("is-active")
      );
      tag.classList.add("is-active");
    });
    if (index === 0) {
      tag.classList.add("is-active");
    }
    chain.appendChild(tag);
  });
}

function render() {
  updateFilterState();
  const filtered = filterLineages();
  renderGrid(filtered);
}

function loadFromInput() {
  const raw = sourceInput.value.trim();
  lineages = raw ? parseLineages(raw) : [...SAMPLE_LINEAGES].map((line) => {
    const [root, rest] = line.split("=").map((part) => part.trim());
    const chain = rest.split("→").map((part) => part.trim());
    return { root, chain, full: `${root} = ${chain.join(" → ")}` };
  });
  activeIndex = null;
  render();
}

function resetAll() {
  sourceInput.value = SAMPLE_LINEAGES.join("\n");
  searchInput.value = "";
  searchTerm = "";
  activeLetter = "all";
  activeIndex = null;
  loadFromInput();
  details.innerHTML = `
    <h2 class="details__title">Select a lineage</h2>
    <p class="details__text">
      Click any tile to preview the full chain with clickable nodes.
    </p>
  `;
}

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});

loadButton.addEventListener("click", loadFromInput);
resetButton.addEventListener("click", resetAll);

buildLetterFilters();
resetAll();
