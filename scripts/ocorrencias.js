import { map } from './mapa.js';
import { obterViaturas, extrairAno, capitalizarCidade, formatarNumero, coresPorCategoria } from './utils.js';

let ocorrenciasRaw = null;
let ocorrenciasLayer = null;

export function carregarOcorrencias(prefixo) {
  return fetch('dados/ocorrencias.geojson.gz')
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const texto = pako.ungzip(new Uint8Array(buffer), { to: 'string' });
      const data = JSON.parse(texto);

      ocorrenciasRaw = data;
      atualizarResumo(prefixo);
      preencherAnos(data);
      exibirOcorrenciasFiltradas(prefixo);
    });
}

function atualizarResumo(prefixo) {
  const ocorrencias = ocorrenciasRaw.features.filter(f => obterViaturas(f).includes(prefixo));
  const total = ocorrencias.length;
  const vitimas = ocorrencias.filter(f => (f.properties['Vitimas'] || '').trim().toUpperCase() === 'SIM').length;
  const municipios = new Set(ocorrencias.map(f => capitalizarCidade(f.properties['Cidade'])).filter(Boolean));

  document.getElementById('num-ocorrencias').textContent = formatarNumero(total);
  document.getElementById('vitimas-salvas').textContent = formatarNumero(vitimas);
  document.getElementById('num-municipios').textContent = formatarNumero(municipios.size);
}

function preencherAnos(data) {
  const anos = new Set(data.features.map(f => extrairAno(f.properties['Dt de Cadastro'])).filter(Boolean));
  const select = document.getElementById('ano-select');
  const anoAtual = new Date().getFullYear().toString();

  [...anos].sort().forEach(ano => {
    const opt = document.createElement('option');
    opt.value = ano;
    opt.textContent = ano;
    if (ano === anoAtual) opt.selected = true;
    select.appendChild(opt);
  });
}

export function exibirOcorrenciasFiltradas(prefixo) {
  if (!ocorrenciasRaw) return;

  if (ocorrenciasLayer) map.removeLayer(ocorrenciasLayer);

  const anoSelecionado = document.getElementById('ano-select').value;

  const filtradas = ocorrenciasRaw.features.filter(f => {
    const viaturas = obterViaturas(f);
    const dataStr = f.properties['Dt de Cadastro'];
    return viaturas.includes(prefixo) && extrairAno(dataStr) === anoSelecionado;
  });

  document.getElementById('contador-ano').textContent = `Ocorrências atendidas no ano: ${formatarNumero(filtradas.length)}`;

  ocorrenciasLayer = L.geoJSON({ ...ocorrenciasRaw, features: filtradas }, {
    pointToLayer: (feature, latlng) => {
      const categoria = feature.properties['Categoria']?.toUpperCase() || 'default';
      const cor = coresPorCategoria[categoria] || coresPorCategoria['default'];
      return L.circleMarker(latlng, { radius: 8, fillColor: cor, color: '#000', weight: 1, opacity: 1, fillOpacity: 1 });
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const html = `
        <strong>Data:</strong> ${p['Dt de Cadastro'] || 'Sem data'}<br>
        <strong>Nº Ocorrência:</strong> ${p['Nº Ocorrência'] || ''}<br>
        <strong>Tipo:</strong> ${p['Tipo Inicial Atualizado'] || 'Sem categoria'}<br>
        <strong>Cidade:</strong> ${p['Cidade'] || 'Não informado'}<br>
        <strong>Bairro:</strong> ${p['Bairro'] || 'Não informado'}
      `;
      layer.bindPopup(html);
    }
  }).addTo(map);
}
