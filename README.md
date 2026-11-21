# Animeverse

A bilingual (Persian/English) anime encyclopedia built with React + Vite.
Data is fetched from the public AniList GraphQL API and Jikan REST API.
Favorites are stored locally in the visitor's browser.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages
1. Create a GitHub repository and upload the contents of this folder.
2. In Cloudflare Dashboard, open **Workers & Pages**.
3. Choose **Create application → Pages → Connect to Git**.
4. Select the repository.
5. Set:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Click **Save and Deploy**.

The site will be published at `https://YOUR-PROJECT.pages.dev`.
No environment variables, database, VPS, or API key are required for the public catalog features.

## Data sources
- AniList GraphQL: https://graphql.anilist.co
- Jikan API: https://docs.jikan.moe/

## Notes
- This is a frontend-only static site. Search and catalog requests require internet access.
- AniList and Jikan are third-party services and may apply rate limits or experience downtime.
- Favorites are saved in localStorage on the current browser/device; they are not synced between devices.
- News is collected from Jikan's news endpoints for popular anime. It is not a real-time newswire.
