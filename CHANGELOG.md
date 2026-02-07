# Changelog - DenunZIA

## [v2.0.0-beta] - 2026-02-07
### 🎨 UI & UX Improvements (Redesign)
- **New Light Theme**: Implemented a modern, cleaner interface using sky blue gradients and white cards with purple accents (`#7c3aed`).
- **Splash Screen**: Added a 3-second animated splash screen on initial load.
- **Security Gateway**: Complete redesign with clearer "Welcome" messaging and distinct action buttons.
- **Dashboard**: Updated map visualization and statistics panel to match the new design language.
- **Admin Panel**: Login screen updated to light theme; secure dark mode retained for the internal dashboard.
- **Page Transitions**: Added smooth fade-in and slide-up animations between routes.
- **Responsive Design**: Enhanced mobile compatibility across all key components.

### 🗺️ Map & Geocoding Features
- **Backend Geocoding Proxy**: Implemented `/api/geocode/reverse` and `/api/geocode/search` endpoints in the backend server.
  - *Benefit*: Bypasses browser CORS restrictions when accessing OpenStreetMap/Nominatim APIs.
  - *Benefit*: Centralizes geocoding logic and allows for server-side caching or rate limiting in the future.
- **Mexico-Specific Addressing**: Enhanced address parsing logic to better detect:
  - **Colonias**: Scans `suburb`, `neighbourhood`, `hamlet`, etc.
  - **Postal Codes**: Automatically appends CP to the colony field (e.g., "Colonia Centro C.P. 06000").
  - **Alcaldías (CDMX)**: Added support for detection via `borough` field.
- **Map Interaction Fix**: Changed LeafletMap mode from `view` to `input` for the reporting form, enabling proper click-to-select functionality.

### 📝 Report Form
- **Multi-step Flow**: Restructured into a clean 2-step process (Location/Role -> Details/Evidence).
- **File Upload**: Added Drag & Drop zone with file previews (images, PDF icons).
- **CAPTCHA**: Re-integrated ReCAPTCHA validation step.
- **Navigation Fix**: The "HAZ TU DENUNCIA" button now correctly routes to `/denunciar` instead of the dashboard.

### 🔒 Security & Performance
- **Leaflet Optimizations**: Implemented `React.memo`, `useCallback`, and `useMemo` to prevent unnecessary map re-renders.
- **Environment Configuration**: Updated `.env.local` to point to the local backend proxy (`http://localhost:3001`) during development.

### 🐛 Bug Fixes
- **Address Duplication**: Fixed an issue where "City" name was appearing in both the Colony and Municipality fields.
- **CORS Errors**: Resolved "Failed to fetch" errors from OpenStreetMap by routing requests through the new backend proxy.

---

## Deployment Notes 🚀

When deploying to production (e.g., Render, Vercel):

1. **Environment Variables**:
   - Ensure `VITE_API_URL` points to the **production backend URL** (e.g., `https://denunzia-v1.onrender.com`), NOT `localhost`.
   
2. **Backend**:
   - The backend server must be running to handle geocoding requests (`/api/geocode/*`).

3. **Branch**:
   - Deploy from branch: `feature/design-v2`
