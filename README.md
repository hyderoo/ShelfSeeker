# ShelfSeeker

A mobile-first book finder web app (PWA). Search books by title, save your reading list, scan an ISBN barcode, and explore authors - all powered by the free [OpenLibrary API](https://openlibrary.org/developers/api).

This was my final project for the PPB (Pemrograman Perangkat Bergerak / Mobile Programming) course at Diponegoro University.

**Live demo:** https://shelfseekerapp.web.app (Firebase Hosting)

## Features

- **Book search** - search millions of books by title, with covers, authors, and first-publish year
- **Filter and sort results** - sort by year or title, filter by language, subject, and earliest publish year
- **Book details** - description, subjects, and author for each book, plus similar-book recommendations based on the book's subjects
- **Reading list** - save books to "Want to read", "Reading", or "Done". Stored in your browser (localStorage), so it works offline and needs no account
- **ISBN check** - look up a book by ISBN-10/ISBN-13, or point your camera at the barcode to scan it
- **Author finder** - search authors and see birth date and top work
- **Dark mode** - toggle in the bottom navigation bar, remembers your choice
- **Installable PWA with offline support** - the app shell and pages you visited before open without a connection; covers and API responses are cached by the service worker

## Barcode scanning support

Barcode scanning uses the built-in `BarcodeDetector` browser API, which is available in Chromium-based browsers (for example Chrome on Android). Support varies by browser and platform, so when scanning is unavailable the app says so and the manual ISBN input is used instead.

## Tech stack

- React 18 (Create React App, `react-scripts` 5)
- React Router v6
- Plain CSS (custom design tokens, responsive grid, light/dark themes)
- Workbox service worker (PWA, offline caching)
- [OpenLibrary API](https://openlibrary.org/developers/api) - no API key or backend needed
- Deployed on Firebase Hosting

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

Production build:

```bash
npm run build
```

Deploy to Firebase Hosting (requires `firebase login` and access to the `shelfseekerapp` project):

```bash
npm run build
firebase deploy
```

### Offline development without OpenLibrary access

Set `REACT_APP_MOCK_API=true` to run the whole UI against local fixtures (`src/mockApi.js`) instead of the live API:

```bash
REACT_APP_MOCK_API=true npm start
```

Never use this flag for a production build.

## Data sources

Primary book, cover, ISBN, and author data comes from [OpenLibrary](https://openlibrary.org) (Internet Archive), a free and open API. Covers are served from `covers.openlibrary.org`.

The ISBN lookup page can also fall back to the [Kakao (Daum) Book API](https://developers.kakao.com/docs/latest/en/daum-search/dev-guide) for books OpenLibrary does not carry. That fallback goes through the same-origin serverless proxy in `api/isbn.js` and only activates when the `KAKAO_REST_API_KEY` environment variable is set in the Vercel project - the key stays server-side and is never shipped to the browser. Without it, the ISBN page works exactly as before.

## Notes

- This is a learning project; the "ISBN authenticity check" is a lookup against OpenLibrary's catalog - a missing ISBN there does not prove a copy is fake.
- The reading list and theme preference are stored only in your own browser; clearing site data removes them.
- Offline mode shows pages and covers you have opened before; brand-new searches still need a connection.
