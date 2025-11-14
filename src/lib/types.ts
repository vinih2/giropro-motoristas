// Tipos do GiroPro

export type Plataforma = 
  | 'Uber' 
  | '99' 
  | 'iFood' 
  | 'Rappi' 
  | 'Shopee' 
  | 'Amazon' 
  | 'Loggi' 
  | 'Outro';

export type TipoVeiculo = 
  | 'Carro Flex' 
  | 'Moto' 
  | 'Elétrico' 
  | 'Diesel';

export interface DadosDia {
  plataforma: Plataforma;
  ganhoBruto: number;
  horasTrabalhadas: number;
  kmRodados: number;
}

export interface ResultadoDia {
  ganhoPorHora: number;
  ganhoPorKm: number;
  custoDiario: number;
  lucroFinal: number;
}

export interface DadosCusto {
  tipoVeiculo: TipoVeiculo;
  consumoMedio: number;
  precoCombustivel: number;
  kmRodados: number;
}

export interface ResultadoCusto {
  custoPorKm: number;
  custoDiario: number;
  comparacaoFlex?: {
    gasolina: number;
    etanol: number;
    melhorOpcao: string;
  };
}

export interface DadosInsights {
  cidade: string;
  plataforma: Plataforma;
  horarioTrabalho: string;
}

export interface DadosSimulador {
  ganhoDiarioMedio: number;
  diasPorSemana: number;
  custoDiarioMedio: number;
}

export interface ResultadoSimulador {
  lucroSemanal: number;
  lucroMensal: number;
}
