# EN↔PT Tense Navigator (Static, Manifest‑Driven)

Aden, this is the split‑files version ready for Netlify (or any static host).  
It auto‑loads **JSON tenses** listed in `data/manifest.json` and **filters** from `filters.json`.
Formatting supports `**bold**`, `*italic*`, and `~~strike~~` inside your JSON strings.

## Structure
```
en-pt-tense-navigator/
├─ index.html
├─ filters.json                # JSON rules for the filter chips
├─ assets/
│  ├─ style.css
│  └─ app.js                   # loads manifest + tenses, renders UI
└─ data/
   ├─ manifest.json            # list of JSON files to load (order = sidebar order)
   ├─ simple-present.json
   ├─ present-continuous.json
   ├─ present-perfect.json
   ├─ present-perfect-continuous.json
   ├─ simple-past.json
   ├─ past-continuous.json
   ├─ past-perfect.json
   ├─ future-will.json
   ├─ future-going-to.json
   └─ present-cont-future.json
```

> Netlify note: no build step required. Just deploy this folder.

## Add / Edit Tenses (scales to thousands of lines)
1. **Create a new JSON file** in `data/` (e.g., `present-perfect-vs-past.json`) with this schema:
```json
{
  "id": "unique-id",
  "name": "Card Title",
  "form": "Form line",
  "logic": "Logic‑first explanation. You can use **bold** and ~~strike~~.",
  "ptMap": ["Bullet 1", "Bullet 2"],
  "tags": ["tag1","tag2"],
  "examples": [
    {"en":"English example","pt":"Portuguese mapping"},
    {"en":"Another","pt":"Outro"}
  ],
  "timeline": 40,
  "pitfalls": ["Common mistake 1","Tip 2"]
}
```
2. **Append the filename** to `data/manifest.json`. The order in the manifest == order in the sidebar.
3. Done. No HTML changes. The app fetches and renders everything.

> Why JSON (not JS)? JSON is safer and easier to validate, and avoids global script ordering issues on static hosting.

## Filters (also dynamic)
Edit `filters.json`. Rules are JSON only (no code), so it’s safe:
- `timelineRange`: `{ "type":"timelineRange", "min":40, "max":60 }`
- `tagsAnyOf`: `{ "type":"tagsAnyOf", "tags":["plan","arranged"] }`

Example:
```json
[
  {"id":"past","label":"Past","rule":{"type":"timelineRange","max":39}},
  {"id":"present","label":"Present","rule":{"type":"timelineRange","min":40,"max":60}},
  {"id":"experience","label":"Experience (já/ever)","rule":{"type":"tagsAnyOf","tags":["experience","ever","have been to"]}}
]
```

## Markdown-ish formatting inside JSON
- `**bold**`, `*italic*`, `~~strike~~` are rendered.
- Use straight quotes inside JSON. Example: `"I have been to **NY**"`.

## Fullscreen
- Click the **Full Screen** button or press **f**.

## Typical “Present Perfect” quick adds
- **Have you ever** → `"examples":[{"en":"Have you ever...","pt":"Você já..."}]`
- **I have been to** → `"ptMap":[ "“I have been to X” → “Eu já fui/estive em X”" ]`
- **since vs for** → put in `ptMap` or examples as shown in the provided cards.

## Growing to dozens/hundreds of files
- Keep `data/manifest.json` as the single list of files.
- You can split by topic/focus (e.g., `pp-ever.json`, `pp-since-for.json`, `future-comparison.json`).

## FAQ
**Q: Can it auto‑discover files without editing the manifest?**  
On static hosts (no server), there’s no directory listing. Use the manifest (simple + explicit).

**Q: Can I use JS files instead of JSON?**  
You *can*, but then you need to include each `<script>` in `index.html`. JSON + manifest keeps HTML untouched.

---

Made for you, Aden. Enjoy growing it like Lego blocks.