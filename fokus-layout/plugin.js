/**
 * Fokus Layout — a calm, modern layout layer for Hermes Desktop.
 *
 * Not a color theme: it changes reading width, typography rhythm, the composer,
 * transcript noise, geometry and interaction feedback. Works on top of ANY
 * theme. Ships one optional palette ("Fokus") that can be picked in
 * Appearance, but never forces it.
 *
 * Design rules:
 *   - Only stable hooks: CSS variables + `data-slot` attributes. No generated
 *     class names, no DOM surgery, no React internals — survives app updates.
 *   - Every rule is gated by an attribute on <html>, so each feature toggles
 *     live and everything disappears cleanly when the plugin is disabled.
 *   - HUD / overlay windows are never touched.
 */

import {
  atom,
  ListRow,
  PALETTE_AREA,
  SegmentedControl,
  THEMES_AREA,
  ToggleRow,
  useValue
} from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'

const ID = 'fokus-layout'
const STYLE_ID = `${ID}-style`
const VERSION = '1.0.0'

const WIDTHS = {
  schmal: { label: 'Schmal', rem: '40rem' },
  standard: { label: 'Standard', rem: '46rem' },
  weit: { label: 'Weit', rem: '56rem' },
  voll: { label: 'Voll', rem: '100%' }
}
const WIDTH_ORDER = ['schmal', 'standard', 'weit', 'voll']

const TEXT = {
  kompakt: { label: 'Kompakt' },
  normal: { label: 'Normal' },
  gross: { label: 'Groß' }
}

const DEFAULTS = {
  width: 'standard',
  text: 'normal',
  calm: true,
  soft: true,
  composer: true,
  polish: true
}

/* ------------------------------------------------------------------ CSS -- */

const ROOT = 'html[data-fokus]:not([data-hud-window])'

