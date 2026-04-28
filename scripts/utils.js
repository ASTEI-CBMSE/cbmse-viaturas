export function capitalizar(texto) {
  return (texto || '').toLowerCase().split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export function capitalizarCidade(cidade) {
  const [nome, uf] = (cidade || '').split('-');
  return uf ? `${capitalizar(nome)}-${uf.toUpperCase()}` : capitalizar(nome);
}

export function extrairAno(dataStr) {
  return dataStr?.split('/')[2].split(' ')[0];
}

export function obterViaturas(f) {
  const raw = (f.properties['Indicativo Viatura'] || '');
  // Para cada indicativo, incluir tanto a versão sem hífen quanto a versão
  // com hífen (inserindo um hífen entre letras e dígitos quando necessário).
  // Ex: 'ABT-19' -> ['abt19','abt-19'], 'abt19' -> ['abt19','abt-19']
  const variants = raw.split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .map(v => v.toLowerCase())
    .flatMap(v => {
      const without = v.replace(/-/g, '');
      // Se já tiver hífen, mantém
      if (v.includes('-')) {
        return [without, v];
      }
      // Tentar inserir hífen entre letras e dígitos: 'abt19' -> 'abt-19'
      const m = without.match(/^([a-z]+)(\d+)$/i);
      if (m) {
        const withHyphen = `${m[1]}-${m[2]}`;
        return [without, withHyphen];
      }
      // Caso geral: retornar apenas a forma sem hífen e a original (idem)
      return [without, v];
    });

  return [...new Set(variants)];
}

export function formatarNumero(v) {
  return isNaN(v) ? v : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export const coresPorCategoria = {
  'ACIDENTE': '#f5b50a',
  'BUSCA E SALVAMENTO': '#214e8b',
  'INCÊNDIO': '#d91f1f',
  'PRÉ-HOSPITALAR': '#d42ca5',
  'SERVIÇOS E ATIVIDADES': '#2b8286',
  'PRODUTOS PERIGOSOS': '#798b21',
  'INFRAESTRUTURA E VIAS DE COMUNICAÇÃO': '#2f2f2f',
  'default': '#cacaca'
};
