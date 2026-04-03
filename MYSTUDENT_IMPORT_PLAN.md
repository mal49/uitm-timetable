# MyStudent Timetable Import Plan

## Goal

Let users bring their timetable from `mystudent.uitm.edu.my` into this app without this app handling UiTM login, student credentials, or MyDigital ID verification.

The intended flow is:

1. The user signs into MyStudent themselves.
2. A client-side helper extracts timetable data from the logged-in page.
3. The helper exports structured timetable data.
4. This app imports that data and sends it into the existing timetable maker and wallpaper flow.

## Core Product Direction

Do not automate UiTM login on this app's server.

Do not ask users for:

- UiTM Google credentials
- MyDigital ID credentials
- session cookies copied into this app

Instead, keep the protected-site interaction fully on the user's side and only import timetable data after they are already logged in.

## Recommended Architecture

Split the system into two parts:

1. MyStudent helper
2. Main timetable app

The MyStudent helper is responsible only for extraction.

The main timetable app is responsible for:

- accepting imported data
- validating it
- normalizing it
- rendering it in timetable views
- sending it into the wallpaper maker

## Phase 1: Define the Import Contract

Create one canonical import format that maps cleanly to the existing timetable model.

Suggested fields per session:

- `subjectCode`
- `subjectName`
- `group` or `section`
- `day`
- `start`
- `end`
- `venue`
- `lecturer`
- `source`

Suggested source value:

- `mystudent`

This format should be normalized into the same shape already used by the app wherever possible.

Relevant repo files to align with:

- `lib/types.ts`
- `lib/scraper.ts`

## Phase 2: Pick the First Import Mechanism

Recommended order of implementation:

1. JSON file import
2. Paste JSON into a text area
3. Direct integration via userscript or browser extension

Why this order:

- JSON upload is fastest to ship
- it is easy to debug
- it keeps auth concerns out of this app
- it gives you a stable, versioned interchange format

## Phase 3: Build the Extraction Helper

Start outside the main app with a small extraction tool.

Possible formats:

- bookmarklet
- userscript
- browser extension

Recommended first version:

- userscript

Why:

- quicker to prototype than a full extension
- easy to update during testing
- enough to validate whether MyStudent data can be extracted reliably

The helper should:

- run only on `mystudent.uitm.edu.my`
- detect whether the user is on the timetable page
- read the timetable data from the page
- normalize obvious text inconsistencies
- export a `.json` file

The helper should not:

- perform login
- store user credentials
- attempt to bypass MyDigital ID

## Phase 4: Reverse-Engineer the MyStudent Timetable Page

You will need one real logged-in timetable page to inspect during development.

Check for timetable data in this order:

1. page-level JSON or embedded state
2. XHR or fetch responses used by the page
3. rendered HTML DOM

Preferred extraction priority:

1. structured page state
2. network response payloads
3. visual DOM scraping

Reason:

Structured data is generally more stable than parsing rendered markup.

Questions to answer during inspection:

- Is the timetable rendered as a table, cards, or some other layout?
- Is the source data already available in a JavaScript object?
- Does the page fetch timetable data from an API after load?
- Are the day and time fields already normalized or still presentation text?

## Phase 5: Add Import UI to This App

Add a separate import path alongside the current public timetable search.

Suggested UI entry:

- `Import from MyStudent`

Suggested inputs:

- upload `.json`
- paste JSON manually as a fallback

Suggested UX:

- keep this clearly separate from the public timetable search flow
- explain that login happens only on MyStudent, not in this app
- allow preview before confirming import

Likely repo touchpoints:

- `app/page.tsx`
- `components/search-form.tsx`

## Phase 6: Add a Normalization Layer

Create a dedicated mapper for imported MyStudent data.

Suggested new module:

- `lib/importers/mystudent.ts`

Responsibilities:

- validate required fields
- normalize day names
- normalize time ranges
- convert empty venue to `Online` when appropriate
- map imported group values into the app's `section` model
- deduplicate repeated entries
- attach warnings for incomplete or malformed rows

This parsing logic should stay out of UI components.

## Phase 7: Feed the Existing Timetable Maker

Once normalized, imported data should go through the same display and export path as existing timetable selections.

Relevant components:

- `components/timetable-grid.tsx`
- `components/timetable-table.tsx`
- `components/wallpaper-maker-v2/wallpaper-maker.tsx`

Goal:

Imported timetables should behave like native app data rather than a special-case view.

## Phase 8: Add Local Persistence

To make access faster on repeat visits, persist imported timetable data locally.

Recommended options:

- `localStorage` for a simple first version
- IndexedDB if the stored import flow becomes more complex

Persist:

- latest imported timetable
- import timestamp
- import source version if needed

Benefits:

- user does not need to repeat the import every time
- the app becomes faster for returning users

## Phase 9: Add Validation and Import Feedback

Before completing import, show a summary:

- number of subjects
- number of sessions
- missing fields
- invalid rows

Also show metadata such as:

- import time
- import source
- warnings if some entries could not be parsed cleanly

Recommended messaging:

- data stays on the device if the import is handled locally
- this app does not ask for UiTM credentials

## Phase 10: Test for Change Risk

Main long-term risk:

- MyStudent markup or client-side data structures may change

Test scenarios:

- regular lecture schedule
- lab or tutorial sessions
- online classes
- repeated classes across the week
- missing lecturer or venue
- duplicate rows
- mixed Malay and English labels
- new semester data formats

Keep the extraction helper versioned so it can evolve independently from the main app.

## Suggested Delivery Order

1. Inspect one real MyStudent timetable page
2. Define and document the import JSON schema
3. Build a userscript that exports the schema as JSON
4. Add a JSON upload flow in this app
5. Add normalization and validation
6. Connect imported data to timetable rendering
7. Connect imported data to wallpaper export
8. Add local persistence
9. Improve UX and error states

## First Milestone

The fastest proof of concept is:

1. userscript export from MyStudent
2. JSON import into this app
3. imported timetable opens in the existing timetable maker

That is enough to validate the whole product direction before investing in a browser extension or deeper automation.
