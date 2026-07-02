import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const generateAdminInsight = async (stats: any) => {
  const ai = getAI();
  if (!ai) return "AI Key não configurada.";

  const prompt = `Analise os seguintes dados de uma plataforma de e-commerce e sugira acções estratégicas para o administrador.
  Dados Actuais:
  - Volume Total: ${stats.volume}
  - Vendedores: ${stats.sellers}
  - Utilizadores: ${stats.users}
  - Pagamentos Pendentes: ${stats.payments}
  - Detalhe de crescimento: ${stats.detail}

  Por favor, forneça:
  1. Resumo da situação actual.
  2. Duas recomendações de foco imediato.
  3. Uma previsão otimista para o próximo mês.
  
  Responda de forma profissional e concisa em Português de Angola.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return result.text || "Não foi possível gerar insights.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao comunicar com a IA.";
  }
};

export const chatWithAdminAI = async (message: string, context?: string) => {
  const ai = getAI();
  if (!ai) return "AI Key não configurada.";

  const systemInstruction = `És o assistente de IA "KwikInsight", integrado no painel de administração da plataforma Moda d'Angola em Angola.
  Teu objectivo é ajudar o administrador a gerir a plataforma, analisar dados, resolver problemas de vendedores e sugerir melhorias.
  Seja prestativo, use tons profissionais mas amigáveis. Domine termos do mercado angolano como "Kwik", "MCX Express", "Kwanza (Kz)".
  ${context ? `Contexto actual: ${context}` : ''}`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction
      }
    });
    return result.text || "Desculpe, não consegui processar o pedido.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Erro ao processar mensagem da IA.";
  }
};
