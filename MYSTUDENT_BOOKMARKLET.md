# MyStudent Bookmarklet

## Goal

Let users export timetable JSON from `mystudent.uitm.edu.my` without installing a browser extension.

## Flow

1. Open this app.
2. Add the `Import from MyStudent` bookmarklet from the import panel to the browser bookmarks bar.
3. Log in to MyStudent normally.
4. Open the MyStudent timetable page.
5. Click the bookmarklet.
6. Download the generated JSON.
7. Upload or paste that JSON back into this app.

## File

The bookmarklet loads:

- [public/mystudent-bookmarklet.js](C:/Users/ikhmalhanif/OneDrive/Documents/next-project/uitm-timetable-gen/public/mystudent-bookmarklet.js)

## Notes

- The bookmarklet discovers the student-specific timetable JSON URL dynamically.
- It reads the structured timetable payload from `cdn.uitm.link/jadual/baru/...json`.
- It normalizes the payload into the same import schema used by the app.
- It does not handle UiTM login credentials.
