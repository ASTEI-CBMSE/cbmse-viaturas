import { map } from './mapa.js';
import { coresPorCategoria } from './utils.js';

export function adicionarLegendaCategorias() {
  const legenda = L.control({ position: 'bottomright' });

  legenda.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const categorias = Object.keys(coresPorCategoria).filter(c => c !== 'default');
    div.innerHTML = '<strong>Categoria</strong><br>' + categorias.map(cat =>
      `<i style="background:${coresPorCategoria[cat]}; width:18px; height:18px; display:inline-block; margin-right:6px; border:1px solid #000;"></i> ${cat}<br>`
    ).join('');
    return div;
  };

  legenda.addTo(map);
}
