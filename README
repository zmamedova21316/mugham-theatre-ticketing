# Baku Mugham Theatre – Interactive Venue Ticketing System

Front-end ticket-selection website for a theatre venue, built with plain HTML, CSS and JavaScript.

## How to run
Open `index.html` in any browser. No installation or build step is needed.

## Venue
**Type:** auditorium / theatre

| Zone | Rows | Seats per row | Seats | Price |
|---|---|---|---|---|
| Parterre (front) | 4 | 14 | 56 | 60 AZN |
| Left Loge | 3 | 4 | 12 | 35 AZN |
| Mid Stalls | 6 | 16 | 96 | 40 AZN |
| Right Loge | 3 | 4 | 12 | 35 AZN |
| Balcony (back) | 4 | 18 | 72 | 25 AZN |

Total: 248 seats, 11 of them unavailable (already sold).

## Features
- Venue map generated from a JavaScript data model (no copy-pasted seat HTML)
- Every seat is a `<button>` with an accessible label
- Seat states: available, inspected, in cart, unavailable
- Clicking a seat only inspects it (details and price); the cart changes only with **ADD TO CART**
- Duplicate prevention, ticket removal and total price
- Map and cart stay synchronized
- Cart saved in `localStorage` and restored together with the seat states after a refresh
- Map controls: Zoom In, Zoom Out, Move Up / Down / Left / Right, Reset / Center View, with sensible limits
- Responsive layout for desktop, tablet and phone

## How it works
- `venue` (in `script.js`) describes zones, row labels, seats per row, prices, colors and unavailable seats.
- `makeSection()` loops over rows and seat numbers and creates one button per seat with an ID like `stalls-F-8`.
- The cart is an array of seat IDs in `state.cart`. It is saved with `localStorage` on every change and validated when it is loaded.
- The map is moved and zoomed with a CSS `transform` (`translate` + `scale`) driven by the `view` object.

## Files
- `index.html` – page structure
- `style.css` – styling and responsive rules
- `script.js` – data model, seat generation, cart, storage and map navigation
