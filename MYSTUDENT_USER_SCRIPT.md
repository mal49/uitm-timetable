# MyStudent Exporter Userscript

## Install

1. Install a userscript manager such as Tampermonkey.
2. Create a new userscript.
3. Paste in [`scripts/mystudent-export.user.js`](C:/Users/ikhmalhanif/OneDrive/Documents/next-project/uitm-timetable-gen/scripts/mystudent-export.user.js).
4. Save it.

## Use

1. Sign in to `https://mystudent.uitm.edu.my` yourself.
2. Open the timetable page.
3. Wait for the floating `UiTM Timetable Export` panel to say the timetable is ready.
4. Click `Download JSON`.
5. Import the downloaded file into this app with `Import from MyStudent`.

## Notes

- The script discovers the student-specific JSON URL dynamically.
- It normalizes the MyStudent payload into the app's import schema.
- Repeated weekly sessions are deduplicated before export.
- If the panel stays idle, refresh the timetable page once while staying on MyStudent.
