import { Injectable, Logger } from '@nestjs/common';

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    repeat_penalty?: number;
    stop?: string[];
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

@Injectable()
export class MistralService {
  private readonly logger = new Logger(MistralService.name);
  private baseUrl: string;
  private modelName: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.modelName = process.env.MISTRAL_MODEL_NAME || 'mistral';
  }

  async generateResponse(prompt: string, options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}): Promise<string> {
    try {
      // Configuración optimizada para respuestas completas y precisas
      const requestBody: OllamaRequest = {
        model: this.modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.05, // Temperatura más baja para mayor precisión
          num_predict: options.maxTokens || 2000, // Más tokens para respuestas completas
          top_p: 0.9, // Control de diversidad
          top_k: 40, // Control de tokens más probables
          repeat_penalty: 1.1, // Evitar repeticiones
          stop: ['```', '---', '###'], // Detener en marcadores específicos
        }
      };

      this.logger.log(`[OLLAMA] Enviando request a ${this.baseUrl}/api/generate`);
      this.logger.log(`[OLLAMA] Modelo: ${this.modelName}`);
      this.logger.log(`[OLLAMA] Configuración optimizada para precisión`);
      this.logger.log(`[OLLAMA] Prompt (primeros 200 chars): ${prompt.substring(0, 200)}...`);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error de Ollama: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaResponse;
      this.logger.log(`[OLLAMA] Respuesta recibida, longitud: ${data.response.length}`);
      this.logger.log(`[OLLAMA] Duración total: ${data.total_duration}ms`);
      
      return data.response;
    } catch (error) {
      this.logger.error('[OLLAMA] Error generando respuesta:', error);
      throw error;
    }
  }

  async checkModelStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json() as any;
      const models = data.models || [];
      const modelExists = models.some((model: any) => 
        model.name === this.modelName || model.name.startsWith(this.modelName.split(':')[0])
      );
      
      this.logger.log(`[OLLAMA] Modelo ${this.modelName} disponible: ${modelExists}`);
      return modelExists;
    } catch (error) {
      this.logger.error('[OLLAMA] Error verificando modelo:', error);
      return false;
    }
  }

  async pullModel(): Promise<void> {
    try {
      this.logger.log(`[OLLAMA] Descargando modelo ${this.modelName}...`);
      
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error descargando modelo: ${response.status} ${response.statusText}`);
      }

      this.logger.log(`[OLLAMA] Modelo ${this.modelName} descargado exitosamente`);
    } catch (error) {
      this.logger.error('[OLLAMA] Error descargando modelo:', error);
      throw error;
    }
  }
} 