import { carregarViaturas } from './viaturas.js';
import { carregarOcorrencias } from './ocorrencias.js';
import { carregarPoligonos } from './poligonos.js';
import { adicionarLegendaCategorias } from './legenda.js';
import { inicializarEventos } from './eventos.js';

const prefixo = new URLSearchParams(window.location.search).get('prefixo')?.toLowerCase() || '';
document.getElementById('prefixo-titulo').textContent = prefixo.toUpperCase();

carregarViaturas(prefixo);
carregarPoligonos();
carregarOcorrencias(prefixo);
adicionarLegendaCategorias();
inicializarEventos(prefixo);
