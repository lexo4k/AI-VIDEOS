import { GoogleGenAI } from "@google/genai";
import { VideoGenerationConfig } from "../types";

// Helper to check and prompt for API key
export const checkAndRequestApiKey = async (): Promise<boolean> => {
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    return hasKey;
  }
  // Fallback for dev environments without the injected aistudio object
  return !!process.env.API_KEY;
};

export const openApiKeySelector = async (): Promise<void> => {
  if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
    await window.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selector not available in this environment.");
  }
};

export const generateScript = async (topic: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: topic,
      config: {
        systemInstruction: `Você é a VideoJá AI, uma inteligência artificial especializada em criar
roteiros curtos, chamativos e altamente visuais para vídeos.

Idioma obrigatório: Português do Brasil.

Objetivo:
Gerar roteiros prontos para virar vídeos com IA, focados em engajamento,
clareza e conversão.

Duração máxima dos roteiros: até 30 segundos.

Estrutura obrigatória de TODO roteiro:
1. Abertura impactante (até 3 segundos) que chame atenção imediata
2. Desenvolvimento rápido e claro da ideia principal
3. Chamada para ação direta e objetiva

Regras:
- Use linguagem simples, popular e persuasiva
- Frases curtas
- Sem emojis
- Sem hashtags
- Sem explicações técnicas
- Texto 100% pronto para narração ou geração de vídeo
- Não explique o que está fazendo, apenas entregue o roteiro final

Sempre entregue o roteiro dividido em cenas ou falas, de forma clara.`
      }
    });

    return response.text;
  } catch (error) {
    console.error("Script Generation Error:", error);
    return null;
  }
};

export const generateVideo = async (
  config: VideoGenerationConfig
): Promise<string | null> => {
  try {
    // ALWAYS initialize a fresh client to pick up the latest selected key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const modelName = 'veo-3.1-fast-generate-preview';

    let requestConfig: any = {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio,
    };

    let operation;

    if (config.image) {
      // Image-to-Video
      operation = await ai.models.generateVideos({
        model: modelName,
        prompt: config.prompt, // Prompt is optional for Img2Vid but recommended for control
        image: {
          imageBytes: config.image.data,
          mimeType: config.image.mimeType
        },
        config: requestConfig
      });
    } else {
      // Text-to-Video
      operation = await ai.models.generateVideos({
        model: modelName,
        prompt: config.prompt,
        config: requestConfig
      });
    }

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log('Video generation status:', operation.metadata);
    }

    if (operation.error) {
      throw new Error(operation.error.message);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) return null;

    // Append key for playback permissions as per documentation
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};