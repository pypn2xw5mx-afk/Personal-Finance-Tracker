# Finance Tracker — Web (iOS-style)

This is a minimal, browser-based finance tracker designed to look and feel like an iOS app. It uses `localStorage` for persistence and works without a server.

Quick start

1. Open `index.html` in your browser (double-click or drag into the browser).
2. Click **+ Add** or press `n` to create a transaction.
3. Transactions persist in your browser `localStorage` under the key `ft_transactions_v1`.

Notes & next steps

- This is a starter scaffold: next steps include charts, CSV import/export, account support, and optional server-sync.
- To serve with a simple local server (recommended for some browsers):

```bash
# Python 3
python -m http.server 8000

# Or using Node (if installed)
npx serve .
```

Files

- `index.html` — main app UI and logic

If you want, I can add charts, CSV import/export, or convert this to a PWA manifest/service worker.
