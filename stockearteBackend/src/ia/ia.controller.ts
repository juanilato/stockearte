// Controlador de IA: expone los endpoints para interpretar archivos y voz usando el modelo Mistral
import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IaService } from './ia.service';
import fetch from 'node-fetch';
import * as FormData from 'form-data';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('interpretar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined, // Usar memory storage
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async interpretarArchivo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    
    console.log('--- LOG CONTROLLER interpretarArchivo ---');
    console.log('File recibido en controller:', file?.originalname, file?.mimetype, file?.size);
    
    return await this.iaService.interpretarArchivo(file);
  }

  @Post('interpretar-voz')
  async interpretarVoz(@Body() body: { texto: string; productos: any[] }) {
    if (!body.texto || !body.productos) {
      throw new BadRequestException('Se requiere texto y productos');
    }
    
    console.log('--- LOG CONTROLLER interpretarVoz ---');
    console.log('Texto recibido:', body.texto);
    console.log('Productos disponibles:', body.productos.length);
    
    return await this.iaService.interpretarVoz(body.texto, body.productos);
  }

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