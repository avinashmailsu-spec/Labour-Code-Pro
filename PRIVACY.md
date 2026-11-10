# Privacy — LabourCode Pro Web

The core app is a static website. Its learning lessons, quizzes, original Gazette PDFs and search index run in your browser. It does not include advertising, automatic analytics or an account-registration service.

- Progress, preferences, notes, checklists and saved search data are stored locally in your browser (Local Storage).
- Supplementary PDF imports, if used, are stored locally in IndexedDB on the device.
- Browser caching and the service worker store the app's own files for offline use.
- Exported Word, Excel, JSON or calendar files are downloaded only when you request them.
- Browser voice synthesis and speech recognition depend on the browser and may use third-party/browser services according to that browser's settings.
- The optional cloud AI tutor sends a question and selected excerpts only after explicit user action to the HTTPS endpoint you supply. Its availability, data retention and handling are governed by that separately operated backend, not this static website.
- Documents screened with the TXT/DOCX local screening tool are handled in the browser. The screening is educational and should not be treated as a legal audit.

Clearing the browser's site data can erase progress, annotations and locally imported materials. Export important data before clearing browser storage. This site does not automatically synchronise across devices.
