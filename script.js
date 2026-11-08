/* Baku Mugham Theatre – venue data model*/
const venue = {
  name: "Baku Mugham Theatre",
  sections: [
    { id: "parterre", name: "Parterre", price: 60, color: "#ff6fa5",
      rowLabels: ["A", "B", "C", "D"], seatsPerRow: 14, zone: "front" },
 
    { id: "loge-l", name: "Left Loge", price: 35, color: "#b79cf0",
      rowLabels: ["A", "B", "C"], seatsPerRow: 4, zone: "left" },
 
    { id: "stalls", name: "Mid Stalls", price: 40, color: "#ffb48a",
      rowLabels: ["E", "F", "G", "H", "I", "J"], seatsPerRow: 16, zone: "middle" },
 
    { id: "loge-r", name: "Right Loge", price: 35, color: "#b79cf0",
      rowLabels: ["A", "B", "C"], seatsPerRow: 4, zone: "right" },
 
    { id: "balcony", name: "Balcony", price: 25, color: "#7fd6c9",
      rowLabels: ["K", "L", "M", "N"], seatsPerRow: 18, zone: "back" }
  ],
  unavailable: [
    "parterre-A-5", "parterre-A-6", "parterre-B-7",
    "stalls-F-8", "stalls-F-9", "stalls-H-3",
    "loge-l-B-2", "loge-r-A-1",
    "balcony-K-10", "balcony-M-4", "balcony-M-5"
  ]
};
 
/*Application state*/
const state = {
  inspectedId: null,   
  cart: []            
};
 
const seatIndex = new Map();   
 
/*Generation of the venue from data*/
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
 
/*Seat states + inspection*/
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
  if (isUnavailable(id)) return;       
  if (state.inspectedId === id) {      
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

  document.getElementById("add-to-cart").disabled = inCart;
  updateSeatStates();
}
 
/*Cart: add/remove/render and localStorage*/
const CART_KEY = "mughamTheatreCart";
 
function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  } catch (err) {
    console.warn("Could not save the cart:", err);
  }
}
 
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(saved)) return;
    
    state.cart = saved.filter((id, i) =>
      typeof id === "string" &&
      seatIndex.has(id) &&
      !isUnavailable(id) &&
      saved.indexOf(id) === i);
  } catch (err) {
    state.cart = [];
  }
}
 
function addToCart() {
  const id = state.inspectedId;
  if (!id || isUnavailable(id) || state.cart.includes(id)) return;//no duplicates
  state.cart.push(id);
  saveCart();
  renderCart();
  state.inspectedId = null;   
  inspectSeat(id);
}
 
function removeFromCart(id) {
  state.cart = state.cart.filter(cartId => cartId !== id);
  saveCart();
  renderCart();
  if (state.inspectedId === id) {
    state.inspectedId = null;
    inspectSeat(id);          
  } else {
    updateSeatStates();       
}
}
 