const CSS = `
/* ---------- Lesespalte ---------- */
${ROOT}[data-fokus-width='schmal']   { --composer-width: ${WIDTHS.schmal.rem}; }
${ROOT}[data-fokus-width='standard'] { --composer-width: ${WIDTHS.standard.rem}; }
${ROOT}[data-fokus-width='weit']     { --composer-width: ${WIDTHS.weit.rem}; }

/* ---------- Typografie & Rhythmus ---------- */
${ROOT} {
  --paragraph-gap: 0.9rem;
  --turn-block-gap: 1rem;
  --conversation-turn-gap: 0.625rem;
  --tool-row-gap: 0.25rem;
  --message-text-indent: 0rem;
}
${ROOT}[data-fokus-text='kompakt'] {
  --conversation-text-base-size: 0.84375rem;
  --conversation-base-line-height: 1.25rem;
  --conversation-tool-base-size: 0.6875rem;
}
${ROOT}[data-fokus-text='normal'] {
  --conversation-text-base-size: 0.875rem;
  --conversation-base-line-height: 1.375rem;
  --conversation-tool-base-size: 0.75rem;
  --conversation-caption-base-size: 0.78125rem;
}
${ROOT}[data-fokus-text='gross'] {
  --conversation-text-base-size: 1rem;
  --conversation-base-line-height: 1.5rem;
  --conversation-tool-base-size: 0.8125rem;
  --conversation-caption-base-size: 0.84375rem;
}
${ROOT} [data-slot='aui_assistant-message-content'] {
  line-height: 1.62;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'kern', 'liga', 'calt';
}
${ROOT} [data-slot='aui_assistant-message-content'] :is(h1, h2, h3, h4) {
  letter-spacing: -0.011em;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
${ROOT} [data-slot='aui_assistant-message-content'] :is(h1, h2, h3, h4):first-child { margin-top: 0; }
${ROOT} [data-slot='aui_assistant-message-content'] :is(ul, ol) > li + li { margin-top: 0.3em; }
${ROOT} [data-slot='aui_assistant-message-content'] blockquote {
  border-left: 2px solid color-mix(in srgb, var(--ui-base) 18%, transparent);
  padding-left: 0.9em;
  color: var(--ui-text-secondary);
}
${ROOT} [data-slot='aui_assistant-message-content'] table {
  font-variant-numeric: tabular-nums;
}
${ROOT} [data-slot='aui_turn-pair'] + [data-slot='aui_turn-pair'] { margin-top: 0.75rem; }

/* ---------- Weiche Geometrie ---------- */
${ROOT}[data-fokus-soft] { --radius-scalar: 0.7; }
${ROOT}[data-fokus-soft] [data-slot='code-card'] {
  border-color: color-mix(in srgb, var(--ui-base) 9%, transparent) !important;
}

/* ---------- Schwebender Composer ---------- */
${ROOT}[data-fokus-composer] {
  --composer-control-size: 1.875rem;
  --composer-control-primary-size: 2rem;
  --composer-control-gap: 0.375rem;
  --composer-surface-pad-x: 0.875rem;
  --composer-surface-pad-y: 0.5rem;
  --composer-input-min-height: 1.875rem;
  --composer-input-max-height: 14rem;
  --composer-shell-pad-block-end: 1rem;
}
${ROOT}[data-fokus-composer] [data-slot='composer-surface'] {
  border-color: color-mix(in srgb, var(--ui-base) 11%, transparent) !important;
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.06),
    0 10px 30px -14px rgb(0 0 0 / 0.35);
  transition: border-color 140ms ease, box-shadow 180ms ease;
}
${ROOT}[data-fokus-composer] [data-slot='composer-surface']:focus-within {
  border-color: color-mix(in srgb, var(--dt-primary) 50%, transparent) !important;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--dt-primary) 15%, transparent),
    0 12px 32px -14px rgb(0 0 0 / 0.4);
}
${ROOT}[data-fokus-composer] [data-slot='composer-rich-input']:is(:empty, [data-empty])::before {
  opacity: 0.8;
}

/* ---------- Ruhiger Verlauf: Werkzeug-Rauschen tritt zurück ---------- */
${ROOT}[data-fokus-calm] [data-slot='tool-block'][data-tool-row],
${ROOT}[data-fokus-calm] [data-slot='aui_thinking-disclosure'],
${ROOT}[data-fokus-calm] [data-slot='aui_turn-activity'] {
  opacity: 0.62;
  transition: opacity 160ms ease;
}
${ROOT}[data-fokus-calm] [data-slot='tool-block'][data-tool-row]:is(:hover, :focus-within, [data-tool-open]),
${ROOT}[data-fokus-calm] [data-slot='aui_thinking-disclosure']:is(:hover, :focus-within),
${ROOT}[data-fokus-calm] [data-slot='aui_turn-activity']:is(:hover, :focus-within) {
  opacity: 1;
}
/* Freigaben und Rückfragen bleiben immer voll sichtbar. */
${ROOT}[data-fokus-calm] [data-slot='tool-approval-inline'],
${ROOT}[data-fokus-calm] [data-slot='clarify-inline'] {
  opacity: 1 !important;
}
${ROOT}[data-fokus-calm] { --disclosure-caret-rest: 0.35; }

/* ---------- Feinschliff: Ebenen, Fokus, Feedback ---------- */
${ROOT}[data-fokus-polish] :is([data-slot='dropdown-menu-content'], [data-slot='popover-content'], [data-slot='context-menu-content'], [data-slot='select-content']) {
  box-shadow:
    0 14px 36px -10px rgb(0 0 0 / 0.38),
    0 0 0 1px color-mix(in srgb, var(--ui-base) 8%, transparent);
}
${ROOT}[data-fokus-polish] [data-slot='dialog-content'] {
  box-shadow:
    0 28px 70px -18px rgb(0 0 0 / 0.5),
    0 0 0 1px color-mix(in srgb, var(--ui-base) 8%, transparent);
}
${ROOT}[data-fokus-polish] :is(button, [role='button'], a, [role='menuitem'], [role='tab'], [role='option'], [data-slot='row-button']):focus-visible {
  outline: 2px solid var(--dt-primary);
  outline-offset: 2px;
}
${ROOT}[data-fokus-polish] :is([data-slot='row-button'], [data-slot='dropdown-menu-item'], [data-slot='pane-tab'], [data-sidebar='menu-button']) {
  transition: background-color 120ms ease, color 120ms ease, opacity 120ms ease;
}
${ROOT}[data-fokus-polish] [data-slot='aui_msg-actions'] :is(button, [role='button']) {
  min-width: 1.75rem;
  min-height: 1.75rem;
}
${ROOT}[data-fokus-polish] ::selection {
  background: color-mix(in srgb, var(--dt-primary) 28%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  ${ROOT} *, ${ROOT} *::before, ${ROOT} *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
`

