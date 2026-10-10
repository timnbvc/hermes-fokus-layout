# Fokus Layout für Hermes Desktop

Ein ruhiges, modernes Layout für die Hermes-Desktop-App. Kein Farbschema, sondern eine UX-Schicht, die mit **jedem** Theme funktioniert.

| | Vorher (Hermes Standard) | Mit Fokus Layout |
|---|---|---|
| Lesebreite | fensterbreit | ~75 Zeichen, zentriert (einstellbar) |
| Chat-Text | 13 px | 14 px, mehr Zeilenabstand (einstellbar) |
| Eingabefeld | flach, eng | schwebend, mehr Luft, größere Schaltflächen, Fokus-Ring |
| Werkzeug-Aufrufe | gleich laut wie die Antwort | treten zurück, bei Hover voll sichtbar |
| Ecken | kantig | weich |
| Tastatur | Fokus kaum sichtbar | einheitlicher, sichtbarer Fokus-Ring |

Dazu gibt es eine passende, optionale Farbpalette **„Fokus“** (hell und dunkel) unter Einstellungen → Darstellung → Theme.

## Installieren

In Hermes Desktop: **Capabilities → Plugins → Install plugin** und diesen Pfad einfügen:

```text
timnbvc/hermes-fokus-layout/fokus-layout
```

Danach unter **Capabilities → Plugins** einschalten.

Manuell geht es auch so: Den Ordner `fokus-layout` nach `~/.hermes/desktop-plugins/` kopieren (Windows: `%USERPROFILE%\.hermes\desktop-plugins\`).

## Einstellen

- **Einstellungen → Plugins → Fokus Layout**: Lesebreite, Textgröße, und jedes Modul einzeln an/aus.
- **⌘K / Strg+K → „Fokus“**: Lesebreite, Textgröße und Ruhiger Verlauf direkt umschalten.

## Technik

- Nutzt nur stabile Hooks der App (CSS-Variablen und `data-slot`-Attribute), keine generierten Klassennamen und keine DOM-Eingriffe. Dadurch übersteht es App-Updates deutlich besser als reine CSS-Hacks.
- Jede Regel hängt an einem Attribut auf `<html>`. Beim Ausschalten wird alles rückstandsfrei entfernt.
- HUD- und Overlay-Fenster bleiben unberührt. `prefers-reduced-motion` wird respektiert.
- Getestet gegen Hermes Desktop v0.21.6.

## Lizenz

MIT
