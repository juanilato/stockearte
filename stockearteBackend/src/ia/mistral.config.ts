export const MISTRAL_CONFIG = {
  // Configuración para análisis de archivos (máxima precisión)
  FILE_ANALYSIS: {
    temperature: 0.05,
    maxTokens: 3000,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    stop: ['```', '---', '###']
  },
  
  // Configuración para interpretación de voz (precisión + velocidad)
  VOICE_INTERPRETATION: {
    temperature: 0.05,
    maxTokens: 2000,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    stop: ['```', '---', '###']
  },
  
  // Configuración para respuestas generales
  GENERAL: {
    temperature: 0.1,
    maxTokens: 1500,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1
  }
};

export const PROMPT_TEMPLATES = {
  FILE_ANALYSIS: `Eres un sistema de gestión de stock especializado en análisis de inventarios. Tu tarea es analizar el siguiente texto extraído de un archivo y devolver un array JSON de productos.

REGLAS ESTRICTAS:
1. SOLO devuelve un array JSON válido
2. Cada producto debe tener estos campos OBLIGATORIOS:
   - nombre (string): nombre del producto
   - precioVenta (number): precio de venta al público
   - precioCosto (number): precio de costo/compra
   - stock (number): cantidad disponible (0 si no se especifica)
   - codigoBarras (string): código de barras (null si no se especifica)

3. FORMATO REQUERIDO:
   - NO incluyas comentarios dentro del JSON
   - NO incluyas texto explicativo antes o después
   - NO uses "..." ni comentarios
   - El array debe estar completo y bien cerrado
   - Todos los campos deben tener el tipo correcto

4. PROCESAMIENTO:
   - Analiza cada línea/entrada del texto
   - Identifica productos, precios y cantidades
   - Si no encuentras información para un campo, usa null o 0
   - Incluye TODOS los productos que encuentres

5. EJEMPLO DE RESPUESTA CORRECTA:
[
  {
    "nombre": "Producto ejemplo",
    "precioVenta": 1000,
    "precioCosto": 500,
    "stock": 10,
    "codigoBarras": null
  }
]

Texto a analizar:
"""
{content}
"""

RESPONDE SOLO CON EL ARRAY JSON, SIN EXPLICACIONES NI COMENTARIOS.`,

  VOICE_INTERPRETATION: `Eres un asistente de ventas inteligente especializado en interpretación de pedidos. El cliente dijo: "{texto}"

BASE DE DATOS DE PRODUCTOS DISPONIBLES:
{productos}

REGLAS ESTRICTAS:
1. SOLO devuelve productos que existan EXACTAMENTE en la base de datos
2. Busca coincidencias exactas o muy similares en los nombres
3. Extrae las cantidades mencionadas explícitamente
4. Si no se menciona cantidad, asume 1
5. Si no encuentras productos que coincidan, devuelve array vacío []
6. NO inventes productos que no estén en la base de datos

FORMATO DE RESPUESTA REQUERIDO:
[
  {
    "id": ID_DEL_PRODUCTO_EN_LA_DB,
    "nombre": "NOMBRE_EXACTO_DEL_PRODUCTO_EN_LA_DB", 
    "cantidad": CANTIDAD_NUMERICA,
    "precioVenta": PRECIO_DE_VENTA_DEL_PRODUCTO,
    "precioCosto": PRECIO_DE_COSTO_DEL_PRODUCTO
  }
]

EJEMPLO:
[{"id": 25, "nombre": "Cachafaz conitos", "cantidad": 2, "precioVenta": 500, "precioCosto": 300}]

RESPONDE SOLO CON EL ARRAY JSON, SIN EXPLICACIONES NI COMENTARIOS.`
}; 