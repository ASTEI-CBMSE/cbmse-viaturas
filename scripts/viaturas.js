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
      df = df.addColumn('PREFIXO_LOWER', df['PREFIXO'].values.map(p => p.toLowerCase()));
      const idx = df['PREFIXO_LOWER'].values.findIndex(p => p === prefixo);
      if (idx === -1) return;

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
      document.getElementById('valor').textContent = formatarNumero(dados['VALOR DO INVESTIMENTO']) ? `R$ ${formatarNumero(dados['VALOR DO INVESTIMENTO'])}` : '(Sem Informação)';
      document.getElementById('empenho').textContent = dados['NOTA DO EMPENHO'] || '(Sem Informação)';
      document.getElementById('fonte').textContent = dados['FONTE DO RECURSO'] ? `${capitalizar(dados['FONTE DO RECURSO']) + ': ' + dados['ID FONTE']}` : '(Sem Informação)';
      document.getElementById('representante').textContent = capitalizar(dados['REPRESENTANTE PÚBLICO']) || '(Sem Informação)';
      document.getElementById('representante-link').href = dados['LINK PÚBLICO'] || '#';
    });
}
