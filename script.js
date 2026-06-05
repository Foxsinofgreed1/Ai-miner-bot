import { lineages } from "./lineages.js";

const searchInput = document.querySelector("#search");
const resetButton = document.querySelector("#reset");
const counts = document.querySelector("#counts");
const grid = document.querySelector("#grid");
const details = document.querySelector("#details");

const cardTemplate = document.querySelector("#card-template");
const pillTemplate = document.querySelector("#pill-template");

let activeRoot = null;

const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

const renderDetails = (root, descendants) => {
  if (!root) {
    details.classList.remove("is-visible");
    details.textContent = "";
    return;
  }

  details.innerHTML = `
    <strong>${root}</strong>
    <span>→ ${formatter.format(descendants)}</span>
  `;
  details.classList.add("is-visible");
};

const clearActivePills = () => {
  grid.querySelectorAll(".pill.is-active").forEach((pill) => pill.classList.remove("is-active"));
};

const createCard = ({ root, descendants }) => {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const title = card.querySelector(".card__root");
  const container = card.querySelector(".card__descendants");

  title.textContent = root;

  const activate = () => {
    activeRoot = root;
    renderDetails(root, descendants);
    clearActivePills();
    card.querySelectorAll(".pill").forEach((pill) => pill.classList.add("is-active"));
  };

  card.addEventListener("click", (event) => {
    // avoid double handling when pills are clicked (handled below)
    if (event.target.classList.contains("pill")) {
      return;
    }
    activate();
  });

  descendants.forEach((desc) => {
    const pill = pillTemplate.content.firstElementChild.cloneNode(true);
    pill.textContent = desc;
    pill.title = `${root} → ${desc}`;
    pill.addEventListener("click", (event) => {
      event.stopPropagation();
      activeRoot = root;
      clearActivePills();
      pill.classList.add("is-active");
      renderDetails(root, descendants);
    });
    container.appendChild(pill);
  });

  return card;
};

const renderGrid = (data) => {
  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  data.forEach((entry) => fragment.appendChild(createCard(entry)));
  grid.appendChild(fragment);
  counts.textContent = `Showing ${data.length} of ${lineages.length} lineages`;
};

const filterLineages = (term) => {
  const query = term.trim().toLowerCase();
  if (!query) {
    return lineages;
  }
  return lineages.filter(({ root, descendants }) => {
    if (root.toLowerCase().includes(query)) {
      return true;
    }
    return descendants.some((desc) => desc.toLowerCase().includes(query));
  });
};

searchInput.addEventListener("input", (event) => {
  const value = event.target.value;
  const filtered = filterLineages(value);
  renderGrid(filtered);
  renderDetails(null);
});

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  renderGrid(lineages);
  renderDetails(null);
  clearActivePills();
  searchInput.focus({ preventScroll: true });
});

// initial render
renderGrid(lineages);
renderDetails(null);
