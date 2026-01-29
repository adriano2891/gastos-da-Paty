
import { GoogleGenAI } from "@google/genai";
import { ConsolidatedExpense } from "../types";

export const getFinancialAdvice = async (
  budget: number,
  spent: number,
  consolidated: ConsolidatedExpense[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    const context = `
      Orçamento Total: R$ ${budget}
      Total Gasto: R$ ${spent}
      Saldo Restante: R$ ${budget - spent}
      Top 5 Gastos Consolidados:
      ${consolidated.slice(0, 5).map(c => `- ${c.description}: R$ ${c.total}`).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise brevemente este resumo financeiro e dê um conselho curto e prático (máximo 2 frases) para economizar ou gerenciar melhor o dinheiro. Seja amigável e direto. \nContexto: ${context}`,
    });

    return response.text || "Continue acompanhando seus gastos para manter a saúde financeira!";
  } catch (error) {
    console.error("Erro ao obter conselho do Gemini:", error);
    return "Mantenha o foco nos seus objetivos financeiros!";
  }
};
