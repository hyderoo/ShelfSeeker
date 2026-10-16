# ShelfSeeker

A mobile-first book finder web app (PWA). Search books by title, check a book by its ISBN, and explore authors - all powered by the free [OpenLibrary API](https://openlibrary.org/developers/api).

This was my final project for the PPB (Pemrograman Perangkat Bergerak / Mobile Programming) course at Diponegoro University.

**Live demo:** https://shelfseekerapp.web.app (Firebase Hosting)

## Features

- **Book search** - search millions of books by title, with covers, authors, and first-publish year
- **Book details** - description, subjects, and author for each book
- **ISBN check** - look up a book by ISBN-10/ISBN-13 to see its edition details
- **Author finder** - search authors and see birth date and top work
- **Installable PWA** - service worker caching, install prompt on mobile

## Tech stack

- React 18 (Create React App, `react-scripts` 5)
- React Router v6
- Plain CSS (custom design tokens, responsive grid)
- Workbox service worker (PWA)
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

## Data source

All book, cover, ISBN, and author data comes from [OpenLibrary](https://openlibrary.org) (Internet Archive), a free and open API. Covers are served from `covers.openlibrary.org`.

## Notes

- This is a learning project; the "ISBN authenticity check" is a lookup against OpenLibrary's catalog - a missing ISBN there does not prove a copy is fake.
- In 2026 the design was refreshed and a few bugs fixed (bottom navigation active state, ISBN page render loop, mobile search-bar overflow, book description rendering) with assistance from an AI coding tool. All original features and content are unchanged.
