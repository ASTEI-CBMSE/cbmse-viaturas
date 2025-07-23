// Inicialização do mapa Leaflet
const map = L.map('map').setView([-10.5, -37.3], 8);

// Adiciona camada base do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Elementos DOM
const selectAno = document.getElementById('ano-select');
const anoAtual = new Date().getFullYear().toString();

// Variáveis globais
const params = new URLSearchParams(window.location.search);
const prefixo = (params.get('prefixo') || '').toLowerCase();
let ocorrenciasRaw = null;
let ocorrenciasLayer = null;

// Prefixo no título
document.getElementById('prefixo-titulo').textContent = prefixo.toUpperCase();

// Carrega os dados das viatura
function carregarViaturas() {
  dfd.readCSV('dados-viaturas.csv', { delimiter: ';' }).then(df => {

    // Cria nova coluna com valores em lowercase
    df = df.addColumn('PREFIXO_LOWER', df['PREFIXO'].values.map(p => p.toLowerCase()));

    // Encontra o índice da linha com prefixo correspondente
    const idx = df['PREFIXO_LOWER'].values.findIndex(p => p === prefixo);

    const linha = df.iloc({ rows: [idx] });
    const valores = linha.values[0];
    const colunas = linha.columns;

    // Cria um dicionário: {coluna: valor}
    const dados = Object.fromEntries(colunas.map((col, i) => [col, valores[i]]));

    // Preenche os dados no HTML
    document.getElementById('marca-modelo').textContent = capitalizar(`${dados['MARCA']} ${dados['MODELO']}`) || '(Sem Informação)';
    document.getElementById('ano').textContent = dados['ANO'] || '(Sem Informação)';
    document.getElementById('prefixo').textContent = dados['PREFIXO'] || '(Sem Informação)';
    document.getElementById('placa').textContent = dados['PLACA'] || '(Sem Informação)';
    document.getElementById('designacao').textContent = capitalizar(dados['DESIGNAÇÃO']) || '(Sem Informação)';
    document.getElementById('unidade').textContent = dados['UNIDADE DETENTORA'] || '(Sem Informação)';
    document.getElementById('regional').textContent = capitalizar(dados['REGIONAL']) || '(Sem Informação)';
    document.getElementById('cidade').textContent = capitalizarCidade(dados['CIDADE']) || '(Sem Informação)';
    const valorFormatado = formatarNumero(dados['VALOR INVESTIMENTO']);
    document.getElementById('valor').textContent = valorFormatado ? `R$ ${valorFormatado}` : '(Sem Informação)';
    document.getElementById('empenho').textContent = dados['NOTA EMPENHO'] || '(Sem Informação)';
    document.getElementById('fonte').textContent = capitalizar(dados['FONTE RECURSO']) || '(Sem Informação)';
    document.getElementById('representante').textContent = capitalizar(dados['REPRESENTANTE PÚBLICO']) || '(Sem Informação)';
  });
}

// Carrega os dados de polígonos
function carregarPoligonos() {
  fetch('poligonos.geojson')
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: {
          color: '#3388ff',
          weight: 2,
          fillOpacity: 0.2
        },
        onEachFeature: (feature, layer) => {
          const cidade = feature.properties.name || 'N/A';
          layer.bindPopup(`Cidade: ${cidade}`);
        }
      }).addTo(map);

      map.fitBounds(layer.getBounds());
    });
}

// Carrega os dados das ocorrências e inicializa os filtros
function carregarOcorrencias() {
  fetch('ocorrencias.geojson')
    .then(res => res.json())
    .then(data => {
      ocorrenciasRaw = data;

      atualizarOcorrenciasViatura(data);
      preencherAnosDisponiveis(data);
      exibirOcorrenciasFiltradas(); // Primeira renderização
    });
}

