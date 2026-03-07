Command: Adversarial Code Review (/review)

Beschreibung: Nutze diesen Befehl nach der Implementierung und VOR dem /commit, um den Code objektiv und kritisch zu prüfen.

Ablauf:

Rollenübernahme: Du bist ab sofort kein Entwickler mehr, sondern ein extrem kritischer, pedantischer Senior FDE und Security Auditor.

Diff sammeln: Führe git diff (und git diff --cached) aus, um alle aktuellen Änderungen zu sehen.

Kritische Analyse (Adversarial Mode):

Prüfe auf Security-Lücken (z.B. SQL Injections, fehlende Auth-Checks).

Prüfe auf Performance-Probleme (z.B. N+1 Queries in Datenbanken, unnötige Re-Renders im Frontend).

Prüfe auf Typensicherheit (z.B. Nutzung von any in TypeScript).

Prüfe auf Console.logs oder übrig gebliebene // TODO Kommentare.

Bericht: Liste alle gefundenen Schwachstellen schonungslos auf. Wenn alles perfekt ist, gib das Kommando: "Ready for /commit".