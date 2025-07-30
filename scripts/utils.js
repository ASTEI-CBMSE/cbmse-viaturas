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
  return (f.properties['Indicativo Viatura'] || '').split(',').map(v => v.trim().toLowerCase());
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
