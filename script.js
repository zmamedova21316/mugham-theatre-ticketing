/* Baku Mugham Theatre venue data model */
const venue = {
  name: "Baku Mugham Theatre", sections: [
    { id:"parterre", name:"Parterre", price: 60, color:"#e0526b",
      rowLabels:["A", "B", "C", "D"], seatsPerRow: 14, zone:"front" },

    { id:"loge-l", name:"Left Loge", price: 35, color:"#b57edc",
      rowLabels: ["A", "B", "C"], seatsPerRow: 4, zone:"left" },

    { id:"stalls", name:"Mid Stalls", price: 40, color:"#eca73f",
      rowLabels: ["E", "F", "G", "H", "I", "J"], seatsPerRow: 16, zone:"middle" },

    { id:"loge-r", name:"Right Loge", price: 35, color:"#b57edc",
      rowLabels: ["A", "B", "C"], seatsPerRow: 4, zone:"right" },

    { id:"balcony", name:"Balcony", price: 25, color:"#4fb3d9",
      rowLabels: ["K", "L", "M", "N"], seatsPerRow: 18, zone:"back" }
  ],
  // Seat IDs that are already sold -> in this order-> "<sectionId>-<row>-<number>"
  unavailable: [
    "parterre-A-5", "parterre-A-6", "parterre-B-7",
    "stalls-F-8", "stalls-F-9", "stalls-H-3",
    "loge-l-B-2", "loge-r-A-1",
    "balcony-K-10", "balcony-M-4", "balcony-M-5"
  ]
};

/* Application state */
const state = {
  inspectedId: null,   // here seat currently being inspected
  cart: []             // array of seat IDs (week3)
};

const seatIndex = new Map();   






function makeSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section";

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = `${section.name} – ${section.price} AZN`;
  wrapper.appendChild(title);

  section.rowLabels.forEach(rowLabel => {
    const rowEl = document.createElement("div");
    rowEl.className = "row";

    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = rowLabel;
    rowEl.appendChild(label);

    for (let n = 1; n <= section.seatsPerRow; n++) {
      const id = `${section.id}-${rowLabel}-${n}`;
      const seat = { id, section, row: rowLabel, number: n, price: section.price };
      seatIndex.set(id, seat);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seat";
      btn.dataset.id = id;
      btn.style.setProperty("--seat-color", section.color);
      btn.textContent = n;
      btn.setAttribute("aria-label",
        `${section.name}, row ${rowLabel}, seat ${n}, ${section.price} AZN`);

      if (venue.unavailable.includes(id)) {
        btn.classList.add("unavailable");
        btn.disabled = true;
      }
      rowEl.appendChild(btn);
    }
    wrapper.appendChild(rowEl);
  });
  return wrapper;
}
function buildVenue() {
  const hall = document.getElementById("hall");
  hall.innerHTML = "";

  const stage = document.createElement("div");
  stage.className = "stage";
  stage.textContent = "STAGE";
  hall.appendChild(stage);

  const bySection = id => venue.sections.find(s => s.id === id);

  hall.appendChild(makeSection(bySection("parterre")));

  const middle = document.createElement("div");
  middle.className = "middle";
  ["loge-l", "stalls", "loge-r"].forEach(id => middle.appendChild(makeSection(bySection(id))));
  hall.appendChild(middle);

  hall.appendChild(makeSection(bySection("balcony")));
}
function buildPriceLegend() {
  const list = document.getElementById("price-legend");
  // one entry per distinct section name
  venue.sections.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="price-dot" style="background:${s.color}"></span>${s.name}: ${s.price} AZN`;
    list.appendChild(li);
  });
}
function renderVenueSummary() {
  let total = 0;
  seatIndex.forEach(() => total++);
  const sold = venue.unavailable.length;
  document.getElementById("venue-summary").textContent =
    `${total} seats in ${venue.sections.length} zones · ${total - sold} available · ${sold} unavailable`;
}

/* Seat states + inspection */
function isUnavailable(id) { return venue.unavailable.includes(id); }

function updateSeatStates() {
  document.querySelectorAll(".seat[data-id]").forEach(btn => {
    const id = btn.dataset.id;
    if (isUnavailable(id)) return;
    btn.classList.toggle("in-cart", state.cart.includes(id));
    btn.classList.toggle("inspected", state.inspectedId === id);
    btn.setAttribute("aria-pressed", String(state.inspectedId === id));
  });
}
function clearInspection() {
  state.inspectedId = null;
  document.getElementById("seat-details").innerHTML =
    '<p class="muted">Click a seat to see its details.</p>';
  document.getElementById("add-to-cart").disabled = true;
  updateSeatStates();
}
function inspectSeat(id) {
  if (isUnavailable(id)) return;       // here unavailable seats cannot be inspected or added
  if (state.inspectedId === id) {      // here clicking the same seat again deselects it
    clearInspection();
    return;
  }
  state.inspectedId = id;
  const seat = seatIndex.get(id);
  const inCart = state.cart.includes(id);

  document.getElementById("seat-details").innerHTML = `
    <div class="seat-title">
      <span class="price-dot" style="background:${seat.section.color}"></span>
      ${seat.section.name}
    </div>
    <dl class="details-list">
      <dt>Row</dt><dd>${seat.row}</dd>
      <dt>Seat</dt><dd>${seat.number}</dd>
      <dt>Price</dt><dd>${seat.price} AZN</dd>
      <dt>Status</dt>
      <dd><span class="badge ${inCart ? "in-cart" : "free"}">
        ${inCart ? "In your cart" : "Available – not in cart yet"}</span></dd>
    </dl>`;

  // for week 3; this button will call addToCart(); disabled if already in cart
  document.getElementById("add-to-cart").disabled = inCart;
  updateSeatStates();
}
/* Events */
document.getElementById("hall").addEventListener("click", e => {
  const btn = e.target.closest(".seat[data-id]");
  if (btn) inspectSeat(btn.dataset.id);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") clearInspection();
});

buildVenue();
buildPriceLegend();
renderVenueSummary();
updateSeatStates();
