// Funções de cálculo do GiroPro

import { DadosDia, ResultadoDia, DadosCusto, ResultadoCusto, DadosSimulador, ResultadoSimulador } from './types';

export function calcularGiroDia(dados: DadosDia, custoPorKm: number): ResultadoDia {
  const ganhoPorHora = dados.ganhoBruto / dados.horasTrabalhadas;
  const ganhoPorKm = dados.ganhoBruto / dados.kmRodados;
  const custoDiario = custoPorKm * dados.kmRodados;
  const lucroFinal = dados.ganhoBruto - custoDiario;

  return {
    ganhoPorHora: isFinite(ganhoPorHora) ? ganhoPorHora : 0,
    ganhoPorKm: isFinite(ganhoPorKm) ? ganhoPorKm : 0,
    custoDiario: isFinite(custoDiario) ? custoDiario : 0,
    lucroFinal: isFinite(lucroFinal) ? lucroFinal : 0,
  };
}

export function calcularCustoPorKm(dados: DadosCusto): ResultadoCusto {
  const custoPorKm = dados.precoCombustivel / dados.consumoMedio;
  const custoDiario = custoPorKm * dados.kmRodados;

  let comparacaoFlex;
  if (dados.tipoVeiculo === 'Carro Flex') {
    // Assumindo que gasolina custa ~30% mais que etanol
    const precoGasolina = dados.precoCombustivel;
    const precoEtanol = dados.precoCombustivel * 0.7;
    
    const custoGasolina = precoGasolina / dados.consumoMedio;
    const custoEtanol = precoEtanol / (dados.consumoMedio * 0.7); // Etanol rende ~70% da gasolina
    
    comparacaoFlex = {
      gasolina: custoGasolina,
      etanol: custoEtanol,
      melhorOpcao: custoEtanol < custoGasolina ? 'Etanol' : 'Gasolina',
    };
  }

  return {
    custoPorKm: isFinite(custoPorKm) ? custoPorKm : 0,
    custoDiario: isFinite(custoDiario) ? custoDiario : 0,
    comparacaoFlex,
  };
}

export function calcularSimuladorMensal(dados: DadosSimulador): ResultadoSimulador {
  const lucroSemanal = (dados.ganhoDiarioMedio - dados.custoDiarioMedio) * dados.diasPorSemana;
  const lucroMensal = lucroSemanal * 4.33; // Média de semanas por mês

  return {
    lucroSemanal: isFinite(lucroSemanal) ? lucroSemanal : 0,
    lucroMensal: isFinite(lucroMensal) ? lucroMensal : 0,
  };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function avaliarDesempenho(ganhoPorHora: number): { nivel: string; cor: string } {
  if (ganhoPorHora >= 25) return { nivel: 'Excelente', cor: 'text-green-600' };
  if (ganhoPorHora >= 18) return { nivel: 'Bom', cor: 'text-blue-600' };
  if (ganhoPorHora >= 12) return { nivel: 'Médio', cor: 'text-yellow-600' };
  return { nivel: 'Fraco', cor: 'text-red-600' };
}
