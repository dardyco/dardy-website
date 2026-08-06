# Dardy site

A Vite + React + Tailwind project containing the Dardy landing page.

## Local development

npm install
npm run dev

## Deploying to GitHub Pages

1. Push this project to a new GitHub repo.
2. In vite.config.js, set `base` to `/your-repo-name/` (already set to `/dardy-site/` — edit if your repo is named differently).
3. In the repo on GitHub: Settings → Pages → Source → select "GitHub Actions".
4. Push to the `main` branch. The included workflow (.github/workflows/deploy.yml) builds and deploys automatically.
5. Your site will be live at https://your-username.github.io/your-repo-name/
