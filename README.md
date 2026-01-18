# Programming Lineage Grid

This repo contains a small, self-contained web page that renders an interactive
lineage grid. Paste your full A–Z lineage list, click **Load grid**, then tap any
card to explore the chain with clickable nodes.

## Usage

1. Open `index.html` in a browser (or run a local server).
2. Paste your lineage list in the textarea (one lineage per line).
3. Click **Load grid** to render the interactive layout.

### Optional local server

```sh
python -m http.server 8080
```

Then open <http://localhost:8080>.

## Lineage format

```
Language = Descendant → Descendant → Descendant
```

You can paste the entire 215-root/900-derivative list and the grid will index it
with search + letter filters.