// Atualiza o total de ocorrências da viatura
function atualizarOcorrenciasViatura(data) {
  const ocorrencias = data.features.filter(feature => {
    const viaturas = obterViaturas(feature);
    return viaturas.includes(prefixo);
  });

  const totalOcorrencias = ocorrencias.length;

  const vitimasSalvas = ocorrencias.filter(feature => {
    const valor = (feature.properties['Vitimas'] || '').toUpperCase().trim();
    return valor === 'SIM';
  }).length;

  document.getElementById('num-ocorrencias').textContent = formatarNumero(totalOcorrencias);
  document.getElementById('vitimas-salvas').textContent = formatarNumero(vitimasSalvas);
}


// Preenche o <select> com os anos extraídos dos dados
function preencherAnosDisponiveis(data) {
  const anos = new Set();

  data.features.forEach(feature => {
    const dataStr = feature.properties['Dt de Cadastro'];
    if (dataStr) {
      const ano = extrairAno(dataStr);
      anos.add(ano);
    }
  });

  const anosOrdenados = [...anos].sort();
  anosOrdenados.forEach(ano => {
    const option = document.createElement('option');
    option.value = ano;
    option.textContent = ano;
    if (ano === anoAtual) option.selected = true;
    selectAno.appendChild(option);
  });
}

// Filtra as ocorrências da viatura e ano selecionado
function exibirOcorrenciasFiltradas() {
  if (!ocorrenciasRaw) return;

  if (ocorrenciasLayer) {
    map.removeLayer(ocorrenciasLayer);
  }

  const anoSelecionado = selectAno.value;

  const ocorrenciasFiltradas = ocorrenciasRaw.features.filter(feature => {
    const viaturas = obterViaturas(feature);
    if (!viaturas.includes(prefixo)) return false;

    const dataStr = feature.properties['Dt de Cadastro'];
    if (!dataStr) return false;

    return extrairAno(dataStr) === anoSelecionado;
  });

  ocorrenciasLayer = L.geoJSON({ ...ocorrenciasRaw, features: ocorrenciasFiltradas }, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: '#ff0000',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      const data = props['Dt de Cadastro'] || 'Sem data';
      const numero = props['Nº Ocorrência'] || '';
      const tipo = props['Tipo Inicial Atualizado'] || 'Sem categoria';
      const cidade = props['Cidade'] || 'Não informado';
      const bairro = props['Bairro'] || 'Não informado';

      const conteudo = `
        <strong>Data:</strong> ${data}<br>
        <strong>Nº Ocorrência:</strong> ${numero}<br>
        <strong>Tipo:</strong> ${tipo}<br>
        <strong>Cidade:</strong> ${cidade}<br>
        <strong>Bairro:</strong> ${bairro}
      `;

      layer.bindPopup(conteudo);
    }
  }).addTo(map);
}

// Função auxiliar para extrair o ano de uma string de data (formato BR: dd/mm/yyyy)
function extrairAno(dataStr) {
  return dataStr.split('/')[2].split(' ')[0];
}

// Função auxiliar para pegar e normalizar os prefixos de uma ocorrência
function obterViaturas(feature) {
  const raw = feature.properties['Indicativo Viatura'];
  if (!raw) return [];
  return raw.split(',').map(v => v.trim().toLowerCase());
}

// Formatação de Números para adicionar separador de milhar
function formatarNumero(valor) {
  if (!valor || isNaN(valor)) return valor;

  // Garante que seja número e formata com ponto como separador de milhar
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Função auxiliar para capitalizar texto
function capitalizar(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function capitalizarCidade(cidade) {
  if (!cidade || typeof cidade !== 'string') return '';
  
  // Separa o nome da cidade e a sigla do estado
  const partes = cidade.split('-');
  
  // Capitaliza o nome da cidade
  const nomeCidade = partes[0].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  
  // Mantém a sigla do estado em maiúsculas (se houver)
  const estado = partes[1] ? partes[1].toUpperCase() : '';
  
  return estado ? `${nomeCidade}-${estado}` : nomeCidade;
}

// Eventos
selectAno.addEventListener('change', exibirOcorrenciasFiltradas);

// Inicialização
carregarViaturas()
carregarPoligonos();
carregarOcorrencias();
