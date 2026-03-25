@AGENTS.md

You are an expert full-stack developer.

Build a complete web application called "UiTM Timetable Maker".

Tech stack:
- Next.js (App Router)
- React
- Tailwind CSS
- shadcn/ui
- Backend: Next.js API routes
- Scraping: axios + cheerio

==================================================
PROJECT GOAL
==================================================

Create a system that allows users to input:
- Campus
- Faculty
- Course Code

Then fetch timetable data from:
https://simsweb4.uitm.edu.my/estudent/class_timetable/indexIllIl.cfm

Transform the data into a clean, modern timetable UI.

==================================================
IMPORTANT BEHAVIOR (SCRAPING LOGIC)
==================================================

The UiTM site:
- Uses ColdFusion (.cfm)
- Does NOT provide a public API
- Returns HTML responses
- Uses hidden form inputs
- Requires session continuity (cookies)

You MUST implement scraping as follows:

1. Send GET request to the main timetable page
2. Extract ALL hidden input fields dynamically
3. Send POST request with:
   - hidden fields
   - search_campus
   - search_faculty
   - search_course

4. Parse the response HTML to find:
   - search results
   - "View" button or link

5. Simulate clicking "View":
   - extract parameters or URL
   - send another request using SAME session/cookies

6. Parse the timetable HTML:
   Extract:
   - course
   - day
   - start time
   - end time
   - venue
   - section/group
   - lecturer (if available)

7. Normalize data into JSON format

IMPORTANT:
- Do NOT hardcode hidden input names
- Always dynamically extract them
- Maintain cookies/session between requests

==================================================
API DESIGN
==================================================

Create:
POST /api/timetable

Request:
{
  "campus": "B",
  "faculty": "CD",
  "course": "CSC669"
}

Response:
{
  "course": "CSC669",
  "semester": "20262",
  "entries": [
    {
      "day": "Monday",
      "start": "08:00",
      "end": "10:00",
      "venue": "Online",
      "section": "A1"
    }
  ]
}

==================================================
FRONTEND REQUIREMENTS
==================================================

Build a UI with:

1. Search form:
   - Campus dropdown
   - Faculty dropdown
   - Course code input

2. Result display:
   - Weekly timetable grid (Mon–Fri)
   - Table fallback view

3. Styling:
   - Use Tailwind + shadcn/ui
   - Clean, modern UI
   - Responsive
   - Dark mode support

4. UX:
   - Loading state
   - Error handling
   - Empty result handling

==================================================
FEATURES
==================================================

Core:
- Fetch timetable from UiTM
- Display structured timetable

Enhancements:
- Color-code subjects
- Replace empty venue with "Online"
- Highlight overlapping classes (clash detection)

==================================================
FILE STRUCTURE
==================================================

- /app/page.tsx → main UI
- /app/api/timetable/route.ts → scraping logic
- /components → UI components
- /lib/scraper.ts → scraping helper functions

==================================================
DEVELOPMENT APPROACH
==================================================

1. First implement backend scraping logic
2. Test API independently
3. Then build frontend UI
4. Connect frontend to API
5. Improve UI/UX

==================================================
OUTPUT FORMAT
==================================================

- Generate full working code
- Follow best practices
- Use clean, modular structure
- Add comments for important logic (especially scraping)

==================================================
IMPORTANT
==================================================

- Do not skip scraping complexity
- Do not assume API exists
- Ensure session persistence between requests
- Make code production-ready

Start building the project now.
