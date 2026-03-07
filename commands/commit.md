Command: Git Commit & Memory (/commit)

Beschreibung: Nutze diesen Befehl, um abgeschlossene, validierte Arbeit sicher in die Git-Historie (unser Langzeitgedächtnis) zu übertragen.

Ablauf:

Diff analysieren: Führe git status und git diff aus, um alle Änderungen präzise zu erfassen.

Tests prüfen: Stelle sicher, dass der Code läuft und keine offensichtlichen Fehler (z.B. Linter-Warnungen) vorliegen.

Commit Message formatieren: Schreibe die Commit-Message strikt nach den Conventional Commits Regeln:

Format: type(scope): kurze Beschreibung in Englisch

Erlaubte Types: feat, fix, chore, refactor, docs, test.

Füge im Body der Message eine kurze Begründung hinzu, warum die Änderung gemacht wurde und nicht nur was gemacht wurde.

Ausführung: Führe git add . gefolgt von git commit -m "..." autonom aus.

Erfolg melden: Melde dem User den erfolgreichen Commit und den generierten Hash in einer kurzen Bestätigung.