const tierSelect = document.getElementById("ticket-tier");
const qtyInput = document.getElementById("ticket-qty");
const totalEl = document.getElementById("ticket-total");
const form = document.getElementById("ticket-form");
const messageEl = document.getElementById("checkout-message");
const qtyDownBtn = document.getElementById("qty-down");
const qtyUpBtn = document.getElementById("qty-up");

const soldCountEl = document.getElementById("sold-count");
const soldProgressEl = document.getElementById("sold-progress");
const purchaseFeedEl = document.getElementById("purchase-feed");

const serviceFee = 7;
const seatCapacity = 1400;
let soldSeats = Number(soldCountEl?.textContent || 742);

const buyerNames = [
  "Maya",
  "Jon",
  "Lina",
  "Omar",
  "Paula",
  "Theo",
  "Nora",
  "Ivan",
  "Zoe",
  "Milan",
];

const buyerCities = [
  "Vienna",
  "Berlin",
  "Prague",
  "Zurich",
  "Munich",
  "Amsterdam",
  "Hamburg",
  "Copenhagen",
];

const saleTiers = [
  { name: "Standard", maxQty: 4 },
  { name: "Business", maxQty: 3 },
  { name: "Premium", maxQty: 2 },
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clampQty = (qty) => Math.max(1, Math.min(8, qty));
const money = (value) => `$${value.toFixed(2)}`;

const parseTierValue = () => {
  const [tierName, priceStr] = (tierSelect?.value || "Standard|59").split("|");
  return {
    tierName,
    price: Number(priceStr || 0),
  };
};

const setActiveCard = (tierName) => {
  document.querySelectorAll(".ticket-card").forEach((card) => {
    const isActive = card.getAttribute("data-tier") === tierName;
    card.classList.toggle("is-active", isActive);
  });
};

const updateTotal = () => {
  if (!qtyInput || !totalEl) return;

  const qty = clampQty(Number(qtyInput.value || 1));
  qtyInput.value = String(qty);

  const { price, tierName } = parseTierValue();
  const total = price * qty + serviceFee;
  totalEl.textContent = money(total);
  setActiveCard(tierName);
};

const setTierFromCard = (tierName) => {
  if (!tierSelect) return;

  for (const option of tierSelect.options) {
    if (option.value.startsWith(`${tierName}|`)) {
      option.selected = true;
      break;
    }
  }

  updateTotal();
  document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const wireTicketButtons = () => {
  document.querySelectorAll(".ticket-card").forEach((card) => {
    const button = card.querySelector(".choose-ticket");
    if (!button) return;

    button.addEventListener("click", () => {
      const tierName = card.getAttribute("data-tier") || "Standard";
      setTierFromCard(tierName);
    });
  });
};

const wireQuantityControls = () => {
  if (!qtyInput) return;

  qtyDownBtn?.addEventListener("click", () => {
    qtyInput.value = String(clampQty(Number(qtyInput.value || 1) - 1));
    updateTotal();
  });

  qtyUpBtn?.addEventListener("click", () => {
    qtyInput.value = String(clampQty(Number(qtyInput.value || 1) + 1));
    updateTotal();
  });

  qtyInput.addEventListener("input", () => {
    qtyInput.value = String(clampQty(Number(qtyInput.value || 1)));
    updateTotal();
  });
};

const wireForm = () => {
  if (!form || !tierSelect || !qtyInput || !messageEl) return;

  tierSelect.addEventListener("change", updateTotal);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = (document.getElementById("ticket-email")?.value || "").trim();
    if (!email) {
      messageEl.textContent = "Add an email so we know where to send your questionable life choices.";
      return;
    }

    const { tierName } = parseTierValue();
    const qty = clampQty(Number(qtyInput.value || 1));
    messageEl.textContent = `${qty} ${tierName} ticket(s) reserved for ${email}. See you in the camera zone.`;
  });
};

const updateSalesUI = () => {
  if (!soldCountEl || !soldProgressEl) return;

  const safeSold = Math.max(0, Math.min(seatCapacity, soldSeats));
  const pct = (safeSold / seatCapacity) * 100;
  soldCountEl.textContent = String(safeSold);
  soldProgressEl.style.width = `${pct.toFixed(1)}%`;
  soldProgressEl.parentElement?.setAttribute("aria-valuenow", String(safeSold));
};

const pushPurchase = (qty, tierName) => {
  if (!purchaseFeedEl) return;

  const row = document.createElement("li");
  row.innerHTML = `<span>${rand(buyerNames)}, ${rand(buyerCities)}</span><strong>${qty} x ${tierName}</strong>`;
  purchaseFeedEl.prepend(row);

  while (purchaseFeedEl.children.length > 6) {
    purchaseFeedEl.removeChild(purchaseFeedEl.lastElementChild);
  }
};

const simulateSale = () => {
  if (soldSeats >= seatCapacity) return;

  const pickedTier = rand(saleTiers);
  const qty = Math.floor(Math.random() * pickedTier.maxQty) + 1;

  soldSeats = Math.min(seatCapacity, soldSeats + qty);
  pushPurchase(qty, pickedTier.name);
  updateSalesUI();
};

const scheduleNextSale = () => {
  if (soldSeats >= seatCapacity) return;
  simulateSale();

  const nextDelay = Math.floor(Math.random() * 2600) + 2200;
  window.setTimeout(scheduleNextSale, nextDelay);
};

updateTotal();
wireTicketButtons();
wireQuantityControls();
wireForm();
updateSalesUI();
window.setTimeout(scheduleNextSale, 2600);