function renderCart() {
  const list = document.getElementById("cart-list");
  list.innerHTML = "";
  let total = 0;
 
  if (state.cart.length === 0) {
    list.innerHTML = '<li class="muted">Your cart is empty.</li>';
  }
 
  state.cart.forEach(id => {
    const seat = seatIndex.get(id);
    total += seat.price;
 
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span>${seat.section.name}<br><small>Row ${seat.row}, Seat ${seat.number}</small></span>
      <span class="cart-price">${seat.price} AZN</span>`;
 
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "remove-btn";
    btn.dataset.remove = id;
    btn.textContent = "Remove";
    btn.setAttribute("aria-label",
      `Remove ${seat.section.name}, row ${seat.row}, seat ${seat.number}`);
    li.appendChild(btn);
    list.appendChild(li);
  });
 
  document.getElementById("cart-total").textContent = total;
}

/*Map navigation:zoom,move,reset*/
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.2;
const MOVE_STEP = 60;  
const KEEP_VISIBLE = 100;
 
const viewportEl = document.getElementById("viewport");
const hallEl = document.getElementById("hall");
const view = { x: 0, y: 0, zoom: 1 };
 
function clampView() {
  const w = hallEl.offsetWidth * view.zoom;
  const h = hallEl.offsetHeight * view.zoom;
  view.x = Math.min(viewportEl.clientWidth - KEEP_VISIBLE, Math.max(KEEP_VISIBLE - w, view.x));
  view.y = Math.min(viewportEl.clientHeight - KEEP_VISIBLE, Math.max(KEEP_VISIBLE - h, view.y));
}
 
function applyView() {
  clampView();
  hallEl.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
}
 
function zoomAt(newZoom, px, py) {
  newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));
  const ratio = newZoom / view.zoom;
  view.x = px - (px - view.x) * ratio;
  view.y = py - (py - view.y) * ratio;
  view.zoom = newZoom;
  applyView();
}
 
function setZoom(newZoom) {
  zoomAt(newZoom, viewportEl.clientWidth / 2, viewportEl.clientHeight / 2);
}
 
function moveBy(dx, dy) {
  view.x += dx;
  view.y += dy;
  applyView();
}
 
function resetView() {
  const vw = viewportEl.clientWidth;
  const fit = (vw - 24) / hallEl.offsetWidth;          
  view.zoom = Math.max(ZOOM_MIN, Math.min(1, fit));
  view.x = (vw - hallEl.offsetWidth * view.zoom) / 2;  
  view.y = 10;
  applyView();
}
 
/*Events*/
document.getElementById("hall").addEventListener("click", e => {
  const btn = e.target.closest(".seat[data-id]");
  if (btn) inspectSeat(btn.dataset.id);
});
 
document.addEventListener("keydown", e => {
  if (e.key === "Escape") clearInspection();
});
 
document.getElementById("add-to-cart").addEventListener("click", addToCart);
 
document.getElementById("cart-list").addEventListener("click", e => {
  const btn = e.target.closest("[data-remove]");
  if (btn) removeFromCart(btn.dataset.remove);
});
 

document.getElementById("map-controls").addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  switch (btn.dataset.action) {
    case "zoom-in":  setZoom(view.zoom + ZOOM_STEP); break;
    case "zoom-out": setZoom(view.zoom - ZOOM_STEP); break;
    case "up":       moveBy(0, MOVE_STEP); break;
    case "down":     moveBy(0, -MOVE_STEP); break;
    case "left":     moveBy(MOVE_STEP, 0); break;
    case "right":    moveBy(-MOVE_STEP, 0); break;
    case "reset":    resetView(); break;
  }
});
 
window.addEventListener("resize", applyView);
 
/*Bonus*/
const DRAG_THRESHOLD = 5;     
const WHEEL_FACTOR = 1.1;      
let drag = null;              
let justDragged = false;      

viewportEl.addEventListener("wheel", e => {
  e.preventDefault();// stop the page from scrolling while zooming map
  const rect = viewportEl.getBoundingClientRect();
  const px = e.clientX - rect.left - viewportEl.clientLeft;
  const py = e.clientY - rect.top - viewportEl.clientTop;
  const factor = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR;
  zoomAt(view.zoom * factor, px, py);
}, { passive: false });
 


viewportEl.addEventListener("pointerdown", e => {
  if (e.pointerType !== "mouse" || e.button !== 0) return;//touch keeps normal scrolling
  drag = { startX: e.clientX, startY: e.clientY, viewX: view.x, viewY: view.y, moved: false };
});
 
window.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;
  if (!drag.moved) {
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;//still just a click
    drag.moved = true;
    viewportEl.classList.add("dragging");
  }
  view.x = drag.viewX + dx;
  view.y = drag.viewY + dy;
  applyView();
});
 
function endDrag() {
  if (!drag) return;
  if (drag.moved) {
    justDragged = true;                       
    setTimeout(() => { justDragged = false; }, 0);
  }
  drag = null;
  viewportEl.classList.remove("dragging");
}
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);
 


viewportEl.addEventListener("click", e => {
  if (justDragged) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);
 
/*Init*/
buildVenue();
buildPriceLegend();
renderVenueSummary();
loadCart();//restore cart from localStorage
renderCart();
updateSeatStates();//restore matching seat states on the map
resetView(); 