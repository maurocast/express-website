web prova su Render con node.js
utilizzo Express

## API file

- `GET /api/files` restituisce l'elenco dei file `.fit`.
- `POST /api/files` accetta un file `.fit` o `.geojson` nel campo multipart `file` e lo salva in `public/files` con il nome originale. Se esiste già un file con lo stesso nome, viene sostituito.
- Quando genera la raccolta GeoJSON, il client la salva come file `.geojson` accanto al file FIT sorgente; questi file non vengono inclusi nell'elenco FIT restituito da `GET /api/files`.
