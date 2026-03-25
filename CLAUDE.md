@AGENTS.md

# UiTM Timetable Maker — Instructions

You are an expert full-stack developer. Build a complete production-ready web app called **UiTM Timetable Maker**.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- Cheerio

## Goal
Build a web app that allows users to:
- load campus list
- load faculty list
- search by course code
- fetch UiTM timetable data from the UiTM timetable website
- display the timetable in a clean, modern UI

The source website is:
`https://simsweb4.uitm.edu.my/estudent/class_timetable/`

---

## Important Reference Logic

Port the following PHP scraping logic into modern TypeScript for Next.js API routes.

### Real scraping flow

#### 1. Get campus list
Fetch:
`cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30`

Requirements:
- send a `Referer` header pointing to:
  `https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm`
- parse JSON response
- return campus objects:
  - `code`
  - `fullname`

Rules:
- skip item where `id === 'X'`
- if campus text does not contain `SELANGOR`, split on first `-` and keep the second part
- otherwise keep full text

#### 2. Get faculty list
Fetch:
`cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30`

Requirements:
- same referer header
- parse JSON response
- return:
  - `code`
  - `fullname`

Rules:
- faculty fullname is the second part after the first `-`

#### 3. Get main page info
Fetch:
`index.cfm`

From this page:
- extract all hidden inputs
- extract select names/values if needed
- parse inline scripts
- find script containing `check_form_before_submit`
- extract any values assigned through:
  `document.getElementById(...).value = ...`
- extract submission path from JS with pattern like:
  `url: '...cfm...'`

Also:
- capture all `Set-Cookie` headers from the response
- build a cookie header string for later requests

Return:
- `hiddenInputs`
- `submissionPath`
- `cookieHeader`

#### 4. Search subjects by campus + faculty + course
Submit POST request to:
`https://simsweb4.uitm.edu.my/estudent/class_timetable/` + `submissionPath`

POST body must include:
- all extracted hidden inputs
- `search_campus`
- `search_faculty`
- `search_course`

Headers must include:
- `Content-Type: application/x-www-form-urlencoded`
- `Referer: https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm`
- `Cookie: <cookieHeader>`

Then parse the returned HTML:
- remove script tags first
- parse rows from the result table
- skip header row
- extract:
  - course subject text
  - `View` anchor href

Normalize subject:
- trim whitespace
- remove `.` characters

Return array:
- `subject`
- `path`

#### 5. Fetch subject timetable
For a selected `path`, request:
`https://simsweb4.uitm.edu.my/estudent/class_timetable/` + `path`

Headers:
- `Referer: https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm`
- `Cookie: <cookieHeader>`

Then parse timetable HTML:
- iterate through table rows
- skip header row
- collect all `<td>` text
- extract group name from the correct column
- group rows by group name

Return grouped timetable data.

---

## Required API Endpoints

Create these Next.js API endpoints:

### `GET /api/campuses`
Returns all campuses.

### `GET /api/faculties`
Returns all faculties.

### `POST /api/search`
Request body:
```json
{
  "campus": "B",
  "faculty": "CD",
  "course": "CSC669"
}