// Controlador de IA: expone los endpoints para interpretar archivos y voz usando el modelo Mistral
import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IaService } from './ia.service';
import fetch from 'node-fetch';
import * as FormData from 'form-data';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  // Endpoint para interpretar archivos (sube un archivo y devuelve el texto interpretado)
  @Post('interpretar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined, // Usar memory storage
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  // Método para interpretar un archivo subido
  async interpretarArchivo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    

    
    return await this.iaService.interpretarArchivo(file);
  }

  // Endpoint para interpretar voz (envía texto y productos disponibles)
  // Recibe un JSON con el texto y los productos
  @Post('interpretar-voz')
  async interpretarVoz(@Body() body: { texto: string; productos: any[] }) {
    if (!body.texto || !body.productos) {
      throw new BadRequestException('Se requiere texto y productos');
    }
    // Llama al servicion de IA para interpretar el pedido de voz
    return await this.iaService.interpretarVoz(body.texto, body.productos);
  }

  // Transcribe audio to text using an internal service (open AI whisper)
  @Post('transcribir-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined, // Usar memory storage
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async proxyTranscribirAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    // Prepara el archivo para reenviarlo al servidor Python
    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    // Reenvía al servidor Python
    const response = await fetch('http://localhost:5000/transcribir-audio', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    const data = await response.json();
    return data;
  }
} 