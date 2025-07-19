# Servidor IA Local (Whisper + Mistral/Ollama) para Stockearte

Este README documenta el funcionamiento del servidor Python `mistral_server.py` y los scripts de prueba incluidos en esta carpeta. El objetivo es permitir procesamiento de voz y archivos con IA de forma local, robusta y sin depender de servicios cloud.

## ¿Qué hace este servidor?
- Expone endpoints HTTP para:
  - Transcribir audio a texto usando Whisper local
  - Interpretar archivos (.txt, .pdf, .docx) y extraer productos usando Mistral/Ollama
  - Interpretar pedidos de voz y mapearlos a productos existentes
- Se integra con el backend Node/NestJS, que actúa como único punto de contacto para el frontend.

## Arquitectura

```
Frontend (React Native)
    ↓
Backend NestJS (Node.js, puerto 3000)
    ↓
Servidor IA Python (Flask, puerto 5000 por default)
    ↓
Ollama (Mistral LLM, puerto 11434)
```

- El frontend nunca se conecta directo al Python, siempre pasa por el backend.
- El backend reenvía archivos, texto o audio al servidor Python según corresponda.
- El servidor Python llama a Ollama/Mistral para tareas de LLM y a Whisper para transcripción.

## Archivos principales

- `mistral_server.py`: Servidor Flask que expone endpoints para interpretación de archivos, voz y transcripción de audio. Lanza Ollama automáticamente si es necesario.
- `test-ia.js`: Script Node.js para probar los endpoints de interpretación de archivos y voz.
- `test-frontend-connection.js`: Script Node.js para verificar que el backend NestJS responde correctamente a los endpoints de IA.
- `test-productos.txt`: Archivo de ejemplo con productos ficticios para pruebas.
- `IA_INTEGRATION.md`: Documentación detallada de la integración IA en el proyecto.

## Endpoints expuestos por el servidor Python

- `POST /interpretar`: Recibe un archivo, extrae texto y pide a Mistral/Ollama que devuelva productos en JSON.
- `POST /interpretar-voz`: Recibe texto y productos, y pide a Mistral/Ollama que devuelva productos interpretados de la voz.
- `POST /transcribir-audio`: Recibe un archivo de audio, lo transcribe usando Whisper local y devuelve el texto.

## Cómo correr el servidor IA localmente

1. Instala dependencias de Python:
   ```bash
   pip install flask requests python-docx PyPDF2 openai-whisper
   # (y cualquier otra que falte según errores)
   ```
2. Instala y corre Ollama con el modelo Mistral:
   ```bash
   ollama pull mistral
   ollama serve  # o deja que el script lo lance automáticamente
   ```
3. Lanza el servidor Python:
   ```bash
   python mistral_server.py --port 5000
   # O simplemente: python mistral_server.py
   ```
4. Asegúrate de que el backend NestJS esté corriendo y configurado para reenviar requests a este servidor.

## Cómo testear

- Prueba endpoints de IA directamente:
  ```bash
  node test-ia.js
  ```
- Prueba la conexión frontend-backend:
  ```bash
  node test-frontend-connection.js
  ```
- Puedes modificar `test-productos.txt` para probar con otros productos.

## Notas y recomendaciones

- El servidor Python lanza Ollama automáticamente si no está corriendo.
- Los endpoints devuelven arrays JSON listos para consumir por el frontend.
- Si tienes problemas con dependencias, revisa los imports y mensajes de error.
- Para detalles avanzados, consulta `IA_INTEGRATION.md`.

## Flujo típico de uso

1. El usuario sube un archivo o graba audio en la app.
2. El frontend envía el archivo/texto al backend Node.
3. El backend reenvía al servidor Python según el tipo de request.
4. El servidor Python procesa (Whisper/Mistral) y responde con JSON.
5. El backend reenvía la respuesta al frontend.

---

