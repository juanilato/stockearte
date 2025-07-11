import { Express } from 'express';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { MistralService } from './mistral.service';
import { FileExtractorService } from './file-extractor.service';
import { MISTRAL_CONFIG, PROMPT_TEMPLATES } from './mistral.config';

@Injectable()
export class IaService implements OnModuleInit {
  private logger = new Logger(IaService.name);
  private mistralProcess: ChildProcessWithoutNullStreams | null = null;
  // Puerto donde corre el servidor de Mistral (configurable por variable de entorno)
  private readonly mistralPort = process.env.MISTRAL_PORT || '5000';
  // Comando para lanzar Mistral (ej: 'python')
  private readonly mistralCmd = process.env.MISTRAL_CMD || 'python';
  // Argumentos para lanzar Mistral (ej: 'mistral_server.py --port 5000')
  private readonly mistralArgs = (process.env.MISTRAL_ARGS || 'mistral_server.py --port 5000').split(' ');
  // URL base del servidor de Mistral
  private readonly mistralUrl = process.env.MISTRAL_URL || `http://localhost:${this.mistralPort}`;

  constructor(
    private readonly mistralService: MistralService,
    private readonly fileExtractorService: FileExtractorService,
  ) {}

  // Al iniciar el módulo, lanza el proceso de Mistral automáticamente
  onModuleInit() {
    this.launchMistral();
  }

  // Lanza el proceso de Mistral si no está corriendo
  private launchMistral() {
    if (this.mistralProcess) {
      this.logger.log('Mistral process already running.');
      return;
    }
    this.logger.log(`Launching Mistral: ${this.mistralCmd} ${this.mistralArgs.join(' ')}`);
    this.mistralProcess = spawn(this.mistralCmd, this.mistralArgs, { stdio: 'inherit' });
    this.mistralProcess.on('error', (err) => {
      this.logger.error('Failed to start Mistral process:', err);
    });
    this.mistralProcess.on('exit', (code, signal) => {
      this.logger.warn(`Mistral process exited with code ${code}, signal ${signal}`);
      this.mistralProcess = null;
    });
  }

  // Procesa el archivo directamente en NestJS usando las librerías instaladas
  async interpretarArchivo(file: Express.Multer.File): Promise<any> {
    console.log('--- LOG NEST interpretarArchivo ---');
    console.log('File recibido:', file?.originalname, file?.mimetype, file?.size);
    
    try {
      // Guardar archivo temporalmente para procesarlo
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(tempFilePath, file.buffer);
      
      console.log('Archivo guardado temporalmente:', tempFilePath);
      
      // Extraer contenido del archivo
      const content = await this.fileExtractorService.extractContent(tempFilePath, file.mimetype);
      console.log('Contenido extraído (primeros 200 chars):', content.slice(0, 200));
      
      // Limpiar archivo temporal
      fs.unlinkSync(tempFilePath);
      
      // Prompt optimizado para la IA usando template
      const prompt = PROMPT_TEMPLATES.FILE_ANALYSIS.replace('{content}', content);

      console.log('Enviando prompt a Mistral...');
      let responseText = await this.mistralService.generateResponse(prompt, MISTRAL_CONFIG.FILE_ANALYSIS);
      console.log('Respuesta cruda de Mistral:', responseText);
      responseText = responseText.trim();
      
      // Limpiar bloque markdown si existe
      const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)```/i) || responseText.match(/```\s*([\s\S]*?)```/i);
      if (codeBlockMatch) {
        responseText = codeBlockMatch[1].trim();
      }
      
      // Limpiar comentarios y texto extra del JSON
      responseText = this.limpiarJSON(responseText);
      
      // Extraer el primer array JSON válido
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
      console.log('¿Encontró array JSON?', !!jsonMatch);
      
      let data;
      try {
        if (jsonMatch) {
          data = this.fileExtractorService.parsearProductosValidos(jsonMatch[0]);
          console.log('Productos parseados (array):', data);
        } else {
          // Si no hay array, buscar objetos individuales
          data = this.fileExtractorService.parsearProductosValidosDesdeObjetos(responseText);
          console.log('Productos parseados (objetos sueltos):', data);
        }
      } catch (e) {
        console.log('Error en parseo final:', e);
        throw new Error('No se pudo parsear la respuesta de la IA');
      }
      
      console.log('Enviando al frontend:', data);
      return data;
      
    } catch (error: any) {
      console.error('Error procesando archivo:', error.message);
      throw new Error(error.message || 'Error interpretando archivo con IA');
    }
  }

  // Función para limpiar JSON de comentarios y texto extra
  private limpiarJSON(jsonString: string): string {
    // Remover comentarios de una línea (// ...)
    let cleaned = jsonString.replace(/\/\/.*$/gm, '');
    
    // Remover comentarios de múltiples líneas (/* ... */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remover líneas vacías y espacios extra
    cleaned = cleaned.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    // Remover texto antes del primer [
    const firstBracketIndex = cleaned.indexOf('[');
    if (firstBracketIndex > 0) {
      cleaned = cleaned.substring(firstBracketIndex);
    }
    
    // Remover texto después del último ]
    const lastBracketIndex = cleaned.lastIndexOf(']');
    if (lastBracketIndex > 0 && lastBracketIndex < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBracketIndex + 1);
    }
    
    // Remover cualquier texto que contenga "..." al final
    cleaned = cleaned.replace(/,\s*\.\.\.\s*\]$/, ']');
    cleaned = cleaned.replace(/\.\.\.\s*\]$/, ']');
    
    // Remover cualquier línea que contenga solo "..."
    cleaned = cleaned.split('\n')
      .filter(line => !line.trim().match(/^\.\.\.$/))
      .join('\n');
    
    this.logger.log('[IA] JSON limpio:', cleaned);
    return cleaned;
  }

  // Reenvía el texto y productos al endpoint /interpretar-voz del servidor de Mistral
  async interpretarVoz(texto: string, productos: any[]): Promise<any> {
    try {
      const prompt = PROMPT_TEMPLATES.VOICE_INTERPRETATION
        .replace('{texto}', texto)
        .replace('{productos}', JSON.stringify(productos, null, 2));

      const responseText = await this.mistralService.generateResponse(prompt, MISTRAL_CONFIG.VOICE_INTERPRETATION);
      
      // Limpiar y parsear la respuesta
      let cleanResponse = responseText.trim();
      // Remover bloques de código si existen
      const codeBlockMatch = cleanResponse.match(/```json\s*([\s\S]*?)```/i) || cleanResponse.match(/```\s*([\s\S]*?)```/i);
      if (codeBlockMatch) {
        cleanResponse = codeBlockMatch[1].trim();
      }
      
      // Limpiar comentarios y texto extra del JSON
      cleanResponse = this.limpiarJSON(cleanResponse);
      
      // Extraer el array JSON
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log('No se pudo interpretar la respuesta de la IA:', cleanResponse);
        return { productos: [], textoOriginal: texto };
      }
      const productosInterpretados = JSON.parse(jsonMatch[0]);
      console.log('Respuesta parseada enviada al frontend:', productosInterpretados);
      return { 
        productos: productosInterpretados,
        textoOriginal: texto 
      };
      
    } catch (error: any) {
      console.error('Error interpretando voz:', error.message);
      throw new Error(error.message || 'Error interpretando voz con IA');
    }
  }
}
