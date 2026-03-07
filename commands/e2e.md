Command: Visual E2E Testing (/e2e)

Beschreibung: Nutze diesen Befehl, um das Frontend visuell durch einen Headless-Browser zu testen.

Ablauf:

Server prüfen: Stelle sicher, dass der lokale Dev-Server läuft (z.B. localhost:3000). Wenn nicht, starte ihn im Hintergrund.

Agent Browser initialisieren: Nutze das Vercel Agent Browser CLI (agent-browser).

User Journeys abarbeiten:

Öffne die URL der neuen Funktion.

Mache einen Screenshot (nutze agent-browser snapshot -i).

Analysiere das Bild: Sieht das UI korrekt aus? Sind die Buttons erreichbar?

Klicke dich durch den Flow (z.B. Login, Formular ausfüllen).

Fehlerbehebung: Wenn Elemente überlappen oder Logik-Fehler auftreten, behebe den Code und teste die Seite erneut, bis der Flow fehlerfrei durchläuft.