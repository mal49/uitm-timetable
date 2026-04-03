# UiTM Schedule

<p align="center">
  <img src="./public/social-preview.jpg" alt="UiTM Schedule preview" width="100%" />
</p>

<p align="center">
  Build a UiTM class schedule, check clashes, and export it as a wallpaper-ready image.
</p>

<p align="center">
  <a href="https://uitm-timetable.vercel.app/">Live Site</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#running-locally">Running Locally</a>
</p>

## Overview

UiTM Schedule is a Next.js app for students who want a cleaner way to turn timetable data into something usable.

The app currently supports two input paths:

- `MyStudent` import by student ID
- manual subject search by campus, faculty, and course code

From there, users can choose subject matches, select groups, review clashes, preview the combined timetable, and export a wallpaper-style version.

## Features

- MyStudent timetable import by student ID
- Manual UiTM subject lookup by campus, faculty, and course code
- Multiple subject match selection when a search returns more than one result
- Group selection per subject
- Clash detection across selected timetable entries
- Desktop timetable preview in grid and table views
- Wallpaper maker with customizable layouts and export settings
- JPG export for the combined timetable preview
- Responsive UI for desktop and mobile

## Data Sources

Timetable data in this project comes from:

- the UiTM scheduling portal
- MyStudent timetable imports

This is an unofficial student tool and is not affiliated with UiTM.

## Current User Flow

1. Import classes from MyStudent or open the manual search accordion.
2. Add subjects and choose the correct match when needed.
3. Pick a group for each subject.
4. Review clashes in the combined timetable.
5. Export the timetable or build a wallpaper version from the final schedule.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui, Base UI, Lucide React |
| Networking | Native `fetch`, Axios |
| Parsing/Scraping | Cheerio, Tough Cookie, Axios Cookie Jar Support |
| Export | `html-to-image` |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

## Project Structure

```text
app/                         App routes, API routes, layout, and home page
app/_home/                   Home page state, components, and timetable workflow
components/                  Shared UI and wallpaper maker components
lib/                         Scraper, constants, importers, presets, and shared types
public/                      Static assets
```

## Running Locally

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API Endpoints

The app currently exposes these server routes:

- `GET /api/campuses`
- `GET /api/faculties`
- `GET /api/mystudent`
- `POST /api/search`
- `POST /api/subjects`
- `POST /api/timetable`

## Development Notes

- Main home page UI lives in [`app/_home/home-page.tsx`](./app/_home/home-page.tsx).
- Home page state and actions live in [`app/_home/use-home-page.ts`](./app/_home/use-home-page.ts).
- MyStudent parsing logic lives in [`lib/importers/mystudent.ts`](./lib/importers/mystudent.ts).
- UiTM scraping logic lives in [`lib/scraper.ts`](./lib/scraper.ts).
- Wallpaper editing and export UI lives under [`components/wallpaper-maker-v2/`](./components/wallpaper-maker-v2/).
- If UiTM or MyStudent change their payload or markup, scraper/import fixes will likely be required.

## Contributing

Contributions are useful if they improve:

- timetable accuracy
- scraper resilience
- mobile usability
- export quality
- UI clarity

Before opening a PR:

1. Keep the change scoped.
2. Run `npm run lint`.
3. Include screenshots for visual changes when relevant.
4. Note any assumptions about upstream UiTM or MyStudent data changes.

## Live Demo

Production URL: [https://uitm-timetable.vercel.app/](https://uitm-timetable.vercel.app/)
