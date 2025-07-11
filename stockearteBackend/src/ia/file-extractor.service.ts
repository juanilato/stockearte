import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import * as xlsx from 'xlsx';

@Injectable()
export class FileExtractorService {
  private readonly logger = new Logger(FileExtractorService.name);

  async extractContent(filePath: string, mimetype: string): Promise<string> {
    this.logger.log(`[FILE-EXTRACTOR] Procesando archivo: ${path.basename(filePath)}, tipo: ${mimetype}`);

    try {
      if (mimetype.includes('wordprocessingml') || mimetype.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        // .docx
        this.logger.log('[FILE-EXTRACTOR] Procesando archivo .docx con mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } else if (mimetype.includes('spreadsheetml') || mimetype.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        // .xlsx
        this.logger.log('[FILE-EXTRACTOR] Procesando archivo .xlsx con xlsx');
        const workbook = xlsx.readFile(filePath);
        let text = '';
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
          text += data.map((row: any) => row.join(' | ')).join('\n') + '\n';
        });
        return text;
      } else if (mimetype.includes('pdf') || mimetype.includes('application/pdf')) {
        // .pdf
        this.logger.log('[FILE-EXTRACTOR] Procesando archivo .pdf con pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      } else if (mimetype.includes('text/plain') || mimetype.includes('application/octet-stream')) {
        // .txt o archivos de texto
        this.logger.log('[FILE-EXTRACTOR] Procesando archivo de texto');
        return fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new Error(`Tipo de archivo no soportado: ${mimetype}`);
      }
    } catch (error) {
      this.logger.error(`[FILE-EXTRACTOR] Error procesando archivo: ${error}`);
      throw new Error(`Error procesando archivo: ${error.message}`);
    }
  }

  // Función para validar y limpiar productos uno a uno
  parsearProductosValidos(jsonArrayString: string): any[] {
    let productosValidos: any[] = [];
    try {
      const arr = JSON.parse(jsonArrayString);
      this.logger.log('[FILE-EXTRACTOR] Array parseado:', arr);
      if (Array.isArray(arr)) {
        for (const prod of arr) {
          // Si algún campo es null, poner 0 o ''
          const limpio = {
            nombre: prod.nombre ?? '',
            precioVenta: prod.precioVenta ?? 0,
            precioCosto: prod.precioCosto ?? 0,
            stock: prod.stock ?? 0,
            codigoBarras: prod.codigoBarras ?? '',
          };
          this.logger.log('[FILE-EXTRACTOR] Producto limpio:', limpio);
          if (
            typeof limpio.nombre === 'string' && limpio.nombre.trim() !== '' &&
            typeof limpio.precioVenta === 'number' && !isNaN(limpio.precioVenta) &&
            typeof limpio.precioCosto === 'number' && !isNaN(limpio.precioCosto) &&
            typeof limpio.stock === 'number' && !isNaN(limpio.stock)
          ) {
            productosValidos.push(limpio);
          } else {
            this.logger.log('[FILE-EXTRACTOR] Producto descartado por formato:', limpio);
          }
        }
      }
    } catch (e) {
      this.logger.log('[FILE-EXTRACTOR] Error parseando array:', e);
    }
    return productosValidos;
  }

  // Función para validar y limpiar productos desde objetos sueltos
  parsearProductosValidosDesdeObjetos(responseText: string): any[] {
    const productosValidos: any[] = [];
    // Buscar todos los bloques {...} en el string
    const objectMatches = responseText.match(/\{[\s\S]*?\}/g);
    this.logger.log('[FILE-EXTRACTOR] Objetos encontrados:', objectMatches?.length || 0);
    if (objectMatches) {
      for (const objStr of objectMatches) {
        try {
          this.logger.log('[FILE-EXTRACTOR] Intentando parsear:', objStr);
          const prod = JSON.parse(objStr);
          const limpio = {
            nombre: prod.nombre ?? '',
            precioVenta: prod.precioVenta ?? 0,
            precioCosto: prod.precioCosto ?? 0,
            stock: prod.stock ?? 0,
            codigoBarras: prod.codigoBarras ?? '',
          };
          this.logger.log('[FILE-EXTRACTOR] Producto limpio:', limpio);
          if (
            typeof limpio.nombre === 'string' &&
            typeof limpio.precioVenta === 'number' &&
            typeof limpio.precioCosto === 'number' &&
            typeof limpio.stock === 'number'
          ) {
            productosValidos.push(limpio);
          } else {
            this.logger.log('[FILE-EXTRACTOR] Producto descartado por formato:', limpio);
          }
        } catch (e) {
          this.logger.log('[FILE-EXTRACTOR] Error parseando objeto:', e);
        }
      }
    }
    return productosValidos;
  }
} 