# 🚀 GNCIPL Full Stack Internship — 6 Weeks

This repository contains my work during the **6-week Full Stack Development Internship at GNCIPL**. Each week focuses on building projects that improve frontend, backend, database, and deployment skills.

---

## 📂 Repository Structure

```
root/
├── week01/
│   └── static-e-commerce/
│       ├── index.html
│       ├── styles.css
│       └── scripts.js
├── week02/
│   └── Video-conferencing-app/
│       ├── backend/
│       └── frontend/
├── week03/
│   └── expense-tracker-api/
│       ├── backend/
├── week04/
│   └── .../
├── week05/
│   └── .../
├── week06/
│   └── .../
```

---

## 🗓️ Week-by-week Project Details

#### --------------------------------------------------

### Week 01 — Static E‑Commerce (Static Page)

#### --------------------------------------------------

**Folder:** `week01/static-e-commerce/`

**What I built:**

- A static landing page and basic e-commerce layout using plain HTML, CSS and vanilla JavaScript.
- Files included: `index.html`, `styles.css`, `scripts.js`.

**Key features & learning outcomes:**

- Semantic HTML structure for header, product grid, and footer.
- Responsive layout using CSS Flexbox / Grid and media queries.
- Simple DOM manipulation to simulate adding products to a cart and showing totals (no backend or persistence).
- Basic accessibility considerations (alt tags, proper heading order).

**How to run locally:**

1. Open `week01/static-e-commerce/index.html` in a browser.
2. (Optional) Serve with a simple static server for faster dev workflow: `npx http-server week01/static-e-commerce` or `python -m http.server --directory week01/static-e-commerce 8000`.

#### --------------------------------------------------

### Week 02 — Video Conferencing App

#### --------------------------------------------------

**Folder:** `week02/Video-conferencing-app/`

**What I built:**

- A basic video conferencing application using WebRTC for peer-to-peer media, Socket.IO for signaling, and Peer connections for managing multiple peers.
- Project split into `frontend/` (client UI, getUserMedia, peer connection handling) and `backend/` (Node.js + Express server that hosts signaling via Socket.IO).

**Key features & learning outcomes:**

- Real-time media streaming using `navigator.mediaDevices.getUserMedia`.
- Signaling flow implemented with Socket.IO to exchange SDP offers/answers and ICE candidates.
- Multi-party handling with Peer connection logic (simple room join/leave flows).
- Mute/unmute, camera off/on, and basic UI for video tiles.

**How to run locally:**

1. Start backend: `cd week02/Video-conferencing-app/backend && npm install && node index.js` (or `nodemon`).
2. Start frontend: `cd week02/Video-conferencing-app/frontend && npm install && npm run dev` (or open the static client in a browser if it's plain HTML).
3. Open multiple tabs or share the room URL to test multi-party video.

#### --------------------------------------------------

### Week 03 — Expense Management API (MERN + Cloudinary)

#### --------------------------------------------------

**Folder:** `week03/expense-tracker-api/`

**What I built:**

- A backend API for expense tracking using the MERN stack (MongoDB, Express, React, Node).
- Cloudinary integration for uploading and storing receipt images.
- Postman collection used to test and validate endpoints.

**Key features & learning outcomes:**

- RESTful API with routes for CRUD operations: create expense, read (list & filter), update, and delete expenses.
- User authentication (JWT-based) to secure endpoints (if implemented in backend folder).
- Image uploads handled via Cloudinary (or local fallback) — used `multer` on the server and uploaded to Cloudinary.
- Learned to write and use a Postman collection for systematic API testing and documentation.

**How to run locally:**

1. Install dependencies: `cd week03/expense-tracker-api/backend && npm install`.
2. Create a `.env` with at least:

   ```
   MONGO_URI=<your_mongo_connection_string>
   JWT_SECRET=<your_jwt_secret>
   CLOUDINARY_URL=<your_cloudinary_url>
   ```

3. Start server: `npm run dev` (using nodemon) or `node server.js`.
4. Use Postman to hit endpoints (import the provided Postman collection in the `backend/` folder).

**Notes / Next steps:**

- Add pagination and aggregate endpoints for expense summaries (monthly/yearly totals).
- Add unit and integration tests for endpoints.

#### --------------------------------------------------

### Week 04 — (placeholder)

#### --------------------------------------------------

**Folder:** `week04/` — details to be added.

#### --------------------------------------------------

### Week 05 — (placeholder)

#### --------------------------------------------------

**Folder:** `week05/` — details to be added.

#### --------------------------------------------------

### Week 06 — (placeholder)

#### --------------------------------------------------

**Folder:** `week06/` — details to be added.

---

## ✅ Common scripts & tips

- Use `npm run dev` where available to run with `nodemon`.
- Use environment variables for secrets and database URIs; never commit `.env` to the repo.
- Keep a Postman collection (or OpenAPI spec) for backend APIs for easier testing and handoff.

## ✍️ Notes

- This README will be expanded after weeks 4–6 are completed.
- If you want, I can add sample curl/Postman examples, UIs screenshots, or an OpenAPI spec next.

---

_Made with 💻 during the GNCIPL internship._
