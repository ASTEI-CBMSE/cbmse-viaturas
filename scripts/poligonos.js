import { map } from './mapa.js';

export function carregarPoligonos() {
  fetch('dados/poligonos.geojson.gz')
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const texto = pako.ungzip(new Uint8Array(buffer), { to: 'string' });
      const data = JSON.parse(texto);

      const layer = L.geoJSON(data, {
        style: { color: '#3388ff', weight: 2, fillOpacity: 0.2 },
        onEachFeature: (f, l) => l.bindPopup(`Cidade: ${f.properties.name || 'N/A'}`)
      }).addTo(map);

      map.fitBounds(layer.getBounds());
    });
}
