# Integración de IA con Ollama y NestJS

## Descripción

Esta integración permite procesar archivos (.pdf, .docx, .xlsx, .txt) y texto de voz usando el modelo Mistral a través de Ollama, directamente desde el backend NestJS.

## Arquitectura

```
Frontend (React Native) 
    ↓
Backend NestJS (Puerto 3000)
    ↓
Ollama API (Puerto 11434)
    ↓
Modelo Mistral
```

## Componentes

### 1. MistralService (`src/ia/mistral.service.ts`)
- Maneja la comunicación con la API de Ollama
- Genera respuestas usando el modelo Mistral
- Verifica el estado del modelo
- Descarga el modelo si es necesario

### 2. FileExtractorService (`src/ia/file-extractor.service.ts`)
- Extrae texto de diferentes formatos de archivo
- Soporta: .pdf, .docx, .xlsx, .txt
- Parsea y valida respuestas JSON de la IA

### 3. IaService (`src/ia/ia.service.ts`)
- Coordina el procesamiento de archivos y voz
- Genera prompts optimizados para la IA
- Maneja la lógica de negocio

### 4. IaController (`src/ia/ia.controller.ts`)
- Expone endpoints REST
- Maneja uploads de archivos con multer
- Valida requests

## Endpoints

### POST `/api/interpretar`
Procesa archivos y extrae productos.

**Request:**
```bash
curl -X POST http://localhost:3000/api/interpretar \
  -F "file=@documento.pdf"
```

**Response:**
```json
[
  {
    "nombre": "Producto 1",
    "precioVenta": 100,
    "precioCosto": 80,
    "stock": 10,
    "codigoBarras": "123456789"
  }
]
```

### POST `/api/interpretar-voz`
Interpreta texto de voz y extrae productos del pedido.

**Request:**
```json
{
  "texto": "Quiero comprar 2 laptops y un mouse",
  "productos": [
    {"id": 1, "nombre": "Laptop HP", "precioVenta": 1200, "precioCosto": 800},
    {"id": 2, "nombre": "Mouse Logitech", "precioVenta": 25, "precioCosto": 15}
  ]
}
```

**Response:**
```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Laptop HP",
      "cantidad": 2,
      "precioVenta": 1200,
      "precioCosto": 800
    },
    {
      "id": 2,
      "nombre": "Mouse Logitech",
      "cantidad": 1,
      "precioVenta": 25,
      "precioCosto": 15
    }
  ],
  "textoOriginal": "Quiero comprar 2 laptops y un mouse"
}
```

## Configuración

### Variables de Entorno

```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
MISTRAL_MODEL_NAME=mistral

# Mistral Server (opcional, para lanzamiento automático)
MISTRAL_PORT=5000
MISTRAL_CMD=python
MISTRAL_ARGS=mistral_server.py --port 5000
MISTRAL_URL=http://localhost:5000
```

### Instalación de Dependencias

```bash
npm install mammoth pdf-parse xlsx form-data
```

## Uso desde Frontend

### Interpretar Archivo
```typescript
import { interpretarArchivo } from '../config/backend';

const file = await DocumentPicker.getDocumentAsync();
const productos = await interpretarArchivo(file);
```

### Interpretar Voz
```typescript
import { interpretarVoz } from '../config/backend';

const resultado = await interpretarVoz(texto, productosDisponibles);
```

## Formatos de Archivo Soportados

| Extensión | MIME Type | Librería |
|-----------|-----------|----------|
| .pdf | application/pdf | pdf-parse |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | mammoth |
| .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | xlsx |
| .txt | text/plain | fs |

## Prompts Optimizados

### Para Archivos
```
Eres un sistema de gestión de stock. Tu tarea es analizar el siguiente texto extraído de un archivo y devolver un array JSON de productos. Cada producto debe ser un objeto con los siguientes campos OBLIGATORIOS y con el tipo correcto:
- nombre (string)
- precioVenta (number)
- precioCosto (number)
- stock (number)
- codigoBarras (string, opcional)

IMPORTANTE:
- NO devuelvas arrays de caracteres ni objetos con claves numéricas.
- Si no puedes identificar un campo, pon null o 0, pero SIEMPRE incluye todos los campos con el nombre correcto.
- El array debe estar correctamente cerrado y no debe haber texto extra antes ni después del array JSON.
- NO EXPLIQUES NADA, SOLO EL ARRAY JSON, BIEN PARSEADO Y CERRADO CORRECTAMENTE.
```

### Para Voz
```
Eres un asistente de ventas inteligente. El cliente dijo: "{texto}"

Tienes acceso a esta base de datos de productos disponibles:
{productos}

Analiza el texto del cliente e identifica qué productos quiere comprar y en qué cantidad. 

Reglas IMPORTANTES:
1. SOLO devuelve productos que existan EXACTAMENTE en la base de datos proporcionada
2. Busca coincidencias exactas o muy similares en los nombres de productos
3. Extrae las cantidades mencionadas
4. Si no se menciona cantidad, asume 1
5. Si no encuentras productos que coincidan, devuelve array vacío
6. NO inventes productos que no estén en la base de datos

Responde SOLO con un array JSON de objetos con esta estructura:
[
  {
    "id": ID_DEL_PRODUCTO_EN_LA_DB,
    "nombre": "NOMBRE_EXACTO_DEL_PRODUCTO_EN_LA_DB", 
    "cantidad": CANTIDAD_NUMERICA,
    "precioVenta": PRECIO_DE_VENTA_DEL_PRODUCTO,
    "precioCosto": PRECIO_DE_COSTO_DEL_PRODUCTO
  }
]
```

## Testing

Ejecutar el script de prueba:
```bash
node test-ia.js
```

## Troubleshooting

### Error: "Modelo no disponible"
```bash
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/tags

# Descargar modelo Mistral
ollama pull mistral
```

### Error: "Tipo de archivo no soportado"
- Verificar que el archivo sea .pdf, .docx, .xlsx o .txt
- Verificar que las librerías estén instaladas

### Error: "No se pudo parsear la respuesta"
- Verificar que Ollama esté respondiendo correctamente
- Revisar logs del backend para ver la respuesta cruda de la IA

## Logs

Los servicios incluyen logging detallado:
- `[OLLAMA]` - Comunicación con Ollama
- `[FILE-EXTRACTOR]` - Procesamiento de archivos
- `[IA]` - Lógica de negocio

## Mejoras Futuras

1. **Caché de respuestas** para archivos similares
2. **Procesamiento en lote** de múltiples archivos
3. **Validación mejorada** de productos extraídos
4. **Soporte para más formatos** (.doc, .rtf, etc.)
5. **Configuración de prompts** por empresa
6. **Métricas de precisión** de la IA 