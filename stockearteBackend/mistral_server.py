# Servidor Flask para IA: integra Whisper (transcripción de audio) y Mistral/Ollama (LLM)
# Permite extraer productos de archivos y voz, y transcribir audio localmente
# Autor: Stockearte
# ---------------------------------------------
import os
import sys
import subprocess
import time
from flask import Flask, request, jsonify
import requests
from io import BytesIO

# Intentar importar librerías para extracción de texto de archivos
try:
    from docx import Document  # Para .docx
except ImportError:
    Document = None
try:
    import PyPDF2  # Para .pdf
except ImportError:
    PyPDF2 = None

app = Flask(__name__)

# Configuración de Ollama/Mistral
OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'mistral')
OLLAMA_CMD = os.environ.get('OLLAMA_CMD', 'ollama')
OLLAMA_ARGS = os.environ.get('OLLAMA_ARGS', 'run mistral').split()

# Obtener puerto desde argumentos o variable de entorno
def get_port():
    for i, arg in enumerate(sys.argv):
        if arg == '--port' and i + 1 < len(sys.argv):
            try:
                return int(sys.argv[i + 1])
            except ValueError:
                pass
    return int(os.environ.get('MISTRAL_PORT', 5000))

# Lanzar Ollama automáticamente si no está corriendo
def launch_ollama():
    try:
        print(f'Lanzando Ollama: {OLLAMA_CMD} {" ".join(OLLAMA_ARGS)}')
        subprocess.Popen([OLLAMA_CMD] + OLLAMA_ARGS, 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        time.sleep(3)  # Dar tiempo a que Ollama inicie
        print('Ollama iniciado')
    except Exception as e:
        print(f'Error lanzando Ollama: {e}')

# Extraer texto de archivos soportados (docx, pdf, txt)
def extract_text(file):
    filename = file.filename.lower()
    if filename.endswith('.docx') and Document:
        doc = Document(BytesIO(file.read()))
        return '\n'.join([p.text for p in doc.paragraphs])
    elif filename.endswith('.pdf') and PyPDF2:
        reader = PyPDF2.PdfReader(BytesIO(file.read()))
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text
    elif filename.endswith('.txt'):
        return file.read().decode('utf-8')
    else:
        return None

# Endpoint: /interpretar
# Recibe archivo, extrae texto y pide a Mistral/Ollama que devuelva productos en JSON
@app.route('/interpretar', methods=['POST'])
def interpretar():
    print('--- LOG FLASK /interpretar ---')
    print('Headers:', dict(request.headers))
    print('Archivos recibidos:', request.files)
    file = request.files.get('file')
    if not file:
        print('No se recibió archivo')
        return jsonify({'error': 'No se envió archivo'}), 400
    print('Archivo recibido:', file.filename)
    file.seek(0)
    texto = extract_text(file)
    if not texto or not texto.strip():
        return jsonify({'error': 'No se pudo extraer texto del archivo'}), 400
    
    # Prompt para que Mistral devuelva productos en JSON
    prompt = f"""Analiza el siguiente texto y extrae los productos mencionados. 
Devuelve SOLO un array JSON con los productos encontrados, cada uno con estos campos:
- nombre: string
- precioVenta: number (si se menciona)
- precioCosto: number (si se menciona) 
- stock: number (si se menciona)
- codigoBarras: string (si se menciona)

Si no encuentras productos, devuelve un array vacío [].

Texto a analizar:
{texto}

Respuesta (solo JSON):"""

    payload = {
        'model': OLLAMA_MODEL,
        'prompt': prompt,
        'stream': False
    }
    try:
        ollama_response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        ollama_response.raise_for_status()
        data = ollama_response.json()
        response_text = data.get('response', '')
        
        # Intentar parsear la respuesta como JSON
        try:
            import json
            productos = json.loads(response_text.strip())
            if isinstance(productos, list):
                return jsonify(productos)  # Devuelve directamente el array para que el frontend lo reconozca
            else:
                return jsonify([])
        except json.JSONDecodeError:
            print('Error parseando JSON de Mistral:', response_text)
            return jsonify([])
            
    except Exception as e:
        print('Error llamando a Ollama:', str(e))
        return jsonify({'error': 'Error llamando a Ollama', 'details': str(e)}), 500

# Endpoint: /interpretar-voz
# Recibe texto y productos, pide a Mistral/Ollama que devuelva productos interpretados de la voz
@app.route('/interpretar-voz', methods=['POST'])
def interpretar_voz():
    data = request.get_json()
    texto = data.get('texto', '')
    productos = data.get('productos', [])

    # Prompt estricto para interpretación de voz (adaptado de mistral.config.ts)
    prompt = f"""Eres un asistente de ventas inteligente especializado en interpretación de pedidos. El cliente dijo: \"{texto}\"\n\nBASE DE DATOS DE PRODUCTOS DISPONIBLES:\n{productos}\n\nREGLAS ESTRICTAS:\n1. SOLO devuelve productos que existan EXACTAMENTE en la base de datos\n2. Busca coincidencias exactas o muy similares en los nombres\n3. Extrae las cantidades mencionadas explícitamente\n4. Si no se menciona cantidad, asume 1\n5. Si no encuentras productos que coincidan, devuelve array vacío []\n6. NO inventes productos que no estén en la base de datos\n\nFORMATO DE RESPUESTA REQUERIDO:\n[\n  {{\n    \"id\": ID_DEL_PRODUCTO_EN_LA_DB,\n    \"nombre\": \"NOMBRE_EXACTO_DEL_PRODUCTO_EN_LA_DB\", \n    \"cantidad\": CANTIDAD_NUMERICA,\n    \"precioVenta\": PRECIO_DE_VENTA_DEL_PRODUCTO,\n    \"precioCosto\": PRECIO_DE_COSTO_DEL_PRODUCTO\n  }}\n]\n\nEJEMPLO:\n[{{\"id\": 25, \"nombre\": \"Cachafaz conitos\", \"cantidad\": 2, \"precioVenta\": 500, \"precioCosto\": 300}}]\n\nRESPONDE SOLO CON EL ARRAY JSON, SIN EXPLICACIONES NI COMENTARIOS."""

    payload = {
        'model': OLLAMA_MODEL,
        'prompt': prompt,
        'stream': False
    }
    try:
        ollama_response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        ollama_response.raise_for_status()
        data = ollama_response.json()
        response_text = data.get('response', '')

        # Intentar parsear la respuesta como JSON
        try:
            import json
            productos_interpretados = json.loads(response_text.strip())
            if isinstance(productos_interpretados, list):
                return jsonify({'productos': productos_interpretados, 'textoOriginal': texto})
            else:
                return jsonify({'productos': [], 'textoOriginal': texto})
        except json.JSONDecodeError:
            print('Error parseando JSON de Mistral:', response_text)
            return jsonify({'productos': [], 'textoOriginal': texto})

    except Exception as e:
        print('Error llamando a Ollama:', str(e))
        return jsonify({'error': 'Error llamando a Ollama', 'details': str(e)}), 500

# Endpoint: /transcribir-audio
# Recibe archivo de audio, lo transcribe usando Whisper local y devuelve el texto
@app.route('/transcribir-audio', methods=['POST'])
def transcribir_audio():
    if 'file' not in request.files:
        print('[ERROR] No se envió archivo')
        return jsonify({'error': 'No se envió archivo'}), 400
    file = request.files['file']
    import tempfile, os
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, 'audio.m4a')
    try:
        file.save(temp_path)
        print(f'[DEBUG] Archivo guardado en: {temp_path}')
        print(f'[DEBUG] Tamaño del archivo guardado: {os.path.getsize(temp_path)} bytes')
    except Exception as e:
        print(f'[ERROR] Al guardar el archivo: {e}')
        return jsonify({'error': f'Error guardando archivo: {e}'}), 500
    try:
        import whisper
        model = whisper.load_model('base')
        result = model.transcribe(temp_path, language='es')
        print(f'[DEBUG] Transcripción result: {result}')
        return jsonify({'text': result['text']})
    except Exception as e:
        print('Error transcribiendo audio con Whisper:', str(e))
        return jsonify({'error': 'Error transcribiendo audio', 'details': str(e)}), 500

# Main: lanzar Ollama y correr el servidor Flask
if __name__ == '__main__':
    port = get_port()
    launch_ollama()  # Lanzar Ollama automáticamente
    app.run(host='0.0.0.0', port=port) 