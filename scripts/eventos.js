import { exibirOcorrenciasFiltradas } from './ocorrencias.js';

export function inicializarEventos(prefixo) {
  document.getElementById('ano-select').addEventListener('change', () => {
    exibirOcorrenciasFiltradas(prefixo);
  });

  document.getElementById('share-button').addEventListener('click', async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('URL copiada!');
      } else {
        prompt('Copie a URL abaixo:', url);
      }
    } catch (e) {
      alert('Erro ao compartilhar: ' + e.message);
    }
  });
}