/* -------------------------------------------------------------- Palette -- */

// Optional companion palette: graphite neutrals, one azure accent.
const FOKUS_THEME = {
  name: 'fokus-layout',
  label: 'Fokus',
  description: 'Ruhige Neutraltöne, ein Akzent — passend zum Fokus Layout',
  colors: {
    background: '#FBFBFC',
    foreground: '#16171A',
    card: '#FFFFFF',
    cardForeground: '#16171A',
    muted: '#F2F3F5',
    mutedForeground: '#6B7079',
    popover: '#FFFFFF',
    popoverForeground: '#16171A',
    primary: '#2F6FEB',
    primaryForeground: '#FFFFFF',
    secondary: '#EEF3FD',
    secondaryForeground: '#16171A',
    accent: '#F0F2F5',
    accentForeground: '#16171A',
    border: '#E4E6EA',
    input: '#E4E6EA',
    ring: '#2F6FEB',
    midground: '#2F6FEB',
    composerRing: '#2F6FEB',
    destructive: '#D93C3C',
    destructiveForeground: '#FFFFFF',
    sidebarBackground: '#F5F6F8',
    sidebarBorder: '#E7E9ED',
    userBubble: '#F0F2F5',
    userBubbleBorder: '#E7E9ED'
  },
  darkColors: {
    background: '#111214',
    foreground: '#E6E8EB',
    card: '#17181B',
    cardForeground: '#E6E8EB',
    muted: '#1C1D21',
    mutedForeground: '#8C929C',
    popover: '#1A1B1E',
    popoverForeground: '#E6E8EB',
    primary: '#5E9EFF',
    primaryForeground: '#0B0C0E',
    secondary: '#1B2433',
    secondaryForeground: '#E6E8EB',
    accent: '#1E2024',
    accentForeground: '#E6E8EB',
    border: '#26282D',
    input: '#26282D',
    ring: '#5E9EFF',
    midground: '#5E9EFF',
    composerRing: '#5E9EFF',
    destructive: '#F06A6A',
    destructiveForeground: '#0B0C0E',
    sidebarBackground: '#0E0F11',
    sidebarBorder: '#202226',
    userBubble: '#1C1E22',
    userBubbleBorder: '#26282D'
  }
}

/* -------------------------------------------------------------- Runtime -- */

function applyToDocument(prefs) {
  const root = document.documentElement
  root.setAttribute('data-fokus', VERSION)
  root.setAttribute('data-fokus-width', WIDTHS[prefs.width] ? prefs.width : DEFAULTS.width)
  root.setAttribute('data-fokus-text', TEXT[prefs.text] ? prefs.text : DEFAULTS.text)

  for (const key of ['calm', 'soft', 'composer', 'polish']) {
    if (prefs[key]) {
      root.setAttribute(`data-fokus-${key}`, '')
    } else {
      root.removeAttribute(`data-fokus-${key}`)
    }
  }

  let style = document.getElementById(STYLE_ID)

  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }

  if (style.textContent !== CSS) {
    style.textContent = CSS
  }
}

function clearDocument() {
  const root = document.documentElement

  for (const attr of [...root.attributes].map(a => a.name)) {
    if (attr === 'data-fokus' || attr.startsWith('data-fokus-')) {
      root.removeAttribute(attr)
    }
  }

  document.getElementById(STYLE_ID)?.remove()
}

/* ------------------------------------------------------------- Settings -- */

