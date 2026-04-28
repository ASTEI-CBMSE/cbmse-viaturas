import { capitalizar, capitalizarCidade, formatarNumero } from './utils.js';

export function carregarViaturas(prefixo) {
  fetch('dados/dados-viaturas.csv.gz')
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const texto = pako.ungzip(new Uint8Array(buffer), { to: 'string' });
      const blob = new Blob([texto], { type: 'text/csv' });
      return dfd.readCSV(blob, { delimiter: ';' });
    })
    .then(df => {
      df = df.query(df['PREFIXO'].map(p => p && p.trim() !== ''));
      df = df.addColumn('PREFIXO_LOWER', df['PREFIXO'].values.map(p => p.toLowerCase()));
      // Coluna adicional com prefixo normalizado (sem hífens) para permitir buscas
      // por formas com e sem hífen (ex: abt-19 e abt19).
      df = df.addColumn('PREFIXO_NORMALIZED', df['PREFIXO_LOWER'].values.map(p => p.replace(/-/g, '')));

      const busca = prefixo.toLowerCase();
      const buscaNormalizada = busca.replace(/-/g, '');

      // Tentar encontrar por igualdade direta ou pela versão normalizada
      let idx = df['PREFIXO_LOWER'].values.findIndex(p => p === busca || p === buscaNormalizada);
      // Se não encontrado pela coluna original, tentar pela coluna normalizada
      if (idx === -1) {
        const idx2 = df['PREFIXO_NORMALIZED'].values.findIndex(p => p === busca || p === buscaNormalizada);
        if (idx2 === -1) return;
        idx = idx2;
      }

      const linha = df.iloc({ rows: [idx] });
      const dados = Object.fromEntries(linha.columns.map((col, i) => [col, linha.values[0][i]]));

      document.getElementById('marca-modelo').textContent = capitalizar(`${dados['MARCA']} ${dados['MODELO']}`) || '(Sem Informação)';
      document.getElementById('ano').textContent = dados['ANO'] || '(Sem Informação)';
      document.getElementById('prefixo').textContent = dados['PREFIXO'] || '(Sem Informação)';
      document.getElementById('placa').textContent = dados['PLACA'] || '(Sem Informação)';
      document.getElementById('designacao').textContent = capitalizar(dados['DESIGNAÇÃO']) || '(Sem Informação)';
      document.getElementById('unidade').textContent = dados['UNIDADE DETENTORA'] || '(Sem Informação)';
      document.getElementById('regional').textContent = capitalizar(dados['REGIONAL']) || '(Sem Informação)';
      document.getElementById('cidade').textContent = capitalizarCidade(dados['CIDADE']) || '(Sem Informação)';
      document.getElementById('valor').textContent = formatarNumero(dados['VALOR DO INVESTIMENTO'])
        ? `R$ ${formatarNumero(dados['VALOR DO INVESTIMENTO'])}`
        : '(Sem Informação)';
      document.getElementById('empenho').textContent = dados['NOTA DO EMPENHO'] || '(Sem Informação)';
      document.getElementById('fonte').textContent = dados['FONTE DO RECURSO']
        ? `${capitalizar(dados['FONTE DO RECURSO']) + ': ' + dados['ID FONTE']}`
        : '(Sem Informação)';
      document.getElementById('representante').textContent = capitalizar(dados['REPRESENTANTE PÚBLICO']) || '(Sem Informação)';
      document.getElementById('representante-link').href = dados['LINK PÚBLICO'] || '#';
    });
}
