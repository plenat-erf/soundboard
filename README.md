# Soundboard — GitHub Pages Edition (Static)

This repo is **ready for GitHub Pages**. It serves a static soundboard with no backend.

## Files
- `index.html`, `app.js`, `styles.css` — the app (mobile-first, responsive UI)
- `sounds/` — put your audio files here (`.mp3`, `.wav`, `.ogg`)
- `sounds.json` — manifest of filenames inside `sounds/`
- `.github/workflows/update-sounds-manifest.yml` — optional workflow to regenerate `sounds.json` whenever `sounds/` changes

## Quick start (local preview)
Open `index.html` in a browser. For strict browsers, you can use a tiny static server:
```bash
python3 -m http.server 8080
# then visit http://localhost:8080/
```

## Deploy to GitHub Pages
1. Create a **new GitHub repository** and upload these files (keep the folder structure).
2. Go to **Settings → Pages**:
   - **Source**: *Deploy from a branch*
   - **Branch**: `main` and **Folder**: `/ (root)` (or choose `/docs` if you move files there)
3. Save. Wait for the deploy to finish. Your site will be at
   `https://<your-username>.github.io/<your-repo>/`.
4. On first load (especially on mobile), tap **Enable Audio** once to satisfy autoplay rules.

### Adding/Removing sounds
- Put files in `sounds/` and update `sounds.json` with the list of filenames (relative, no paths).
- OR enable the included GitHub Action which will update `sounds.json` automatically on pushes that modify `sounds/`.

### Tips
- Keep filenames simple (letters, numbers, hyphens). The app handles encoding, but simplicity avoids typos.
- For faster loads, prefer `.mp3`. Large WAVs will work but are heavier.
- To bust cache after replacing a file, rename it and update `sounds.json`.