function SettingsPage({ prefs, update }) {
  const p = useValue(prefs)

  return jsxs('div', {
    children: [
      jsx(ListRow, {
        title: 'Lesebreite',
        description: 'Breite von Verlauf und Eingabefeld. Standard ≈ 75 Zeichen pro Zeile — am angenehmsten zu lesen.',
        action: jsx(SegmentedControl, {
          value: p.width,
          onChange: width => update({ width }),
          options: WIDTH_ORDER.map(id => ({ id, label: WIDTHS[id].label }))
        })
      }),
      jsx(ListRow, {
        title: 'Textgröße im Chat',
        description: 'Schriftgröße und Zeilenabstand der Antworten.',
        action: jsx(SegmentedControl, {
          value: p.text,
          onChange: text => update({ text }),
          options: Object.entries(TEXT).map(([id, v]) => ({ id, label: v.label }))
        })
      }),
      jsx(ToggleRow, {
        label: 'Ruhiger Verlauf',
        description: 'Werkzeug-Aufrufe und Denkschritte treten zurück, die Antwort steht vorn. Hover zeigt alles; Freigaben und Rückfragen bleiben voll sichtbar.',
        checked: p.calm,
        onChange: calm => update({ calm })
      }),
      jsx(ToggleRow, {
        label: 'Schwebendes Eingabefeld',
        description: 'Mehr Luft, größere Schaltflächen, Tiefe statt Rahmenlinie, klarer Fokus beim Tippen.',
        checked: p.composer,
        onChange: composer => update({ composer })
      }),
      jsx(ToggleRow, {
        label: 'Weiche Ecken',
        description: 'Abgerundete Flächen statt der kantigen Standard-Geometrie.',
        checked: p.soft,
        onChange: soft => update({ soft })
      }),
      jsx(ToggleRow, {
        label: 'Feinschliff',
        description: 'Weiche Schatten für Menüs und Dialoge, sichtbarer Tastatur-Fokus, sanfte Hover-Übergänge.',
        checked: p.polish,
        onChange: polish => update({ polish })
      })
    ]
  })
}

/* --------------------------------------------------------------- Plugin -- */

export default {
  id: ID,
  name: 'Fokus Layout',
  register(ctx) {
    const prefs = atom({ ...DEFAULTS, ...(ctx.storage.get('prefs', {}) || {}) })

    const update = patch => {
      prefs.set({ ...prefs.get(), ...patch })
      ctx.storage.set('prefs', prefs.get())
      applyToDocument(prefs.get())
    }

    applyToDocument(prefs.get())
    ctx.onDispose(clearDocument)

    ctx.register({ id: 'theme', area: THEMES_AREA, data: FOKUS_THEME })

    const nextWidth = () => {
      const i = WIDTH_ORDER.indexOf(prefs.get().width)
      update({ width: WIDTH_ORDER[(i + 1) % WIDTH_ORDER.length] })
    }

    ctx.registerMany([
      {
        id: 'cmd-width',
        area: PALETTE_AREA,
        data: {
          id: `${ID}.width`,
          label: 'Fokus: Lesebreite wechseln',
          keywords: ['fokus', 'breite', 'width', 'layout', 'spalte'],
          detail: () => WIDTHS[prefs.get().width]?.label ?? '',
          detailVariant: 'state',
          run: nextWidth
        }
      },
      {
        id: 'cmd-calm',
        area: PALETTE_AREA,
        data: {
          id: `${ID}.calm`,
          label: 'Fokus: Ruhiger Verlauf',
          keywords: ['fokus', 'ruhig', 'tools', 'calm', 'rauschen'],
          detail: () => (prefs.get().calm ? 'An' : 'Aus'),
          detailVariant: 'state',
          run: () => update({ calm: !prefs.get().calm })
        }
      },
      {
        id: 'cmd-text',
        area: PALETTE_AREA,
        data: {
          id: `${ID}.text`,
          label: 'Fokus: Textgröße wechseln',
          keywords: ['fokus', 'text', 'schrift', 'größe', 'font'],
          detail: () => TEXT[prefs.get().text]?.label ?? '',
          detailVariant: 'state',
          run: () => {
            const order = Object.keys(TEXT)
            update({ text: order[(order.indexOf(prefs.get().text) + 1) % order.length] })
          }
        }
      }
    ])

    ctx.registerSettingsPage?.({
      id: 'settings',
      title: 'Fokus Layout',
      icon: 'layout',
      render: () => jsx(SettingsPage, { prefs, update })
    })
  }
}
