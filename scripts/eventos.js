import { exibirOcorrenciasFiltradas } from './ocorrencias.js';

export function inicializarEventos(prefixo) {
  document.getElementById('ano-select').addEventListener('change', () => {
    exibirOcorrenciasFiltradas(prefixo);
  });

  document.getElementById('share-button').addEventListener('click', async () => {
    const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('URL copiada!');
      }
  });
}
